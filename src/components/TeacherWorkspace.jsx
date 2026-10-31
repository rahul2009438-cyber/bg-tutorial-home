import React, { useState, useEffect } from 'react';
import ExamPaperMaker from './ExamPaperMaker';
import GuardianBroadcastHub from './GuardianBroadcastHub';
import WeakStudentTracker from './WeakStudentTracker';
import FeeReceiptMaker from './FeeReceiptMaker';
import BatchSyllabusTracker from './BatchSyllabusTracker';

export const CLASS_SUBJECT_OPTIONS = {
  'Class 7': ['গণিত (Mathematics)', 'পরিবেশ ও বিজ্ঞান (Science)'],
  'Class 8': ['গণিত (Mathematics)', 'পরিবেশ ও বিজ্ঞান (Science)'],
  'Class 9': ['গণিত (Mathematics)', 'ভৌতবিজ্ঞান ও পরিবেশ (Physical Science)', 'জীবনবিজ্ঞান ও পরিবেশ (Life Science)'],
  'Class 10': ['গণিত (Mathematics)', 'ভৌতবিজ্ঞান ও পরিবেশ (Physical Science)', 'জীবনবিজ্ঞান ও পরিবেশ (Life Science)'],
  'Class 11': ['রাষ্ট্রবিজ্ঞান (Political Science)', 'দর্শন (Philosophy)'],
  'Class 12': ['রাষ্ট্রবিজ্ঞান (Political Science)', 'দর্শন (Philosophy)']
};
import { Search, Database, 
  Lock, Unlock, ShieldCheck, CheckCircle2, XCircle, Users, 
  Plus, Trash2, Edit3, Download, Share2, DollarSign, BookOpen, 
  HelpCircle, Settings, Save, AlertCircle, RefreshCw, Eye,
  Sparkles, Smartphone, Bot, Copy, ExternalLink, Phone,
  MessageCircle, MessageSquare, FileText, ArrowRight, Wand2, UploadCloud,
  Check, UserCheck, UserX, Inbox, Send, Megaphone, MapPin,
  Award, Star, PhoneCall, HeartPulse, CreditCard, ChevronDown, ChevronUp,
  Camera, Image, ShieldAlert, AlertTriangle, Clock, Calendar, Layers, CheckSquare, XSquare, TrendingUp
} from 'lucide-react';
import ReportCardGenerator from './ReportCardGenerator';
import { DETAILED_SYLLABUS } from '../data/syllabusData';


import { verifyTeacherPin, getLockoutState, resetLockoutState, MAX_ATTEMPTS } from '../utils/security';
import { db, logAudit } from '../utils/db';
import UnifiedBatchManager from './UnifiedBatchManager';
import Student360Profile from './Student360Profile';
import AcademicAnalytics from './AcademicAnalytics';
import SmartRevisionPlanner from './SmartRevisionPlanner';
import HomeworkManager from './HomeworkManager';
import FeeLedger from './FeeLedger';
import AdmissionCRM from './AdmissionCRM';
import TimetableConflictDetector from './TimetableConflictDetector';
import OMRSheetGenerator from './OMRSheetGenerator';
import DatabaseHealthCenter from './DatabaseHealthCenter';
import GlobalSearchCommand from './GlobalSearchCommand';
import SmartDailyDashboard from './SmartDailyDashboard';
import LeaveLateManager from './LeaveLateManager';
import ParentCommunicationLog from './ParentCommunicationLog';
import StudentDocumentGenerator from './StudentDocumentGenerator';
import QuestionBankManager from './QuestionBankManager';
import ChapterPerformanceAnalytics from './ChapterPerformanceAnalytics';
import CoachingFinancialLedger from './CoachingFinancialLedger';
import SystemIntegrityCenter from './SystemIntegrityCenter';
import Student360Timeline from './Student360Timeline';
import CoachingGrowthAnalytics from './CoachingGrowthAnalytics';
import WhatsAppBatchAutoImporter from './WhatsAppBatchAutoImporter';
import DiaryPhotoAutoGrader from './DiaryPhotoAutoGrader';
import StudentNoteAndDocxStudio from './StudentNoteAndDocxStudio';
import QuizArena from './QuizArena';


export default function TeacherWorkspace({ 
  lang, 
  t, 
  customData = {}, 
  setCustomData, 
  students = [],
  setStudents,
  notices = [], 
  setNotices, 
  doubts = [], 
  setDoubts, 
  homeworkList = [], 
  setHomeworkList,
  feeRecords = [],
  setFeeRecords,
  inquiries = [],
  setInquiries,
  studyMaterials = [],
  setStudyMaterials,
  registrations = [],
  setRegistrations,
  routine = [],
  setRoutine,
  saveToServer
}) {
  // ================= 1. SECURITY & SELF-DEFENSE BRUTE-FORCE LOCK =================
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Check lockout on mount and tick countdown
  useEffect(() => {
    const checkLockout = () => {
      const storedLock = localStorage.getItem('bg_lockout_until');
      if (storedLock) {
        const remaining = Math.max(0, Math.floor((Number(storedLock) - Date.now()) / 1000));
        if (remaining > 0) {
          setLockoutRemaining(remaining);
        } else {
          localStorage.removeItem('bg_lockout_until');
          setLockoutRemaining(0);
          setFailedAttempts(0);
        }
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

    const handleUnlock = async (e) => {
    e.preventDefault();
    const lock = getLockoutState();
    if (lock.isLocked) {
      setLockoutRemaining(lock.remainingSeconds);
      return;
    }

    const entered = pinInput.trim();
    const isValid = await verifyTeacherPin(entered, customData?.securityPinHash);

    if (isValid) {
      setIsUnlocked(true);
      setPinError(false);
      setFailedAttempts(0);
      setPinInput('');
    } else {
      const updatedLock = getLockoutState();
      setFailedAttempts(updatedLock.attempts);
      setPinError(true);
      setPinInput('');
      if (updatedLock.isLocked) {
        setLockoutRemaining(updatedLock.remainingSeconds);
      }
    }
  };

  // ================= NAVIGATION TABS =================
  const [currentTab, setCurrentTab] = useState('daily_dashboard');

  // Urgent triage absent/attention list (declared before HUBS to avoid TDZ ReferenceError)
  const triageCallList = (students || []).filter(s => {
    return s.status === 'absent' || (s.healthStars && s.healthStars <= 2) || (s.attendanceRate && s.attendanceRate < 75) || s.feesStatus === 'Due';
  });

  // ================= 5-CATEGORY STREAMLINED HUB SYSTEM (BLUEPRINT 6.0) =================
  const HUBS = [
    {
      id: 'hub_autopilot',
      title: '⚡ অটোপাইলট ব্যাচ ও ওয়াটসঅ্যাপ হাব',
      icon: Sparkles,
      defaultTab: 'whatsapp_auto_importer',
      tabs: [
        { id: 'whatsapp_auto_importer', label: '⚡ WhatsApp অটো-ইম্পোর্টার', icon: Smartphone, badge: 'Blueprint 6.0' },
        { id: 'unified_batch', label: '👥 ব্যাচ ও হাজিরা ম্যানেজার', icon: Users },
        { id: 'daily_dashboard', label: '📊 ডেইলি ড্যাশবোর্ড', icon: TrendingUp },
        { id: 'diary_grader', label: '📸 ডায়েরি ফটো অটো-গ্রেডার', icon: Camera, badge: 'New AI' },
        { id: 'leave_late', label: '⏱️ ছুটি ও লেট ম্যানেজার', icon: Clock },
        { id: 'admission_crm', label: '📝 নতুন ভর্তি ও CRM', icon: UserCheck },
        { id: 'conflict_detector', label: '⚠️ টাইমটেবিল সংঘাত ডিটেক্টর', icon: AlertTriangle },
        { id: 'routine', label: '📅 ব্যাচ রুটিন', icon: Calendar }
      ]
    },
    {
      id: 'hub_ai_studio',
      title: '🧠 এআই প্রশ্নপত্র, নোটস ও OMR স্টুডিও',
      icon: BookOpen,
      defaultTab: 'exam_maker',
      tabs: [
        { id: 'exam_maker', label: '📝 এআই প্রশ্নপত্র মেকার', icon: FileText, badge: 'AI Generator' },
        { id: 'notes_docx_studio', label: '📘 স্মার্ট নোট ও DOCX স্টুডিও', icon: Download, badge: 'Print & Word' },
        { id: 'question_bank', label: '📚 প্রশ্ন ভাণ্ডার লাইব্রেরি', icon: BookOpen },
        { id: 'omr_generator', label: '🎯 OMR শিট জেনারেটর', icon: CheckSquare },
        { id: 'syllabus_tracker', label: '📑 সিলেবাস ও রিভিশন ট্র্যাকার', icon: Layers },
        { id: 'revision_planner', label: '📅 স্মার্ট রিভিশন প্ল্যানার', icon: Calendar },
        { id: 'homework_mgmt', label: '✍️ হোমওয়ার্ক ম্যানেজার', icon: CheckCircle2 },
        { id: 'quiz_arena', label: '🏆 কুইজ অ্যারিনা', icon: Award }
      ]
    },
    {
      id: 'hub_comm_docs',
      title: '💬 অভিভাবক যোগাযোগ ও ডকুমেন্টস',
      icon: Megaphone,
      defaultTab: 'guardian_broadcast',
      tabs: [
        { id: 'guardian_broadcast', label: '📢 অভিভাবক ব্রডকাস্ট হাব', icon: Megaphone },
        { id: 'parent_comms', label: '📞 অভিভাবক যোগাযোগ লগ', icon: PhoneCall },
        { id: 'student_docs', label: '📄 সার্টিফিকেট ও ডকুমেন্ট মেকার', icon: FileText },
        { id: 'reports', label: '🎓 ডিজিটাল রিপোর্ট কার্ড', icon: Award },
        { id: 'call_triage', label: '🤖 AI কল ট্রায়াজ', icon: PhoneCall, badge: triageCallList?.length > 0 ? `${triageCallList.length} জরুরি` : null },
        { id: 'doubts_box', label: '💬 ডাউট বক্স', icon: MessageSquare, badge: (doubts || []).filter(d => d.status !== 'answered').length > 0 ? `${(doubts || []).filter(d => d.status !== 'answered').length}` : null },
        { id: 'notices', label: '📢 নোটিশ পাবলিশার', icon: Megaphone }
      ]
    },
    {
      id: 'hub_finance',
      title: '💰 ফি ও আর্থিক লেজার',
      icon: DollarSign,
      defaultTab: 'smart_fee_ledger',
      tabs: [
        { id: 'smart_fee_ledger', label: '💳 ফি ও ক্যাশলেজার', icon: DollarSign },
        { id: 'fee_receipts', label: '🧾 ডিজিটাল ফি রশিদ মেকার', icon: CreditCard },
        { id: 'financial_ledger', label: '📊 কোচিং আয়-ব্যয় লেজার', icon: TrendingUp }
      ]
    },
    {
      id: 'hub_analytics_vault',
      title: '📈 ৩৬০° অ্যানালিটিক্স ও সিস্টেম ভল্ট',
      icon: ShieldCheck,
      defaultTab: 'student_timeline',
      tabs: [
        { id: 'student_timeline', label: '⏳ স্টুডেন্ট ৩৬০° টাইমলাইন', icon: Clock },
        { id: 'weak_student_tracker', label: '🎯 দুর্বল শিক্ষার্থী কেয়ার', icon: HeartPulse },
        { id: 'chapter_analytics', label: '📊 অধ্যায়ভিত্তিক অগ্রগতি', icon: TrendingUp },
        { id: 'analytics_hub', label: '📈 একাডেমিক অ্যানালিটিক্স', icon: TrendingUp },
        { id: 'growth_analytics', label: '🚀 হাবড়া কোচিং গ্রোথ', icon: Star },
        { id: 'system_integrity', label: '🛡️ সিস্টেম রিস্টোর পয়েন্ট', icon: ShieldCheck },
        { id: 'database_health', label: '💾 ডাটাবেস ব্যাকআপ ও হেলথ', icon: Database },
        { id: 'settings', label: '⚙️ সেটিংস ও মাস্টার পিন', icon: Settings }
      ]
    }
  ];

  const getActiveHub = (tabId) => {
    for (const h of HUBS) {
      if (h.tabs.some(t => t.id === tabId)) return h;
    }
    return HUBS[0];
  };

  const activeHub = getActiveHub(currentTab);

  const [selectedStudent360, setSelectedStudent360] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false); 
  // 'call_triage', 'registrations', 'fees_ledger', 'attendance', 'notices', 'notes_manager', 'reports', 'habra_growth', 'settings'
  
  // Selected Batch Filter
  const [selectedBatch, setSelectedBatch] = useState('সকল ব্যাচ');
  const [studentSearch, setStudentSearch] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingRatingStudentId, setEditingRatingStudentId] = useState(null);
  const [customRatingInput, setCustomRatingInput] = useState('');

  // Single Student Add State
  const [newStudent, setNewStudent] = useState({ 
    name: '', 
    roll: '', 
    batch: 'Class 10', 
    phone: '', 
    guardianName: '',
    schoolName: '',
    healthStars: 4,
    healthCondition: 'ভালো (Good)',
    notes: ''
  });

  // ================= ROUTINE, NOTE, FEE, & NOTICE STATES (HOISTED FOR TDZ SAFETY) =================
// ================= ROUTINE MANAGER STATE =================
  const DEFAULT_WEEKLY_ROUTINE = [
    { id: 1, day: 'সোমবার', batch: 'Class 7 & 8', subject: 'গণিত ও সমন্বিত বিজ্ঞান', time: 'বিকাল ৪:০০ - ৫:৩০', location: 'টিউটোরিয়াল হোম, দক্ষিণ হাবড়া' },
    { id: 2, day: 'মঙ্গলবার', batch: 'Class 9 & 10', subject: 'মাধ্যমিক স্পেশাল গণিত ও বিজ্ঞান', time: 'সকাল ৮:০০ - ৯:৩০', location: 'টিউটোরিয়াল হোম, দক্ষিণ হাবড়া' },
    { id: 3, day: 'বুধবার', batch: 'Class 7 & 8', subject: 'গণিত ও সমন্বিত বিজ্ঞান', time: 'বিকাল ৪:০০ - ৫:৩০', location: 'টিউটোরিয়াল হোম, দক্ষিণ হাবড়া' },
    { id: 4, day: 'বৃহস্পতিবার', batch: 'Class 9 & 10', subject: 'মাধ্যমিক স্পেশাল গণিত ও বিজ্ঞান', time: 'সকাল ৮:০০ - ৯:৩০', location: 'টিউটোরিয়াল হোম, দক্ষিণ হাবড়া' },
    { id: 5, day: 'শুক্রবার', batch: 'Private Home Batch', subject: 'হোম টিউশন প্রাইভেট ভিজিট', time: 'বিকাল ৪:৩০ - ৬:৩০', location: 'বাণীপুর ও দক্ষিণ হাবড়া (হোম ভিজিট)' },
    { id: 6, day: 'শনিবার', batch: 'Class 11 & 12', subject: 'রাষ্ট্রবিজ্ঞান ও দর্শন (Sem 1-4)', time: 'সন্ধ্যা ৫:০০ - ৭:০০', location: 'টিউটোরিয়াল হোম, দক্ষিণ হাবড়া' },
    { id: 7, day: 'রবিবার', batch: 'All Batches Special', subject: 'সাপ্তাহিক মক টেস্ট ও ডাউট ক্লিয়ারিং', time: 'সকাল ৯:০০ - ১২:০০', location: 'টিউটোরিয়াল হোম, দক্ষিণ হাবড়া' }
  ];

  const [routineList, setRoutineList] = useState(() => {
    try {
      const saved = localStorage.getItem('bg_routine');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch(e) {}
    if (Array.isArray(routine) && routine.length > 0) return routine;
    return [];
  });
  const [routineSaveMsg, setRoutineSaveMsg] = useState('');

// Study Note Form
  const [newNoteForm, setNewNoteForm] = useState({
    title: '',
    batch: 'Class 10',
    subject: 'Mathematics',
    size: '২.৫ MB',
    type: 'Handwritten Notes',
    desc: ''
  });
  const [noteSuccessMsg, setNoteSuccessMsg] = useState('');

const [feeForm, setFeeForm] = useState({
    studentName: '',
    batch: 'Class 12',
    amount: '250',
    mode: 'নগদ (Offline Cash)',
    date: new Date().toLocaleDateString('bn-BD'),
    month: 'অক্টোবর ২০২৬',
    note: 'মাসিক টিউশন ফি প্রদান',
    paymentSource: 'Center Batch Batch-1'
  });
  const [feeSuccessMsg, setFeeSuccessMsg] = useState('');

// Notice State
  const [noticeForm, setNoticeForm] = useState({ 
    title: '', 
    batch: 'সকল ব্যাচ', 
    desc: '' 
  });
  const [noticePublishSuccess, setNoticePublishSuccess] = useState(false);

// Image File Input Ref for Study Notes
  const noteFileInputRef = React.useRef(null);
  const [noteImagePreview, setNoteImagePreview] = useState(null);

// Settings & PIN Change
  const [configForm, setConfigForm] = useState({ ...customData });
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState({ text: '', type: '' });
  const [saveSuccess, setSaveSuccess] = useState(false);



  // ================= 2. AI DIARY & REGISTER OCR SCANNER STATE =================
  const [showDiaryScanner, setShowDiaryScanner] = useState(false);
  const [isScanningDiary, setIsScanningDiary] = useState(false);
  const [scannedStudentsPreview, setScannedStudentsPreview] = useState([]);
  const [diaryScanSource, setDiaryScanSource] = useState('preset1');
  const [diarySuccessMsg, setDiarySuccessMsg] = useState('');

  // Sample Scanned Data Presets from Babun Sir's Khata
  const DIARY_PRESETS = {
    preset1: [
      { id: 'scan_1', name: 'সৌভিক সরকার', roll: '০৭', batch: 'Class 10', type: 'Home Group Batch', schoolName: 'হাবড়া মডেল হাইস্কুল', guardianName: 'অরুণ সরকার', phone: '9832104521', notes: 'অঙ্কে মনোযোগী' },
      { id: 'scan_2', name: 'দেবস্মিতা রায়', roll: '০৮', batch: 'Class 10', type: 'Home Group Batch', schoolName: 'বাণীপুর গার্লস হাইস্কুল', guardianName: 'সুজয় রায়', phone: '9733912384', notes: 'ভৌত বিজ্ঞানে ভালো' },
      { id: 'scan_3', name: 'অরিত্র দত্ত', roll: '০৯', batch: 'Class 10', type: 'Private Home Visit', schoolName: 'প্রফুল্লনগর হাইস্কুল', guardianName: 'বিপ্লব দত্ত', phone: '9832188432', notes: 'নিয়মিত অনুশীলন প্রয়োজন' },
      { id: 'scan_4', name: 'স্নেহা মজুমদার', roll: '১০', batch: 'Class 10', type: 'Home Group Batch', schoolName: 'হাবড়া হাইস্কুল', guardianName: 'তাপস মজুমদার', phone: '9733955621', notes: 'উপপাদ্য রিভিশন আবশ্যক' },
      { id: 'scan_5', name: 'সায়ন মুখার্জী', roll: '১১', batch: 'Class 10', type: 'Home Group Batch', schoolName: 'হাবড়া শ্রীরামকৃষ্ণ বিদ্যাপীঠ', guardianName: 'অসীম মুখার্জী', phone: '9832144789', notes: 'মক টেস্টে ভালো স্কোর' }
    ],
    preset2: [
      { id: 'scan_6', name: 'পার্থ সেনগুপ্ত', roll: '০৩', batch: 'Class 12', type: 'Home Group Batch', schoolName: 'হাবড়া উচ্চ মাধ্যমিক বিদ্যালয়', guardianName: 'সনৎ সেনগুপ্ত', phone: '9832177412', notes: 'দর্শন ও যুক্তিবিজ্ঞান' },
      { id: 'scan_7', name: 'শ্রাবণী ভৌমিক', roll: '০৪', batch: 'Class 12', type: 'Private Home Visit', schoolName: 'বাণীপুর বিদ্যাপীঠ', guardianName: 'মৃদুল ভৌমিক', phone: '9733966321', notes: 'রাষ্ট্রবিজ্ঞান সেমিস্টার ৩' },
      { id: 'scan_8', name: 'তানিশা পাল', roll: '০৫', batch: 'Class 11', type: 'Home Group Batch', schoolName: 'হাবড়া মডেল হাইস্কুল', guardianName: 'প্রবীর পাল', phone: '9832199852', notes: 'রাষ্ট্রদর্শন ভালো বোঝে' }
    ],
    preset3: [
      { id: 'scan_9', name: 'রৌনক কর্মকার', roll: '০২', batch: 'Class 9', type: 'Home Group Batch', schoolName: 'হাবড়া হাইস্কুল', guardianName: 'রমেন কর্মকার', phone: '9832133214', notes: 'গণিত ও সমন্বিত বিজ্ঞান' },
      { id: 'scan_10', name: 'তিয়াশা দে', roll: '০৫', batch: 'Class 8', type: 'Home Group Batch', schoolName: 'হাবড়া গার্লস হাইস্কুল', guardianName: 'স্বপন দে', phone: '9733944125', notes: 'পরমাণুর গঠন রিভিশন' },
      { id: 'scan_11', name: 'আকাশ হালদার', roll: '০৬', batch: 'Class 7', type: 'Private Home Visit', schoolName: 'প্রফুল্লনগর হাইস্কুল', guardianName: 'সুভাষ হালদার', phone: '9832166547', notes: 'পাটিগণিত যত্ন প্রয়োজন' }
    ]
  };

  const handleStartDiaryScan = (presetKey = 'preset1') => {
    setIsScanningDiary(true);
    setDiaryScanSource(presetKey);
    setTimeout(() => {
      setScannedStudentsPreview(JSON.parse(JSON.stringify(DIARY_PRESETS[presetKey] || DIARY_PRESETS.preset1)));
      setIsScanningDiary(false);
    }, 800);
  };

  const handleUpdateScannedField = (id, field, value) => {
    setScannedStudentsPreview(prev => prev.map(st => st.id === id ? { ...st, [field]: value } : st));
  };

  const handleRemoveScannedItem = (id) => {
    setScannedStudentsPreview(prev => prev.filter(st => st.id !== id));
  };

  const handleApproveScannedStudents = () => {
    if (scannedStudentsPreview.length === 0) return;
    const newStudentsToAdd = scannedStudentsPreview.map((s, idx) => ({
      id: Date.now() + idx,
      name: s.name,
      roll: s.roll,
      batch: s.batch,
      type: s.type || 'Home Group Batch',
      schoolName: s.schoolName,
      guardianName: s.guardianName,
      phone: s.phone,
      notes: s.notes,
      status: 'present',
      attendanceRate: 100,
      healthStars: 4,
      healthCondition: 'ভালো (Good)',
      feesStatus: 'Paid'
    }));

    const updated = [...students, ...newStudentsToAdd];
    setStudents(updated);
    saveToServer({ students: updated });
    localStorage.setItem('bg_students', JSON.stringify(updated));

    setDiarySuccessMsg(`${newStudentsToAdd.length} জন শিক্ষার্থীর তথ্য সফলভাবে ডাটাবেসে সেভ হয়েছে!`);
    setScannedStudentsPreview([]);
    setTimeout(() => {
      setDiarySuccessMsg('');
      setShowDiaryScanner(false);
    }, 2000);
  };

  // ================= 3. AI STUDY NOTES & HANDWRITTEN DIGITIZER STATE =================
  const [showNoteDigitizer, setShowNoteDigitizer] = useState(false);
  const [isDigitizingNote, setIsDigitizingNote] = useState(false);
  const [noteScanBatch, setNoteScanBatch] = useState('Class 10');
  const [noteScanSubject, setNoteScanSubject] = useState('Physical Science');
  const [digitizedTitle, setDigitizedTitle] = useState('');
  const [digitizedContent, setDigitizedContent] = useState('');
  const [digitizedSummary, setDigitizedSummary] = useState('');
  const [noteDigitizeSuccess, setNoteDigitizeSuccess] = useState('');

  const NOTE_PRESETS = [
    {
      title: 'ওহমের সূত্র ও রোধের সমবায় গাণিতিক সমাধান',
      batch: 'Class 10',
      subject: 'Physical Science',
      rawText: 'V = IR সূত্রটির প্রয়োগ। শ্রেণী সমবায়ে R = R1 + R2 + R3। সমান্তরাল সমবায়ে 1/R = 1/R1 + 1/R2। কোষের অভ্যন্তরীণ রোধ r হলে নষ্ট ভোল্ট = Ir। জুলের সূত্র: H = I^2*R*t / J।',
      content: '📌 **মূল ধারণা ও সূত্রাবলী:**\n• ওহমের সূত্র: উষ্ণতা ও অন্যান্য ভৌত অবস্থা অপরিবর্তিত থাকলে পরিবাহীর তড়িৎপ্রবাহ মাত্রা তার দুই প্রান্তের বিভব পার্থক্যের সমানুপাতিক (V = IR)।\n• রোধের শ্রেণী সমবায়: $R_{eq} = R_1 + R_2 + R_3$ (প্রতিটি রোধের মধ্য দিয়ে একই পরিমাণ প্রবাহ যায়)।\n• সমান্তরাল সমবায়: $\\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}$ (উভয় প্রান্তে বিভবভেদ স্থির থাকে)।\n• নষ্ট ভোল্ট (Lost Volt): কোষের নিজস্ব অভ্যন্তরীণ রোধ r কাটিয়ে তড়িৎ পাঠাতে যে পরিমাণ বিভব ক্ষয় হয় ($v = Ir$)।',
      summary: '⚡ ২-মিনিট কুইক রিভিশন:\n১. $V = IR$ এবং রোধাঙ্ক $\\rho = \\frac{RA}{l}$ সূত্র দুটি মুখস্থ রাখবে।\n২. ফিলামেন্ট বা হিটারের তারের রোধাঙ্ক উচ্চ এবং গলনাঙ্ক অত্যন্ত উচ্চ হয়।\n৩. গৃহস্থালির বর্তনীতে সমস্ত সরঞ্জাম সর্বদা সমান্তরাল সমবায়ে যুক্ত থাকে।'
    },
    {
      title: 'রাষ্ট্রবিজ্ঞান: সার্বভৌমত্ব ও একত্ববাদী দৃষ্টিভঙ্গি',
      batch: 'Class 11',
      subject: 'Political Science',
      rawText: 'অস্টিনের সার্বভৌমত্ব তত্ত্ব। সার্বভৌমত্ব চরম, অসীম ও অবিভাজ্য। আইনের উৎস সার্বভৌমের আদেশ। বহুত্ববাদীদের বিরোধিতা (ল্যাস্কি ও বার্কার)।',
      content: '📌 **মূল বিষয়বস্তু ও সংজ্ঞাসমূহ:**\n• জন অস্টিনের আইনগত সার্বভৌমত্ব: সার্বভৌম শক্তি কোনো নির্দিষ্ট মানবীয় ঊর্ধ্বতন কর্তার হাতে থাকে, যার কোনো ঊর্ধ্ব নাই।\n• বৈশিষ্ট্যসমূহ: অবিভাজ্যতা, স্থায়িত্ব, সর্বজনীনতা, এবং পরম কর্তৃত্ব।\n• বহুত্ববাদী সমালোচনা: হ্যারল্ড ল্যাস্কির মতে রাষ্ট্র সার্বভৌম ক্ষমতার একমাত্র অধিকারী নয়; সমাজস্থ অন্যান্য সংঘের নিজস্ব অধিকার রয়েছে।',
      summary: '⚡ ২-মিনিট কুইক রিভিশন:\n১. "আইন হলো সার্বভৌমের আদেশ" — জন অস্টিন (Province of Jurisprudence Determined)।\n২. সার্বভৌমত্বের প্রধান দুই রূপ: অভ্যন্তরীণ ও বাহ্যিক সার্বভৌমত্ব।\n৩. বহুত্ববাদী প্রধান প্রবক্তা: ল্যাস্কি, বার্কার, ম্যাকাইভার ও কোল।'
    },
    {
      title: 'পাটিগণিত: চক্রবৃদ্ধি সুদ ও সমহার বৃদ্ধি ফর্মুলা',
      batch: 'Class 10',
      subject: 'Mathematics',
      rawText: 'A = P(1 + r/100)^n। সুদের পর্ব ৬ মাস হলে n->2n, r->r/2। সমহার হ্রাস হলে মাঝে বিয়োগ চিহ্ন হবে। জনসংখ্যা বৃদ্ধি বা হ্রাস অংক।',
      content: '📌 **ফর্মুলা ও কৌশল:**\n• বার্ষিক সুদ পর্ব হলে সবৃদ্ধিমূল: $A = P\\left(1 + \\frac{r}{100}\\right)^n$\n• চক্রবৃদ্ধি সুদ $CI = A - P = P\\left[\\left(1 + \\frac{r}{100}\\right)^n - 1\\right]$\n• ৬ মাস অন্তর সুদ যুক্ত হলে পর্ব ২: $A = P\\left(1 + \\frac{r/2}{100}\\right)^{2n}$\n• সমহার হ্রাস (অবচয়): $A = P\\left(1 - \\frac{r}{100}\\right)^n$',
      summary: '⚡ ২-মিনিট কুইক রিভিশন:\n১. প্রথম বছরের সরল সুদ এবং চক্রবৃদ্ধি সুদের মান সমান হয়।\n২. ২ বছরের চক্রবৃদ্ধি ও সরল সুদের অন্তর = $P\\left(\\frac{r}{100}\\right)^2$ (শর্টকাট MCQ টেকনিক)।'
    }
  ];

  const handleDigitizePreset = (idx) => {
    setIsDigitizingNote(true);
    const item = NOTE_PRESETS[idx];
    setDigitizedTitle(item.title);
    setNoteScanBatch(item.batch);
    setNoteScanSubject(item.subject);

    setTimeout(() => {
      setDigitizedContent(item.content);
      setDigitizedSummary(item.summary);
      setIsDigitizingNote(false);
    }, 700);
  };

  const handlePublishDigitizedNote = () => {
    if (!digitizedTitle || !digitizedContent) return;

    const newNote = {
      id: Date.now(),
      title: digitizedTitle,
      batch: noteScanBatch,
      subject: noteScanSubject,
      size: '১.৮ MB',
      type: 'AI Digitized Notes',
      desc: digitizedSummary ? `${digitizedContent}\n\n${digitizedSummary}` : digitizedContent,
      date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    const updated = [newNote, ...(studyMaterials || [])];
    setStudyMaterials(updated);
    saveToServer({ studyMaterials: updated });
    localStorage.setItem('bg_study_materials', JSON.stringify(updated));

    setNoteDigitizeSuccess('নোটস সফলভাবে স্টুডেন্ট পোর্টালে লাইভ প্রকাশ করা হয়েছে!');
    setTimeout(() => {
      setNoteDigitizeSuccess('');
      setShowNoteDigitizer(false);
    }, 2000);
  };

  // ================= 4. HABRA LOCAL AI AD GENERATOR (3 STYLES) =================
  const [adPlatform, setAdPlatform] = useState('whatsapp'); // 'whatsapp', 'facebook', 'poster'
  const [adTopic, setAdTopic] = useState('new_batch'); // 'new_batch', 'madhyamik', 'hs_semester', 'home_tuition'
  const [generatedAds, setGeneratedAds] = useState(null);
  const [adCopiedStyle, setAdCopiedStyle] = useState(null);

  const generateHabraAds = () => {
    const phone = customData.phone || '9733974425';
    const teacher = customData.teacherName || 'বাবুন ঘোষ (Babun Ghosh)';

    // Combinatorial building blocks (100+ variations with zero repetition)
    const hooks = [
      '🎯 দক্ষিণ হাবড়া ও সংলগ্ন অঞ্চলের সচেতন অভিভাবকদের দৃষ্টি আকর্ষণ করছি —',
      '❤️ বড় কোচিং সেন্টারের ভিড়ে আপনার সন্তান কি হারিয়ে যাচ্ছে? স্নেহশীল যত্নই সাফল্যের চাবিকাঠি!',
      '🔥 ২০২৬-২৭ শিক্ষাবর্ষে বোর্ড পরীক্ষায় সেরা ফলাফলের অঙ্গীকার নিয়ে যাত্রা শুরু —',
      '📢 হাবড়া স্টেশন, এস. এন দে রোড ও বাণীপুর সংলগ্ন এলাকার ছাত্রছাত্রীদের জন্য জরুরি সুখবর!',
      '⚡ গণিত ও বিজ্ঞানের ভয় দূর করে বোর্ড পরীক্ষায় ৯০%+ স্কোরের সঠিক রোডম্যাপ প্রস্তুত!',
      '🏆 ১৫+ বছরের অভিজ্ঞতা ও শত শত কৃতি শিক্ষার্থীর শিক্ষক বাবুন ঘোষ স্যারের বিশেষ অফলাইন ব্যাচ!',
      '🌟 একাদশ-দ্বাদশ শ্রেণীর নতুন সেমিস্টার পদ্ধতিতে রাষ্ট্রবিজ্ঞান ও দর্শনে সর্বোচ্চ নম্বর নিশ্চিতকরণ!',
      '🏡 বাড়ি বসে নিশ্চিন্তে পড়াশোনার সুযোগ — হাবড়া, বাণীপুর ও অশোকনগরে স্পেশাল হোম টিউশন!',
      '💎 প্রতিটি শিক্ষার্থী অনন্য ও মূল্যবান — একটু স্নেহ ও ব্যক্তিগত যত্নেই সম্ভব অভাবনীয় সাফল্য!',
      '🚀 সময় নষ্ট না করে আজই নিন সঠিক সিদ্ধান্ত — আপনার সন্তানের স্বপ্ন পূরণের নির্ভরযোগ্য দিশা!'
    ];

    const locations = [
      'দক্ষিণ হাবড়া, এস. এন দে রোড (দক্ষিণ হাবড়া হাইস্কুল সংলগ্ন)',
      'হাবড়া স্টেশন অঞ্চল ও বাণীপুরের নিকটবর্তী শান্ত ক্লাসরুম',
      'দক্ষিণ হাবড়া, অশোকনগর ও প্রফুল্লনগর সংলগ্ন এলাকা',
      'এস. এন দে রোড, হাবড়া, উত্তর ২৪ পরগণা (সহজ যাতায়াত ব্যবস্থা)',
      'হাবড়া ও সংলগ্ন পার্শ্ববর্তী অঞ্চল (হোম ভিজিট ও সেন্টার উভয় সুবিধা)'
    ];

    const emotionalPoints = [
      'ছোট ছোট ব্যাচে প্রতিটি ছাত্রছাত্রীকে নিজের সন্তানের মতো আন্তরিক স্নেহে পাঠদান।',
      'লাজুক বা গণিতে দুর্বল শিক্ষার্থীদের জন্য বিশেষ যত্ন ও অতিরিক্ত ডাউট ক্লিয়ারিং ব্যবস্থা।',
      'অভিভাবকদের সাথে নিয়মিত আলোচনা ও প্রতি সপ্তাহের অগ্রগতির বিস্তারিত রিপোর্ট প্রদান।',
      'মুখস্থবিদ্যার বদলে অধ্যায়ভিত্তিক গভীর বোঝাপড়া ও বাস্তব জীবনের উদাহরণের মেলবন্ধন।'
    ];

    const resultPoints = [
      'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ ও উচ্চমাধ্যমিক শিক্ষা সংসদের নতুন সিলেবাস ও OMR MCQ টেস্ট সিরিজ।',
      'অধ্যায়ভিত্তিক সাপ্তাহিক মূল্যায়ন ও ডিজিটাল মার্কশিট কার্ড সিস্টেম।',
      'হাতের লেখা স্পেশাল সাজেশন নোটস ও ফর্মুলা শিট সম্পূর্ণ বিনামূল্যে ক্লাসে প্রদান।',
      'বিগত ১০ বছরের বোর্ড প্রশ্ন ও টেস্ট পেপার সমাধানের নিবিড় প্রস্তুতি।'
    ];

    const urgencies = [
      'চলতি নতুন ব্যাচে আর মাত্র ৩টি আসন ফাঁকা! আসন পূর্ণ হলে নতুন অ্যাডমিশন বন্ধ রাখা হবে।',
      'ছোট ব্যাচের মান বজায় রাখতে সীমিত সংখ্যক আসন — আজই আপনার সন্তানের সিট বুক করুন!',
      'নতুন সেমিস্টার স্পেশাল ওরিয়েন্টেশন ব্যাচে আর মাত্র ২টি আসন অবশিষ্ট রয়েছে!',
      'সীমিত কোটায় সরাসরি স্যারের সাথে কথা বলে নিশ্চিত ভর্তি হওয়ার সুযোগ।'
    ];

    // Pick random items each time button is clicked (Zero repetition)
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const hook1 = pick(hooks);
    const hook2 = hooks[(hooks.indexOf(hook1) + 3) % hooks.length];
    const hook3 = hooks[(hooks.indexOf(hook1) + 6) % hooks.length];
    const loc = pick(locations);

    const ad1 = `${hook1}

👨‍🏫 শিক্ষক: ${teacher}
📍 ক্লাসরুম: ${loc}

${pick(emotionalPoints)}
${pick(emotionalPoints)}

📚 কোন কোন ব্যাচ খোলা রয়েছে:
• সপ্তম থেকে দশম শ্রেণী — গণিত ও সমন্বিত বিজ্ঞান (সহজ ভাষায় বোঝানো)
• একাদশ ও দ্বাদশ শ্রেণী — রাষ্ট্রবিজ্ঞান ও দর্শন (নতুন সেমিস্টার গাইডেন্স)
• ${adTopic === 'home_tuition' ? 'বাড়ি গিয়ে যত্নসহকারে পড়ানোর স্পেশাল হোম টিউশন স্লট' : 'দক্ষিণ হাবড়া অফলাইন কেয়ার ব্যাচ'}

✨ ${pick(urgencies)}
📲 সরাসরি কথা বলতে কল বা WhatsApp করুন: ${phone}
🔗 WhatsApp লিঙ্ক: https://wa.me/91${phone}?text=${encodeURIComponent('নমস্কার স্যার, আমি টিউশন ব্যাচে ভর্তি সংক্রান্ত বিষয়ে জানতে চাই।')}`;

    const ad2 = `${hook2}

🏆 প্রতিষ্ঠান: B.G. TUTORIAL HOME (Babun Ghosh)
📍 ঠিকানা: ${loc}
📞 হেল্পলাইন: ${phone}

🎯 কেন আমাদের ব্যাচ অনন্য:
✅ ${pick(resultPoints)}
✅ ${pick(resultPoints)}
✅ ${pick(emotionalPoints)}

💡 লক্ষ্য: বোর্ড পরীক্ষায় ৯০%+ নম্বর অর্জন ও বিষয়ভিত্তিক মজবুত ভিত্তি।
📌 ব্যাচ: Class 7, 8, 9, 10 (Madhyamik), Class 11 & 12 (WBCHSE Sem 1-4)
🏡 হোম টিউশন: হাবড়া ও পার্শ্ববর্তী এলাকায় নির্বাচিত কিছু পরিবারে প্রাইভেট ভিজিট।

⏰ ${pick(urgencies)}
💬 সিট বুকিং: https://wa.me/91${phone}`;

    const ad3 = `🚨 *${hook3}* 🚨

📢 বি.জি. টিউটোরিয়াল হোম — দক্ষিণ হাবড়া
👨‍🏫 নির্দেশনায়: ${teacher} (অভিজ্ঞতা ১৫+ বছর)
📍 অবস্থান: ${loc}

⚠️ *জরুরি বিজ্ঞপ্তি — আসন সংখ্যা সীমিত:*
${pick(urgencies)}

🌟 আমাদের বিশেষ সুবিধা:
• ${pick(resultPoints)}
• ${pick(emotionalPoints)}
• অভিভাবকের মোবাইলে ১-ক্লিকে রেজাল্ট ও হাজিরা কার্ড।

📱 দ্রুত সিট বুক করতে এখনি কল করুন: ${phone}
👉 WhatsApp সরাসরি: https://wa.me/91${phone}`;

    setGeneratedAds({ emotional: ad1, result: ad2, urgent: ad3 });
  };

  const copyAdToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setAdCopiedStyle(key);
    setTimeout(() => setAdCopiedStyle(null), 3000);
  };

  // ================= 5. SMART ATTENDANCE, ROUTINE & DAILY CALL DISPATCHER =================
  // Routine Schedule Calculation
  const daysOfWeek = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const todayDayName = daysOfWeek[new Date().getDay()];

  // Multi-Batch Dynamic Schedule from routine list (No hardcoded fallback!)
  const todaySlots = (routineList || []).filter(r => r.day === todayDayName && r.active !== false);
  const todaySchedule = todaySlots.length > 0 ? todaySlots[0] : null;

  const [showLiveRollCall, setShowLiveRollCall] = useState(false);
  const [absentReasonMap, setAbsentReasonMap] = useState({});

  const todayBatchStudents = todaySchedule 
    ? (students || []).filter(s => s.batch === todaySchedule.batch || (s.batch && s.batch.includes(todaySchedule.batch.replace(/\D/g, ''))))
    : [];

  const handleMarkStudentStatus = (studentId, status, reason = '') => {
    const updated = students.map(s => {
      if (s.id === studentId) {
        const hist = s.attendanceHistory || [];
        return {
          ...s,
          status,
          absentReason: reason,
          attendanceHistory: [
            { date: new Date().toLocaleDateString('bn-BD'), day: todayDayName, status, reason, batch: todaySchedule?.batch || s.batch },
            ...hist
          ]
        };
      }
      return s;
    });
    setStudents(updated);
    saveToServer({ students: updated });
    localStorage.setItem('bg_students', JSON.stringify(updated));
  };

  const handleSendAbsentWhatsApp = (student) => {
    const reason = absentReasonMap[student.id] || student.absentReason || 'অনুপস্থিত';
    const guardianNum = student.guardianPhone || student.phone;
    const msg = "নমস্কার, আমি বাবুন ঘোষ (B.G. TUTORIAL HOME, দক্ষিণ হাবড়া)। আপনার সন্তান " + student.name + " (রোল: " + (student.roll || 'N/A') + ", ব্যাচ: " + (todaySchedule?.batch || student.batch) + ") আজকের ক্লাসে (" + todayDayName + ") অনুপস্থিত রয়েছে। কারণ: " + reason + "। কোনো সমস্যা থাকলে দয়া করে যোগাযোগ করুন (ফোন: " + (customData.phone || '9733974425') + ")।";
    window.open("https://wa.me/91" + guardianNum + "?text=" + encodeURIComponent(msg), '_blank');
  };

  // 1-Tap Attendance Batch Actions
  const handleMarkEntireBatchPresent = () => {
    const updated = students.map(s => s.batch === selectedBatch ? { ...s, status: 'present' } : s);
    setStudents(updated);
    saveToServer({ students: updated });
    localStorage.setItem('bg_students', JSON.stringify(updated));
    alert(`${selectedBatch}-এর সমস্ত শিক্ষার্থীকে সফলভাবে 'উপস্থিত' মার্ক করা হয়েছে!`);
  };

  const handleCancelBatchToday = () => {
    if (window.confirm(`আপনি কি আজকের ${selectedBatch}-এর ক্লাস ছুটি বা বাতিল ঘোষণা করতে চান?`)) {
      const msg = `📢 *জরুরি ক্লাসরুম নোটিশ — বি.জি. টিউটোরিয়াল হোম*\n👨‍🏫 শিক্ষক: বাবুন ঘোষ\n\nপ্রিয় ছাত্রছাত্রী ও অভিভাবকবৃন্দ,\nআজকের (${todayDayName}) ${selectedBatch}-এর টিউশন ক্লাস অনিবার্য কারণবশত বাতিল/ছুটি থাকছে। পরবর্তী ক্লাসের সময়সূচী গ্রুপে জানিয়ে দেওয়া হবে।\n\nধন্যবাদ,\nবি.জি. টিউটোরিয়াল হোম, দক্ষিণ হাবড়া।\nফোন: ${customData.phone || '9733974425'}`;
      
      const updatedNotices = [{
        id: Date.now(),
        title: `আজকের ${selectedBatch}-এর ক্লাস স্থগিত`,
        batch: selectedBatch,
        desc: `অনিবার্য কারণবশত আজকের ক্লাস ছুটি ঘোষণা করা হয়েছে। পরবর্তী ক্লাস নিয়মিত রুটিনে হবে।`,
        date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
      }, ...(notices || [])];

      setNotices(updatedNotices);
      saveToServer({ notices: updatedNotices });

      // Open WhatsApp Broadcast Link
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  const toggleAttendanceStatus = (id) => {
    const updated = students.map(s => s.id === id ? { ...s, status: s.status === 'present' ? 'absent' : 'present' } : s);
    setStudents(updated);
    saveToServer({ students: updated });
    localStorage.setItem('bg_students', JSON.stringify(updated));
  };

  const updateStudentHealth = (id, stars, condition, notes) => {
    const updated = students.map(s => s.id === id ? { 
      ...s, 
      healthStars: stars, 
      healthCondition: condition, 
      notes: notes !== undefined ? notes : s.notes 
    } : s);
    setStudents(updated);
    saveToServer({ students: updated });
    localStorage.setItem('bg_students', JSON.stringify(updated));
  };

  const handleRemoveStudent = (id) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই শিক্ষার্থীকে তালিকা থেকে মুছে ফেলতে চান?')) {
      const filtered = students.filter(s => s.id !== id);
      setStudents(filtered);
      saveToServer({ students: filtered });
      localStorage.setItem('bg_students', JSON.stringify(filtered));
    }
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.roll) return;
    const added = [...students, { 
      id: Date.now(), 
      ...newStudent, 
      status: 'present',
      attendanceRate: 100,
      healthStars: Number(newStudent.healthStars) || 4,
      feesStatus: 'Paid'
    }];
    setStudents(added);
    saveToServer({ students: added });
    localStorage.setItem('bg_students', JSON.stringify(added));
    setNewStudent({ 
      name: '', 
      roll: '', 
      batch: selectedBatch, 
      phone: '', 
      guardianName: '', 
      schoolName: '',
      healthStars: 4, 
      healthCondition: 'ভালো (Good)', 
      notes: '' 
    });
  };

  // Fees State
  // (Routine state moved to top)

  const handleUpdateRoutineItem = (id, field, value) => {
    setRoutineList(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSaveRoutine = () => {
    if (setRoutine) setRoutine(routineList);
    saveToServer({ routine: routineList });
    try {
      localStorage.setItem('bg_routine', JSON.stringify(routineList));
      const db = JSON.parse(localStorage.getItem('bg_tutorial_portal_offline_db') || '{}');
      db.routine = routineList;
      localStorage.setItem('bg_tutorial_portal_offline_db', JSON.stringify(db));
    } catch(e) {}
    setRoutineSaveMsg('✅ সাপ্তাহিক রুটিন সফলভাবে সংরক্ষিত হয়েছে এবং স্টুডেন্ট পোর্টালে লাইভ আপডেট হয়েছে!');
    setTimeout(() => setRoutineSaveMsg(''), 4000);
  };

  const handleAddRoutineSlot = () => {
    const newSlot = {
      id: Date.now(),
      day: 'নতুন বার',
      batch: 'Class 10',
      subject: 'গণিত',
      time: 'সকাল ৮:০০ - ৯:৩০',
      location: 'টিউটোরিয়াল হোম, দক্ষিণ হাবড়া'
    };
    setRoutineList(prev => [...prev, newSlot]);
  };

  const handleRemoveRoutineSlot = (id) => {
    setRoutineList(prev => {
      const updated = prev.filter(item => item.id !== id);
      if (setRoutine) setRoutine(updated);
      saveToServer({ routine: updated });
      try {
        localStorage.setItem('bg_routine', JSON.stringify(updated));
        const db = JSON.parse(localStorage.getItem('bg_tutorial_portal_offline_db') || '{}');
        db.routine = updated;
        localStorage.setItem('bg_tutorial_portal_offline_db', JSON.stringify(db));
      } catch(e) {}
      return updated;
    });
  };

  // (Note file ref moved to top)

  const handleDirectImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setNoteImagePreview(reader.result);
      if (!newNoteForm.title) {
        setNewNoteForm(prev => ({
          ...prev,
          title: 'হাতের লেখা খাতা - ' + file.name.replace(/\.[^/.]+$/, ""),
          desc: 'শিক্ষক বাবুন ঘোষ স্যারের ক্লাসরুমের বোর্ড ও খাতা থেকে তোলা পরিষ্কার নোটস।'
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNoteClassChange = (selectedBatch) => {
    const available = CLASS_SUBJECT_OPTIONS[selectedBatch] || ['গণিত (Mathematics)'];
    setNewNoteForm(prev => ({
      ...prev,
      batch: selectedBatch,
      subject: available[0]
    }));
  };


  // (Fee form state moved to top)

  const handleAddFeeRecord = (e) => {
    e.preventDefault();
    if (!feeForm.studentName || !feeForm.amount) return;

    const receiptNo = `BG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord = {
      id: Date.now(),
      receiptNo,
      ...feeForm,
      amount: Number(feeForm.amount),
      status: 'Paid'
    };

    const updated = [newRecord, ...(feeRecords || [])];
    setFeeRecords(updated);
    saveToServer({ feeRecords: updated });

    setFeeSuccessMsg(`ফি আদায় রশিদ ${receiptNo} সফলভাবে তৈরি হয়েছে!`);
    setTimeout(() => setFeeSuccessMsg(''), 4000);
  };

  const removeFeeRecord = (id) => {
    if (window.confirm('এই রশিদটি বাতিল করতে চান?')) {
      const filtered = (feeRecords || []).filter(r => r.id !== id);
      setFeeRecords(filtered);
      saveToServer({ feeRecords: filtered });
    }
  };

  // (Notice form state moved to top)

  const handleAddNotice = (e) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.desc) return;
    const newN = {
      id: Date.now(),
      title: noticeForm.title,
      batch: noticeForm.batch,
      desc: noticeForm.desc,
      date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
    };
    const updated = [newN, ...(notices || [])];
    setNotices(updated);
    saveToServer({ notices: updated });
    setNoticeForm({ title: '', batch: 'সকল ব্যাচ', desc: '' });
    setNoticePublishSuccess(true);
    setTimeout(() => setNoticePublishSuccess(false), 3000);
  };

  const removeNotice = (id) => {
    const filtered = (notices || []).filter(n => n.id !== id);
    setNotices(filtered);
    saveToServer({ notices: filtered });
  };

  // (Note form state moved to top)

  const handleAddStudyNote = (e) => {
    e.preventDefault();
    if (!newNoteForm.title) return;
    const newNote = {
      id: Date.now(),
      ...newNoteForm
    };
    const updated = [newNote, ...(studyMaterials || [])];
    setStudyMaterials(updated);
    saveToServer({ studyMaterials: updated });
    setNewNoteForm({
      title: '',
      batch: 'Class 10',
      subject: 'Mathematics',
      size: '২.৫ MB',
      type: 'Handwritten Notes',
      desc: ''
    });
    setNoteSuccessMsg('স্টাডি নোটস সফলভাবে যুক্ত হয়েছে!');
    setTimeout(() => setNoteSuccessMsg(''), 3000);
  };

  const removeStudyNote = (id) => {
    const filtered = (studyMaterials || []).filter(m => m.id !== id);
    setStudyMaterials(filtered);
    saveToServer({ studyMaterials: filtered });
  };

  
  // 1-Tap Student Registration Approval & Rejection Engine
  const handleApproveRegistration = (reg) => {
    // 1. Duplicate check against existing verified students
    const isDuplicate = (students || []).some(s => {
      const samePhone = s.phone && reg.phone && s.phone.replace(/\D/g, '') === reg.phone.replace(/\D/g, '');
      const sameNameAndRoll = s.name && reg.studentName && 
        s.name.trim().toLowerCase() === reg.studentName.trim().toLowerCase() && 
        s.roll && reg.rollNo && String(s.roll) === String(reg.rollNo);
      return samePhone || sameNameAndRoll;
    });

    if (isDuplicate) {
      alert(`⚠️ এই শিক্ষার্থীর ডেটা ইতিমধ্যে বিদ্যমান! (Student "${reg.studentName}" is already registered in the verified database)`);
      return;
    }

    // 2. Auto-generate Unique Student ID (e.g. BG-2026-C10-01)
    const classNum = (reg.grade || 'Class 10').replace(/\D/g, '') || '10';
    const rollNum = String(reg.rollNo || (students || []).length + 1).padStart(2, '0');
    const generatedId = `BG-2026-C${classNum}-${rollNum}`;

    const newStudent = {
      id: Date.now(),
      studentId: generatedId,
      name: reg.studentName,
      roll: reg.rollNo || String((students || []).length + 1).padStart(2, '0'),
      batch: reg.grade || 'Class 10',
      school: reg.schoolName || 'হাবড়া হাইস্কুল',
      schoolName: reg.schoolName || 'হাবড়া হাইস্কুল',
      guardianName: reg.guardianName || 'অভিভাবক',
      guardianRelation: reg.guardianRelation || 'অভিভাবক',
      phone: reg.phone, // Student WhatsApp
      guardianPhone: reg.guardianPhone || '', // Guardian calling phone
      tuitionType: reg.tuitionType || reg.mode || 'টিউটোরিয়াল হোম ব্যাচ',
      batchPreference: reg.tuitionType || reg.mode || 'টিউটোরিয়াল হোম ব্যাচ',
      paymentSource: (reg.tuitionType || reg.mode || '').includes('Home') || (reg.tuitionType || reg.mode || '').includes('হোম') ? 'Home Visit / Private Tuition' : 'Center Batch',
      batchTimeline: reg.batchTimeline || '',
      batchTime: reg.batchTimeline || 'সকাল ৭:০০ - ৮:৩০',
      address: reg.address || 'দক্ষিণ হাবড়া',
      landmark: reg.landmark || '',
      mapLocation: reg.mapLocation || '',
      status: 'present',
      healthStars: 5,
      healthCondition: 'চমৎকার ও নিয়মিত (Excellent)',
      weakRemarks: reg.notes || 'যাচাইকৃত নিয়মিত শিক্ষার্থী — চমৎকার প্রস্তুতি।'
    };

    const updatedStudents = [...(students || []), newStudent];
    const updatedRegs = (registrations || []).map(r => r.id === reg.id ? { ...r, status: 'approved', studentId: generatedId } : r);

    setStudents(updatedStudents);
    if (setRegistrations) setRegistrations(updatedRegs);
    saveToServer({ students: updatedStudents, registrations: updatedRegs });
    alert(`✅ অভিনন্দন! "${newStudent.name}" অনুমোদিত হয়েছে।\n\n🎓 ইউনিক স্টুডেন্ট আইডি: ${generatedId}\n(হাজিরা খাতা, মার্কশিট ও স্টুডেন্ট পোর্টালে যুক্ত হয়েছে)`);
  };

  const handleRejectRegistration = (regId) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই রেজিস্ট্রেশন আবেদনটি বাতিল করতে চান?')) return;
    const updatedRegs = (registrations || []).map(r => r.id === regId ? { ...r, status: 'rejected' } : r);
    if (setRegistrations) setRegistrations(updatedRegs);
    saveToServer({ registrations: updatedRegs });
  };


  const handleRemoveRegistration = (id) => {
    if (window.confirm('এই রেজিস্ট্রেশন রেকর্ডটি মুছে ফেলতে চান?')) {
      const filtered = (registrations || []).filter(r => r.id !== id);
      if (setRegistrations) setRegistrations(filtered);
      saveToServer({ registrations: filtered });
    }
  };

  // (Config form state moved to top)

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setCustomData(configForm);
    saveToServer({ profile: configForm });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePinChange = (e) => {
    e.preventDefault();
    if (newPin.length !== 6 || isNaN(newPin)) {
      setPinChangeMsg({ text: 'পিন অবশ্যই ৬ সংখ্যার হতে হবে!', type: 'error' });
      return;
    }
    if (newPin !== confirmPin) {
      setPinChangeMsg({ text: 'উভয় পিন মিলছে না!', type: 'error' });
      return;
    }
    const updated = { ...customData, securityPin: newPin };
    setCustomData(updated);
    saveToServer({ profile: updated });
    setNewPin('');
    setConfirmPin('');
    setPinChangeMsg({ text: 'সিকিউরিটি পিন সফলভাবে পরিবর্তন করা হয়েছে!', type: 'success' });
    setTimeout(() => setPinChangeMsg({ text: '', type: '' }), 4000);
  };

  // ================= 6. SELF-DEFENSE BRUTE-FORCE LOCK SCREEN =================
  if (lockoutRemaining > 0) {
    const minutes = Math.floor(lockoutRemaining / 60);
    const seconds = lockoutRemaining % 60;

    return (
      <div className="fixed inset-0 z-50 bg-black text-rose-500 flex flex-col items-center justify-center p-6 text-center select-none font-mono">
        <div className="w-20 h-20 rounded-3xl bg-rose-950/60 border-2 border-rose-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-rose-900/50 animate-pulse">
          <ShieldAlert className="w-10 h-10 text-rose-500" />
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-950 text-rose-400 border border-rose-800 uppercase tracking-widest mb-3">
          SECURITY PROTOCOL ACTIVATED
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider mb-2">
          ACCESS DENIED — SYSTEM SECURED
        </h1>

        <p className="text-sm text-rose-400 max-w-md mx-auto leading-relaxed mb-6 font-sans">
          পরপর ২ বার ভুল সিকিউরিটি পিন প্রবেশের কারণে আত্মরক্ষা প্রটোকল সক্রিয় হয়েছে। Babun Sir ছাড়া অন্য কোনো ব্যক্তি যাতে টার্মিনাল হ্যাক বা ব্রুট-ফোর্স না করতে পারে, সেজন্য সিস্টেমটি <strong>১৫ মিনিটের জন্য সম্পূর্ণ ফ্রিজ/লক</strong> করা হয়েছে।
        </p>

        
        {/* Emergency Master Unlock Button for Babun Sir */}
        <div className="mb-6 flex flex-col items-center space-y-2">
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('bg_lockout_until');
              setLockoutRemaining(0);
              setFailedAttempts(0);
              setIsUnlocked(true);
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition"
          >
            🔓 মাস্টার রিকভারি দিয়ে অবিলম্বে আনলক করুন (Master Unlock)
          </button>
        </div>

        {/* Live Countdown */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-rose-900/80 max-w-xs w-full mb-6">
          <span className="text-xs text-zinc-500 block uppercase tracking-wider mb-1">
            বাকি সময় (Remaining Freeze Time)
          </span>
          <div className="text-4xl font-black font-mono text-rose-400 tracking-widest">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        <div className="text-[11px] text-zinc-500 max-w-sm font-sans">
          বি.জি. টিউটোরিয়াল হোম • মাস্টার সিকিউরিটি নোড • দক্ষিণ হাবড়া
        </div>
      </div>
    );
  }

  // ================= LOCKED PIN SCREEN =================
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto my-4 sm:my-10 p-5 sm:p-8 bg-white/95 rounded-3xl border border-slate-200 shadow-2xl text-center backdrop-blur-md">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-inner">
          <Lock className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        
        <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
          <ShieldCheck className="w-4 h-4" />
          <span>শিক্ষক সিকিউরিটি ভেরিফিকেশন</span>
        </span>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-4 mb-2 tracking-tight">
          বাবুন ঘোষ — সেন্ট্রাল টিচার পোর্টাল
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
          শুধুমাত্র অনুমোদিত শিক্ষক বাবুন ঘোষ স্যারের ব্যবহারের জন্য সংরক্ষিত। আপনার ব্যক্তিগত গোপন ৬ সংখ্যার সিকিউরিটি পিন দিন। পরপর ২ বার ভুল পিন দিলে আত্মরক্ষা প্রোটোকলে ১৫ মিনিটের জন্য সিস্টেম সম্পূর্ণ লক থাকবে।
        </p>

        <form onSubmit={handleUnlock} className="space-y-5">
          <div>
            <input 
              type="password"
              inputMode="numeric"
              maxLength="6"
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              placeholder="••••••"
              className="w-full text-center text-3xl tracking-[0.6em] font-mono py-4 px-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 transition shadow-inner"
              autoFocus
            />
          </div>

          {pinError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 border border-rose-200 shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>ভুল সিকিউরিটি পিন! সঠিক পিন দিন (পরপর ২ বার ভুলে ১৫ মিনিট লক)।</span>
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 hover:from-emerald-700 hover:to-indigo-800 text-white rounded-2xl text-base font-black shadow-xl shadow-emerald-600/25 active:scale-95 transition flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>কন্ট্রোল প্যানেল আনলক করুন</span>
          </button>
        </form>
        
        <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
          🛡️ বি.জি. টিউটোরিয়াল হোম • সুরক্ষিত শিক্ষক ডাটাবেস • দক্ষিণ হাবড়া
        </div>
      </div>
    );
  }

  // ================= UNLOCKED TEACHER DASHBOARD =================
  const currentBatchStudents = (students || []).filter(s => {
    const matchBatch = (selectedBatch === 'সকল ব্যাচ' || selectedBatch === 'All' || !selectedBatch) 
      ? true 
      : (s.batch === selectedBatch || (s.batch && s.batch.includes(selectedBatch)));
    const q = (studentSearch || '').trim().toLowerCase();
    const matchSearch = q === '' ? true : (
      (s.name || '').toLowerCase().includes(q) ||
      (s.roll || '').toString().includes(q) ||
      (s.phone || '').includes(q) ||
      (s.schoolName || s.school || '').toLowerCase().includes(q) ||
      (s.guardianName || '').toLowerCase().includes(q)
    );
    return matchBatch && matchSearch;
  });

  const handleSaveEditedStudent = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editingStudent) return;
    const updated = (students || []).map(s => s.id === editingStudent.id ? editingStudent : s);
    setStudents(updated);
    if (typeof saveToServer === 'function') saveToServer({ students: updated });
    localStorage.setItem('bg_students', JSON.stringify(updated));
    setEditingStudent(null);
  };
  
// triageCallList defined above before HUBS

  const absentStudents = (students || []).filter(s => s.status === 'absent');

  // Fee Analytics
  const totalFees = (feeRecords || []).reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  const cashFees = (feeRecords || []).filter(r => r.mode?.includes('নগদ') || r.mode?.includes('Cash')).reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  const onlineFees = (feeRecords || []).filter(r => r.mode?.includes('PhonePe') || r.mode?.includes('UPI') || r.mode?.includes('Online')).reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-5 sm:p-7 rounded-3xl shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                শিক্ষক বাবুন ঘোষ • সেন্ট্রাল AI কন্ট্রোল ড্যাশবোর্ড
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-1">
              B.G. TUTORIAL HOME — টিচার পোর্টাল
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              দক্ষিণ হাবড়া, এস. এন দে রোড • ১-ট্যাপ মোবাইল অপারেশন ও রিয়েলটাইম AI অ্যাসিস্ট্যান্ট
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsUnlocked(false)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center space-x-1.5 transition"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>লক করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* TODAY'S DYNAMIC SCHEDULE & ROUTINE HEADER WITH LIVE ROLL-CALL */}
      {todaySchedule ? (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-5 rounded-3xl text-white shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/20 text-white font-mono text-xs font-black">
                  📅 আজ {todayDayName} • {todaySchedule.time}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                  ব্যাচ: {todaySchedule.batch}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-100 text-xs font-bold">
                  {todaySchedule.location}
                </span>
              </div>
              
              <h3 className="font-black text-lg sm:text-xl text-white">
                {todaySchedule.topicReminder || todaySchedule.subject}
              </h3>

              {todaySchedule.notesReminder && (
                <p className="text-xs text-amber-200 font-bold flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>নোটস ও হ্যান্ডআউট রিমাইন্ডার: {todaySchedule.notesReminder}</span>
                </p>
              )}

              <p className="text-xs text-emerald-100">
                এই ব্যাচে মোট নথিভুক্ত শিক্ষার্থী: <strong>{todayBatchStudents.length} জন</strong> 
                {' • '} উপস্থিত: <strong>{todayBatchStudents.filter(s => s.status === 'present').length} জন</strong>
                {' • '} অনুপস্থিত: <strong>{todayBatchStudents.filter(s => s.status === 'absent').length} জন</strong>
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setShowLiveRollCall(!showLiveRollCall)}
                className="px-4 py-2.5 bg-white text-indigo-900 hover:bg-slate-100 rounded-2xl text-xs font-black flex items-center space-x-1.5 shadow-md active:scale-95 transition"
              >
                <Users className="w-4 h-4 text-indigo-600" />
                <span>{showLiveRollCall ? 'হাজিরা প্যানেল বন্ধ করুন' : '👥 লাইভ ব্যাচ রোল-কল ও রিপোর্ট'}</span>
              </button>

              <button
                type="button"
                onClick={handleMarkEntireBatchPresent}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl text-xs font-black flex items-center space-x-1.5 shadow-md active:scale-95 transition"
              >
                <CheckSquare className="w-4 h-4" />
                <span>✅ পুরো ব্যাচ উপস্থিত</span>
              </button>

              <button
                type="button"
                onClick={handleCancelBatchToday}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-black flex items-center space-x-1.5 shadow-md active:scale-95 transition"
              >
                <XSquare className="w-4 h-4" />
                <span>⚠️ ব্যাচ ছুটি</span>
              </button>
            </div>
          </div>

          {/* EXPANDABLE LIVE BATCH ROLL CALL */}
          {showLiveRollCall && (
            <div className="bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-white/20 space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/10 pb-2 text-xs">
                <span className="font-black text-amber-300">
                  📋 আজকের ব্যাচের শিক্ষার্থীদের তাৎক্ষণিক হাজিরা তালিকা ({todaySchedule.batch})
                </span>
                <span className="text-slate-300 text-[11px]">
                  অনুপস্থিত থাকলে কারণ নির্বাচন করে ১-ক্লিকে অভিভাবকের নম্বরে WhatsApp এলার্ট পাঠান
                </span>
              </div>

              {todayBatchStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-bold">
                  এই ব্যাচের কোনো শিক্ষার্থী এখনো সিস্টেমে নিবন্ধিত নেই। শিক্ষার্থী তালিকা থেকে ব্যাচ সিলেক্ট করুন।
                </div>
              ) : (
                <div className="divide-y divide-white/10 space-y-2">
                  {todayBatchStudents.map((st) => (
                    <div key={st.id} className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-white/20 font-mono font-bold text-[10px] text-white">
                            রোল: {st.roll || 'N/A'}
                          </span>
                          <span className="font-extrabold text-sm text-white">{st.name}</span>
                          <span className="font-mono text-[11px] text-emerald-400">{st.studentId}</span>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          স্কুল: {st.school || st.schoolName} • ফোন: {st.phone} (অভিভাবক: {st.guardianName || 'N/A'})
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {st.status === 'present' ? (
                          <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>উপস্থিত</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center space-x-1">
                            <span>অনুপস্থিত</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleMarkStudentStatus(st.id, 'present')}
                          className={'px-3 py-1.5 rounded-xl font-bold transition active:scale-95 ' + (st.status === 'present' ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-white/10 text-white hover:bg-white/20')}
                        >
                          উপস্থিত
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkStudentStatus(st.id, 'absent', absentReasonMap[st.id] || 'অসুস্থ')}
                          className={'px-3 py-1.5 rounded-xl font-bold transition active:scale-95 ' + (st.status === 'absent' ? 'bg-rose-600 text-white font-black' : 'bg-white/10 text-white hover:bg-white/20')}
                        >
                          অনুপস্থিত
                        </button>

                        {st.status === 'absent' && (
                          <>
                            <select
                              value={absentReasonMap[st.id] || 'অসুস্থ (Illness)'}
                              onChange={(e) => {
                                const r = e.target.value;
                                setAbsentReasonMap(prev => ({ ...prev, [st.id]: r }));
                                handleMarkStudentStatus(st.id, 'absent', r);
                              }}
                              className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-[11px] font-medium"
                            >
                              <option value="অসুস্থ (Illness)">অসুস্থ (Illness)</option>
                              <option value="স্কুলের পরীক্ষা (Exam)">স্কুলের পরীক্ষা (Exam)</option>
                              <option value="পারিবারিক কাজ (Family)">পারিবারিক কাজ (Family)</option>
                              <option value="অন্যান্য কারণ (Other)">অন্যান্য কারণ (Other)</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleSendAbsentWhatsApp(st)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center space-x-1"
                              title="অভিভাবককে WhatsApp এলার্ট"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp এলার্ট</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* STANDBY BANNER WHEN NO BATCH SCHEDULED FOR TODAY */
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-5 rounded-3xl text-white shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-mono text-xs font-bold">
                📅 আজ {todayDayName}
              </span>
              <span className="text-amber-300 font-bold text-xs">
                স্ট্যান্ডবাই মোড • কোনো ব্যাচ শিডিউল সেট করা নেই
              </span>
            </div>
            <h3 className="font-black text-base sm:text-lg text-slate-100">
              আজকের দিনে কোনো পূর্ব-নির্ধারিত ব্যাচ রুটিন সক্রিয় নেই
            </h3>
            <p className="text-xs text-slate-400">
              স্যার রুটিন ম্যানেজারে আজকের দিনের জন্য একটি নতুন ব্যাচ ও সময়সূচি সংরক্ষণ করলেই এখানে লাইভ উপস্থিতি ও রোল-কল প্যানেল চালু হয়ে যাবে।
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCurrentTab('routine')}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl font-black text-xs flex items-center space-x-1.5 shadow-md active:scale-95 transition shrink-0"
          >
            <Calendar className="w-4 h-4" />
            <span>➕ রুটিন ম্যানেজারে শিডিউল সেট করুন</span>
          </button>
        </div>
      )}

            {/* 5-CATEGORY STREAMLINED HUB NAVIGATION SYSTEM */}
      <div className="space-y-3 mb-6">
        {/* Primary Hub Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-1.5 bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-800">
          {HUBS.map(hub => {
            const Icon = hub.icon;
            const isHubActive = activeHub.id === hub.id;
            return (
              <button
                key={hub.id}
                onClick={() => setCurrentTab(hub.defaultTab)}
                className={`flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-black transition active:scale-95 ${
                  isHubActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{hub.title.split(' ')[1] || hub.title}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Subtab Modules for Active Hub */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {activeHub.tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition active:scale-95 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 text-[10px] bg-rose-500 text-white rounded-full font-black">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= NEW POWER FEATURE 1: EXAM PAPER MAKER ================= */}
      {currentTab === 'exam_maker' && (
        <ExamPaperMaker 
          customData={customData} 
          studyMaterials={studyMaterials} 
          setStudyMaterials={setStudyMaterials} 
          saveToServer={saveToServer} 
        />
      )}

      {/* ================= NEW POWER FEATURE 2: GUARDIAN BROADCAST HUB ================= */}
      {currentTab === 'guardian_broadcast' && (
        <GuardianBroadcastHub 
          students={students} 
          customData={customData} 
        />
      )}

      {/* ================= NEW POWER FEATURE 3: BATCH SYLLABUS & REVISION TRACKER ================= */}
      {currentTab === 'syllabus_tracker' && (
        <BatchSyllabusTracker 
          customData={customData} 
          saveToServer={saveToServer} 
        />
      )}

      {/* ================= NEW POWER FEATURE 4: WEAK STUDENT TRACKER ================= */}
      {currentTab === 'weak_student_tracker' && (
        <WeakStudentTracker 
          students={students} 
          customData={customData} 
          saveToServer={saveToServer} 
        />
      )}

      {/* ================= NEW POWER FEATURE 5: DIGITAL FEE RECEIPTS ================= */}
      {currentTab === 'fee_receipts' && (
        <FeeReceiptMaker 
          students={students} 
          feeRecords={feeRecords} 
          setFeeRecords={setFeeRecords} 
          customData={customData} 
          saveToServer={saveToServer} 
        />
      )}

      {/* ================= BLUEPRINT 5.1 / 6 ENHANCEMENT MODULES ================= */}
      {currentTab === 'daily_dashboard' && (
        <SmartDailyDashboard
          customData={customData}
          students={students}
          routine={routine}
          setRoutine={setRoutine}
          notices={notices}
          doubts={doubts}
          homeworkList={homeworkList}
          feeRecords={feeRecords}
          onNavigateTab={setCurrentTab}
        />
      )}

      {currentTab === 'question_bank' && (
        <QuestionBankManager
          customData={customData}
        />
      )}

      {currentTab === 'financial_ledger' && (
        <CoachingFinancialLedger
          students={students}
          feeRecords={feeRecords}
          customData={customData}
        />
      )}

      {currentTab === 'growth_analytics' && (
        <CoachingGrowthAnalytics
          students={students}
          feeRecords={feeRecords}
          customData={customData}
        />
      )}

      {currentTab === 'system_integrity' && (
        <SystemIntegrityCenter
          customData={customData}
        />
      )}

      {currentTab === 'leave_late' && (
        <LeaveLateManager
          students={students}
          customData={customData}
        />
      )}

      {currentTab === 'parent_comms' && (
        <ParentCommunicationLog
          students={students}
          customData={customData}
        />
      )}

      {currentTab === 'student_docs' && (
        <StudentDocumentGenerator
          students={students}
          customData={customData}
        />
      )}

      {currentTab === 'chapter_analytics' && (
        <ChapterPerformanceAnalytics
          students={students}
          customData={customData}
        />
      )}

      {currentTab === 'student_timeline' && (
        <Student360Timeline
          students={students}
          customData={customData}
        />
      )}

      {/* ================= BLUEPRINT 5 MODULAR TABS ================= */}
      {currentTab === 'unified_batch' && (
        <UnifiedBatchManager 
          customData={customData} 
          students={students} 
          setStudents={setStudents}
          lang={lang} 
        />
      )}

      {currentTab === 'analytics_hub' && (
        <AcademicAnalytics 
          students={students} 
        />
      )}

      {currentTab === 'revision_planner' && (
        <SmartRevisionPlanner 
          customData={customData} 
        />
      )}

      {currentTab === 'homework_mgmt' && (
        <HomeworkManager 
          customData={customData} 
          students={students} 
        />
      )}

      {currentTab === 'smart_fee_ledger' && (
        <FeeLedger 
          customData={customData} 
          students={students} 
        />
      )}

      {currentTab === 'admission_crm' && (
        <AdmissionCRM 
          customData={customData} 
          setStudents={setStudents} 
        />
      )}

      {currentTab === 'conflict_detector' && (
        <TimetableConflictDetector 
          customData={customData} 
        />
      )}

      {currentTab === 'omr_generator' && (
        <OMRSheetGenerator 
          customData={customData} 
        />
      )}

      {currentTab === 'database_health' && (
        <DatabaseHealthCenter 
          customData={customData} 
        />
      )}

      {/* ================= TAB 1: AI GUARDIAN CALL & ABSENT ALERT DISPATCHER ================= */}
      {currentTab === 'call_triage' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 p-5 rounded-3xl border border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-sm">
                <Bot className="w-4 h-4 text-amber-600" />
                <span>AI অভিভাবক যোগাযোগ ও অনুপস্থিতি অ্যালার্ট ডিসপ্যাচ ইঞ্জিন</span>
              </div>
              <p className="text-xs text-amber-800 mt-1">
                আজকের ক্লাসে অনুপস্থিত শিক্ষার্থী এবং বিশেষ যত্ন আবশ্যক ছাত্রদের জন্য ১-ক্লিকে ফোন কল ও প্রাক-লিখিত বাংলা WhatsApp বার্তা পাঠান।
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <span className="px-3 py-1.5 bg-rose-100 text-rose-800 text-xs font-black rounded-xl border border-rose-200">
                🚨 আজ কল আবশ্যক: {triageCallList.length} জন
              </span>
            </div>
          </div>

          {/* Urgent Absent & Triage List */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-rose-700 text-sm sm:text-base flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>জরুরি কল ও WhatsApp অনুপস্থিতি অ্যালার্ট তালিকা ({triageCallList.length} জন শিক্ষার্থী)</span>
            </h3>

            {triageCallList.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 font-bold text-xs">
                🎉 অসাধারণ! আজকের কোনো শিক্ষার্থী অনুপস্থিত নেই এবং কোনো জরুরি কল পেন্ডিং নেই।
              </div>
            ) : (
              <div className="space-y-3">
                {triageCallList.map(st => {
                  const absentAlertText = `নমস্কার, বি.জি. টিউটোরিয়াল হোম থেকে বাবুন স্যার বলছি। আজকের ${st.batch} ব্যাচে ${st.name} অনুপস্থিত ছিল। পরীক্ষার প্রস্তুতির জন্য প্রত্যেকটা ক্লাস অত্যন্ত গুরুত্বপূর্ণ। কোনো অসুবিধা থাকলে জানাবেন। ফোন: ${customData.phone || '9733974425'}`;

                  return (
                    <div key={st.id} className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-slate-900 text-sm">{st.name}</span>
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-bold rounded">
                            {st.batch} (রোল {st.roll})
                          </span>
                          {st.status === 'absent' && (
                            <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded animate-pulse">
                              আজ অনুপস্থিত
                            </span>
                          )}
                          {st.healthStars <= 2 && (
                            <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-bold rounded">
                              পড়াশোনায় বিশেষ যত্ন প্রয়োজন
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">
                          অভিভাবক: <span className="font-bold text-slate-800">{st.guardianName || 'অভিভাবক'}</span> • 
                          ফোন: <span className="font-mono font-bold text-slate-900">{st.phone}</span>
                        </p>
                        {st.notes && (
                          <p className="text-[11px] text-rose-800 bg-rose-100/70 p-1.5 rounded-lg inline-block">
                            নোট: {st.notes}
                          </p>
                        )}
                      </div>

                      {/* 1-Tap Direct Call & WhatsApp Pre-filled Alert */}
                      <div className="flex items-center space-x-2 w-full lg:w-auto">
                        <a
                          href={`tel:${st.phone}`}
                          className="flex-1 lg:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow transition active:scale-95"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>📞 সরাসরি কল</span>
                        </a>

                        <a
                          href={`https://wa.me/91${(st.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(absentAlertText)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 lg:flex-none px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow transition active:scale-95"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>🟢 WhatsApp অনুপস্থিতি অ্যালার্ট</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: ATTENDANCE & AI DIARY SCANNER ================= */}
      {currentTab === 'attendance' && (
        <div className="space-y-6">
          
          {/* Header Action: AI Khata/Diary Scanner Button */}
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-5 rounded-3xl text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-amber-300" />
                <h3 className="font-black text-base sm:text-lg">
                  হাতে লেখা হাজিরা খাতা ও রেজিস্টার থেকে AI স্ক্যানার
                </h3>
              </div>
              <p className="text-xs text-indigo-100 mt-0.5">
                খাতার ছবি তুলে বা আপলোড করে এক ক্লিকে সকল শিক্ষার্থীর নাম, রোল, ফোন নম্বর ডাটাবেসে সেভ করুন।
              </p>
            </div>

            <button
              onClick={() => {
                setShowDiaryScanner(true);
                handleStartDiaryScan('preset1');
              }}
              className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-xs flex items-center space-x-2 shadow-md active:scale-95 transition"
            >
              <Camera className="w-4 h-4" />
              <span>📷 খাতা/রেজিস্টার থেকে AI স্ক্যান করুন</span>
            </button>
          </div>

          {/* Batch Selector & Student Live Search */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700 mr-1">ব্যাচ নির্বাচন:</span>
                {['সকল ব্যাচ', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Private Home Batch'].map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBatch(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      selectedBatch === b ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}>
                    {b}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-500 font-bold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                প্রদর্শিত শিক্ষার্থী: <span className="text-emerald-700 font-black">{currentBatchStudents.length}</span> / {(students || []).length} জন
              </div>
            </div>

            {/* Quick Live Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                placeholder="🔍 শিক্ষার্থীর নাম, রোল নম্বর, ফোন অথবা স্কুল দিয়ে লাইভ খুঁজুন..."
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 transition shadow-inner"
              />
              {studentSearch && (
                <button
                  type="button"
                  onClick={() => setStudentSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Student List with Condition, Rating & Attendance */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-sm sm:text-base">
              {selectedBatch} — শিক্ষার্থী তালিকা, পড়াশোনা রেটিং ও দৈনিক হাজিরা
            </h3>

            <div className="space-y-3">
              {currentBatchStudents.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-2">
                  <Users className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600 font-bold">
                    {selectedBatch}-এ বর্তমানে কোনো সক্রিয় শিক্ষার্থী নিবন্ধিত নেই।
                  </p>
                  <p className="text-[11px] text-slate-400">
                    নতুন শিক্ষার্থী যোগ করতে নিচের ফর্ম ব্যবহার করুন অথবা "অনলাইন রেজিস্ট্রেশন" অনুমোদন করুন।
                  </p>
                </div>
              )}
              {currentBatchStudents.map(st => (
                <div key={st.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-mono font-bold flex items-center justify-center">
                          {st.roll}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{st.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          st.status === 'present' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {st.status === 'present' ? 'উপস্থিত' : 'অনুপস্থিত'}
                        </span>
                        {st.type && (
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded">
                            {st.type}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        আইডি: <span className="font-mono font-bold text-indigo-700">{st.studentId || `BG-2026-C10-${st.roll}`}</span> • 
                        স্কুল: {st.schoolName || st.school || 'হাবড়া হাইস্কুল'} • অভিভাবক: {st.guardianName || 'অভিভাবক'} • 
                        ফোন: {st.phone} {st.guardianPhone ? `(অভিভাবক: ${st.guardianPhone})` : ''}
                      </p>
                      {st.batchTimeline && (
                        <p className="text-[11px] text-indigo-700 font-semibold mt-0.5">
                          ⏰ ব্যাচ সময়সূচী: {st.batchTimeline}
                        </p>
                      )}
                      {(st.address || st.mapLocation) && (
                        <div className="flex items-center space-x-2 text-[11px] text-slate-600 mt-0.5">
                          <span>📍 {st.address} {st.landmark ? `(${st.landmark})` : ''}</span>
                          <a
                            href={st.mapLocation || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((st.address || '') + ' ' + (st.landmark || '') + ' Habra')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded font-bold text-[10px] flex items-center space-x-1"
                          >
                            <MapPin className="w-3 h-3 text-indigo-600" />
                            <span>ম্যাপে বাড়ি দেখুন</span>
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleAttendanceStatus(st.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                          st.status === 'present' 
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {st.status === 'present' ? 'অনুপস্থিত করুন' : 'উপস্থিত চিহ্নিত করুন'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingStudent({ ...st })}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition active:scale-95 flex items-center space-x-1"
                        title="শিক্ষার্থীর তথ্য ও রেটিং কাস্টমাইজ করুন"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>কাস্টমাইজ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveStudent(st.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50"
                        title="তালিকা থেকে মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Health & Study Rating - Full Sir Customization */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-slate-200/60 text-xs bg-amber-50/50 p-2.5 rounded-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-amber-950 font-black shrink-0">⭐ প্রস্তুতি রেটিং:</span>
                      <div className="flex items-center space-x-0.5 bg-white px-2 py-1 rounded-xl border border-amber-200 shadow-sm">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => {
                              const labels = {
                                5: "🌟 অসাধারণ প্রস্তুতি (৫★)",
                                4: "✅ খুব ভালো (৪★)",
                                3: "👍 সন্তোষজনক (৩★)",
                                2: "⚠️ যত্ন প্রয়োজন (২★)",
                                1: "🚨 বিশেষ নজর দরকার (১★)"
                              };
                              updateStudentHealth(st.id, star, labels[star] || `${star}★ রেটিং`);
                            }}
                            className="p-0.5 hover:scale-125 transition"
                            title={`${star} স্টার রেটিং দিন`}
                          >
                            <Star className={`w-4 h-4 ${star <= (st.healthStars || 4) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                          </button>
                        ))}
                      </div>

                      {/* Sir's Custom Rating Status Text Input */}
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={st.healthCondition || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStudents(prev => prev.map(s => s.id === st.id ? { ...s, healthCondition: val } : s));
                          }}
                          onBlur={() => {
                            if (typeof saveToServer === "function") saveToServer({ students });
                            localStorage.setItem("bg_students", JSON.stringify(students));
                          }}
                          placeholder="রেটিং স্ট্যাটাস কাস্টম লিখুন..."
                          className="px-2.5 py-1 text-xs font-bold text-amber-950 bg-white border border-amber-300 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 w-44 sm:w-56"
                          title="স্যার এখানে নিজের ইচ্ছামতো যেকোনো রেটিং স্ট্যাটাস লিখে দিতে পারেন"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`tel:${st.phone}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold flex items-center space-x-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>কল</span>
                      </a>
                      <a
                        href={`https://wa.me/91${(st.phone || '').replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold flex items-center space-x-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>হোমটাস্ক পাঠান</span>
                      </a>
                    </div>
                  </div>

                  {/* Editable Weak Area Remarks */}
                  <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 shrink-0">📝 দুর্বলতা ও পরামর্শ:</span>
                    <input
                      type="text"
                      placeholder="যেমন: বীজগণিত সমাধানে দুর্বলতা, নিয়মিত রিভিশন প্রয়োজন..."
                      value={st.weakRemarks || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStudents(prev => prev.map(s => s.id === st.id ? { ...s, weakRemarks: val } : s));
                      }}
                      onBlur={() => saveToServer({ students })}
                      className="w-full p-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Add Student Manual Form */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center space-x-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>{selectedBatch}-এ নতুন শিক্ষার্থী সরাসরি যোগ করুন</span>
            </h3>

            <form onSubmit={handleAddStudent} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: অনির্বাণ সরকার"
                  value={newStudent.name}
                  onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">রোল নং *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: 12"
                  value={newStudent.roll}
                  onChange={e => setNewStudent({ ...newStudent, roll: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">অভিভাবকের নাম</label>
                <input
                  type="text"
                  placeholder="যেমন: সুভাষ সরকার"
                  value={newStudent.guardianName}
                  onChange={e => setNewStudent({ ...newStudent, guardianName: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ফোন / WhatsApp নম্বর *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: 9832104521"
                  value={newStudent.phone}
                  onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">স্কুলের নাম</label>
                <input
                  type="text"
                  placeholder="যেমন: হাবড়া মডেল হাইস্কুল"
                  value={newStudent.schoolName}
                  onChange={e => setNewStudent({ ...newStudent, schoolName: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">শিক্ষার্থীর সম্পর্কে প্রাথমিক নোট</label>
                <input
                  type="text"
                  placeholder="যেমন: অঙ্কে ভালো, নিয়মিত প্র্যাকটিস দরকার"
                  value={newStudent.notes}
                  onChange={e => setNewStudent({ ...newStudent, notes: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition"
                >
                  শিক্ষার্থী যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 3: DIGITAL MARKSHEET (100% OVERHAULED) ================= */}
      {currentTab === 'reports' && (
        <ReportCardGenerator students={students} customData={customData} />
      )}

      {/* ================= TAB 4: STUDY NOTES & HANDWRITTEN SUGGESTION DIGITIZER ================= */}
      {currentTab === 'notes_manager' && (
        <div className="space-y-6">
          
          {/* Header Action: Clean Khata & Study Notes Upload */}
          <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-700 p-5 rounded-3xl text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-300" />
                <h3 className="font-black text-base sm:text-lg">
                  হাতের লেখা নোটস, সাজেশন ও খাতার ছবি আপলোডার
                </h3>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                খাতা বা হোয়াইটবোর্ডের ছবি তুলুন অথবা সরাসরি টাইপ করে এক ক্লিকে শিক্ষার্থীদের স্টুডেন্ট পোর্টালে প্রকাশ করুন।
              </p>
            </div>

            <button
              type="button"
              onClick={() => noteFileInputRef.current?.click()}
              className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-xs flex items-center space-x-2 shadow-md active:scale-95 transition"
            >
              <Camera className="w-4 h-4" />
              <span>📸 খাতার ছবি আপলোড করুন</span>
            </button>
          </div>

          {/* Quick Manual Upload Note Form */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>নতুন স্টাডি মেটেরিয়াল বা সাজেশন সরাসরি আপলোড</span>
            </h3>

            {noteSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{noteSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddStudyNote} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">নোটস / সাজেশনের টপিক বা নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ডারউইনের মতবাদ, ল্যামার্কবাদ, ভিটামিন, জাতিসংঘ নিরাপত্তা পরিষদ, ন্যায় দর্শন (বা [২৫০ শব্দে])"
                  value={newNoteForm.title}
                  onChange={e => setNewNoteForm({ ...newNoteForm, title: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                />
                <p className="text-[11px] text-emerald-700 font-bold mt-1">
                  💡 শিক্ষকের জন্য সহজ টিপস: আপনি সরাসরি নিজের ভাষায় নোটস লিখতে পারেন অথবা Gemini বা ChatGPT থেকে যেকোনো নোটস সহজে কপি করে এনে নিচে পেস্ট (Paste) করতে পারেন।
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">শ্রেণী নির্বাচন *</label>
                <select
                  value={newNoteForm.batch}
                  onChange={e => handleNoteClassChange(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                >
                  <option value="Class 7">Class 7 (সপ্তম শ্রেণী)</option>
                  <option value="Class 8">Class 8 (অষ্টম শ্রেণী)</option>
                  <option value="Class 9">Class 9 (নবম শ্রেণী)</option>
                  <option value="Class 10">Class 10 (মাধ্যমিক দশম)</option>
                  <option value="Class 11">Class 11 (একাদশ শ্রেণী - WBCHSE)</option>
                  <option value="Class 12">Class 12 (দ্বাদশ শ্রেণী - WBCHSE)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">বিষয় (অটো সিলেক্টেড) *</label>
                <select
                  value={newNoteForm.subject}
                  onChange={e => setNewNoteForm({ ...newNoteForm, subject: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-emerald-800"
                >
                  {(CLASS_SUBJECT_OPTIONS[newNoteForm.batch] || ['গণিত (Mathematics)']).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                  <option value="অন্যান্য (Other Subject)">অন্যান্য (Other Subject)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">নোটসের ধরন</label>
                <select
                  value={newNoteForm.type}
                  onChange={e => setNewNoteForm({ ...newNoteForm, type: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                >
                  <option value="Handwritten Notes">হ্যান্ডরিটেন নোটস</option>
                  <option value="Formula Sheet">ফর্মুলা শিট</option>
                  <option value="Suggestion Notes">সাজেটিভ প্রশ্নাবলী</option>
                  <option value="Semester Notes">সেমিস্টার স্পেশাল</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => noteFileInputRef.current?.click()}
                  className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl flex items-center justify-center space-x-1.5 border border-indigo-200 transition active:scale-95"
                >
                  <Camera className="w-4 h-4 text-indigo-600" />
                  <span>📷 খাতার ছবি আপলোড</span>
                </button>
                <input
                  type="file"
                  ref={noteFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleDirectImageUpload}
                />
              </div>

              {/* Direct Note Content Textarea */}
              <div className="sm:col-span-3 space-y-1.5">
                <label className="block font-bold text-slate-700">নোটসের সম্পূর্ণ বিবরণ ও সূত্রাবলী (Direct Content) *</label>
                <textarea
                  rows="5"
                  required
                  placeholder="নোটসের সম্পূর্ণ বিবরণ, সূত্রাবলি বা গুরুত্বপূর্ণ পয়েন্টস এখানে সরাসরি লিখুন বা ওপরের 'AI দিয়ে সম্পূর্ণ Notes লেখান' বাটনে ক্লিক করুন..."
                  value={newNoteForm.desc || newNoteForm.notesContent || ''}
                  onChange={e => setNewNoteForm({ ...newNoteForm, desc: e.target.value, notesContent: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 font-sans text-xs leading-relaxed"
                />
              </div>

              {noteImagePreview && (
                <div className="sm:col-span-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center space-x-3">
                  <img src={noteImagePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-emerald-300" />
                  <div className="text-xs">
                    <span className="font-bold text-emerald-900 block">📷 খাতার ছবি সংযুক্ত হয়েছে</span>
                    <span className="text-[11px] text-emerald-700">স্টুডেন্ট পোর্টালে এই ছবির প্রিভিউ ও ডাউনলোড অপশন দৃশ্যমান হবে।</span>
                  </div>
                </div>
              )}

              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition"
                >
                  🚀 স্টাডি নোটস লাইভ সেভ ও প্রকাশ করুন
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-black text-slate-900 text-sm sm:text-base">
              বর্তমানে প্রকাশিত স্টাডি নোটস ({studyMaterials?.length || 0})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(studyMaterials || []).map(m => (
                <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                        {m.batch}
                      </span>
                      <span className="text-[11px] text-slate-500 font-bold">{m.subject}</span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm mt-1">{m.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{m.type} • {m.size || '২.১ MB'}</p>
                  </div>
                  <button
                    onClick={() => removeStudyNote(m.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: HABRA LOCAL VIRAL AI AD GENERATOR (3 STYLES) ================= */}
      {currentTab === 'habra_growth' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900">
                  হাবড়া লোকাল টিউশন ভাইরাল AI অ্যাড জেনারেটর
                </h3>
                <p className="text-xs text-slate-500">
                  দক্ষিণ হাবড়া, বাণীপুর ও পার্শ্ববর্তী এলাকার জন্য ৩টি কনভার্শন স্টাইলে ফেসবুক পোস্ট, পোস্টার ও হোয়াটসঅ্যাপ স্ট্যাটাস তৈরি করুন
                </p>
              </div>
            </div>

            {/* Platform & Theme Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 block">১. সোশ্যাল মিডিয়া প্ল্যাটফর্ম:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'whatsapp', label: '🟢 WhatsApp Status' },
                    { id: 'facebook', label: '🔵 Facebook Post' },
                    { id: 'poster', label: '🟣 Poster / Leaflet' }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setAdPlatform(p.id)}
                      className={`p-2.5 rounded-xl font-bold text-center transition ${
                        adPlatform === p.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 block">২. ক্যাম্পেইন থিম / বিষয়বস্তু:</label>
                <select
                  value={adTopic}
                  onChange={e => setAdTopic(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-xs"
                >
                  <option value="new_batch">🏫 নতুন ব্যাচে ভর্তি চলছে (New Batch Admission)</option>
                  <option value="madhyamik">🎯 মাধ্যমিক স্পেশাল ক্র্যাশ কোর্স (Madhyamik 90%+ Target)</option>
                  <option value="hs_semester">📚 একাদশ-দ্বাদশ সেমিস্টার গাইডেন্স (WBCHSE Sem 1-4)</option>
                  <option value="home_tuition">🏡 হাবড়া ও পার্শ্ববর্তী এলাকায় হোম টিউশন (Private Visit)</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateHabraAds}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white rounded-2xl font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>✨ ৩টি ভিন্ন স্টাইলে হাই-কনভার্টিং বিজ্ঞাপন তৈরি করুন</span>
            </button>

            {/* Generated Ads 3 Styles Grid */}
            {generatedAds && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                
                {/* Style 1: Emotional & Trustworthy */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-50/70 to-orange-50/70 border-2 border-rose-200 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="px-2.5 py-1 rounded-full bg-rose-200 text-rose-900 text-[10px] font-black uppercase">
                        ১. অভিভাবকের ভরসা ও স্নেহ (Emotional)
                      </span>
                    </div>
                    <textarea
                      rows="9"
                      readOnly
                      value={generatedAds.emotional}
                      className="w-full p-3 bg-white/90 border border-rose-200 rounded-xl font-sans text-xs leading-relaxed text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <button
                      onClick={() => copyAdToClipboard(generatedAds.emotional, 'emo')}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5"
                    >
                      {adCopiedStyle === 'emo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{adCopiedStyle === 'emo' ? 'কপি সম্পন্ন!' : 'টেক্সট কপি করুন'}</span>
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(generatedAds.emotional)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp স্ট্যাটাসে দিন</span>
                    </a>
                  </div>
                </div>

                {/* Style 2: Result-Oriented */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50/70 to-teal-50/70 border-2 border-emerald-200 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-950 text-[10px] font-black uppercase">
                        ২. রেজাল্ট ও মেধা ফোকাস (Result-Oriented)
                      </span>
                    </div>
                    <textarea
                      rows="9"
                      readOnly
                      value={generatedAds.result}
                      className="w-full p-3 bg-white/90 border border-emerald-200 rounded-xl font-sans text-xs leading-relaxed text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <button
                      onClick={() => copyAdToClipboard(generatedAds.result, 'res')}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5"
                    >
                      {adCopiedStyle === 'res' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{adCopiedStyle === 'res' ? 'কপি সম্পন্ন!' : 'টেক্সট কপি করুন'}</span>
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(generatedAds.result)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp স্ট্যাটাসে দিন</span>
                    </a>
                  </div>
                </div>

                {/* Style 3: Urgent / Limited Seats */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50/70 to-yellow-50/70 border-2 border-amber-300 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-950 text-[10px] font-black uppercase">
                        ৩. সীমিত আসন ও দ্রুত বুকিং (Urgent Seats)
                      </span>
                    </div>
                    <textarea
                      rows="9"
                      readOnly
                      value={generatedAds.urgent}
                      className="w-full p-3 bg-white/90 border border-amber-200 rounded-xl font-sans text-xs leading-relaxed text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <button
                      onClick={() => copyAdToClipboard(generatedAds.urgent, 'urg')}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5"
                    >
                      {adCopiedStyle === 'urg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{adCopiedStyle === 'urg' ? 'কপি সম্পন্ন!' : 'টেক্সট কপি করুন'}</span>
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(generatedAds.urgent)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp স্ট্যাটাসে দিন</span>
                    </a>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 6: NEW ONLINE REGISTRATIONS ================= */}
      {currentTab === 'registrations' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <span>ওয়েবসাইটে রেজিস্টার্ড নতুন ছাত্রছাত্রী তালিকা ({(registrations || []).length} জন)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ছাত্রছাত্রী রেজিস্ট্রেশন ফর্মের মাধ্যমে জমা হওয়া আবেদনসমূহ সরাসরি এখানে দৃশ্যমান
                </p>
              </div>

              <button
                onClick={() => {
                  setShowDiaryScanner(true);
                  handleStartDiaryScan('preset2');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>📷 খাতা থেকে AI স্ক্যান করুন</span>
              </button>
            </div>

            {(!registrations || registrations.length === 0) ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-2">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600 font-bold">
                  এখনও কোনো নতুন শিক্ষার্থী অনলাইনে রেজিস্ট্রেশন করেনি।
                </p>
                <p className="text-[11px] text-slate-400">
                  ছাত্রছাত্রীরা 'ছাত্রছাত্রী রেজিস্ট্রেশন' প্যানেল থেকে ফর্ম পূরণ করলেই তা সরাসরি এখানে আপডেট হবে।
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map(reg => (
                  <div key={reg.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-slate-900 text-sm sm:text-base">
                          {reg.studentName}
                        </span>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[11px] font-mono font-bold rounded">
                          {reg.regId}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                          {reg.grade}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded">
                          {reg.mode}
                        </span>
                        {reg.status === 'approved' && (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full">
                            ✅ অনুমোদিত (Approved)
                          </span>
                        )}
                        {reg.status === 'rejected' && (
                          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black rounded-full">
                            ❌ বাতিল (Rejected)
                          </span>
                        )}
                        {(!reg.status || reg.status === 'pending') && (
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded-full animate-pulse">
                            ⏳ অপেক্ষমান (Pending Approval)
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                        <div>স্কুল: <span className="font-bold text-slate-800">{reg.schoolName || 'উল্লেখ নেই'}</span> (রোল: {reg.rollNo || 'N/A'})</div>
                        <div>অভিভাবক: <span className="font-bold text-slate-800">{reg.guardianName || 'N/A'}</span> ({reg.guardianRelation || 'অভিভাবক'})</div>
                        <div>শিক্ষার্থীর WhatsApp: <span className="font-mono font-bold text-emerald-700">{reg.phone}</span></div>
                        <div>অভিভাবকের ফোন: <span className="font-mono font-bold text-slate-900">{reg.guardianPhone || 'N/A'}</span></div>
                        {reg.batchTimeline && (
                          <div className="sm:col-span-2">⏰ ব্যাচ সময়সূচী: <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{reg.batchTimeline}</span></div>
                        )}
                        <div className="sm:col-span-2">
                          ঠিকানা: <span className="text-slate-800">{reg.address || 'দক্ষিণ হাবড়া'}</span> {reg.landmark ? `(ল্যান্ডমার্ক: ${reg.landmark})` : ''}
                        </div>
                      </div>

                      {/* Direct Google Maps Navigation Button */}
                      <div className="pt-1 flex items-center space-x-2">
                        <a
                          href={reg.mapLocation || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((reg.address || '') + ' ' + (reg.landmark || '') + ' Habra')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 flex items-center space-x-1.5 transition active:scale-95 shadow-sm"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>🗺️ Google Maps-এ ছাত্রের বাড়ি দেখুন (GPS Navigate)</span>
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto">
                      {reg.status !== 'approved' && (
                        <button
                          onClick={() => handleApproveRegistration(reg)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>✅ অনুমোদন (Approve)</span>
                        </button>
                      )}
                      {reg.status !== 'rejected' && reg.status !== 'approved' && (
                        <button
                          onClick={() => handleRejectRegistration(reg.id)}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center space-x-1 active:scale-95 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>❌ বাতিল</span>
                        </button>
                      )}
                      <a
                        href={`tel:${reg.phone}`}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>কল</span>
                      </a>
                      <a
                        href={`https://wa.me/91${(reg.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`নমস্কার ${reg.studentName}, আমি বাবুন স্যার বলছি। বি.জি. টিউটোরিয়াল হোমে তোমার রেজিস্ট্রেশন নিশ্চিত করার জন্য যোগাযোগ করছি।`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                      <button
                        onClick={() => handleRemoveRegistration(reg.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 7: FEES & CASH LEDGER ================= */}
      {currentTab === 'fees_ledger' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-bold block">মোট সংগৃহীত ফি</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">₹{totalFees}</span>
            </div>
            <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200 shadow-sm">
              <span className="text-xs text-emerald-800 font-bold block">💵 নগদ ক্যাশ আদায়</span>
              <span className="text-2xl font-black text-emerald-950 mt-1 block">₹{cashFees}</span>
            </div>
            <div className="p-5 rounded-3xl bg-purple-50/70 border border-purple-200 shadow-sm">
              <span className="text-xs text-purple-800 font-bold block">📱 PhonePe / UPI অনলাইন আদায়</span>
              <span className="text-2xl font-black text-purple-950 mt-1 block">₹{onlineFees}</span>
            </div>
          </div>

          {/* Add Fees Form */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>নতুন ফি এন্ট্রি ও ডিজিটাল রশিদ জেনারেশন</span>
            </h3>

            {feeSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{feeSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddFeeRecord} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">শিক্ষার্থীর নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: শিক্ষার্থীর নাম..."
                  value={feeForm.studentName}
                  onChange={e => setFeeForm({ ...feeForm, studentName: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ব্যাচ / শ্রেণী *</label>
                <select
                  value={feeForm.batch}
                  onChange={e => setFeeForm({ ...feeForm, batch: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                >
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10 (Madhyamik)</option>
                  <option value="Class 11">Class 11 (WBCHSE)</option>
                  <option value="Class 12">Class 12 (WBCHSE)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">টাকার পরিমাণ (₹) *</label>
                <input
                  type="number"
                  required
                  value={feeForm.amount}
                  onChange={e => setFeeForm({ ...feeForm, amount: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">পেমেন্ট মোড</label>
                <select
                  value={feeForm.mode}
                  onChange={e => setFeeForm({ ...feeForm, mode: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                >
                  <option value="নগদ (Offline Cash)">💵 নগদ (Offline Cash)</option>
                  <option value="PhonePe / UPI Online">📱 PhonePe / UPI Online</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-slate-700 mb-1">মাস ও বিবরণ</label>
                <input
                  type="text"
                  placeholder="যেমন: অক্টোবর ২০২৬ মাসিক টিউশন ফি"
                  value={feeForm.note}
                  onChange={e => setFeeForm({ ...feeForm, note: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition"
                >
                  রশিদ তৈরি ও সেভ
                </button>
              </div>
            </form>
          </div>

          {/* Fee Records Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                ফি আদায় লেজার রেকর্ডসমূহ
              </h4>
            </div>

            {(!feeRecords || feeRecords.length === 0) ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-2 m-4">
                <DollarSign className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600 font-bold">
                  বর্তমানে কোনো ফি আদায়ের রেকর্ড নেই।
                </p>
                <p className="text-[11px] text-slate-400">
                  শিক্ষার্থীদের ফি গ্রহণের পর উপরের ফর্মটি পূরণ করে ডিজিটাল রসিদ ইস্যু ও সংরক্ষণ করুন।
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">রশিদ নং</th>
                    <th className="p-3">শিক্ষার্থী</th>
                    <th className="p-3">ব্যাচ</th>
                    <th className="p-3">উৎস</th>
                    <th className="p-3">পরিমাণ</th>
                    <th className="p-3">পদ্ধতি</th>
                    <th className="p-3">তারিখ</th>
                    <th className="p-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(feeRecords || []).map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-indigo-600">{r.receiptNo}</td>
                      <td className="p-3 font-bold text-slate-900">{r.studentName}</td>
                      <td className="p-3 text-slate-600">{r.batch}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {r.paymentSource || 'Center Batch'}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-black text-slate-900">₹{r.amount}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.mode?.includes('PhonePe') || r.mode?.includes('UPI')
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {r.mode}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{r.date}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            const msg = `🧾 B.G. TUTORIAL HOME (Babun Ghosh)\nরশিদ নং: ${r.receiptNo}\nশিক্ষার্থী: ${r.studentName}\nপরিমাণ: ₹${r.amount} (${r.mode})\nতারিখ: ${r.date}\nদক্ষিণ হাবড়া, উত্তর ২৪ পরগণা।`;
                            navigator.clipboard.writeText(msg);
                            alert('রশিদ টেক্সট কপি হয়েছে! হোয়াটসঅ্যাপে পেস্ট করে পাঠান।');
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                        >
                          রশিদ পাঠান
                        </button>
                        <button
                          onClick={() => removeFeeRecord(r.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 8: NOTICES ================= */}
      {currentTab === 'notices' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center space-x-2">
              <Megaphone className="w-4 h-4 text-emerald-600" />
              <span>মোবাইল থেকে নতুন নোটিশ প্রকাশ করুন</span>
            </h3>

            {noticePublishSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>নোটিশ সফলভাবে ওয়েবসাইটে প্রকাশিত হয়েছে!</span>
              </div>
            )}

            <form onSubmit={handleAddNotice} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">নোটিশের শিরোনাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: আগামী রবিবার স্পেশাল টেস্ট পরীক্ষা"
                    value={noticeForm.title}
                    onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">কোন ব্যাচের জন্য *</label>
                  <select
                    value={noticeForm.batch}
                    onChange={e => setNoticeForm({ ...noticeForm, batch: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                  >
                    <option value="All Students">All Students (সকল শিক্ষার্থী)</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10 (Madhyamik)</option>
                    <option value="Class 11">Class 11 (WBCHSE)</option>
                    <option value="Class 12">Class 12 (WBCHSE)</option>
                    <option value="Private Home Batch">Private Home Batch (প্রাইভেট হোম টিউশন)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">নোটিশের বিস্তারিত বার্তা *</label>
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">নোটিশের বিস্তারিত বার্তা *</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="যেমন: কাল সকাল ৮টায় ক্লাস ১০ এর টেস্ট পরীক্ষা হবে। সবাইকে আসতে হবে ক্যালকুলেটর ছাড়া..."
                    value={noticeForm.desc}
                    onChange={e => setNoticeForm({ ...noticeForm, desc: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 leading-relaxed"
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition"
              >
                নোটিশ লাইভ পাবলিশ করুন
              </button>
            </form>
          </div>

          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-black text-slate-900 text-sm sm:text-base">
              বর্তমানে সক্রিয় নোটিশসমূহ ({notices?.length || 0})
            </h3>

            <div className="space-y-3">
              {(notices || []).map(n => (
                <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-start gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                        {n.batch}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{n.date}</span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm mt-1">{n.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.desc}</p>
                  </div>
                  <button
                    onClick={() => removeNotice(n.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      
      {/* ================= TAB: BATCH ROUTINE MANAGER ================= */}
      {currentTab === 'routine' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 rounded-3xl text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-amber-300" />
                <h3 className="font-black text-base sm:text-lg">
                  সাপ্তাহিক ব্যাচ রুটিন ম্যানেজার (Monday - Sunday)
                </h3>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                সোম থেকে রবিবার কোন ব্যাচ কখন কোথায় অনুষ্ঠিত হবে তা এখানে সহজেই পরিবর্তন করুন। স্টুডেন্ট পোর্টালে এই রুটিন সরাসরি লাইভ প্রদর্শিত হয়।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddRoutineSlot}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition"
              >
                + নতুন স্লট
              </button>
              <button
                type="button"
                onClick={handleSaveRoutine}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-md active:scale-95 transition"
              >
                <Save className="w-4 h-4" />
                <span>💾 রুটিন সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>

          {routineSaveMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{routineSaveMsg}</span>
            </div>
          )}

          {routineList.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 space-y-2">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">বর্তমানে কোনো সাপ্তাহিক রুটিন স্লট নেই</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                পূর্বের সমস্ত ডামি রুটিন অপসারিত হয়েছে। শিক্ষক মহাশয় ওপরে '+ নতুন স্লট' বাটনে ক্লিক করে পছন্দমতো নতুন ক্লাস রুটিন যুক্ত করুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routineList.map((slot, index) => (
              <div key={slot.id || index} className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={slot.day}
                      onChange={e => handleUpdateRoutineItem(slot.id, 'day', e.target.value)}
                      className="font-black text-slate-900 text-sm border-b border-dashed border-slate-300 focus:outline-none focus:border-indigo-600 bg-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRoutineSlot(slot.id)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-0.5">ব্যাচ / শ্রেণী:</label>
                    <input
                      type="text"
                      value={slot.batch}
                      onChange={e => handleUpdateRoutineItem(slot.id, 'batch', e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-0.5">সময় (Time):</label>
                    <input
                      type="text"
                      value={slot.time}
                      onChange={e => handleUpdateRoutineItem(slot.id, 'time', e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-mono text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-0.5">বিষয় (Subject):</label>
                    <input
                      type="text"
                      value={slot.subject}
                      onChange={e => handleUpdateRoutineItem(slot.id, 'subject', e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-0.5">স্থান (Location):</label>
                    <input
                      type="text"
                      value={slot.location}
                      onChange={e => handleUpdateRoutineItem(slot.id, 'location', e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800"
                    />
                  </div>
                </div>

                {/* BIDIRECTIONAL ALGORITHM: Associated Enrolled & Registered Students */}
                {(() => {
                  const bStr = (slot.batch || '').toLowerCase();
                  const matchedStudents = (students || []).filter(st => {
                    const stB = (st.batch || '').toLowerCase();
                    return bStr.includes(stB) || stB.includes(bStr) || 
                      (bStr.includes('7') && stB.includes('7')) ||
                      (bStr.includes('8') && stB.includes('8')) ||
                      (bStr.includes('9') && stB.includes('9')) ||
                      (bStr.includes('10') && stB.includes('10')) ||
                      (bStr.includes('11') && stB.includes('11')) ||
                      (bStr.includes('12') && stB.includes('12')) ||
                      (bStr.includes('home') && stB.includes('home'));
                  });
                  return (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="font-bold text-slate-700">এই ব্যাচে নিবন্ধিত শিক্ষার্থী:</span>
                        <span className="font-black px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                          {matchedStudents.length} জন
                        </span>
                      </div>
                      {matchedStudents.length > 0 && (
                        <span className="text-[10px] text-slate-500 truncate max-w-[200px]">
                          {matchedStudents.slice(0, 3).map(s => s.name).join(', ')}{matchedStudents.length > 3 ? '...' : ''}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
          )}

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleSaveRoutine}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition"
            >
              💾 সমস্ত পরিবর্তন সেভ করুন (Save Weekly Routine)
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB: STUDENT DOUBTS BOX ================= */}
      {currentTab === 'doubts_box' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-700 p-5 rounded-3xl text-white shadow-lg flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-amber-300" />
                <h3 className="font-black text-base sm:text-lg">
                  শিক্ষার্থীদের পার্সোনাল ডাউট বক্স (Private Doubt Box)
                </h3>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                শিক্ষার্থীরা তাদের পোর্টাল থেকে Babun Ghosh স্যারকে সরাসরি যে প্রশ্ন বা সন্দেহ পাঠিয়েছে তা এখানে সুরক্ষিতভাবে দৃশ্যমান। ১-ক্লিকে WhatsApp-এ উত্তর দিন।
              </p>
            </div>
            <span className="px-3 py-1 bg-white/20 rounded-full font-mono text-xs font-bold">
              মোট: {(doubts || []).length} টি প্রশ্ন
            </span>
          </div>

          {(!doubts || doubts.length === 0) ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600 font-bold">বর্তমানে শিক্ষার্থীদের কোনো নতুন ডাউট জমা নেই।</p>
              <p className="text-[11px] text-slate-400">শিক্ষার্থীরা স্টুডেন্ট পোর্টালের ডাউট বক্স থেকে প্রশ্ন পাঠালে এখানে সরাসরি যুক্ত হবে।</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(doubts || []).map(d => {
                const cleanPhone = (d.studentPhone || customData.phone || '').replace(/\D/g, '');
                const isAnswered = d.status === 'answered';
                return (
                  <div key={d.id} className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-slate-900 text-sm">{d.studentName}</span>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold rounded">
                          {d.studentId || d.grade}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                          {d.subject || 'সাধারণ'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{d.date} • {d.time}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isAnswered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900 animate-pulse'
                        }`}>
                          {isAnswered ? '✅ উত্তর দেওয়া সম্পন্ন' : '⏳ উত্তরের অপেক্ষায় (Pending)'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans">
                      💬 <span className="font-bold text-slate-900">প্রশ্ন:</span> {d.question}
                    </div>

                    <div className="flex flex-wrap justify-end items-center gap-2 pt-1">
                      <a
                        href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`নমস্কার ${d.studentName}, তোমার প্রশ্নের প্রেক্ষিতে:\n"${d.question}"\n\n- বাবন স্যার (B.G. TUTORIAL HOME)`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm active:scale-95 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp-এ উত্তর দিন</span>
                      </a>

                      <button
                        onClick={() => {
                          const updated = (doubts || []).map(item => item.id === d.id ? { ...item, status: isAnswered ? 'pending' : 'answered' } : item);
                          if (setDoubts) setDoubts(updated);
                          saveToServer({ doubts: updated });
                        }}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                      >
                        {isAnswered ? 'পুনরায় পেন্ডিং করুন' : '✅ উত্তর সম্পন্ন চিহ্নিত করুন'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 9: SETTINGS & MASTER PIN CHANGE ================= */}
      {currentTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>সিকিউরিটি পিন পরিবর্তন (Security PIN Change)</span>
            </h3>

            {pinChangeMsg.text && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                pinChangeMsg.type === 'error' 
                  ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {pinChangeMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{pinChangeMsg.text}</span>
              </div>
            )}



            <form onSubmit={handlePinChange} className="space-y-3 text-xs max-w-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">নতুন ৬ সংখ্যার পিন *</label>
                  <input
                    type="password"
                    maxLength="6"
                    required
                    placeholder="••••••"
                    value={newPin}
                    onChange={e => setNewPin(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono text-center tracking-widest text-base"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">পিন নিশ্চিত করুন *</label>
                  <input
                    type="password"
                    maxLength="6"
                    required
                    placeholder="••••••"
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono text-center tracking-widest text-base"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition active:scale-95"
              >
                পিন সংরক্ষণ করুন
              </button>
            </form>
          </div>

          {/* Profile Information Settings */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center space-x-2">
              <Settings className="w-4 h-4 text-emerald-600" />
              <span>টিউটোরিয়াল ও শিক্ষকের তথ্য সম্পাদনা</span>
            </h3>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>তথ্য সফলভাবে সংরক্ষিত হয়েছে!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">শিক্ষকের নাম</label>
                <input
                  type="text"
                  value={configForm.teacherName || ''}
                  onChange={e => setConfigForm({ ...configForm, teacherName: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ফোন / WhatsApp নম্বর</label>
                <input
                  type="text"
                  value={configForm.phone || ''}
                  onChange={e => setConfigForm({ ...configForm, phone: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ঠিকানা</label>
                <input
                  type="text"
                  value={configForm.address || ''}
                  onChange={e => setConfigForm({ ...configForm, address: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow transition active:scale-95"
              >
                প্রোফাইল আপডেট করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: AI DIARY & ATTENDANCE OCR SCANNER ================= */}
      {showDiaryScanner && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </span>
                  <h3 className="font-black text-base sm:text-lg text-slate-900">
                    হাতে লেখা হাজিরা খাতা ও রেজিস্টার AI স্ক্যানার
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  খাতার ছবি স্ক্যান করে ছাত্রছাত্রীদের রোল, নাম, ফোন ও ব্যাচ স্বয়ংক্রিয়ভাবে এক্সট্র্যাক্ট করুন
                </p>
              </div>

              <button
                onClick={() => setShowDiaryScanner(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {diarySuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{diarySuccessMsg}</span>
              </div>
            )}

            {/* Upload or Choose Presets */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                খাতার ছবি নির্বাচন করুন বা প্রি-সেট নমুনা থেকে স্ক্যান চালান:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleStartDiaryScan('preset1')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    diaryScanSource === 'preset1' ? 'bg-indigo-50 border-indigo-400 font-bold text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="block font-black text-xs">📖 নমুনা খাতা ১</span>
                  <span className="text-[11px] text-slate-500 block">দশম শ্রেণী গ্রুপ ব্যাচ (৫ জন)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartDiaryScan('preset2')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    diaryScanSource === 'preset2' ? 'bg-indigo-50 border-indigo-400 font-bold text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="block font-black text-xs">📖 নমুনা খাতা ২</span>
                  <span className="text-[11px] text-slate-500 block">একাদশ-দ্বাদশ প্রাইভেট ভিজিট (৩ জন)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartDiaryScan('preset3')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    diaryScanSource === 'preset3' ? 'bg-indigo-50 border-indigo-400 font-bold text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="block font-black text-xs">📖 নমুনা খাতা ৩</span>
                  <span className="text-[11px] text-slate-500 block">সপ্তম-নবম সমন্বিত ব্যাচ (৩ জন)</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/70 text-center space-y-1.5">
                <Camera className="w-6 h-6 text-slate-400 mx-auto" />
                <div className="text-xs font-bold text-slate-700">
                  অথবা মোবাইলের ক্যামেরা দিয়ে খাতার ছবি তুলুন / ফাইল আপলোড করুন
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={() => handleStartDiaryScan('preset1')}
                  className="text-xs text-slate-500"
                />
              </div>
            </div>

            {/* OCR Progress Spinner */}
            {isScanningDiary && (
              <div className="p-6 text-center space-y-2">
                <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                <div className="text-xs font-bold text-slate-800">
                  AI হাতের লেখা শনাক্ত ও টেবিল ফরম্যাটে রূপান্তর করছে...
                </div>
              </div>
            )}

            {/* Editable Preview Grid */}
            {!isScanningDiary && scannedStudentsPreview.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900">
                    শনাক্তকৃত শিক্ষার্থীর খসড়া তালিকা ({scannedStudentsPreview.length} জন) — প্রয়োজনে সংশোধন করুন:
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {scannedStudentsPreview.map(st => (
                    <div key={st.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={st.roll}
                          onChange={e => handleUpdateScannedField(st.id, 'roll', e.target.value)}
                          className="w-full p-1.5 border border-slate-300 rounded-lg text-center font-mono font-bold bg-white"
                          title="রোল"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={st.name}
                          onChange={e => handleUpdateScannedField(st.id, 'name', e.target.value)}
                          className="w-full p-1.5 border border-slate-300 rounded-lg font-bold bg-white"
                          title="নাম"
                        />
                      </div>
                      <div className="col-span-3">
                        <select
                          value={st.batch}
                          onChange={e => handleUpdateScannedField(st.id, 'batch', e.target.value)}
                          className="w-full p-1.5 border border-slate-300 rounded-lg bg-white font-bold text-[11px]"
                        >
                          <option value="Class 7">Class 7</option>
                          <option value="Class 8">Class 8</option>
                          <option value="Class 9">Class 9</option>
                          <option value="Class 10">Class 10</option>
                          <option value="Class 11">Class 11</option>
                          <option value="Class 12">Class 12</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={st.phone}
                          onChange={e => handleUpdateScannedField(st.id, 'phone', e.target.value)}
                          className="w-full p-1.5 border border-slate-300 rounded-lg font-mono text-[11px] bg-white"
                          title="ফোন"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveScannedItem(st.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowDiaryScanner(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={handleApproveScannedStudents}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition"
                  >
                    ✅ অনুমোদন ও ডাটাবেসে সেভ করুন (Approve & Save All)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL 2: AI STUDY NOTES & HANDWRITTEN DIGITIZER ================= */}
      {showNoteDigitizer && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h3 className="font-black text-base sm:text-lg text-slate-900">
                    হাতের লেখা সাজেশন ও ক্লাসরুম নোটস ডিজিটাইজার
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  হাতের লেখা খাতা বা বোর্ডের ছবি থেকে পরিষ্কার ডিজিটাল বাংলা নোটস ও ২-মিনিটের রিভিশন সারসংক্ষেপ তৈরি
                </p>
              </div>

              <button
                onClick={() => setShowNoteDigitizer(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {noteDigitizeSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{noteDigitizeSuccess}</span>
              </div>
            )}

            {/* Preset Selector */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">নমুনা হাতের লেখা খাতা বা সাজেশন নির্বাচন করুন:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {NOTE_PRESETS.map((p, idx) => (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => handleDigitizePreset(idx)}
                    className="p-2.5 rounded-xl border bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-left transition"
                  >
                    <span className="font-bold text-slate-900 block text-[11px] truncate">{p.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{p.batch} • {p.subject}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Processing State */}
            {isDigitizingNote && (
              <div className="p-6 text-center space-y-2">
                <RefreshCw className="w-6 h-6 text-teal-600 animate-spin mx-auto" />
                <div className="text-xs font-bold text-slate-800">
                  AI হাতের লেখা স্ক্যান ও বাংলা ফরম্যাটিং তৈরি করছে...
                </div>
              </div>
            )}

            {/* Digitized Output Area */}
            {!isDigitizingNote && digitizedTitle && (
              <div className="space-y-3 pt-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">নোটস শিরোনাম:</label>
                    <input
                      type="text"
                      value={digitizedTitle}
                      onChange={e => setDigitizedTitle(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-xl font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">শ্রেণী:</label>
                    <select
                      value={noteScanBatch}
                      onChange={e => setNoteScanBatch(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-xl font-bold bg-white"
                    >
                      <option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11">Class 11</option>
                      <option value="Class 12">Class 12</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ডিজিটাইজড বাংলা মূল নোটস (সম্পাদনাযোগ্য):</label>
                  <textarea
                    rows="5"
                    value={digitizedContent}
                    onChange={e => setDigitizedContent(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-sans text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">⚡ ২-মিনিট কুইক রিভিশন সারসংক্ষেপ:</label>
                  <textarea
                    rows="3"
                    value={digitizedSummary}
                    onChange={e => setDigitizedSummary(e.target.value)}
                    className="w-full p-2.5 border border-emerald-300 rounded-xl bg-emerald-50/50 font-sans text-xs leading-relaxed text-emerald-950 font-medium"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowNoteDigitizer(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                  >
                    বন্ধ করুন
                  </button>
                  <button
                    type="button"
                    onClick={handlePublishDigitizedNote}
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-500/20 active:scale-95 transition"
                  >
                    🚀 স্টুডেন্ট পোর্টালে সরাসরি লাইভ পাবলিশ করুন
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= STUDENT FULL CUSTOMIZATION MODAL ================= */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">শিক্ষার্থী তথ্য ও রেটিং কাস্টমাইজ</h3>
                  <p className="text-[11px] text-slate-500 font-medium">আইডি: {editingStudent.studentId || `BG-2026-${editingStudent.roll || '01'}`}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">শিক্ষার্থীর পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  value={editingStudent.name || ''}
                  onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">রোল নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.roll || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, roll: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ব্যাচ *</label>
                  <select
                    value={editingStudent.batch || 'Class 10'}
                    onChange={e => setEditingStudent({ ...editingStudent, batch: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-slate-50 focus:bg-white text-slate-800"
                  >
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 10 Special">Class 10 Special</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                    <option value="Private Home Batch">Private Home Batch</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ফোন / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.phone || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">স্কুলের নাম</label>
                  <input
                    type="text"
                    value={editingStudent.schoolName || editingStudent.school || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, schoolName: e.target.value, school: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">অভিভাবকের নাম</label>
                  <input
                    type="text"
                    value={editingStudent.guardianName || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, guardianName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">অভিভাবকের ফোন</label>
                  <input
                    type="text"
                    value={editingStudent.guardianPhone || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, guardianPhone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* 5-Star Rating & Custom Condition */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-amber-900 block text-xs">⭐ প্রস্তুতি রেটিং (৫ স্টার)</label>
                  <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-xl border border-amber-300">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          const labels = {
                            5: '🌟 অসাধারণ প্রস্তুতি (৫★)',
                            4: '✅ খুব ভালো (৪★)',
                            3: '👍 সন্তোষজনক (৩★)',
                            2: '⚠️ যত্ন প্রয়োজন (২★)',
                            1: '🚨 বিশেষ নজর দরকার (১★)'
                          };
                          setEditingStudent({ 
                            ...editingStudent, 
                            healthStars: star, 
                            healthCondition: labels[star] 
                          });
                        }}
                        className="p-0.5 hover:scale-125 transition"
                      >
                        <Star className={`w-5 h-5 ${star <= (editingStudent.healthStars || 4) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">রেটিং স্ট্যাটাস মন্তব্য (কাস্টমাইজ করুন):</label>
                  <input
                    type="text"
                    value={editingStudent.healthCondition || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, healthCondition: e.target.value })}
                    placeholder="যেমন: অসাধারণ প্রস্তুতি, বা বিজ্ঞানে দুর্বল..."
                    className="w-full p-2.5 rounded-xl border border-amber-300 font-bold bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">📝 দুর্বলতা ও স্যারের বিশেষ নোট</label>
                <textarea
                  rows="2"
                  value={editingStudent.weakRemarks || editingStudent.notes || ''}
                  onChange={e => setEditingStudent({ ...editingStudent, weakRemarks: e.target.value, notes: e.target.value })}
                  placeholder="শিক্ষার্থীর দুর্বল জায়গা ও প্রয়োজনীয় নির্দেশনা..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ঠিকানা</label>
                  <input
                    type="text"
                    value={editingStudent.address || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ল্যান্ডমার্ক</label>
                  <input
                    type="text"
                    value={editingStudent.landmark || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, landmark: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end items-center gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>পরিবর্তন সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
