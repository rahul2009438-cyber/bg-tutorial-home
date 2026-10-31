import React, { useState, useEffect } from 'react';
import { 
  Award, Share2, Printer, CheckCircle, Calculator, FileText, 
  User, Sparkles, Plus, Trash2, Copy, Check, Star, RefreshCw, 
  Eye, Download, ShieldCheck, Sliders, ToggleLeft, ToggleRight,
  AlertTriangle, RotateCcw
} from 'lucide-react';

const BOARD_SUBJECTS = {
  'Class 7': [
    { id: 'math', name: 'গণিত (Mathematics)', maxMarks: 100, defaultMarks: 82, enabled: true },
    { id: 'science', name: 'বিজ্ঞান (Integrated Science)', maxMarks: 100, defaultMarks: 78, enabled: true }
  ],
  'Class 8': [
    { id: 'math', name: 'গণিত (Mathematics)', maxMarks: 100, defaultMarks: 85, enabled: true },
    { id: 'science', name: 'বিজ্ঞান (Integrated Science)', maxMarks: 100, defaultMarks: 80, enabled: true }
  ],
  'Class 9': [
    { id: 'math', name: 'গণিত (Mathematics)', maxMarks: 100, defaultMarks: 86, enabled: true },
    { id: 'science', name: 'বিজ্ঞান (Integrated Science)', maxMarks: 100, defaultMarks: 82, enabled: true }
  ],
  'Class 10': [
    { id: 'math', name: 'গণিত (Mathematics)', maxMarks: 100, defaultMarks: 88, enabled: true },
    { id: 'phySci', name: 'ভৌত বিজ্ঞান (Physical Science)', maxMarks: 100, defaultMarks: 84, enabled: true },
    { id: 'lifeSci', name: 'জীবন বিজ্ঞান (Life Science)', maxMarks: 100, defaultMarks: 85, enabled: true }
  ],
  'Class 11': [
    { id: 'polscience', name: 'রাষ্ট্রবিজ্ঞান (Political Science)', maxMarks: 100, defaultMarks: 84, enabled: true },
    { id: 'philosophy', name: 'দর্শন (Philosophy)', maxMarks: 100, defaultMarks: 82, enabled: true }
  ],
  'Class 12': [
    { id: 'polscience', name: 'রাষ্ট্রবিজ্ঞান (Political Science)', maxMarks: 100, defaultMarks: 86, enabled: true },
    { id: 'philosophy', name: 'দর্শন (Philosophy)', maxMarks: 100, defaultMarks: 88, enabled: true }
  ]
};

const EXAM_PRESETS = [
  '১ম পর্যায়ক্রমিক মূল্যায়ন (1st Unit Test)',
  '২য় পর্যায়ক্রমিক মূল্যায়ন (2nd Unit Test)',
  'ফাইনাল বার্ষিক মূল্যায়ন (Annual Exam)',
  'মাধ্যমিক স্পেশাল মক টেস্ট (Madhyamik Test)',
  'সেমিস্টার ১ মূল্যায়ন (WBCHSE Semester 1)',
  'সেমিস্টার ২ মূল্যায়ন (WBCHSE Semester 2)',
  'সেমিস্টার ৪ ফাইনাল মূল্যায়ন (WBCHSE Semester 4)',
  'সাপ্তাহিক প্র্যাকটিস টেস্ট (Weekly Test)',
  'কাস্টম স্পেশাল পরীক্ষা'
];

export default function ReportCardGenerator({ students = [], customData = {} }) {
  const [selectedStudentId, setSelectedStudentId] = useState(students?.[0]?.id || 'manual');
  const [activeBatch, setActiveBatch] = useState('Class 10');
  const [examName, setExamName] = useState('১ম পর্যায়ক্রমিক মূল্যায়ন (1st Unit Test)');
  const [customExamInput, setCustomExamInput] = useState('');
  
  // Custom subject inputs
  const [customSubjectName, setCustomSubjectName] = useState('');
  const [customMaxMarks, setCustomMaxMarks] = useState('25');
  const [customInitMarks, setCustomInitMarks] = useState('20');
  const [showAddSubject, setShowAddSubject] = useState(false);

  // Remarks state
  const [teacherRemarks, setTeacherRemarks] = useState(
    'অংক ও বিজ্ঞানের মৌলিক ধারণা অত্যন্ত সুন্দর। নিয়মিত রিভিশন ও টেস্টে সময় ব্যবস্থাপনা ঠিক রাখলে ফাইনালে ৯০%+ নম্বর নিশ্চিত।'
  );
  const [isGeneratingRemark, setIsGeneratingRemark] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Manual fallback student when database has no records
  const [manualStudent, setManualStudent] = useState({
    name: '',
    roll: '',
    batch: 'Class 10',
    schoolName: '',
    guardianName: '',
    phone: ''
  });

  // Resolve current student safely with optional chaining
  const selectedStudent = (students || []).find(s => String(s?.id) === String(selectedStudentId)) || (students?.[0] || null);

  const studentName = selectedStudent?.name || manualStudent?.name || 'শিক্ষার্থী';
  const studentRoll = selectedStudent?.roll || manualStudent?.roll || '—';
  const studentSchool = selectedStudent?.schoolName || selectedStudent?.school || manualStudent?.schoolName || 'হাবড়া হাইস্কুল';
  const studentGuardian = selectedStudent?.guardianName || selectedStudent?.guardian || manualStudent?.guardianName || 'অভিভাবক';
  const studentPhone = selectedStudent?.phone || manualStudent?.phone || '';

  // Determine current class safely
  const studentBatch = selectedStudent?.batch || manualStudent?.batch || activeBatch || 'Class 10';
  const normalizedBatch = ['Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].find(b => 
    studentBatch?.toLowerCase().includes(b.toLowerCase())
  ) || 'Class 10';

  // Initialize subjects directly from BOARD_SUBJECTS so there is NEVER an empty array crash
  const [subjectList, setSubjectList] = useState(() => {
    const defaults = BOARD_SUBJECTS['Class 10'] || [];
    return defaults.map(s => ({
      id: s.id,
      name: s.name,
      maxMarks: s.maxMarks,
      marks: s.defaultMarks,
      enabled: true,
      isCustom: false
    }));
  });

  // Sync subjects when batch or selected student changes, with support for student?.subjects
  useEffect(() => {
    try {
      if (selectedStudent?.subjects && Array.isArray(selectedStudent.subjects) && selectedStudent.subjects.length > 0) {
        setSubjectList(selectedStudent.subjects.map(s => ({
          id: s.id || `subj_${Math.random()}`,
          name: s.name || 'বিষয়',
          maxMarks: Number(s.maxMarks) || 100,
          marks: Number(s.marks ?? s.defaultMarks ?? 75),
          enabled: s.enabled !== false,
          isCustom: Boolean(s.isCustom)
        })));
      } else {
        const defaultSubs = BOARD_SUBJECTS[normalizedBatch] || BOARD_SUBJECTS['Class 10'] || [];
        setSubjectList(defaultSubs.map(s => ({
          id: s.id,
          name: s.name,
          maxMarks: s.maxMarks,
          marks: s.defaultMarks,
          enabled: true,
          isCustom: false
        })));
      }
    } catch (e) {
      console.error('Error synchronizing subject list:', e);
    }
  }, [normalizedBatch, selectedStudentId]);

  // Restore Default Board Subjects
  const handleRestoreBoardDefaults = () => {
    const defaultSubs = BOARD_SUBJECTS[normalizedBatch] || BOARD_SUBJECTS['Class 10'] || [];
    setSubjectList(defaultSubs.map(s => ({
      id: s.id,
      name: s.name,
      maxMarks: s.maxMarks,
      marks: s.defaultMarks,
      enabled: true,
      isCustom: false
    })));
  };

  // Handle Mark Change safely
  const updateMarks = (id, newMarks) => {
    setSubjectList(prev => (prev || []).map(s => {
      if (s.id === id) {
        const maxVal = Number(s.maxMarks) || 100;
        const val = Math.max(0, Math.min(maxVal, Number(newMarks) || 0));
        return { ...s, marks: val };
      }
      return s;
    }));
  };

  // Handle Max Marks Change (e.g. Sir wants 20 marks unit test instead of 100)
  const updateMaxMarks = (id, newMax) => {
    setSubjectList(prev => (prev || []).map(s => {
      if (s.id === id) {
        const maxVal = Math.max(5, Number(newMax) || 100);
        return { 
          ...s, 
          maxMarks: maxVal,
          marks: Math.min(Number(s.marks) || 0, maxVal)
        };
      }
      return s;
    }));
  };

  // Toggle Subject Enabled
  const toggleSubjectEnabled = (id) => {
    setSubjectList(prev => (prev || []).map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  // Add Custom Subject (Teacher can add ANY subject)
  const handleAddCustomSubject = (e) => {
    e.preventDefault();
    if (!customSubjectName.trim()) return;
    const maxM = Number(customMaxMarks) || 25;
    const initM = Math.min(maxM, Number(customInitMarks) || 0);

    const newSubj = {
      id: 'custom_' + Date.now(),
      name: customSubjectName.trim(),
      maxMarks: maxM,
      marks: initM,
      enabled: true,
      isCustom: true
    };

    setSubjectList(prev => [...(prev || []), newSubj]);
    setCustomSubjectName('');
    setShowAddSubject(false);
  };

  // Remove ANY Subject (Allows single-subject tests like only Math or only Philosophy)
  const removeSubject = (id) => {
    setSubjectList(prev => (prev || []).filter(s => s.id !== id));
  };

  // Active Enabled Subjects & Safe Computations (NO NaN / ZERO DIVISION CRASHES)
  const activeSubjects = (subjectList || []).filter(s => s?.enabled);
  const total = activeSubjects.reduce((acc, s) => acc + (Number(s?.marks) || 0), 0);
  const maxTotal = activeSubjects.reduce((acc, s) => acc + (Number(s?.maxMarks) || 100), 0);
  const percentage = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;

  // Grade Calculation based on WBBSE / WBCHSE standard
  const getGrade = (pct) => {
    if (activeSubjects.length === 0) return { grade: '—', text: 'কোনো বিষয় সক্রিয় নেই', color: 'text-slate-600 bg-slate-100 border-slate-300' };
    if (pct >= 90) return { grade: 'AA', text: 'অসাধারণ (Outstanding)', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (pct >= 80) return { grade: 'A+', text: 'চমৎকার (Excellent)', color: 'text-teal-700 bg-teal-50 border-teal-300' };
    if (pct >= 70) return { grade: 'A', text: 'খুব ভালো (Very Good)', color: 'text-blue-700 bg-blue-50 border-blue-300' };
    if (pct >= 60) return { grade: 'B+', text: 'ভালো (Good)', color: 'text-indigo-700 bg-indigo-50 border-indigo-300' };
    if (pct >= 45) return { grade: 'B', text: 'সন্তোষজনক (Satisfactory)', color: 'text-amber-700 bg-amber-50 border-amber-300' };
    if (pct >= 35) return { grade: 'C', text: 'উন্নতি প্রয়োজন (Needs Work)', color: 'text-orange-700 bg-orange-50 border-orange-300' };
    return { grade: 'D', text: 'বিশেষ যত্ন আবশ্যক (Remedial Needed)', color: 'text-rose-700 bg-rose-50 border-rose-300' };
  };

  const gradeInfo = getGrade(percentage);

  // AI Smart Remark Generator
  const generateAIRemark = () => {
    if (activeSubjects.length === 0) {
      setTeacherRemarks('কোনো সক্রিয় বিষয় নির্ধারিত নেই। অনুগ্রহ করে অন্তত একটি বিষয় যোগ বা নির্বাচন করুন।');
      return;
    }

    setIsGeneratingRemark(true);
    setTimeout(() => {
      let remark = '';
      const topSubject = [...activeSubjects].sort((a, b) => ((b.marks || 0) / (b.maxMarks || 1)) - ((a.marks || 0) / (a.maxMarks || 1)))[0];
      const lowSubject = [...activeSubjects].sort((a, b) => ((a.marks || 0) / (a.maxMarks || 1)) - ((b.marks || 0) / (b.maxMarks || 1)))[0];

      if (percentage >= 85) {
        remark = `${studentName}-এর সার্বিক পারফরম্যান্স অত্যন্ত প্রশংসনীয়! বিশেষ করে ${topSubject ? topSubject.name : 'সকল বিষয়ে'} মেধা ও বোঝাপড়া নিখুঁত। নিয়মিত মক টেস্ট ও দ্রুত লেখার অভ্যাস বজায় রাখলে বোর্ড ফাইনালে স্টার মার্কস ও র‍্যাংক অর্জন নিশ্চিত।`;
      } else if (percentage >= 70) {
        remark = `লেখাপড়ায় মনোযোগ খুব ভালো এবং অগ্রগতি সন্তোষজনক। ${topSubject ? topSubject.name + '-এ ভালো স্কোর এসেছে' : ''}। তবে ${lowSubject && lowSubject.id !== topSubject?.id ? lowSubject.name + '-এর কিছু জটিল সংকেত ও তত্ত্বে' : 'সংক্ষিপ্ত উত্তরে'} নিয়মিত রিভিশন প্রয়োজন। প্রতিদিন ক্লাসরুম নোটস অন্তত ৩০ মিনিট অনুশীলন করবে।`;
      } else if (percentage >= 50) {
        remark = `মৌলিক বিষয়বস্তু বুঝতে পারছে, তবে পরীক্ষার খাতায় উপস্থাপনা ও সময়ের মধ্যে সম্পূর্ণ উত্তর লেখায় আরও সতর্ক হতে হবে। ব্যাচে বিশেষ যত্ন ও হোমটাস্ক নিয়মিত সম্পন্ন করলে পরবর্তী পরীক্ষায় ৮০%+ নম্বর পাওয়া পুরোপুরি সম্ভব। অভিভাবকের উৎসাহ একান্ত প্রয়োজন।`;
      } else {
        remark = `বর্তমানে পরীক্ষার ফলাফল অনুসারে এই বিষয়ে বিশেষ অতিরিক্ত যত্ন ও ক্লাসরুম রিভিশন আবশ্যক। বাবুন স্যারের ক্লাসে ছোট ছোট ডাউট ক্লিয়ারিং সেশনে নিয়মিত অংশগ্রহণ করলে ভীতি দূর হবে এবং নিশ্চিত উন্নতি আসবে। নিয়মিত উপস্থিতি বাধ্যতামূলক।`;
      }

      setTeacherRemarks(remark);
      setIsGeneratingRemark(false);
    }, 400);
  };

  // WhatsApp Formatted Text
  const getWhatsAppText = () => {
    let text = `📊 *প্রগ্রেস রিপোর্ট কার্ড — বি.জি. টিউটোরিয়াল হোম*\n`;
    text += `👨‍🏫 *শিক্ষক:* বাবুন ঘোষ (Babun Ghosh) | দক্ষিণ হাবড়া, এস. এন দে রোড\n`;
    text += `📞 হেল্পলাইন: 9733974425\n\n`;
    text += `👤 *শিক্ষার্থী:* ${studentName} (রোল: ${studentRoll})\n`;
    text += `🏫 *বিদ্যালয়:* ${studentSchool}\n`;
    text += `📚 *শ্রেণী:* ${normalizedBatch}\n`;
    text += `🏆 *পরীক্ষা:* ${examName === 'কাস্টম স্পেশাল পরীক্ষা' && customExamInput ? customExamInput : examName}\n`;
    text += `📅 *তারিখ:* ${new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}\n\n`;
    text += `📝 *বিষয়ভিত্তিক প্রাপ্ত নম্বর:*\n`;

    activeSubjects.forEach(s => {
      const maxM = Number(s?.maxMarks) || 100;
      const m = Number(s?.marks) || 0;
      const pct = Math.round((m / maxM) * 100);
      text += `• ${s?.name}: *${m}/${maxM}* (${pct}%)\n`;
    });

    text += `------------------------------------\n`;
    text += `🎯 *মোট নম্বর:* *${total}/${maxTotal}* (${percentage}%)\n`;
    text += `🏅 *বোর্ড গ্রেড:* *${gradeInfo.grade}* (${gradeInfo.text})\n\n`;
    text += `✍️ *বাবুন স্যারের মূল্যায়ন ও পরামর্শ:*\n"${teacherRemarks}"\n\n`;
    text += `📌 _বি.জি. টিউটোরিয়াল হোম — হাবড়ায় মানসম্মত শিক্ষা ও ব্যক্তিগত যত্নের বিশ্বস্ত ঠিকানা।_\n`;
    text += `💬 যেকোনো আলোচনায় সরাসরি যোগাযোগ করুন: 9733974425`;
    return text;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getWhatsAppText());
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  const sendWhatsAppReport = () => {
    const cleanPhone = (studentPhone || '9733974425').replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(getWhatsAppText());
    window.open(`https://wa.me/91${cleanPhone}?text=${encoded}`, '_blank');
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-4 sm:p-7 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <span>১-ট্যাপ ডিজিটাল মার্কশিট ও ডায়নামিক রিপোর্ট কার্ড</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                AI Auto-Grading
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              বোর্ড অনুসারী সঠিক বিষয় ম্যাপিং, যেকোনো একক বা যৌথ পরীক্ষার মার্কশিট তৈরি ও বাবুন স্যারের স্বাক্ষরিত কার্ড
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handlePrintCard}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>প্রিন্ট / PDF</span>
          </button>
          <button
            onClick={handleCopyText}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition active:scale-95"
          >
            {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSuccess ? 'কপি হয়েছে!' : 'টেক্সট কপি'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ================= CONTROLS COLUMN (LEFT) ================= */}
        <div className="lg:col-span-6 space-y-4 text-xs">
          
          {/* Student Selector Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <label className="block font-bold text-slate-800">
                ১. শিক্ষার্থী নির্বাচন / তথ্য প্রবেশ:
              </label>
              <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                {normalizedBatch}
              </span>
            </div>

            {students && students.length > 0 ? (
              <>
                <select 
                  value={selectedStudentId}
                  onChange={e => {
                    setSelectedStudentId(e.target.value);
                    const st = students.find(s => String(s?.id) === String(e.target.value));
                    if (st?.batch) setActiveBatch(st.batch);
                  }}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 text-xs shadow-sm focus:ring-2 focus:ring-emerald-500"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (রোল: {s.roll} • {s.batch})
                    </option>
                  ))}
                </select>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>অভিভাবক: <strong>{studentGuardian}</strong></span>
                  <span>ফোন: <strong>{studentPhone || '—'}</strong></span>
                </div>
              </>
            ) : (
              <div className="space-y-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>ডেটাবেস খালি — সরাসরি শিক্ষার্থীর তথ্য লিখে টেস্ট মার্কশিট তৈরি করুন:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="শিক্ষার্থীর পুরো নাম *"
                    value={manualStudent.name}
                    onChange={e => setManualStudent({ ...manualStudent, name: e.target.value })}
                    className="p-2 border border-slate-300 rounded-lg bg-white text-xs font-bold"
                  />
                  <input
                    type="text"
                    placeholder="রোল নম্বর (যেমন: 05)"
                    value={manualStudent.roll}
                    onChange={e => setManualStudent({ ...manualStudent, roll: e.target.value })}
                    className="p-2 border border-slate-300 rounded-lg bg-white text-xs font-mono font-bold"
                  />
                  <select
                    value={manualStudent.batch}
                    onChange={e => {
                      setManualStudent({ ...manualStudent, batch: e.target.value });
                      setActiveBatch(e.target.value);
                    }}
                    className="p-2 border border-slate-300 rounded-lg bg-white text-xs font-bold"
                  >
                    {['Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="বিদ্যালয়ের নাম"
                    value={manualStudent.schoolName}
                    onChange={e => setManualStudent({ ...manualStudent, schoolName: e.target.value })}
                    className="p-2 border border-slate-300 rounded-lg bg-white text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Exam Type Preset Selector */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <label className="block font-bold text-slate-800">
              ২. পরীক্ষার ধরণ / নাম নির্বাচন:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EXAM_PRESETS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setExamName(p);
                    if (p === 'কাস্টম স্পেশাল পরীক্ষা' && !customExamInput) {
                      setCustomExamInput('গণিত ২০ নম্বরের ক্লাস টেস্ট');
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition active:scale-95 ${
                    examName === p 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {examName === 'কাস্টম স্পেশাল পরীক্ষা' && (
              <input 
                type="text"
                placeholder="পরীক্ষার নাম লিখুন (যেমন: বীজগণিত স্পেশাল ২৫ নম্বর টেস্ট)"
                value={customExamInput}
                onChange={e => setCustomExamInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-xs"
              />
            )}
          </div>

          {/* Subject & Marks Entry Panel */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="font-bold text-slate-900 block">
                  ৩. বিষয় ও নম্বর নির্ধারণ (Custom Exam Creator):
                </span>
                <span className="text-[10px] text-slate-500">
                  যেকোনো বিষয় বাদ দিয়ে একক টেস্ট নিন অথবা নতুন বিষয় যুক্ত করুন
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={handleRestoreBoardDefaults}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition"
                  title="বোর্ড সিলেবাসের সাধারণ বিষয়গুলো ফিরিয়ে আনুন"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>রিসেট</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddSubject(!showAddSubject)}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold flex items-center space-x-1 border border-indigo-200 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>কাস্টম বিষয়</span>
                </button>
              </div>
            </div>

            {/* Custom Subject Modal Form inline */}
            {showAddSubject && (
              <form onSubmit={handleAddCustomSubject} className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-2">
                <span className="font-black text-indigo-950 block text-[11px]">
                  নতুন কাস্টম সাবজেক্ট বা নির্দিষ্ট অধ্যায় টেস্ট:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="বিষয়ের নাম (যেমন: উপপাদ্য টেস্ট)"
                    value={customSubjectName}
                    onChange={e => setCustomSubjectName(e.target.value)}
                    className="p-2 bg-white rounded-lg border border-indigo-200 font-bold text-xs sm:col-span-2"
                  />
                  <select
                    value={customMaxMarks}
                    onChange={e => setCustomMaxMarks(e.target.value)}
                    className="p-2 bg-white rounded-lg border border-indigo-200 font-bold text-xs"
                  >
                    <option value="10">পূর্ণমান ১০</option>
                    <option value="20">পূর্ণমান ২০</option>
                    <option value="25">পূর্ণমান ২৫</option>
                    <option value="40">পূর্ণমান ৪০</option>
                    <option value="50">পূর্ণমান ৫০</option>
                    <option value="100">পূর্ণমান ১০০</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddSubject(false)}
                    className="px-3 py-1 bg-slate-200 rounded-lg text-[11px] font-bold text-slate-700"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shadow-xs"
                  >
                    যুক্ত করুন
                  </button>
                </div>
              </form>
            )}

            {/* List of Subjects */}
            <div className="space-y-2.5">
              {activeSubjects.length === 0 && (
                <div className="p-4 text-center bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold">
                  ⚠️ কোনো সক্রিয় বিষয় নেই! দয়া করে ওপরের "রিসেট" বাটনে ক্লিক করুন অথবা নতুন কাস্টম বিষয় যোগ করুন।
                </div>
              )}

              {subjectList.map(subj => (
                <div 
                  key={subj.id}
                  className={`p-3 rounded-xl border transition ${
                    subj.enabled 
                      ? 'bg-white border-slate-200 shadow-xs' 
                      : 'bg-slate-100/60 border-slate-200/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => toggleSubjectEnabled(subj.id)}
                        className="text-slate-500 hover:text-slate-800"
                        title={subj.enabled ? 'বিষয়টি সাময়িক নিষ্ক্রিয় করুন' : 'বিষয়টি সক্রিয় করুন'}
                      >
                        {subj.enabled ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-400" />
                        )}
                      </button>
                      <span className={`font-bold ${subj.enabled ? 'text-slate-900' : 'text-slate-500 line-through'}`}>
                        {subj.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Full Marks Customizer */}
                      <select
                        value={subj.maxMarks}
                        onChange={e => updateMaxMarks(subj.id, e.target.value)}
                        className="px-1.5 py-0.5 border border-slate-200 rounded bg-slate-50 text-[10px] font-mono font-bold"
                        title="পূর্ণমান পরিবর্তন করুন"
                      >
                        <option value="10">/10</option>
                        <option value="20">/20</option>
                        <option value="25">/25</option>
                        <option value="40">/40</option>
                        <option value="50">/50</option>
                        <option value="70">/70</option>
                        <option value="90">/90</option>
                        <option value="100">/100</option>
                      </select>

                      {/* Numeric Marks Box */}
                      <input
                        type="number"
                        min="0"
                        max={subj.maxMarks}
                        value={subj.marks}
                        onChange={e => updateMarks(subj.id, e.target.value)}
                        className="w-14 px-1.5 py-1 text-center font-mono font-black border border-slate-300 rounded-lg bg-emerald-50 text-emerald-950 focus:ring-1 focus:ring-emerald-500"
                      />

                      {/* Remove Subject button for ALL subjects */}
                      <button
                        type="button"
                        onClick={() => removeSubject(subj.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="বিষয়টি সম্পূর্ণরূপে মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Range Slider for 1-Tap Mobile Dragging */}
                  {subj.enabled && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max={subj.maxMarks}
                        value={subj.marks}
                        onChange={e => updateMarks(subj.id, e.target.value)}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <span className="font-mono text-[10px] text-slate-500 w-8 text-right">
                        {Math.round(((subj.marks || 0) / (subj.maxMarks || 1)) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Smart Remark & Teacher Remarks Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 to-emerald-50/70 border border-amber-200/80 space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-900 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>৪. বাবুন স্যারের বিশেষ পর্যবেক্ষণ (Remarks):</span>
              </label>

              <button
                type="button"
                onClick={generateAIRemark}
                disabled={isGeneratingRemark}
                className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-emerald-600 text-white rounded-lg text-[10px] font-black flex items-center space-x-1 shadow-sm hover:opacity-90 active:scale-95 transition"
              >
                <Sparkles className={`w-3 h-3 ${isGeneratingRemark ? 'animate-spin' : ''}`} />
                <span>{isGeneratingRemark ? 'লিখছে...' : '✨ AI স্মার্ট মন্তব্য তৈরি'}</span>
              </button>
            </div>

            <textarea
              rows="3"
              value={teacherRemarks}
              onChange={e => setTeacherRemarks(e.target.value)}
              placeholder="শিক্ষার্থীর জন্য উৎসাহব্যঞ্জক মন্তব্য লিখুন..."
              className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs leading-relaxed text-slate-800"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              onClick={sendWhatsAppReport}
              className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 active:scale-95 transition"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp-এ মার্কশিট পাঠান</span>
            </button>

            <button
              onClick={handleCopyText}
              className="py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-md active:scale-95 transition"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedSuccess ? 'টেক্সট কপি হয়েছে!' : 'মেসেজ টেক্সট কপি'}</span>
            </button>
          </div>

        </div>

        {/* ================= LIVE CARD PREVIEW (RIGHT) ================= */}
        <div className="lg:col-span-6">
          <div 
            id="printable-report-card"
            className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-white via-slate-50/80 to-emerald-50/40 border-2 border-emerald-300/80 text-slate-800 space-y-4 shadow-lg relative overflow-hidden"
          >
            {/* Watermark seal behind */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.03] text-black font-black text-8xl rotate-[-20deg]">
              B.G.
            </div>

            {/* Header Stamp */}
            <div className="flex justify-between items-start border-b-2 border-emerald-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-800 tracking-wider bg-emerald-100/70 px-2 py-0.5 rounded">
                  OFFICIAL PROGRESS REPORT CARD
                </span>
                <h4 className="font-black text-lg text-slate-950 mt-1">B.G. TUTORIAL HOME</h4>
                <p className="text-[11px] text-slate-600 font-medium">
                  দক্ষিণ হাবড়া, এস. এন দে রোড • হাবড়া, উত্তর ২৪ পরগণা
                </p>
                <p className="text-[10px] text-emerald-800 font-bold">
                  শিক্ষক: বাবুন ঘোষ (Babun Ghosh) • মোবাইল: 9733974425
                </p>
              </div>

              <div className={`px-3 py-1.5 rounded-2xl border text-center ${gradeInfo.color}`}>
                <span className="text-[10px] font-bold block uppercase tracking-wider">বোর্ড গ্রেড</span>
                <span className="text-xl font-black">{gradeInfo.grade}</span>
              </div>
            </div>

            {/* Student & Exam Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">শিক্ষার্থীর নাম</span>
                <div className="font-black text-slate-900 text-sm">{studentName}</div>
                <div className="text-slate-600 text-[11px]">
                  শ্রেণী: <strong>{normalizedBatch}</strong> • রোল: <strong>{studentRoll}</strong>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold">মূল্যায়ন / পরীক্ষা</span>
                <div className="font-black text-emerald-900 text-xs">
                  {examName === 'কাস্টম স্পেশাল পরীক্ষা' && customExamInput ? customExamInput : examName}
                </div>
                <div className="text-slate-500 font-mono text-[10px] mt-0.5">
                  তারিখ: {new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
              <div className="grid grid-cols-12 bg-slate-100/80 p-2.5 font-bold text-slate-700 text-[11px] border-b border-slate-200">
                <div className="col-span-6">বিষয় (Subject)</div>
                <div className="col-span-3 text-center">পূর্ণমান</div>
                <div className="col-span-3 text-right">প্রাপ্ত নম্বর</div>
              </div>

              <div className="divide-y divide-slate-100">
                {activeSubjects.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 italic">কোনো বিষয় অন্তর্ভুক্ত নেই</div>
                ) : (
                  activeSubjects.map(s => {
                    const maxM = Number(s?.maxMarks) || 100;
                    const m = Number(s?.marks) || 0;
                    const pct = Math.round((m / maxM) * 100);
                    return (
                      <div key={s.id} className="grid grid-cols-12 p-2.5 items-center hover:bg-slate-50">
                        <div className="col-span-6 font-bold text-slate-900">
                          {s.name}
                        </div>
                        <div className="col-span-3 text-center font-mono text-slate-500">
                          {maxM}
                        </div>
                        <div className="col-span-3 text-right font-mono font-black text-slate-950">
                          {m}{' '}
                          <span className="text-[10px] font-normal text-slate-500">({pct}%)</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Total Aggregate Row */}
              <div className="grid grid-cols-12 p-3 bg-emerald-50/80 font-black text-emerald-950 border-t-2 border-emerald-200">
                <div className="col-span-6 text-sm">সর্বমোট নম্বর (Total Score)</div>
                <div className="col-span-3 text-center font-mono text-sm">{maxTotal}</div>
                <div className="col-span-3 text-right font-mono text-sm">
                  {total} <span className="text-xs text-emerald-800">({percentage}%)</span>
                </div>
              </div>
            </div>

            {/* Performance Grade Badge */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">ফলাফল মূল্যায়ন</span>
                <span className="font-extrabold text-slate-900">{gradeInfo.text}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold">শতকরা হার</span>
                <span className="font-black font-mono text-base text-emerald-700">{percentage}%</span>
              </div>
            </div>

            {/* Remarks Section */}
            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs space-y-1">
              <span className="font-black text-amber-900 flex items-center space-x-1">
                <span>✍️ বাবুন স্যারের ব্যক্তিগত পরামর্শ:</span>
              </span>
              <p className="text-slate-700 leading-relaxed italic">
                "{teacherRemarks}"
              </p>
            </div>

            {/* Signature & Seal Footer */}
            <div className="flex justify-between items-end text-[11px] pt-4 border-t border-slate-200">
              <div className="text-slate-500">
                <div>অভিভাবক স্বাক্ষর: ____________________</div>
                <div className="text-[10px] text-slate-400 mt-1">তারিখ: ____/____/২০২৬</div>
              </div>

              <div className="text-right space-y-0.5">
                <div className="w-24 h-8 mx-auto border-b border-dashed border-emerald-400 flex items-center justify-center">
                  <span className="font-serif italic font-black text-emerald-900 text-sm">
                    Babun Ghosh
                  </span>
                </div>
                <span className="font-bold text-[10px] text-slate-800 block">
                  শিক্ষকের স্বাক্ষর ও সীলমোহর
                </span>
                <span className="text-[9px] text-slate-500 font-mono block">
                  B.G. TUTORIAL HOME
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
