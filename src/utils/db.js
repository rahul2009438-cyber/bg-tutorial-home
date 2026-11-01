import Dexie from 'dexie';

export const db = new Dexie('BGTutorialHomeDB');

// Version 4: Core tables + restorePoints + batches + studentNotes + aiCache + settings
db.version(4).stores({
  students: '++id, studentId, name, batch, roll, phone, guardianPhone, status, createdAt',
  attendance: '++id, date, batch, studentId, status, timestamp',
  examResults: '++id, studentId, examName, subject, marks, totalMarks, grade, date',
  feePayments: '++id, studentId, month, amount, date, paymentMode, receiptNo, status',
  syllabusProgress: '++id, batch, subject, chapter, status, completionDate, notes',
  routines: '++id, day, startTime, endTime, batch, subject, room',
  homeworks: '++id, batch, subject, title, description, assignedDate, dueDate, status',
  notices: '++id, title, content, targetBatch, date, priority, isPinned',
  admissions: '++id, studentName, guardianName, phone, classApplied, previousSchool, status, applicationDate',
  doubts: '++id, studentId, subject, question, audioUrl, status, answer, date',
  studyMaterials: '++id, title, subject, targetBatch, fileUrl, fileType, uploadDate',
  guardianMessages: '++id, studentId, message, sender, timestamp, isRead',
  examPapers: '++id, title, targetClass, subject, examType, totalMarks, timeAllowed, createdAt',
  auditLogs: '++id, action, module, details, timestamp',
  expenses: '++id, title, category, amount, date, remarks',
  discounts: '++id, studentId, discountType, amount, reason, date',
  questionBank: '++id, classLevel, subject, topic, marks, questionType, isFavorite',
  attendanceLeaves: '++id, studentId, type, startDate, endDate, reason, status, timestamp',
  communicationLogs: '++id, studentId, studentName, guardianPhone, channel, topic, messageContent, sentAt, sentBy',
  restorePoints: '++id, label, createdAt',
  batches: '++id, name, subject, feeAmount, scheduleSummary, activeStudentCount, maxCapacity',
  studentNotes: '++id, studentId, noteText, noteType, createdAt',
  aiCache: '++id, promptHash, promptType, responseText, createdAt',
  settings: '++id, key, value'
});

export const exportDatabaseBackup = async () => {
  const tables = {
    students: await db.students.toArray(),
    attendance: await db.attendance.toArray(),
    examResults: await db.examResults.toArray(),
    feePayments: await db.feePayments.toArray(),
    syllabusProgress: await db.syllabusProgress.toArray(),
    routines: await db.routines.toArray(),
    homeworks: await db.homeworks.toArray(),
    notices: await db.notices.toArray(),
    admissions: await db.admissions.toArray(),
    doubts: await db.doubts.toArray(),
    studyMaterials: await db.studyMaterials.toArray(),
    guardianMessages: await db.guardianMessages.toArray(),
    examPapers: await db.examPapers.toArray(),
    expenses: await db.expenses.toArray(),
    discounts: await db.discounts.toArray(),
    questionBank: await db.questionBank.toArray(),
    attendanceLeaves: await db.attendanceLeaves.toArray(),
    communicationLogs: await db.communicationLogs.toArray(),
    batches: await db.batches.toArray(),
    studentNotes: await db.studentNotes.toArray(),
    settings: await db.settings.toArray()
  };

  const backupData = {
    app: 'B.G. TUTORIAL HOME',
    version: '4.0.0',
    exportDate: new Date().toISOString(),
    data: tables
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BG_Tutorial_Home_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const restoreDatabaseBackup = async (jsonString) => {
  const backup = JSON.parse(jsonString);
  if (!backup.data) throw new Error('Invalid backup format');

  await db.transaction('rw', [
    db.students, db.attendance, db.examResults, db.feePayments,
    db.syllabusProgress, db.routines, db.homeworks, db.notices,
    db.admissions, db.doubts, db.studyMaterials, db.guardianMessages,
    db.examPapers, db.expenses, db.discounts, db.questionBank,
    db.attendanceLeaves, db.communicationLogs, db.batches, db.studentNotes,
    db.settings
  ], async () => {
    for (const [tableName, records] of Object.entries(backup.data)) {
      if (db[tableName] && Array.isArray(records)) {
        await db[tableName].clear();
        await db[tableName].bulkAdd(records);
      }
    }
  });

  return true;
};
