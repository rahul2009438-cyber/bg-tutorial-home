import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle2, AlertTriangle, Users, BookOpen, 
  DollarSign, ShieldAlert, Sparkles, FileText, ArrowRight, Check,
  UserCheck, UserX, AlertCircle, RefreshCw, Zap, Bell, ChevronRight
} from 'lucide-react';
import { db, createRestorePoint } from '../utils/db';

export default function SmartDailyDashboard({ 
  customData = {}, 
  students = [], 
  routine = [], 
  notices = [], 
  doubts = [], 
  homeworkList = [], 
  feeRecords = [],
  onNavigateTab 
}) {
  const [todayAttendance, setTodayAttendance] = useState({ present: 0, absent: 0, late: 0, total: 0 });
  const [pendingFees, setPendingFees] = useState([]);
  const [todayHomeworks, setTodayHomeworks] = useState([]);
  const [backupStatus, setBackupStatus] = useState('');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [todaySchedules, setTodaySchedules] = useState([]);

  // Days in Bengali
  const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayNamesBn = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const todayEn = dayNamesEn[new Date().getDay()];
  const todayBn = dayNamesBn[new Date().getDay()];
  const todayIso = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadDailyOverview();
  }, [students, routine, feeRecords, homeworkList]);

  const loadDailyOverview = async () => {
    try {
      // 1. Filter today's schedules
      const currentDaySchedules = (routine || []).filter(r => 
        (r.day || '').toLowerCase().includes(todayEn.toLowerCase()) || 
        (r.day || '').includes(todayBn)
      );
      setTodaySchedules(currentDaySchedules);

      // 2. Attendance summary for today
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;

      // Check Dexie attendanceLeaves if any
      const leavesToday = db.attendanceLeaves ? await db.attendanceLeaves.where('date').equals(todayIso).toArray() : [];
      const leaveMap = new Map();
      leavesToday.forEach(l => leaveMap.set(l.studentId, l.type));

      students.forEach(s => {
        const leaveType = leaveMap.get(s.studentId || s.id);
        if (leaveType === 'Late') {
          lateCount++;
        } else if (leaveType === 'Leave' || leaveType === 'Absent' || s.status === 'absent') {
          absentCount++;
        } else {
          presentCount++;
        }
      });
      setTodayAttendance({
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        total: students.length
      });

      // 3. Pending fees for current month
      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      const currentMonthBangla = new Intl.DateTimeFormat('bn-BD', { month: 'long', year: 'numeric' }).format(new Date());
      const paidStudentIds = new Set(
        (feeRecords || [])
          .filter(f => (f.month || '').includes(currentMonth) || (f.month || '').includes(currentMonthBangla))
          .map(f => f.studentId)
      );

      const dueStudents = students.filter(s => !paidStudentIds.has(s.studentId || s.id));
      setPendingFees(dueStudents);

      // 4. Homeworks due today or recently
      const dueHw = (homeworkList || []).filter(h => h.dueDate && h.dueDate >= todayIso);
      setTodayHomeworks(dueHw);

    } catch (err) {
      console.warn('Daily overview load err:', err);
    }
  };

  const handleInstantBackup = async () => {
    setIsBackingUp(true);
    setBackupStatus('রিকভারি পয়েন্ট তৈরি হচ্ছে...');
    try {
      const res = await createRestorePoint(`সকালের স্বয়ংক্রিয় ব্যাকআপ (${todayBn})`, 'স্মার্ট দৈনিক ড্যাশবোর্ড থেকে তাৎক্ষণিক ব্যাকআপ');
      setBackupStatus(`✅ রিকভারি পয়েন্ট #${res.id} সফলভাবে সংরক্ষিত!`);
      setTimeout(() => setBackupStatus(''), 4000);
    } catch (e) {
      setBackupStatus('❌ ব্যাকআপ ব্যর্থ: ' + e.message);
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive Morning Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl border border-emerald-800/40 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>স্মার্ট দৈনিক ড্যাশবোর্ড • {todayBn}, {new Date().toLocaleDateString('bn-BD')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              সুপ্রভাত, {customData.teacherName || 'বাপুন ঘোষ স্যার'}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 max-w-2xl leading-relaxed">
              আজকের ব্যাচ শিডিউল, রোল-কল হাজিরা ও ফি সংগ্রহের ওভারভিউ নিচে তৈরি রয়েছে। ১-ক্লিকে যেকোনো অ্যাকশন সম্পন্ন করুন।
            </p>
          </div>

          <div className="flex flex-col items-end shrink-0">
            <span className="text-xs text-slate-400 font-mono">লাইভ স্ট্যাটাস</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-sm font-bold text-white">অফলাইন ফার্স্ট মোড সক্রিয়</span>
            </div>
          </div>
        </div>

        {/* 1-Click Quick Action Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('leave_late')}
            className="flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition active:scale-95"
          >
            <UserCheck className="w-4 h-4" />
            <span>📋 হাজিরা নিন</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('question_bank')}
            className="flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>📝 প্রশ্নপত্র তৈরি</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('financial_ledger')}
            className="flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition active:scale-95"
          >
            <DollarSign className="w-4 h-4" />
            <span>💰 ফি ও লেজার</span>
          </button>

          <button
            type="button"
            onClick={handleInstantBackup}
            disabled={isBackingUp}
            className="flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-black text-xs border border-rose-500/30 shadow-md transition active:scale-95 disabled:opacity-60"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>🛡️ তাৎক্ষণিক ব্যাকআপ</span>
          </button>
        </div>

        {backupStatus && (
          <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-fadeIn">
            {backupStatus}
          </div>
        )}
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Summary */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">আজকের হাজিরা</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{todayAttendance.present}</span>
            <span className="text-xs text-slate-500 font-bold">/ {todayAttendance.total} শিক্ষার্থী</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] pt-1">
            <span className="text-emerald-600 font-bold">উপস্থিত: {todayAttendance.present}</span>
            <span className="text-rose-600 font-bold">অনুপস্থিত: {todayAttendance.absent}</span>
            {todayAttendance.late > 0 && <span className="text-amber-600 font-bold">দেরি: {todayAttendance.late}</span>}
          </div>
        </div>

        {/* Today's Batches */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">আজকের ব্যাচ শিডিউল</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{todaySchedules.length}</span>
            <span className="text-xs text-slate-500 font-bold">টি ব্যাচ সক্রিয়</span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {todaySchedules.length > 0 
              ? todaySchedules.map(s => `${s.batch} (${s.time})`).join(', ') 
              : 'আজকের কোনো ব্যাচ শিডিউল নেই'}
          </p>
        </div>

        {/* Pending Month Fees */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">চলতি মাসের ফি বাকি</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-amber-600">{pendingFees.length}</span>
            <span className="text-xs text-slate-500 font-bold">জন শিক্ষার্থী</span>
          </div>
          <p className="text-[11px] text-slate-500">
            মোট বকেয়া ফি সংগ্রহ ত্বরান্বিত করতে রিমাইন্ডার পাঠান
          </p>
        </div>

        {/* Unresolved Doubts / Homework */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">অপেক্ষমাণ ডাউট ও হোমওয়ার্ক</span>
            <BookOpen className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-rose-600">
              {(doubts || []).filter(d => d.status !== 'answered').length}
            </span>
            <span className="text-xs text-slate-500 font-bold">টি নতুন প্রশ্ন</span>
          </div>
          <p className="text-[11px] text-slate-500">
            চলতি হোমওয়ার্ক: {todayHomeworks.length} টি নির্ধারিত
          </p>
        </div>
      </div>

      {/* 3. Detailed Daily Schedule & Quick Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>আজকের পাঠদান রুটিন ও ব্যাচ ({todayBn})</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('routine')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center space-x-1"
            >
              <span>রুটিন পরিবর্তন</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todaySchedules.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs font-bold">
              আজকে পূর্ব-নির্ধারিত কোনো ব্যাচ নেই। নতুন ব্যাচ স্লট যোগ করতে রুটিন ম্যানেজারে যান।
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedules.map((sc, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-black">
                        {sc.batch}
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm">{sc.subject}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center space-x-2">
                      <span>⏰ {sc.time}</span>
                      <span>•</span>
                      <span>📍 {sc.location || 'টিউটোরিয়াল হোম'}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateTab && onNavigateTab('unified_batch')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition active:scale-95"
                  >
                    ব্যাচে যান
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Due Fees & Absent Student Alerts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center space-x-2">
              <Bell className="w-4 h-4 text-amber-600" />
              <span>জরুরি ফি রিমাইন্ডার ও অনুপস্থিত অ্যালার্ট</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('financial_ledger')}
              className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center space-x-1"
            >
              <span>সকল ফি দেখুন</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingFees.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-bold">
              🎉 চমৎকার! সকল শিক্ষার্থীর চলতি মাসের ফি পরিশোধ সম্পন্ন হয়েছে।
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {pendingFees.slice(0, 6).map((st, i) => (
                <div key={st.id || i} className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900">{st.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px]">
                        {st.batch} (রোল {st.roll || 'N/A'})
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">ফোন: {st.guardianPhone || st.phone}</span>
                  </div>
                  <a
                    href={`https://wa.me/91${(st.guardianPhone || st.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`নমস্কার, বি.জি. টিউটোরিয়াল হোম থেকে বাপুন স্যার। আপনার সন্তান ${st.name}-এর চলতি মাসের টিউশন ফি বকেয়া রয়েছে। অনুগ্রহ করে যোগাযোগ করুন।`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition active:scale-95"
                  >
                    ফি রিমাইন্ডার WhatsApp
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
