import { db } from './db';
import { getLocalIndianDate, getLocalIndianMonth } from './dateUtils';

/**
 * Autopilot Sync Engine:
 * Ensures multi-module data coherence across:
 * - Attendance & Leave/Late Manager
 * - Exam Results, Weak Student Tracker (<40%), & Chapter Analytics
 * - Fee Payments, Fee Ledger & Coaching Financial Ledger
 * - Student 360 Timeline
 */

let isInitialized = false;

export async function syncAttendance({
  studentId,
  batch,
  date = getLocalIndianDate(),
  status = 'Present',
  lateMinutes = 0,
  reason = '',
  studentName = ''
}) {
  try {
    const sId = Number(studentId);
    // 1. If late or absent, ensure attendanceLeaves has an entry
    if (status === 'Late' || status === 'Absent') {
      const existingLeave = await db.attendanceLeaves
        .where('studentId')
        .equals(sId)
        .and(l => l.startDate === date)
        .first();

      if (!existingLeave) {
        await db.attendanceLeaves.add({
          studentId: sId,
          type: status === 'Late' ? 'Late Arrival' : 'Leave',
          startDate: date,
          endDate: date,
          reason: reason || (status === 'Late' ? `${lateMinutes || 15} মিনিট দেরিতে আগমন` : 'অদ্য ক্লাসে অনুপস্থিত'),
          status: 'Approved',
          timestamp: new Date().toISOString()
        });
      }
    }

    // 2. Audit log for 360 timeline
    await db.auditLogs.add({
      action: 'ATTENDANCE_RECORDED',
      module: 'Attendance Autopilot',
      details: `${studentName || `Student #${sId}`} marked ${status} in batch ${batch} on ${date}`,
      timestamp: new Date().toISOString()
    });

    console.log(`⚡ Autopilot: Synced attendance for student ${sId}`);
  } catch (err) {
    console.warn('Autopilot attendance sync error:', err);
  }
}

export async function syncExamResult({
  studentId,
  studentName = '',
  batch = '',
  examName = 'Chapter Assessment',
  subject = 'General',
  chapter = 'General',
  marks = 0,
  totalMarks = 100,
  date = getLocalIndianDate()
}) {
  try {
    const sId = Number(studentId);
    const m = Number(marks) || 0;
    const tm = Number(totalMarks) || 100;
    const percentage = tm > 0 ? (m / tm) * 100 : 0;
    const grade = percentage >= 80 ? 'A+' : percentage >= 60 ? 'A' : percentage >= 40 ? 'B' : 'F';

    // 1. Add to examResults if not already inserted
    const existing = await db.examResults
      .where('studentId')
      .equals(sId)
      .and(r => r.examName === examName && r.date === date)
      .first();

    if (!existing) {
      await db.examResults.add({
        studentId: sId,
        examName,
        subject,
        marks: m,
        totalMarks: tm,
        grade,
        date
      });
    }

    // 2. Weak Student Auto-Flagging if percentage < 40%
    if (percentage < 40) {
      const weakSettings = await db.settings.where('key').equals('bg_weak_student_tracker').first();
      let weakList = [];
      try {
        weakList = weakSettings?.value ? JSON.parse(weakSettings.value) : [];
      } catch (e) {
        weakList = [];
      }

      const existingRecordIndex = weakList.findIndex(w => Number(w.studentId) === sId);
      const studentObj = await db.students.get(sId);
      const autoRecord = {
        id: `weak_${sId}_${Date.now()}`,
        studentId: sId,
        studentName: studentObj?.name || studentName || `Student #${sId}`,
        phone: studentObj?.guardianPhone || studentObj?.phone || '',
        batch: studentObj?.batch || batch,
        subject,
        weakChapter: chapter,
        score: `${m}/${tm} (${Math.round(percentage)}%)`,
        flaggedDate: date,
        status: 'Needs Immediate Care',
        recommendation: `${chapter} অধ্যায়ে অতিরিক্ত রিভিশন ও সাপ্তাহিক ডাউট সেশন প্রয়োজন।`
      };

      if (existingRecordIndex >= 0) {
        weakList[existingRecordIndex] = autoRecord;
      } else {
        weakList.unshift(autoRecord);
      }

      await db.settings.put({
        key: 'bg_weak_student_tracker',
        value: JSON.stringify(weakList)
      });

      console.log(`⚠️ Autopilot: Flagged weak student #${sId} (${Math.round(percentage)}%)`);
    }

    // 3. Audit log for 360 timeline
    await db.auditLogs.add({
      action: 'EXAM_EVALUATED',
      module: 'Academics Autopilot',
      details: `${studentName || `Student #${sId}`} scored ${m}/${tm} in ${subject} (${examName})`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Autopilot exam sync error:', err);
  }
}

export async function syncFeePayment({
  studentId,
  studentName = '',
  batch = '',
  month = getLocalIndianMonth(),
  amount = 0,
  paymentMode = 'Cash',
  receiptNo = '',
  date = getLocalIndianDate()
}) {
  try {
    const sId = Number(studentId);
    const amt = Number(amount) || 0;
    const rNo = receiptNo || `BG-RCP-${Date.now().toString().slice(-6)}`;

    // 1. Ensure feePayments has entry
    const existingFee = await db.feePayments
      .where('studentId')
      .equals(sId)
      .and(f => f.month === month)
      .first();

    if (!existingFee) {
      await db.feePayments.add({
        studentId: sId,
        month,
        amount: amt,
        date,
        paymentMode,
        receiptNo: rNo,
        status: 'Paid'
      });
    }

    // 2. Audit log for 360 timeline
    await db.auditLogs.add({
      action: 'FEE_RECEIVED',
      module: 'Finance Autopilot',
      details: `Received ₹${amt} from ${studentName || `Student #${sId}`} for ${month} via ${paymentMode}`,
      timestamp: new Date().toISOString()
    });

    console.log(`💰 Autopilot: Synced fee ₹${amt} for student #${sId}`);
  } catch (err) {
    console.warn('Autopilot fee sync error:', err);
  }
}

/**
 * Initialize Dexie reactive hooks once
 */
export function initAutopilotSync() {
  if (isInitialized) return;
  isInitialized = true;

  try {
    // Hook on examResults creation: if score < 40%, auto-flag student
    db.examResults.hook('creating', function (primKey, obj, trans) {
      const percentage = obj.totalMarks > 0 ? (obj.marks / obj.totalMarks) * 100 : 0;
      if (percentage < 40) {
        // Schedule non-blocking weak student sync
        setTimeout(() => {
          syncExamResult({
            studentId: obj.studentId,
            examName: obj.examName,
            subject: obj.subject,
            marks: obj.marks,
            totalMarks: obj.totalMarks,
            date: obj.date
          });
        }, 100);
      }
    });

    console.log('⚡ AutopilotSyncEngine initialized with reactive Dexie hooks');
  } catch (e) {
    console.warn('Could not initialize Dexie hooks:', e);
  }
}

// Auto-run initialization
if (typeof window !== 'undefined') {
  initAutopilotSync();
}

export default {
  syncAttendance,
  syncExamResult,
  syncFeePayment,
  initAutopilotSync
};
