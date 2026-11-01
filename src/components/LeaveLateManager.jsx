import React, { useState, useEffect } from 'react';
import { 
  UserCheck, UserX, Clock, Calendar, Printer, Filter, 
  Search, AlertCircle, CheckCircle2, ChevronRight, Plus, Trash2, FileText
} from 'lucide-react';
import { db, logAudit } from '../utils/db';
import { getLocalIndianDate, getLocalIndianMonth } from '../utils/dateUtils';

export default function LeaveLateManager({ students = [], customData = {} }) {
  const [selectedBatch, setSelectedBatch] = useState('সকল ব্যাচ');
  const [selectedMonth, setSelectedMonth] = useState(getLocalIndianMonth());
  const [leavesList, setLeavesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeForm, setActiveForm] = useState({
    studentId: '',
    date: getLocalIndianDate(),
    type: 'Late', // 'Leave' | 'Late' | 'Absent'
    reason: 'ট্রাফিক জ্যাম ও দেরি',
    arrivalTime: '08:15'
  });
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    loadLeaves();
  }, [selectedMonth]);

  const loadLeaves = async () => {
    try {
      if (!db.attendanceLeaves) return;
      const all = await db.attendanceLeaves.toArray();
      // Filter by selected month
      const filtered = all.filter(item => (item.date || '').startsWith(selectedMonth));
      setLeavesList(filtered);
    } catch (e) {
      console.warn('Leaves load err:', e);
    }
  };

  const handleRecordEntry = async (e) => {
    e.preventDefault();
    if (!activeForm.studentId) {
      alert('দয়া করে শিক্ষার্থী নির্বাচন করুন');
      return;
    }

    try {
      const student = students.find(s => String(s.studentId || s.id) === String(activeForm.studentId));
      await db.attendanceLeaves.add({
        studentId: activeForm.studentId,
        studentName: student ? student.name : 'Unknown',
        batch: student ? student.batch : 'Class 10',
        date: activeForm.date,
        type: activeForm.type,
        reason: activeForm.reason,
        arrivalTime: activeForm.type === 'Late' ? activeForm.arrivalTime : ''
      });

      await logAudit('ATTENDANCE_LEAVE_LOG', 'STUDENT', `${student?.name}: ${activeForm.type} on ${activeForm.date}`);
      setStatusMsg(`✅ সফলভাবে ${activeForm.type === 'Late' ? 'দেরিতে আসার তথ্য' : 'ছুটি/অনুপস্থিতি'} নথিভুক্ত হয়েছে!`);
      setTimeout(() => setStatusMsg(''), 3000);
      loadLeaves();
    } catch (err) {
      alert('সংরক্ষণ ব্যর্থ: ' + err.message);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (window.confirm('এই রেকর্ডটি কি মুছে ফেলতে চান?')) {
      await db.attendanceLeaves.delete(id);
      loadLeaves();
    }
  };

  // Filter students based on batch and search
  const filteredStudents = students.filter(s => {
    const matchesBatch = selectedBatch === 'সকল ব্যাচ' || s.batch === selectedBatch;
    const matchesSearch = !searchQuery || 
      (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.roll && String(s.roll).includes(searchQuery));
    return matchesBatch && matchesSearch;
  });

  // Calculate Monthly Aggregate Attendance for each student
  // Assume standard 12 classes per month for tuition batch
  const TOTAL_MONTHLY_CLASSES = 12;

  const studentAggregates = filteredStudents.map(s => {
    const stId = String(s.studentId || s.id);
    const records = leavesList.filter(l => String(l.studentId) === stId);
    const leaveCount = records.filter(r => r.type === 'Leave').length;
    const absentCount = records.filter(r => r.type === 'Absent').length;
    const lateCount = records.filter(r => r.type === 'Late').length;

    // Weighting: Absent = 0, Leave = 0.5 (excused), Late = 0.8 (partially attended)
    const effectiveAttended = Math.max(
      0, 
      TOTAL_MONTHLY_CLASSES - absentCount - (leaveCount * 0.5) - (lateCount * 0.2)
    );
    const percentage = Math.min(100, Math.round((effectiveAttended / TOTAL_MONTHLY_CLASSES) * 100));

    return {
      student: s,
      records,
      leaveCount,
      absentCount,
      lateCount,
      percentage
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white p-6 rounded-3xl shadow-lg border border-amber-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>স্মার্ট লিভ ও লেইট ট্র্যাকার • LEAVE & LATE MANAGEMENT</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">দেরিতে আগমন, অনুমোদনকৃত ছুটি ও উপস্থিতি বিশ্লেষণ</h2>
          <p className="text-xs text-amber-100 mt-1 max-w-xl">
            দেরিতে আসার সময় নথিভুক্ত করুন, ছুটির আবেদন অনুমোদন করুন এবং স্বয়ংক্রিয় ওয়েটেড পার্সেন্টেজ হিসাব করুন।
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-2xl bg-white text-slate-900 font-black text-xs flex items-center space-x-2 shadow-md hover:bg-slate-100 transition active:scale-95 shrink-0"
        >
          <Printer className="w-4 h-4 text-amber-600" />
          <span>মাসিক হাজিরা শিট প্রিন্ট করুন</span>
        </button>
      </div>

      {/* Action / Record Form (Print Hidden) */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4 print:hidden">
        <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center space-x-2">
          <Plus className="w-4 h-4 text-emerald-600" />
          <span>নতুন ছুটি বা দেরির এন্ট্রি নথিভুক্ত করুন</span>
        </h3>

        <form onSubmit={handleRecordEntry} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Select Student */}
          <div className="lg:col-span-2">
            <label className="text-xs font-bold text-slate-600 block mb-1">শিক্ষার্থী নির্বাচন</label>
            <select
              value={activeForm.studentId}
              onChange={(e) => setActiveForm({ ...activeForm, studentId: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
              required
            >
              <option value="">-- শিক্ষার্থী বেছে নিন --</option>
              {students.map(s => (
                <option key={s.id} value={s.studentId || s.id}>
                  {s.name} ({s.batch} • রোল: {s.roll || 'N/A'})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">তারিখ</label>
            <input
              type="date"
              value={activeForm.date}
              onChange={(e) => setActiveForm({ ...activeForm, date: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">ধরণ</label>
            <select
              value={activeForm.type}
              onChange={(e) => setActiveForm({ ...activeForm, type: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
            >
              <option value="Late">⏰ দেরিতে আগমন (Late)</option>
              <option value="Leave">📝 অনুমোদিত ছুটি (Leave)</option>
              <option value="Absent">❌ বিনা নোটিশে অনুপস্থিত (Absent)</option>
            </select>
          </div>

          {/* Arrival Time or Reason */}
          {activeForm.type === 'Late' ? (
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">আসার সময়</label>
              <input
                type="time"
                value={activeForm.arrivalTime}
                onChange={(e) => setActiveForm({ ...activeForm, arrivalTime: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
              />
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">ছুটির কারণ</label>
              <input
                type="text"
                placeholder="যেমন: জ্বর / পারিবারিক অনুষ্ঠান"
                value={activeForm.reason}
                onChange={(e) => setActiveForm({ ...activeForm, reason: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white"
              />
            </div>
          )}

          <div className="lg:col-span-5 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition active:scale-95"
            >
              রেকর্ড সংরক্ষণ করুন
            </button>
          </div>
        </form>

        {statusMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold text-center">
            {statusMsg}
          </div>
        )}
      </div>

      {/* Filter Bar (Print Hidden) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-slate-100 rounded-2xl print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600">ব্যাচ ফিল্টার:</span>
          {['সকল ব্যাচ', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(b => (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBatch(b)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedBatch === b ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-slate-600">মাস:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
          />
        </div>
      </div>

      {/* Aggregate Attendance Table (Print styled) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-5 sm:p-6 print:p-0 print:border-none">
        <div className="hidden print:block mb-4 text-center border-b pb-3">
          <h2 className="text-xl font-black text-slate-900">B.G. TUTORIAL HOME — বাপুন ঘোষ স্যার</h2>
          <p className="text-xs text-slate-600">দক্ষিণ হাবড়া, এস. এন দে রোড • ফোন: {customData.phone || '9733974425'}</p>
          <h3 className="text-sm font-bold text-slate-800 mt-1">মাসিক শিক্ষার্থী উপস্থিতি, ছুটি ও লেইট রেজিস্টার ({selectedMonth})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                <th className="p-3">রোল</th>
                <th className="p-3">শিক্ষার্থীর নাম</th>
                <th className="p-3">ব্যাচ</th>
                <th className="p-3 text-center">দেরিতে আগমন (Late)</th>
                <th className="p-3 text-center">অনুমোদিত ছুটি (Leave)</th>
                <th className="p-3 text-center">অনুপস্থিত (Absent)</th>
                <th className="p-3 text-center">ওয়েটেড উপস্থিতি %</th>
                <th className="p-3 text-right print:hidden">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentAggregates.map(({ student, records, lateCount, leaveCount, absentCount, percentage }) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3 font-mono font-bold">{student.roll || 'N/A'}</td>
                  <td className="p-3">
                    <div className="font-extrabold text-slate-900">{student.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{student.studentId}</div>
                  </td>
                  <td className="p-3 font-medium text-slate-600">{student.batch}</td>
                  <td className="p-3 text-center">
                    {lateCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                        {lateCount} বার
                      </span>
                    ) : (
                      <span className="text-slate-400">০</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {leaveCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold">
                        {leaveCount} দিন
                      </span>
                    ) : (
                      <span className="text-slate-400">০</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {absentCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 font-bold">
                        {absentCount} দিন
                      </span>
                    ) : (
                      <span className="text-slate-400">০</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full font-black text-xs ${
                      percentage >= 80 ? 'bg-emerald-100 text-emerald-800' :
                      percentage >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {percentage}%
                    </span>
                  </td>
                  <td className="p-3 text-right print:hidden">
                    {records.length > 0 && (
                      <div className="space-x-1">
                        {records.map(r => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => handleDeleteEntry(r.id)}
                            title={`মুছুন: ${r.type} (${r.date})`}
                            className="p-1 hover:bg-rose-100 text-rose-600 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
