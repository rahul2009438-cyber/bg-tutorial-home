import Dexie from 'dexie';

/**
 * B.G. TUTORIAL HOME — Persistent IndexedDB Layer (Dexie.js v4)
 * High-performance, offline-first client database for Babun Ghosh Sir
 * VIP Road, South Habra, North 24 Parganas, West Bengal
 */
export const db = new Dexie('BGTutorialHomeDB');

// Base Version 1 schema
db.version(1).stores({
  students: '++id, studentId, name, batch, roll, phone, guardianPhone, status, createdAt',
  attendance: '++id, studentId, date, batch, status, timestamp',
  examResults: '++id, studentId, examName, batch, marks, totalMarks, percentage, date',
  feePayments: '++id, receiptNo, studentId, studentName, batch, month, amount, paymentMode, date',
  syllabusProgress: '++id, classId, subject, chapterCode, completed, targetDate',
  routines: '++id, day, time, batch, subject',
  homeworks: '++id, batch, subject, title, dueDate, status, createdAt',
  notices: '++id, title, category, date, content, isPinned',
  admissions: '++id, studentName, guardianName, phone, classApplied, status, createdAt',
  doubts: '++id, studentId, studentName, question, subject, status, createdAt, reply',
  studyMaterials: '++id, title, batch, subject, fileType, link, createdAt',
  guardianMessages: '++id, studentName, batch, type, phone, message, date',
  examPapers: '++id, title, classLevel, subject, totalMarks, questionsJson, createdAt',
  auditLogs: '++id, action, entity, timestamp, details',
  settings: 'key, value'
});

// Version 2 schema migration
db.version(2).stores({});

// Version 3 schema upgrade: Blueprint 5.1 / 6 Academic Intelligence & Financial Stores
db.version(3).stores({
  expenses: '++id, category, amount, description, date, paymentMode',
  discounts: '++id, studentId, discountType, amount, reason, validUntil',
  questionBank: '++id, classLevel, subject, chapter, board, marks, difficulty, question, answer, formula',
  attendanceLeaves: '++id, studentId, date, type, reason',
  communicationLogs: '++id, studentId, guardianPhone, type, summary, timestamp',
  restorePoints: '++id, name, timestamp, snapshotJson'
});

// Version 4 schema upgrade: Blueprint 7.0 Autopilot, Batches, Notes & AI Cache
db.version(4).stores({
  batches: '++id, name, subject, feeAmount, scheduleSummary, activeStudentCount, maxCapacity',
  studentNotes: '++id, studentId, title, classLevel, subject, topic, noteType, createdAt',
  aiCache: '++id, promptHash, promptType, responseText, createdAt',
  settings: 'key, value'
});

/**
 * Log mutation into local audit trail
 */
export async function logAudit(action, entity, details = '') {
  try {
    await db.auditLogs.add({
      action,
      entity: entity || 'SYSTEM',
      details: typeof details === 'object' ? JSON.stringify(details) : String(details),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Audit logging error:', err);
  }
}

/**
 * Log communication attempt (client-side intent)
 */
export async function logCommunication(studentId, guardianPhone, type, summary) {
  try {
    await db.communicationLogs.add({
      studentId: studentId || '',
      guardianPhone: guardianPhone || '',
      type: type || 'WhatsApp',
      summary: summary || '',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Communication log error:', err);
  }
}

/**
 * Create a timestamped snapshot of IndexedDB in restorePoints store
 */
export async function createRestorePoint(name = 'Manual Snapshot', reason = 'User triggered backup') {
  try {
    const backupObj = await exportDatabaseBackup();
    const id = await db.restorePoints.add({
      name,
      reason,
      timestamp: new Date().toISOString(),
      snapshotJson: JSON.stringify(backupObj)
    });
    await logAudit('RESTORE_POINT_CREATED', 'SYSTEM', `Point #${id}: ${name}`);
    return { success: true, id };
  } catch (err) {
    console.error('Failed to create restore point:', err);
    throw err;
  }
}

/**
 * Revert database to a specific restore point snapshot
 */
export async function revertToRestorePoint(pointId) {
  try {
    const point = await db.restorePoints.get(Number(pointId));
    if (!point || !point.snapshotJson) {
      throw new Error('রিকভারি পয়েন্ট পাওয়া যায়নি বা ক্ষতিগ্রস্ত!');
    }
    const data = JSON.parse(point.snapshotJson);
    await restoreDatabaseBackup(data, 'replace');
    await logAudit('REVERTED_TO_RESTORE_POINT', 'SYSTEM', `Reverted to point #${pointId}: ${point.name}`);
    return { success: true, name: point.name };
  } catch (err) {
    console.error('Failed to revert to restore point:', err);
    throw err;
  }
}

/**
 * Automatic First-Run Migration from localStorage
 */
export async function migrateFromLocalStorage() {
  try {
    const isMigrated = await db.settings.get('migrated_from_localstorage');
    if (isMigrated && isMigrated.value) {
      return { migrated: false, reason: 'Already migrated' };
    }

    let studentCount = 0;
    let feeCount = 0;
    let routineCount = 0;

    // 1. Check bg_students
    const rawStudents = localStorage.getItem('bg_students');
    if (rawStudents) {
      try {
        const parsed = JSON.parse(rawStudents);
        if (Array.isArray(parsed) && parsed.length > 0) {
          for (const s of parsed) {
            const exists = s.studentId ? await db.students.where('studentId').equals(s.studentId).first() : null;
            if (!exists) {
              await db.students.add({
                studentId: s.studentId || `BG-${Date.now()}-${Math.floor(Math.random() * 100)}`,
                name: s.name || '',
                batch: s.batch || 'Class 10',
                roll: s.roll || '',
                phone: s.phone || '',
                guardianPhone: s.guardianPhone || s.phone || '',
                status: s.status || 'Active',
                createdAt: s.createdAt || new Date().toISOString()
              });
              studentCount++;
            }
          }
        }
      } catch (e) {
        console.warn('Migration error for students:', e);
      }
    }

    // 2. Check bg_fee_records
    const rawFees = localStorage.getItem('bg_fee_records');
    if (rawFees) {
      try {
        const parsed = JSON.parse(rawFees);
        if (Array.isArray(parsed)) {
          for (const f of parsed) {
            await db.feePayments.add({
              receiptNo: f.receiptNo || `REC-${Date.now()}`,
              studentId: f.studentId || '',
              studentName: f.studentName || '',
              batch: f.batch || '',
              month: f.month || '',
              amount: Number(f.amount) || 0,
              paymentMode: f.paymentMode || 'Cash',
              date: f.date || new Date().toISOString().split('T')[0]
            });
            feeCount++;
          }
        }
      } catch (e) {
        console.warn('Migration error for fees:', e);
      }
    }

    // 3. Check bg_routine
    const rawRoutine = localStorage.getItem('bg_routine');
    if (rawRoutine) {
      try {
        const parsed = JSON.parse(rawRoutine);
        if (Array.isArray(parsed)) {
          for (const r of parsed) {
            await db.routines.add({
              day: r.day || '',
              time: r.time || '',
              batch: r.batch || '',
              subject: r.subject || ''
            });
            routineCount++;
          }
        }
      } catch (e) {
        console.warn('Migration error for routine:', e);
      }
    }

    await db.settings.put({ key: 'migrated_from_localstorage', value: true });
    await logAudit('MIGRATION', 'SYSTEM', `Migrated ${studentCount} students, ${feeCount} fees, ${routineCount} routine items.`);

    return { migrated: true, studentCount, feeCount, routineCount };
  } catch (err) {
    console.error('Migration failed:', err);
    return { migrated: false, error: err.message };
  }
}

/**
 * Get Comprehensive Database Health & Storage Estimate
 */
export async function getDbHealth() {
  try {
    const [
      studentsCount,
      attendanceCount,
      examResultsCount,
      feeCount,
      syllabusCount,
      homeworkCount,
      noticesCount,
      auditCount,
      expensesCount,
      discountsCount,
      questionBankCount,
      leavesCount,
      communicationLogsCount,
      restorePointsCount,
      batchesCount,
      notesCount
    ] = await Promise.all([
      db.students.count(),
      db.attendance.count(),
      db.examResults.count(),
      db.feePayments.count(),
      db.syllabusProgress.count(),
      db.homeworks.count(),
      db.notices.count(),
      db.auditLogs.count(),
      db.expenses ? db.expenses.count() : 0,
      db.discounts ? db.discounts.count() : 0,
      db.questionBank ? db.questionBank.count() : 0,
      db.attendanceLeaves ? db.attendanceLeaves.count() : 0,
      db.communicationLogs ? db.communicationLogs.count() : 0,
      db.restorePoints ? db.restorePoints.count() : 0,
      db.batches ? db.batches.count() : 0,
      db.studentNotes ? db.studentNotes.count() : 0
    ]);

    let storageEstimate = null;
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        storageEstimate = {
          usageBytes: estimate.usage || 0,
          quotaBytes: estimate.quota || 0,
          usageMb: ((estimate.usage || 0) / (1024 * 1024)).toFixed(2),
          quotaMb: ((estimate.quota || 0) / (1024 * 1024)).toFixed(2),
          usagePercent: estimate.quota ? ((estimate.usage / estimate.quota) * 100).toFixed(2) : '0'
        };
      } catch (e) {}
    }

    const lastBackup = await db.settings.get('last_backup_timestamp');

    return {
      status: 'healthy',
      counts: {
        students: studentsCount,
        attendance: attendanceCount,
        examResults: examResultsCount,
        fees: feeCount,
        syllabus: syllabusCount,
        homework: homeworkCount,
        notices: noticesCount,
        auditLogs: auditCount,
        expenses: expensesCount,
        discounts: discountsCount,
        questionBank: questionBankCount,
        leaves: leavesCount,
        communicationLogs: communicationLogsCount,
        restorePoints: restorePointsCount,
        batches: batchesCount,
        studentNotes: notesCount
      },
      storageEstimate,
      lastBackup: lastBackup ? lastBackup.value : null
    };
  } catch (err) {
    return {
      status: 'degraded',
      error: err.message,
      counts: {}
    };
  }
}

/**
 * Full JSON Backup Export
 */
export async function exportDatabaseBackup() {
  const [
    students,
    attendance,
    examResults,
    feePayments,
    syllabusProgress,
    routines,
    homeworks,
    notices,
    admissions,
    doubts,
    studyMaterials,
    guardianMessages,
    examPapers,
    auditLogs,
    expenses,
    discounts,
    questionBank,
    attendanceLeaves,
    communicationLogs,
    restorePoints,
    batches,
    studentNotes,
    settings
  ] = await Promise.all([
    db.students.toArray(),
    db.attendance.toArray(),
    db.examResults.toArray(),
    db.feePayments.toArray(),
    db.syllabusProgress.toArray(),
    db.routines.toArray(),
    db.homeworks.toArray(),
    db.notices.toArray(),
    db.admissions.toArray(),
    db.doubts.toArray(),
    db.studyMaterials.toArray(),
    db.guardianMessages.toArray(),
    db.examPapers.toArray(),
    db.auditLogs.toArray(),
    db.expenses ? db.expenses.toArray() : [],
    db.discounts ? db.discounts.toArray() : [],
    db.questionBank ? db.questionBank.toArray() : [],
    db.attendanceLeaves ? db.attendanceLeaves.toArray() : [],
    db.communicationLogs ? db.communicationLogs.toArray() : [],
    db.restorePoints ? db.restorePoints.toArray() : [],
    db.batches ? db.batches.toArray() : [],
    db.studentNotes ? db.studentNotes.toArray() : [],
    db.settings ? db.settings.toArray() : []
  ]);

  const timestamp = new Date().toISOString();
  const backupObject = {
    institution: 'B.G. TUTORIAL HOME — Babun Ghosh Sir',
    developer: 'Rahul Dutta',
    version: '7.0-OMNI-FIX-AUTOPILOT',
    exportTimestamp: timestamp,
    summary: {
      studentsCount: students.length,
      attendanceCount: attendance.length,
      examResultsCount: examResults.length,
      feesCount: feePayments.length,
      expensesCount: expenses.length,
      questionBankCount: questionBank.length,
      homeworkCount: homeworks.length,
      batchesCount: batches.length,
      notesCount: studentNotes.length
    },
    tables: {
      students,
      attendance,
      examResults,
      feePayments,
      syllabusProgress,
      routines,
      homeworks,
      notices,
      admissions,
      doubts,
      studyMaterials,
      guardianMessages,
      examPapers,
      auditLogs,
      expenses,
      discounts,
      questionBank,
      attendanceLeaves,
      communicationLogs,
      restorePoints,
      batches,
      studentNotes,
      settings
    }
  };

  await db.settings.put({ key: 'last_backup_timestamp', value: timestamp });
  await logAudit('BACKUP_EXPORT', 'SYSTEM', `Exported full database: ${students.length} students, ${expenses.length} expenses, ${questionBank.length} questions`);

  return backupObject;
}

/**
 * Restore Database Backup with validation & mode (replace | merge)
 */
export async function restoreDatabaseBackup(jsonData, mode = 'merge') {
  if (!jsonData || typeof jsonData !== 'object') {
    throw new Error('অবৈধ ব্যাকআপ ফাইল। সঠিক JSON ফরম্যাট প্রয়োজন।');
  }

  // Validate institution branding check
  if (!jsonData.institution || !jsonData.institution.includes('B.G. TUTORIAL HOME')) {
    throw new Error('ব্যাকআপ ফাইলের হেডার অমিল। এটি B.G. TUTORIAL HOME-এর অনুমোদিত ব্যাকআপ নয়।');
  }

  const tables = jsonData.tables || {};

  await db.transaction('rw', [
    db.students, db.attendance, db.examResults, db.feePayments,
    db.syllabusProgress, db.routines, db.homeworks, db.notices,
    db.admissions, db.doubts, db.studyMaterials, db.guardianMessages,
    db.examPapers, db.auditLogs, db.settings,
    db.expenses, db.discounts, db.questionBank,
    db.attendanceLeaves, db.communicationLogs, db.restorePoints,
    db.batches, db.studentNotes
  ], async () => {
    if (mode === 'replace') {
      await Promise.all([
        db.students.clear(),
        db.attendance.clear(),
        db.examResults.clear(),
        db.feePayments.clear(),
        db.syllabusProgress.clear(),
        db.routines.clear(),
        db.homeworks.clear(),
        db.notices.clear(),
        db.admissions.clear(),
        db.doubts.clear(),
        db.studyMaterials.clear(),
        db.guardianMessages.clear(),
        db.examPapers.clear(),
        db.expenses.clear(),
        db.discounts.clear(),
        db.questionBank.clear(),
        db.attendanceLeaves.clear(),
        db.communicationLogs.clear(),
        db.restorePoints.clear(),
        db.batches.clear(),
        db.studentNotes.clear()
      ]);
    }

    // Restore tables safely
    const restoreSimpleTable = async (tableObj, records) => {
      if (Array.isArray(records) && records.length > 0) {
        for (const item of records) {
          const { id, ...data } = item;
          await tableObj.add(data);
        }
      }
    };

    if (Array.isArray(tables.students)) {
      for (const s of tables.students) {
        const { id, ...data } = s;
        if (mode === 'merge' && data.studentId) {
          const existing = await db.students.where('studentId').equals(data.studentId).first();
          if (existing) {
            await db.students.update(existing.id, data);
            continue;
          }
        }
        await db.students.add(data);
      }
    }

    if (Array.isArray(tables.feePayments)) {
      for (const f of tables.feePayments) {
        const { id, ...data } = f;
        if (mode === 'merge' && data.receiptNo) {
          const existing = await db.feePayments.where('receiptNo').equals(data.receiptNo).first();
          if (existing) continue;
        }
        await db.feePayments.add(data);
      }
    }

    await restoreSimpleTable(db.attendance, tables.attendance);
    await restoreSimpleTable(db.examResults, tables.examResults);
    await restoreSimpleTable(db.homeworks, tables.homeworks);
    await restoreSimpleTable(db.notices, tables.notices);
    await restoreSimpleTable(db.routines, tables.routines);
    await restoreSimpleTable(db.syllabusProgress, tables.syllabusProgress);
    await restoreSimpleTable(db.expenses, tables.expenses);
    await restoreSimpleTable(db.discounts, tables.discounts);
    await restoreSimpleTable(db.questionBank, tables.questionBank);
    await restoreSimpleTable(db.attendanceLeaves, tables.attendanceLeaves);
    await restoreSimpleTable(db.communicationLogs, tables.communicationLogs);
    await restoreSimpleTable(db.restorePoints, tables.restorePoints);
    await restoreSimpleTable(db.batches, tables.batches);
    await restoreSimpleTable(db.studentNotes, tables.studentNotes);

    if (Array.isArray(tables.settings)) {
      for (const st of tables.settings) {
        await db.settings.put(st);
      }
    }

    await db.settings.put({ key: 'last_restore_timestamp', value: new Date().toISOString() });
    await logAudit('BACKUP_RESTORE', 'SYSTEM', `Restored backup in ${mode} mode.`);
  });

  return { success: true, mode };
}

export default {
  db,
  logAudit,
  logCommunication,
  createRestorePoint,
  revertToRestorePoint,
  migrateFromLocalStorage,
  getDbHealth,
  exportDatabaseBackup,
  restoreDatabaseBackup
};
