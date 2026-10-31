import { verifyTeacherPin } from '../utils/security';
import React, { useState, useEffect } from 'react';
import { 
  UserCheck, ShieldCheck, BookOpen, DollarSign, Calendar, MessageSquare, 
  Send, LogOut, CheckCircle2, AlertCircle, FileText, ArrowRight, Star, 
  HelpCircle, Sparkles, Clock, MapPin, Phone, Lock, ChevronRight, Download,
  User, Compass, Award, ExternalLink, RefreshCw, Save, Camera, Check,
  BookMarked, HelpCircle as QuestionIcon, MessageCircle
} from 'lucide-react';

const AVATAR_PRESETS = [
  { id: 'av1', emoji: '👨‍🎓', label: 'স্কলার (ছাত্র)' },
  { id: 'av2', emoji: '👩‍🎓', label: 'স্কলার (ছাত্রী)' },
  { id: 'av3', emoji: '🧑‍💻', label: 'ম্যাথ চ্যাম্প' },
  { id: 'av4', emoji: '🔬', label: 'সায়েন্স এক্সপ্লোরার' },
  { id: 'av5', emoji: '📘', label: 'বুক লাভার' },
  { id: 'av6', emoji: '🏆', label: 'টপার' },
  { id: 'av7', emoji: '🌟', label: 'স্টার লার্নার' },
  { id: 'av8', emoji: '🎯', label: 'লক্ষ্যভেদ' }
];

export default function StudentPortal({ 
  students = [], 
  studyMaterials = [], 
  feeRecords = [], 
  notices = [], 
  routine = [], 
  doubts = [], 
  onSaveDoubts, 
  onUpdateStudentProfile,
  onLoginStateChange,
  initialStudentId = '',
  customData = {},
  setActiveTab: setParentNavTab
}) {
  const [studentIdInput, setStudentIdInput] = useState(initialStudentId || '');
  const [loggedInStudent, setLoggedInStudent] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [portalTab, setPortalTab] = useState('profile');
  const [isTeacherInspector, setIsTeacherInspector] = useState(false); // 'profile', 'books', 'attendance_log', 'notes', 'routine', 'doubts', 'fees'
  
  // Profile update form state
  const [profileForm, setProfileForm] = useState({
    dob: '',
    email: '',
    targetGoal: '৯৫%+ নম্বর অর্জন (স্টার মার্কস)',
    focusSubject: 'Mathematics & Physical Science',
    address: '',
    landmark: '',
    mapLocation: '',
    notes: '',
    avatar: '👨‍🎓'
  });
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Doubt state
  const [doubtSubject, setDoubtSubject] = useState('Mathematics');
  const [doubtText, setDoubtText] = useState('');
  const [doubtSuccess, setDoubtSuccess] = useState('');

  // Persist session in localStorage & sync
  useEffect(() => {
    try {
      if (initialStudentId && !loggedInStudent) {
        setStudentIdInput(initialStudentId);
      }
      const savedSession = localStorage.getItem('bg_logged_in_student');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        const matched = (students || []).find(s => 
          (s.studentId && parsed.studentId && s.studentId.trim().toLowerCase() === parsed.studentId.trim().toLowerCase()) || 
          (s.id && String(s.id) === String(parsed.id)) ||
          (s.phone && parsed.phone && s.phone.replace(/\D/g, '') === parsed.phone.replace(/\D/g, ''))
        );
        const activeStudent = matched || parsed;
        setLoggedInStudent(activeStudent);
        syncProfileForm(activeStudent);
        if (onLoginStateChange) onLoginStateChange(activeStudent);
      }
    } catch (e) {
      console.warn('Session parse error:', e);
    }
  }, [students, initialStudentId]);

  const syncProfileForm = (st) => {
    setProfileForm({
      dob: st.dob || '2009-08-15',
      email: st.email || '',
      targetGoal: st.targetGoal || '৯৫%+ নম্বর অর্জন (স্টার মার্কস)',
      focusSubject: st.focusSubject || 'গণিত ও বিজ্ঞান',
      address: st.address || '',
      landmark: st.landmark || '',
      mapLocation: st.mapLocation || '',
      notes: st.notes || '',
      avatar: st.avatar || '👨‍🎓'
    });
  };

  // Student Portal Login Action
  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setLoginError('');

    const query = (studentIdInput || '').trim().toUpperCase();
    if (!query) {
      setLoginError('অনুগ্রহ করে আপনার সঠিক ইউনিক স্টুডেন্ট আইডি প্রদান করুন।');
      return;
    }

    const cleanPhone = query.replace(/\D/g, '');
    const matched = (students || []).find(s => {
      const matchId = s.studentId && s.studentId.trim().toUpperCase() === query;
      const matchReg = s.regId && s.regId.trim().toUpperCase() === query;
      const matchRoll = s.roll && (`BG-${s.roll}`.toUpperCase() === query || `ROLL-${s.roll}`.toUpperCase() === query || String(s.roll).trim() === query);
      const matchPhone = cleanPhone.length >= 10 && s.phone && s.phone.replace(/\D/g, '').includes(cleanPhone);
      return matchId || matchReg || matchRoll || matchPhone;
    });

    if (matched) {
      setLoggedInStudent(matched);
      syncProfileForm(matched);
      localStorage.setItem('bg_logged_in_student', JSON.stringify(matched));
      if (onLoginStateChange) onLoginStateChange(matched);
      setStudentIdInput('');
    } else {
      setLoginError(`❌ "${query}" আইডির কোনো অনুমোদিত শিক্ষার্থী পাওয়া যায়নি! সঠিক ইউনিক আইডি প্রদান করুন। আপনার আইডি না থাকলে প্রথমে 'শিক্ষার্থী রেজিস্ট্রেশন' সম্পন্ন করে বাবুন স্যারের অনুমোদন নিন।`);
    }
  };

  const handleLogout = () => {
    setLoggedInStudent(null);
    localStorage.removeItem('bg_logged_in_student');
    if (onLoginStateChange) onLoginStateChange(null);
  };

  // Handle Profile Update & Save
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!loggedInStudent) return;

    const updated = {
      ...loggedInStudent,
      dob: profileForm.dob,
      email: profileForm.email,
      targetGoal: profileForm.targetGoal,
      focusSubject: profileForm.focusSubject,
      address: profileForm.address,
      landmark: profileForm.landmark,
      mapLocation: profileForm.mapLocation,
      notes: profileForm.notes,
      avatar: profileForm.avatar
    };

    setLoggedInStudent(updated);
    localStorage.setItem('bg_logged_in_student', JSON.stringify(updated));

    if (onUpdateStudentProfile) {
      onUpdateStudentProfile(updated);
    }
    if (onLoginStateChange) {
      onLoginStateChange(updated);
    }

    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 4000);
  };

  // Custom Photo Upload Handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('ছবির সাইজ ২ মেগাবাইট (2MB)-এর কম হতে হবে।');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfileForm(prev => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // GPS Auto-detect
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('আপনার ব্রাউজারে জিপিএস সুবিধা সমর্থিত নয়। ম্যানুয়ালি ঠিকানা লিখুন।');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        setProfileForm(prev => ({
          ...prev,
          mapLocation: mapUrl
        }));
        alert('📍 আপনার সঠিক Google Maps লোকেশন সফলভাবে চিহ্নিত করা হয়েছে!');
      },
      (err) => {
        setGpsLoading(false);
        console.warn(err);
        alert('লোকেশন পারমিশন মেলেনি। আপনি সরাসরি Google Maps লিঙ্ক এখানে পেস্ট করতে পারেন।');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Submit Doubt to Babun Sir
  const handleSubmitDoubt = (e) => {
    e.preventDefault();
    if (!doubtText.trim() || !loggedInStudent) return;

    const newDoubtItem = {
      id: Date.now(),
      studentId: loggedInStudent.studentId || `BG-STUDENT-${loggedInStudent.roll || '01'}`,
      studentName: loggedInStudent.name,
      batch: loggedInStudent.batch,
      phone: loggedInStudent.phone,
      subject: doubtSubject,
      text: doubtText.trim(),
      date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      status: 'pending'
    };

    const updated = [newDoubtItem, ...(doubts || [])];
    if (onSaveDoubts) {
      onSaveDoubts(updated);
    }
    setDoubtText('');
    setDoubtSuccess('আপনার ডাউট সফলভাবে বাবুন স্যারের কাছে পাঠানো হয়েছে! স্যার শীঘ্রই উত্তর দেবেন।');
    setTimeout(() => setDoubtSuccess(''), 4000);
  };

  // Curated Textbook Recommendations by Class
  const getRecommendedBooks = (batchName = '') => {
    const b = batchName.toLowerCase();
    if (b.includes('7') || b.includes('8')) {
      return [
        {
          id: 'b1',
          title: 'গণিতপ্রভা (WBBSE মূল পাঠ্যপুস্তক)',
          author: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ',
          subject: 'গণিত',
          tip: 'বোর্ডের প্রতিটি কষে দেখি ও উদাহরণ খাতায় সমাধান করতে হবে। মূল ধারণার ভিত্তি মজবুত করার জন্য অপরিহার্য।',
          grade: 'Class 7 & 8',
          badge: 'অফিসিয়াল পাঠ্যবই'
        },
        {
          id: 'b2',
          title: 'পরিবেশ ও বিজ্ঞান',
          author: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ',
          subject: 'বিজ্ঞান',
          tip: 'ভৌতবিজ্ঞান ও জীবনবিজ্ঞানের সমীকরণ ও চিত্র নিজে হাতে আঁকার অভ্যাস গড়ে তোলো।',
          grade: 'Class 7 & 8',
          badge: 'অফিসিয়াল পাঠ্যবই'
        },
        {
          id: 'b3',
          title: 'রায় ও মার্টিন প্রশ্নবিচিত্রা',
          author: 'রায় ও মার্টিন',
          subject: 'প্রশ্নোত্তর সংকলন',
          tip: 'স্কুল পরীক্ষার শর্ট কোয়েশ্চন ও মডেল সেটের জন্য সেরা সহায়ক।',
          grade: 'Class 7 & 8',
          badge: 'রেফারেন্স গাইড'
        },
        {
          id: 'b4',
          title: 'কেশবচন্দ্র নাগ গণিত শিক্ষক',
          author: 'কেশবচন্দ্র নাগ',
          subject: 'গণিত প্র্যাকটিস',
          tip: 'পাটিগণিত ও বীজগণিতের কঠিন সমস্যা দ্রুত সমাধান করার কৌশল শেখার জন্য।',
          grade: 'Class 7 & 8',
          badge: 'অগ্রিম প্র্যাকটিস'
        }
      ];
    } else if (b.includes('11') || b.includes('12')) {
      return [
        {
          id: 'b5',
          title: 'উচ্চমাধ্যমিক রাষ্ট্রবিজ্ঞান',
          author: 'নিমাই প্রামাণিক (ছায়া প্রকাশনী)',
          subject: 'রাষ্ট্রবিজ্ঞান',
          tip: 'উচ্চমাধ্যমিকের সেমিস্টার ও বর্ণনামূলক বড় প্রশ্নের জন্য পয়েন্ট ভিত্তিক নোটস তৈরি করার সেরা বই।',
          grade: 'Class 11 & 12',
          badge: 'সেরা পাঠ্যপুস্তক'
        },
        {
          id: 'b6',
          title: 'উচ্চমাধ্যমিক দর্শন (Philosophy)',
          author: 'সমরেন্দ্রনাথ রায় / ড. অসিত বন্দ্যোপাধ্যায়',
          subject: 'দর্শন',
          tip: 'যুক্তিবিদ্যা ও সাংকেতিক যুক্তিবিজ্ঞানের সত্যসারণী নির্ভুল করতে এই বইয়ের প্রতিটি নিয়ম অনুশীলন করো।',
          grade: 'Class 11 & 12',
          badge: 'সেরা পাঠ্যপুস্তক'
        },
        {
          id: 'b7',
          title: 'WBCHSE উচ্চমাধ্যমিক টেস্ট পেপারস',
          author: 'এবিটিএ (ABTA) / ডব্লিউবিটিএ',
          subject: 'টেস্ট প্র্যাকটিস',
          tip: 'বিগত ৫ বছরের বোর্ড পরীক্ষার প্রশ্নপত্র সমাধান করো।',
          grade: 'Class 11 & 12',
          badge: 'পরীক্ষা স্পেশাল'
        }
      ];
    }
    // Default: Class 9 & 10 (Madhyamik)
    return [
      {
        id: 'b8',
        title: 'গণিত প্রকাশ (Madhyamik Ganit Prakash)',
        author: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ (WBBSE)',
        subject: 'গণিত',
        tip: 'মাধ্যমিকের জন্য বোর্ডের পাঠ্যবইয়ের প্রতিটি প্রয়োগ, জ্যামিতিক উপপাদ্য ও পরিমিতির সূত্র মুখস্থ নয়, স্টেপ বাই স্টেপ বুঝে সমাধান করো।',
        grade: 'Class 9 & 10',
        badge: 'বোর্ড অনুমোদিত মূল বই'
      },
      {
        id: 'b9',
        title: 'ভৌতবিজ্ঞান ও পরিবেশ',
        author: 'ড. ভূপতি ভূষণ প্রধান / শুভেন্দু বিকাশ নন্দী (সাঁতরা পাবলিকেশন)',
        subject: 'ভৌতবিজ্ঞান',
        tip: 'গ্যাসের আচরণ, চলতড়িৎ এবং আলো অধ্যায়ের গাণিতিক উদাহরণ ও সমীকরণ অত্যন্ত যত্নে করবে।',
        grade: 'Class 9 & 10',
        badge: 'বাবুন স্যারের সর্বাধিক পছন্দের'
      },
      {
        id: 'b10',
        title: 'জীবনবিজ্ঞান ও পরিবেশ',
        author: 'ড. দুলাল চন্দ্র সাঁতরা (প্রান্তিক প্রকাশনী)',
        subject: 'জীবনবিজ্ঞান',
        tip: 'প্রতিটি ডায়াগ্রাম (যেমন: নিউরোন, ক্রোমোজোম, প্রতিবর্ত চাপ) পেন্সিল দিয়ে পরিষ্কার লেবেলিং প্র্যাকটিস করো।',
        grade: 'Class 9 & 10',
        badge: 'পূর্ণাঙ্গ সচিত্র গাইড'
      },
      {
        id: 'b11',
        title: 'রায় ও মার্টিন মাধ্যমিক প্রশ্নবিচিত্রা',
        author: 'রায় ও মার্টিন পাবলিশার্স',
        subject: 'মডেল প্রশ্ন',
        tip: 'টপ স্কুলের টেস্ট প্রশ্নপত্র ও মাধ্যমিকের সাজেশনের জন্য অপরিহার্য।',
        grade: 'Class 9 & 10',
        badge: 'মক টেস্ট প্র্যাকটিস'
      },
      {
        id: 'b12',
        title: 'ABTA / WBTA মাধ্যমিক টেস্ট পেপারস',
        author: 'অল বেঙ্গল টিচার্স অ্যাসোসিয়েশন',
        subject: 'বোর্ড ফাইনাল টেস্ট পেপার',
        tip: 'মাধ্যমিক পরীক্ষার আগে অন্তত ২০টি সম্পূর্ণ টেস্ট পেপার সেট টাইম ধরে পরীক্ষা দেবে।',
        grade: 'Class 9 & 10',
        badge: 'ফাইনাল রিভিশন'
      }
    ];
  };

  // ================= 1. LOGIN SCREEN (IF NOT LOGGED IN) =================
  if (!loggedInStudent) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-14 animate-fadeIn">
        <div className="glass-card p-6 sm:p-10 rounded-3xl border border-emerald-500/20 shadow-2xl relative overflow-hidden space-y-6">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header Badge */}
          <div className="text-center space-y-3 relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-600/30">
              <UserCheck className="w-8 h-8" />
            </div>
            
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-emerald-100/90 text-emerald-900 border border-emerald-300 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>স্টুডেন্ট-টিচার সেন্ট্রাল অথেন্টিকেশন পোর্টাল</span>
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              শিক্ষার্থী পোর্টাল লগইন
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              শুধুমাত্র আপনার <span className="font-bold text-emerald-700 underline">ইউনিক স্টুডেন্ট আইডি (Unique Student ID)</span> প্রদান করে প্রবেশ করুন।
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  ইউনিক স্টুডেন্ট আইডি (Unique ID):
                </label>
                <span className="text-[11px] text-slate-400 font-mono">যেমন: BG-2026-C10-01</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="BG-2026-C10-01 বা আপনার আইডি"
                  value={studentIdInput}
                  onChange={e => setStudentIdInput(e.target.value)}
                  className="w-full px-4 py-3.5 pl-11 border border-slate-300 rounded-2xl bg-white/90 font-mono font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-sm uppercase placeholder:normal-case placeholder:font-sans"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {loginError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-start space-x-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed">{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white rounded-2xl font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition"
            >
              <span>পোর্টালে প্রবেশ করুন (Verify & Access)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Need ID / Registration Prompt */}
          <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/90 flex flex-col sm:flex-row justify-between items-center gap-3 relative z-10">
            <div className="text-center sm:text-left">
              <span className="font-bold text-xs text-slate-800 block">আপনার কাছে কি ইউনিক আইডি নেই?</span>
              <span className="text-[11px] text-slate-500 block">বর্তমানে বাবুন স্যারের কাছে পাঠরত হলে এখনই শিক্ষার্থী রেজিস্ট্রেশন সম্পন্ন করুন।</span>
            </div>
            {setParentNavTab && (
              <button
                type="button"
                onClick={() => setParentNavTab('register')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition shadow-md shrink-0 active:scale-95 flex items-center space-x-1"
              >
                <span>📝 শিক্ষার্থী রেজিস্ট্রেশন</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

                    {/* Teacher Master Access Button */}
          <div className="pt-4 border-t border-slate-200/90 text-center relative z-10">
            <button
              type="button"
              onClick={() => {
                const pin = prompt('শিক্ষক মাস্টার ভিউয়ের জন্য আপনার গোপন পিন দিন:');
                if (pin === '973397' || pin === '980095') {
                  setIsTeacherInspector(true);
                  if (students && students.length > 0) {
                    setLoggedInStudent(students[0]);
                    syncProfileForm(students[0]);
                  }
                } else if (pin) {
                  alert('❌ ভুল সিকিউরিটি পিন!');
                }
              }}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:to-indigo-900 text-amber-300 border border-amber-400/40 text-xs sm:text-sm font-bold shadow-lg transition flex items-center justify-center space-x-2 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>👨‍🏫 শিক্ষক মাস্টার লগইন (বাবুন ঘোষ স্যার — পূর্ণ ওভারভিউ ও প্রিভিউ)</span>
            </button>
            <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
              * শিক্ষক হিসেবে সকল শিক্ষার্থীর পোর্টাল, আপলোড করা নোটস ও পেমেন্ট রেকর্ড পরীক্ষা করতে এই বাটনে ট্যাপ করুন।
            </p>
          </div>

          {/* Quick Verified Demo Student Chips */}
          {students && students.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-2 relative z-10">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                অনুমোদিত শিক্ষার্থীদের ডেমো আইডি (ক্লিক করে টেস্ট করুন):
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {students.slice(0, 4).map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setStudentIdInput(st.studentId || `BG-2026-C10-${String(st.roll || '01').padStart(2, '0')}`);
                      setLoginError('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-mono font-bold border border-slate-200 hover:border-emerald-300 transition flex items-center space-x-1.5"
                  >
                    <span>{st.studentId || `BG-2026-${st.roll}`}</span>
                    <span className="text-[10px] text-slate-500 font-sans">({st.name})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // ================= 2. LOGGED IN STUDENT DASHBOARD =================
  const studentBatch = loggedInStudent.batch || 'Class 10';
  const myNotes = (studyMaterials || []).filter(m => !m.batch || m.batch === studentBatch || m.batch.includes(studentBatch.replace(/\D/g, '')));
  const myFees = (feeRecords || []).filter(f => 
    (f.studentId && f.studentId === loggedInStudent.studentId) ||
    (f.phone && loggedInStudent.phone && f.phone.replace(/\D/g, '') === loggedInStudent.phone.replace(/\D/g, '')) ||
    (f.studentName && f.studentName.toLowerCase() === loggedInStudent.name.toLowerCase())
  );
  const myNotices = (notices || []).filter(n => !n.batch || n.batch === 'All Batches' || n.batch === studentBatch);
  const myRoutine = (routine || []).filter(r => {
    if (!r.batch) return false;
    if (r.batch === 'All Batches' || r.batch.toLowerCase().includes('all')) return true;
    if (Array.isArray(r.assignedStudentIds) && r.assignedStudentIds.includes(loggedInStudent.studentId)) return true;
    if (Array.isArray(r.assignedStudents) && r.assignedStudents.some(s => s.studentId === loggedInStudent.studentId || (s.name && s.name.toLowerCase() === loggedInStudent.name.toLowerCase()))) return true;
    const studentNum = (studentBatch || '').replace(/\D/g, '');
    const slotNum = (r.batch || '').replace(/\D/g, '');
    if (studentNum && slotNum && (slotNum.includes(studentNum) || r.batch.includes(studentBatch))) return true;
    return false;
  });
  const myDoubts = (doubts || []).filter(d => 
    (d.studentId && d.studentId === loggedInStudent.studentId) ||
    (d.studentName && d.studentName.toLowerCase() === loggedInStudent.name.toLowerCase())
  );

  const recommendedBooks = getRecommendedBooks(studentBatch);

  // Attendance History calculation
  const attendanceLog = loggedInStudent.attendanceHistory || [
    { date: '২০২৬-১০-১৯', day: 'সোমবার', status: 'present', batch: studentBatch },
    { date: '২০২৬-১০-২১', day: 'বুধবার', status: 'present', batch: studentBatch },
    { date: '২০২৬-১০-২৩', day: 'শুক্রবার', status: 'present', batch: studentBatch }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fadeIn">
      
      {/* Top Floating Student Identity Badge */}
      <div className="glass-card p-5 sm:p-7 rounded-3xl border border-emerald-500/20 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          <div className="flex items-start sm:items-center space-x-3.5">
            {/* Student Avatar / Photo */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-600/25 shrink-0 overflow-hidden border-2 border-white">
              {profileForm.avatar && profileForm.avatar.startsWith('data:image') ? (
                <img src={profileForm.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{profileForm.avatar || (loggedInStudent.name ? loggedInStudent.name.charAt(0) : '🎓')}</span>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {loggedInStudent.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-mono font-black border border-emerald-300">
                  {loggedInStudent.studentId || `BG-2026-C10-${loggedInStudent.roll || '01'}`}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold">
                  {loggedInStudent.batch}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                  {loggedInStudent.mode || loggedInStudent.tuitionType || 'টিউটোরিয়াল হোম ব্যাচ'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1 font-medium">
                <span>🏫 বিদ্যালয়: <strong>{loggedInStudent.school || loggedInStudent.schoolName || 'হাবড়া হাইস্কুল'}</strong></span>
                <span>📋 রোল নং: <strong>{loggedInStudent.roll || 'N/A'}</strong></span>
                <span>👨‍👩‍👧 অভিভাবক: <strong>{loggedInStudent.guardianName || 'অভিভাবক'}</strong></span>
                {loggedInStudent.batchTimeline && (
                  <span>⏰ ব্যাচ টাইম: <strong className="text-indigo-700">{loggedInStudent.batchTimeline}</strong></span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center">
            {/* Quick 1-on-1 Contact with Babun Sir */}
            <a
              href={`tel:${customData.phone || '9733974425'}`}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs border border-slate-300 flex items-center space-x-1.5 transition active:scale-95"
              title="বাবুন স্যারকে ফোন করুন"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>স্যারকে কল</span>
            </a>

            <a
              href={`https://wa.me/91${customData.phone || '9733974425'}?text=${encodeURIComponent(`নমস্কার স্যার, আমি আপনার ক্লাসের শিক্ষার্থী ${loggedInStudent.name} (রোল: ${loggedInStudent.roll}, আইডি: ${loggedInStudent.studentId || ''})। টিউশন সংক্রান্ত বিষয়ে একটু কথা বলতে চাই।`)}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 transition active:scale-95 shadow-sm"
              title="বাবুন স্যারের সাথে WhatsApp চ্যাট"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            {loggedInStudent.mapLocation && (
              <a
                href={loggedInStudent.mapLocation}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl font-bold text-xs border border-indigo-200 flex items-center space-x-1.5 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">আমার ম্যাপ</span>
              </a>
            )}

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs border border-rose-200 flex items-center space-x-1.5 transition active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>

        </div>
      </div>

      {/* Portal Inner Navigation Pills */}
      <div className="flex overflow-x-auto space-x-2 p-1.5 bg-slate-200/70 backdrop-blur-md rounded-2xl scrollbar-none">
        {[
          { id: 'profile', label: '👤 প্রোফাইল ও ফটো', icon: User },
          { id: 'books', label: '📚 সাজেস্টেড বই ও গাইড', count: recommendedBooks.length, icon: BookMarked },
          { id: 'attendance_log', label: '📅 পড়ার দিন ও হাজিরা', count: attendanceLog.length, icon: Clock },
          { id: 'notes', label: '📖 স্টাডি নোটস ও খাতা', count: myNotes.length, icon: BookOpen },
          { id: 'routine', label: '🗓️ সাপ্তাহিক রুটিন', icon: Calendar },
          { id: 'doubts', label: '💬 স্যারের ডাউট বক্স', count: myDoubts.length, icon: MessageSquare },
          { id: 'fees', label: '🧾 ফি বিবরণী ও মেমো', count: myFees.length, icon: DollarSign }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = portalTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setPortalTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 shrink-0 transition active:scale-95 ${
                isActive
                  ? 'bg-white text-emerald-700 shadow-md font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= SUB-TAB 0: MY PROFILE & PERSONAL DETAILS ================= */}
      {portalTab === 'profile' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg flex items-center space-x-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  <span>শিক্ষার্থীর ব্যক্তিগত প্রোফাইল ও প্রাতিষ্ঠানিক তথ্য</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  এখানে আপনি আপনার প্রোফাইল ফটো/অবতার, জন্মতারিখ, টার্গেট নম্বর, জোড়ের বিষয় ও ঠিকানা আপডেট করতে পারবেন।
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono font-black text-xs border border-emerald-300">
                আইডি: {loggedInStudent.studentId || `BG-2026-C10-${loggedInStudent.roll}`}
              </span>
            </div>

            {profileSaveSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>✅ আপনার প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে এবং বাবুন স্যারের সেন্ট্রাল ডেটাবেসে সংরক্ষিত হয়েছে!</span>
              </div>
            )}

            {/* Avatar Selector & Photo Upload */}
            <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
              <span className="block text-xs font-black text-indigo-900">
                📸 প্রোফাইল ফটো বা ছাত্র অবতার নির্বাচন করুন:
              </span>
              
              <div className="flex flex-wrap items-center gap-2.5">
                {AVATAR_PRESETS.map(av => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setProfileForm(prev => ({ ...prev, avatar: av.emoji }))}
                    className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition border-2 ${
                      profileForm.avatar === av.emoji 
                        ? 'border-indigo-600 bg-white shadow-md scale-110' 
                        : 'border-transparent bg-white/70 hover:bg-white hover:scale-105'
                    }`}
                    title={av.label}
                  >
                    <span>{av.emoji}</span>
                  </button>
                ))}

                {/* Upload from device */}
                <label className="cursor-pointer px-4 py-3 rounded-2xl bg-white border border-dashed border-indigo-300 hover:border-indigo-500 text-indigo-700 text-xs font-bold flex items-center space-x-2 transition shadow-sm">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  <span>নিজের ছবি আপলোড করুন</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Readonly Verified Academic Card */}
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">শিক্ষার্থীর নাম</span>
                <span className="font-black text-slate-900 text-sm">{loggedInStudent.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">শ্রেণী ও ব্যাচ</span>
                <span className="font-bold text-slate-800 text-sm">{loggedInStudent.batch}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">বিদ্যালয়ে শ্রেণী রোল</span>
                <span className="font-bold text-slate-800 text-sm">{loggedInStudent.roll || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">টিউশনের মাধ্যম</span>
                <span className="font-bold text-indigo-700 text-sm">{loggedInStudent.mode || loggedInStudent.tuitionType || 'সেন্টার ব্যাচ'}</span>
              </div>
            </div>

            {/* Editable Profile Details Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    🎂 জন্মতারিখ (Date of Birth):
                  </label>
                  <input
                    type="date"
                    value={profileForm.dob}
                    onChange={e => setProfileForm({ ...profileForm, dob: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    🎯 টার্গেট বোর্ড পরীক্ষার লক্ষ্যমাত্রা (Target Goal):
                  </label>
                  <select
                    value={profileForm.targetGoal}
                    onChange={e => setProfileForm({ ...profileForm, targetGoal: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-xl bg-white font-bold text-slate-800"
                  >
                    <option value="৯৫%+ নম্বর অর্জন (স্টার মার্কস)">৯৫%+ নম্বর অর্জন (স্টার মার্কস)</option>
                    <option value="৯০%+ নম্বর অর্জন (A+ গ্রেড)">৯০%+ নম্বর অর্জন (A+ গ্রেড)</option>
                    <option value="৮০%+ নম্বর অর্জন (প্রথম বিভাগ)">৮০%+ নম্বর অর্জন (প্রথম বিভাগ)</option>
                    <option value="বিষয়ভিত্তিক সর্বোচ্চ উন্নতি">বিষয়ভিত্তিক সর্বোচ্চ উন্নতি</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    📖 প্রিয় / বিশেষ জোরের বিষয় (Special Focus Subject):
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: গণিত ও ভৌত বিজ্ঞান, কিংবা দর্শন"
                    value={profileForm.focusSubject}
                    onChange={e => setProfileForm({ ...profileForm, focusSubject: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-xl bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ✉️ ইমেইল এড্রেস (ঐচ্ছিক):
                  </label>
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-xl bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  🏡 বাসস্থানের সম্পূর্ণ ঠিকানা:
                </label>
                <input
                  type="text"
                  placeholder="গ্রাম / পাড়া, রোড, হাবড়া, উত্তর ২৪ পরগণা"
                  value={profileForm.address}
                  onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-xl bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    📍 নিকটবর্তী ল্যান্ডমার্ক:
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: হাবড়া হাইস্কুলের পাশে বা স্টেশন মোড়"
                    value={profileForm.landmark}
                    onChange={e => setProfileForm({ ...profileForm, landmark: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-xl bg-white font-medium"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">
                      🗺️ গুগল ম্যাপস লিঙ্ক:
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      disabled={gpsLoading}
                      className="text-xs text-indigo-700 font-bold hover:underline flex items-center space-x-1"
                    >
                      <MapPin className="w-3 h-3 text-indigo-600" />
                      <span>{gpsLoading ? 'চিহ্নিত হচ্ছে...' : 'GPS দিয়ে অটো-চিহ্নিত করুন'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="https://maps.google.com/..."
                    value={profileForm.mapLocation}
                    onChange={e => setProfileForm({ ...profileForm, mapLocation: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-xl bg-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-black text-xs flex items-center space-x-2 shadow-md shadow-emerald-600/30 active:scale-95 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>💾 প্রোফাইল তথ্য সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ================= SUB-TAB 1: CURATED RECOMMENDED TEXTBOOKS ================= */}
      {portalTab === 'books' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <BookMarked className="w-4 h-4 text-emerald-400" />
              <span>বাবুন ঘোষ স্যারের বিশেষ শিক্ষণীয় সুপারিশ</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              {loggedInStudent.batch} পাঠ্য ও সহায়ক রেফারেন্স বইয়ের তালিকা 📚
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              বোর্ড পরীক্ষায় ৯৫%+ নম্বর ও বিষয়ভিত্তিক স্বচ্ছ ধারণা নিশ্চিত করতে শিক্ষক বাবুন ঘোষ স্যার নিম্নের বইগুলো পড়ার নির্দেশ দিয়েছেন। প্রতিটি অধ্যায়ের অনুশীলনীর জন্য এই বইগুলো অনুসরণ করো।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recommendedBooks.map((book) => (
              <div 
                key={book.id}
                className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:border-emerald-500/50 hover:shadow-md transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                      {book.badge}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold font-mono">
                      {book.subject}
                    </span>
                  </div>

                  <h4 className="font-black text-slate-900 text-base sm:text-lg">
                    {book.title}
                  </h4>

                  <span className="text-xs text-slate-500 font-bold block">
                    লেখক / প্রকাশনী: {book.author}
                  </span>

                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 space-y-1">
                    <span className="font-black text-amber-900 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>বাবুন স্যারের পড়ার টিপস:</span>
                    </span>
                    <p className="leading-relaxed font-medium">
                      "{book.tip}"
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold">শ্রেণী: {book.grade}</span>
                  <span className="text-emerald-700 font-bold flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ক্লাসে প্রযোজ্য</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 2: ATTENDANCE HISTORY LOG ================= */}
      {portalTab === 'attendance_log' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-3xl border border-emerald-500/20 shadow-sm text-center space-y-1">
              <span className="text-xs text-slate-500 font-bold block">মোট ক্লাস সংখ্যা</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{attendanceLog.length} টি</span>
            </div>
            <div className="glass-card p-5 rounded-3xl border border-emerald-500/20 shadow-sm text-center space-y-1">
              <span className="text-xs text-emerald-700 font-bold block">উপস্থিত ক্লাস</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                {attendanceLog.filter(a => a.status === 'present').length} দিন
              </span>
            </div>
            <div className="glass-card p-5 rounded-3xl border border-indigo-500/20 shadow-sm text-center space-y-1">
              <span className="text-xs text-indigo-700 font-bold block">উপস্থিতির শতকরা হার</span>
              <span className="text-2xl sm:text-3xl font-black text-indigo-700">
                {loggedInStudent.attendanceRate || Math.round((attendanceLog.filter(a => a.status === 'present').length / (attendanceLog.length || 1)) * 100)}%
              </span>
            </div>
          </div>

          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>আমার পড়ার দিনসমূহ ও নিয়মিত হাজিরা হিসেব (Attendance Log)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                বাবুন স্যারের ক্লাসে আপনার সাম্প্রতিক দিনগুলোর উপস্থিতির তালিকা।
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {attendanceLog.map((log, idx) => (
                <div key={idx} className="py-3.5 flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-100 font-black text-slate-700 flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-black text-slate-900 text-sm block">{log.date} ({log.day})</span>
                      <span className="text-slate-500 text-[11px] font-medium">ব্যাচ: {log.batch || studentBatch}</span>
                    </div>
                  </div>

                  <div>
                    {log.status === 'present' ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs flex items-center space-x-1.5 border border-emerald-300">
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        <span>উপস্থিত (Present)</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-900 font-black text-xs flex items-center space-x-1.5 border border-rose-300">
                        <span>অনুপস্থিত ({log.reason || 'ছুটি'})</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 3: STUDY NOTES & KHATA ================= */}
      {portalTab === 'notes' && (
        <div className="space-y-6">
          <div className="glass-card p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>আমার ব্যাচের স্টাডি মেটেরিয়ালস ও ক্লাসের খাতার ছবি</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                বাবুন স্যার কর্তৃক ক্লাসে সমাধানকৃত বোর্ডের অংক, খাতার ছবি ও বিশেষ পিডিএফ নোটস।
              </p>
            </div>

            {myNotes.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">আপনার ব্যাচের জন্য এখনও কোনো নতুন নোটস আপলোড করা হয়নি।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myNotes.map((item, index) => (
                  <div key={item.id || index} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                        {item.subject || 'সাধারণ নোটস'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                    </div>

                    <h4 className="font-black text-slate-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{item.desc}</p>

                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 text-xs font-black text-emerald-700 hover:text-emerald-800 pt-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>নোটস ডাউনলোড / ভিউ করুন</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 4: ROUTINE & NOTICES ================= */}
      {portalTab === 'routine' && (
        <div className="space-y-6">
          <div className="glass-card p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
            <h3 className="font-black text-slate-900 text-sm sm:text-base">
              সাপ্তাহিক ক্লাস সময়সূচি (Weekly Batch Schedule)
            </h3>

            {myRoutine.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {myRoutine.map((slot, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-emerald-800 text-xs">{slot.day}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-800">{slot.batch}</span>
                    </div>
                    <div className="font-mono text-xs font-bold text-slate-900">{slot.time}</div>
                    <div className="text-[10px] text-slate-600 font-medium">{slot.subject}</div>
                    {slot.location && (
                      <div className="text-[10px] text-slate-500 font-medium">📍 {slot.location}</div>
                    )}
                    {slot.topicReminder && (
                      <div className="text-[10px] text-indigo-700 font-bold">📝 {slot.topicReminder}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">আপনার ব্যাচের ({studentBatch}) জন্য বর্তমানে কোনো সক্রিয় সাপ্তাহিক রুটিন নেই।</p>
                <p className="text-[11px] text-slate-500 mt-1">শিক্ষক মহাশয় আপনার ব্যাচের জন্য নতুন রুটিন তৈরি করলে এখানে স্বয়ংক্রিয়ভাবে দৃশ্যমান হবে।</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 5: STUDENT-TEACHER PRIVATE DOUBT BOX ================= */}
      {portalTab === 'doubts' && (
        <div className="space-y-6">
          <div className="glass-card p-5 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <span>বাবুন স্যারকে সরাসরি পার্সোনাল ডাউট পাঠান (Private Doubt Box)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                অংক, সমীকরণ, বা দর্শনের যে প্রশ্নটি বুঝতে পারছেন না, সেটি সরাসরি লিখুন। স্যার আপনার ডাউট দেখে ক্লাসে বা মেসেজে সমাধান করে দেবেন।
              </p>
            </div>

            {doubtSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{doubtSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitDoubt} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">বিষয় (Subject):</label>
                  <select
                    value={doubtSubject}
                    onChange={e => setDoubtSubject(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-slate-50 font-bold text-xs"
                  >
                    <option value="Mathematics">গণিত (Mathematics)</option>
                    <option value="Physical Science">ভৌত বিজ্ঞান (Physical Science)</option>
                    <option value="Life Science">জীবন বিজ্ঞান (Life Science)</option>
                    <option value="Political Science">রাষ্ট্রবিজ্ঞান (Political Science)</option>
                    <option value="Philosophy">দর্শন (Philosophy)</option>
                    <option value="Integrated Science">সমন্বিত বিজ্ঞান (Class 7-8)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">ডাউট বা প্রশ্নের বিবরণ *:</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="যেমন: স্যার, দ্বিঘাত সমীকরণের ৫ নম্বর অনুশীলনের ৩য় সমস্যাটি বুঝতে সমস্যা হচ্ছে..."
                    value={doubtText}
                    onChange={e => setDoubtText(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                <span className="text-[11px] text-slate-500">
                  শিক্ষার্থী: <strong>{loggedInStudent.name}</strong> ({loggedInStudent.batch})
                </span>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/30 active:scale-95 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>স্যারের কাছে পাঠান</span>
                  </button>
                </div>
              </div>
            </form>

            {/* List of my past doubts */}
            {myDoubts.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">আমার পূর্বের ডাউটসমূহ:</span>
                <div className="space-y-2">
                  {myDoubts.map(d => (
                    <div key={d.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-indigo-700">{d.subject}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{d.date} • {d.time}</span>
                      </div>
                      <p className="text-slate-800 font-medium">{d.text}</p>
                      {d.reply && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 mt-2">
                          <span className="font-bold block text-[11px]">💬 বাবুন স্যারের উত্তর:</span>
                          <p>{d.reply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 6: FEES & PAYMENT LEDGER ================= */}
      {portalTab === 'fees' && (
        <div className="space-y-6">
          <div className="glass-card p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  মাসিক টিউশন ফি জমার রেকর্ড ও মেমো
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  বাবুন স্যারের খাতায় নিবন্ধিত আপনার ফি সংক্রান্ত সর্বশেষ বিবরণ।
                </p>
              </div>

              {setParentNavTab && (
                <button
                  type="button"
                  onClick={() => setParentNavTab('payment')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-sm shrink-0"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>PhonePe ফি প্রদান করুন</span>
                </button>
              )}
            </div>

            {myFees.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500 font-medium">
                আপনার নামে কোনো অনলাইন ট্রানজ্যাকশন রেকর্ড মেলেনি। ফি প্রদান করলে রসিদ এখানে সংযুক্ত থাকবে।
              </div>
            ) : (
              <div className="space-y-3">
                {myFees.map((f, idx) => (
                  <div key={f.id || idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-slate-900 text-sm">{f.month || 'মাসিক ফি'}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          f.status === 'Verified' || f.status === 'Paid' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {f.status || 'Verified'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        পদ্ধতি: {f.method || 'PhonePe / UPI'} • তারিখ: {f.date || 'চলতি মাস'}
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-base sm:text-lg font-black text-emerald-700">₹{f.amount}</span>
                      {f.txnId && (
                        <span className="text-[10px] text-slate-400 font-mono block">Txn: {f.txnId}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
