import React, { useState, useEffect } from 'react';
import { 
  User, Award, Calendar, BookOpen, CreditCard, AlertTriangle, 
  CheckCircle2, Clock, Phone, MessageSquare, Printer, ArrowLeft,
  TrendingUp, FileText, ChevronRight
} from 'lucide-react';
import { db } from '../utils/db';

export default function Student360Profile({ 
  student, 
  onClose,
  customData = {}
}) {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [examRecords, setExamRecords] = useState([]);
  const [feeRecords, setFeeRecords] = useState([]);
  const [homeworkRecords, setHomeworkRecords] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const stId = student.studentId || student.id;
        const [att, exams, fees, hw] = await Promise.all([
          db.attendance.where('studentId').equals(stId).toArray(),
          db.examResults.where('studentId').equals(stId).toArray(),
          db.feePayments.where('studentId').equals(stId).toArray(),
          db.homeworks.where('batch').equals(student.batch || 'Class 10').toArray()
        ]);
        setAttendanceRecords(att);
        setExamRecords(exams);
        setFeeRecords(fees);
        setHomeworkRecords(hw);
      } catch (err) {
        console.warn('Error loading student 360:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfileData();
  }, [student]);

  if (!student) return null;

  // Calculate Attendance Percentage
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(r => r.status === 'P').length;
  const attPct = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 100;

  // Calculate Exam Average
  const totalMarksScored = examRecords.reduce((a, b) => a + (Number(b.marks) || 0), 0);
  const totalMarksMax = examRecords.reduce((a, b) => a + (Number(b.totalMarks) || 0), 0);
  const examAvgPct = totalMarksMax > 0 ? ((totalMarksScored / totalMarksMax) * 100).toFixed(1) : 0;

  // Total Fees Paid
  const totalFeesPaid = feeRecords.reduce((a, b) => a + (Number(b.amount) || 0), 0);

  const isLowAttendance = totalDays >= 5 && Number(attPct) < 75;
  const isWeakAcademic = examRecords.length > 0 && Number(examAvgPct) < 40;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl my-8 text-white flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xl">
              {student.roll || student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white">{student.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {student.batch}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                UID: {student.studentId || 'BG-AUTO'} • রোল: {student.roll || '—'} • ফোন: {student.phone || '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center space-x-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট ডজিয়ার</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border ${
              isLowAttendance ? 'bg-rose-950/30 border-rose-500/40 text-rose-300' : 'bg-slate-800/60 border-slate-700 text-slate-200'
            }`}>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>হাজিরা শতাংশ</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">{attPct}%</div>
              <div className="text-[11px] text-slate-400 mt-1">{presentDays}/{totalDays} দিন উপস্থিত</div>
            </div>

            <div className={`p-4 rounded-2xl border ${
              isWeakAcademic ? 'bg-rose-950/30 border-rose-500/40 text-rose-300' : 'bg-slate-800/60 border-slate-700 text-slate-200'
            }`}>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>পরীক্ষার গড় স্কোর</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">{examAvgPct}%</div>
              <div className="text-[11px] text-slate-400 mt-1">{examRecords.length} টি পরীক্ষা অনুষ্ঠিত</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 text-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>মোট ফি পরিশোধ</span>
                <CreditCard className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">₹{totalFeesPaid}</div>
              <div className="text-[11px] text-slate-400 mt-1">{feeRecords.length} টি রসিদ নথিভুক্ত</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 text-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>হোমওয়ার্ক টাস্ক</span>
                <BookOpen className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-white">{homeworkRecords.length}</div>
              <div className="text-[11px] text-slate-400 mt-1">চলতি এসাইনমেন্ট</div>
            </div>
          </div>

          {/* Risk Alerts if Any */}
          {(isLowAttendance || isWeakAcademic) && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-rose-200 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>একাডেমিক পর্যবেক্ষণ ও সতর্কতা অ্যালার্ট (Risk Signals)</span>
              </div>
              <ul className="text-xs space-y-1 list-disc list-inside text-rose-200/90 pl-1">
                {isLowAttendance && <li>হাজিরা ৭৫%-এর নিচে ({attPct}%)। অভিভাবকের সাথে অবিলম্বে যোগাযোগ করা বাঞ্ছনীয়।</li>}
                {isWeakAcademic && <li>পরীক্ষার গড় নম্বর ৪০%-এর নিচে ({examAvgPct}%)। বিশেষ রেমিডিয়াল ক্লাস ও দুর্বল চ্যাপ্টারে অনুশীলন প্রয়োজন।</li>}
              </ul>
            </div>
          )}

          {/* Two-column layout: Exam History & Fee History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exam History */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-white flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>পরীক্ষার ফলাফল ইতিহাস ({examRecords.length})</span>
                </h3>
              </div>
              {examRecords.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">এখনও কোনো পরীক্ষার ফলাফল রেকর্ড করা হয়নি।</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {examRecords.map((ex, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{ex.examName}</div>
                        <div className="text-[10px] text-slate-400">{ex.date || 'তারিখ নেই'}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-emerald-400">{ex.marks} / {ex.totalMarks}</span>
                        <span className="block text-[10px] text-slate-400">{ex.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fee History */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-white flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>ফি পরিশোধের ইতিহাস ({feeRecords.length})</span>
                </h3>
              </div>
              {feeRecords.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">কোনো ফি পরিশোধের রেকর্ড পাওয়া যায়নি।</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {feeRecords.map((f, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{f.month} — রসিদ: {f.receiptNo}</div>
                        <div className="text-[10px] text-slate-400">{f.date} • {f.paymentMode}</div>
                      </div>
                      <div className="font-black text-emerald-400">₹{f.amount}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
