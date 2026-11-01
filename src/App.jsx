import React, { useState, useEffect, Suspense } from 'react';
import { migrateFromLocalStorage } from './utils/db';
import { 
  GraduationCap, Code2, X, Maximize2, Phone, MapPin, Calendar, Clock, BookOpen, 
  CheckCircle2, Award, Users, Heart, Share2, MessageCircle, 
  Send, QrCode, Copy, Check, ExternalLink, ShieldCheck, 
  FileText, Sparkles, AlertCircle, RefreshCw, Volume2, 
  VolumeX, Star, HelpCircle, ChevronRight, Download, Smartphone, Eye,
  Home, Bell, Settings, Lock, Inbox, Trophy, Globe, UserCheck,
  CheckCheck, Printer, ArrowRight, Lightbulb, BookmarkCheck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { translations } from './translations';
const TeacherWorkspace = React.lazy(() => import('./components/TeacherWorkspace'));
import ErrorBoundary from './components/ErrorBoundary';
import StudentPortal from './components/StudentPortal';
import QuizArena from './components/QuizArena';
import ProtectedAccessScreen from './components/ProtectedAccessScreen';
import { DETAILED_SYLLABUS } from './data/syllabusData';
const teacherPosterImg = '/images/teacher-poster.jpg';
const bannerBoardImg = '/images/banner-board.jpg';
const visitingCardImg = '/images/visiting-card.jpg';
const teacherPortraitImg = '/images/teacher-portrait.jpg';


export const AMBIENT_SHADERS = [
  { id: 1, name: 'Emerald Aurora', orb1: '#059669', orb2: '#0d9488', orb3: '#10b981', gradient: 'linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 50%, #99f6e4 100%)' },
  { id: 2, name: 'Royal Indigo', orb1: '#4338ca', orb2: '#3b82f6', orb3: '#6366f1', gradient: 'linear-gradient(135deg, #c7d2fe 0%, #93c5fd 50%, #a5b4fc 100%)' },
  { id: 3, name: 'Sunset Amber & Coral', orb1: '#d97706', orb2: '#ea580c', orb3: '#f59e0b', gradient: 'linear-gradient(135deg, #fed7aa 0%, #fecdd3 50%, #fde68a 100%)' },
  { id: 4, name: 'Rose Blossom', orb1: '#e11d48', orb2: '#db2777', orb3: '#f43f5e', gradient: 'linear-gradient(135deg, #fbcfe8 0%, #fda4af 50%, #f472b6 100%)' },
  { id: 5, name: 'Deep Cyan Breeze', orb1: '#0891b2', orb2: '#0284c7', orb3: '#06b6d4', gradient: 'linear-gradient(135deg, #bae6fd 0%, #a5f3fc 50%, #7dd3fc 100%)' },
  { id: 6, name: 'Violet Mystic', orb1: '#7e22ce', orb2: '#9333ea', orb3: '#a855f7', gradient: 'linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 50%, #c4b5fd 100%)' },
  { id: 7, name: 'Neon Lime Wave', orb1: '#65a30d', orb2: '#16a34a', orb3: '#84cc16', gradient: 'linear-gradient(135deg, #d9f99d 0%, #bbf7d0 50%, #86efac 100%)' },
  { id: 8, name: 'Electric Ocean', orb1: '#1d4ed8', orb2: '#0284c7', orb3: '#2563eb', gradient: 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 50%, #60a5fa 100%)' },
  { id: 9, name: 'Fiery Coral', orb1: '#dc2626', orb2: '#ea580c', orb3: '#ef4444', gradient: 'linear-gradient(135deg, #fecaca 0%, #fed7aa 50%, #fca5a5 100%)' },
  { id: 10, name: 'Fuchsia Magenta', orb1: '#c026d3', orb2: '#db2777', orb3: '#e879f9', gradient: 'linear-gradient(135deg, #f5d0fe 0%, #fbcfe8 50%, #e879f9 100%)' },
  { id: 11, name: 'Teal Lagoon', orb1: '#0f766e', orb2: '#0d9488', orb3: '#14b8a6', gradient: 'linear-gradient(135deg, #99f6e4 0%, #a7f3d0 50%, #5eead4 100%)' },
  { id: 12, name: 'Golden Sunlight', orb1: '#ca8a04', orb2: '#d97706', orb3: '#eab308', gradient: 'linear-gradient(135deg, #fde68a 0%, #fef08a 50%, #fed7aa 100%)' },
  { id: 13, name: 'Purple Twilight', orb1: '#6b21a8', orb2: '#4338ca', orb3: '#7e22ce', gradient: 'linear-gradient(135deg, #ddd6fe 0%, #c7d2fe 50%, #e9d5ff 100%)' },
  { id: 14, name: 'Ruby Crimson', orb1: '#be123c', orb2: '#e11d48', orb3: '#f43f5e', gradient: 'linear-gradient(135deg, #fecdd3 0%, #fda4af 50%, #fb7185 100%)' },
  { id: 15, name: 'Sky Azure', orb1: '#0369a1', orb2: '#0284c7', orb3: '#38bdf8', gradient: 'linear-gradient(135deg, #bae6fd 0%, #7dd3fc 50%, #93c5fd 100%)' },
  { id: 16, name: 'Fresh Mint', orb1: '#059669', orb2: '#10b981', orb3: '#34d399', gradient: 'linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 50%, #a5f3fc 100%)' },
  { id: 17, name: 'Tangerine Sun', orb1: '#c2410c', orb2: '#ea580c', orb3: '#f97316', gradient: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 50%, #fb923c 100%)' },
  { id: 18, name: 'Lavender Mist', orb1: '#7c3aed', orb2: '#9333ea', orb3: '#c084fc', gradient: 'linear-gradient(135deg, #e9d5ff 0%, #f3e8ff 50%, #ddd6fe 100%)' },
  { id: 19, name: 'Ocean Sapphire', orb1: '#1e40af', orb2: '#0369a1', orb3: '#2563eb', gradient: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 50%, #818cf8 100%)' },
  { id: 20, name: 'Sunset Gold', orb1: '#b45309', orb2: '#d97706', orb3: '#f59e0b', gradient: 'linear-gradient(135deg, #fef08a 0%, #fde047 50%, #fed7aa 100%)' },
  { id: 21, name: 'Turquoise Breeze', orb1: '#0f766e', orb2: '#0891b2', orb3: '#2dd4bf', gradient: 'linear-gradient(135deg, #99f6e4 0%, #a5f3fc 50%, #67e8f9 100%)' },
  { id: 22, name: 'Berry Velvet', orb1: '#9d174d', orb2: '#be185d', orb3: '#db2777', gradient: 'linear-gradient(135deg, #fbcfe8 0%, #f472b6 50%, #f5d0fe 100%)' },
  { id: 23, name: 'Peach Glow', orb1: '#e11d48', orb2: '#f43f5e', orb3: '#fb7185', gradient: 'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 50%, #fed7aa 100%)' },
  { id: 24, name: 'Midnight Iris', orb1: '#3730a3', orb2: '#581c87', orb3: '#4338ca', gradient: 'linear-gradient(135deg, #c7d2fe 0%, #ddd6fe 50%, #93c5fd 100%)' },
  { id: 25, name: 'Forest Jade', orb1: '#166534', orb2: '#15803d', orb3: '#22c55e', gradient: 'linear-gradient(135deg, #bbf7d0 0%, #86efac 50%, #a7f3d0 100%)' },
  { id: 26, name: 'Warm Copper', orb1: '#9a3412', orb2: '#c2410c', orb3: '#ea580c', gradient: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 50%, #fde68a 100%)' },
  { id: 27, name: 'Electric Orchid', orb1: '#a21caf', orb2: '#c026d3', orb3: '#e879f9', gradient: 'linear-gradient(135deg, #f5d0fe 0%, #e879f9 50%, #c4b5fd 100%)' },
  { id: 28, name: 'Cosmic Prism', orb1: '#0284c7', orb2: '#7c3aed', orb3: '#db2777', gradient: 'linear-gradient(135deg, #a5f3fc 0%, #c7d2fe 50%, #fbcfe8 100%)' }
];

export default function App() {
  useEffect(() => {
    // Phase 2: First-run migration to IndexedDB
    migrateFromLocalStorage().then(res => {
      if (res && res.migrated) {
        console.log('IndexedDB first-run migration complete:', res.counts);
      }
    }).catch(err => console.warn('Migration notice:', err));
  }, []);
  const [lang, setLang] = useState('en');
  const [shaderIndex, setShaderIndex] = useState(0);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copiedPortalLink, setCopiedPortalLink] = useState(false);

  // 28-Palette Ambient Color Shader Auto-Cycle (Every 4 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setShaderIndex(prev => (prev + 1) % AMBIENT_SHADERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const currentShader = AMBIENT_SHADERS[shaderIndex];

  // Synchronize dynamic background gradient with document.body & viewport
  useEffect(() => {
    if (typeof document !== 'undefined' && currentShader) {
      document.body.style.background = currentShader.gradient;
      document.body.style.transition = 'background 1000ms ease-in-out';
    }
  }, [currentShader]);

  const handleCopyPortalLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('https://bg-tutorial-home.vercel.app');
      setCopiedPortalLink(true);
      setTimeout(() => setCopiedPortalLink(false), 2500);
    }
  };

  const handleDownloadWebsiteQr = (svgId = 'website-qr-svg-home') => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 760;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const grad = ctx.createLinearGradient(0, 0, 600, 760);
      grad.addColorStop(0, '#022c22');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#064e3b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 760);

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 6;
      ctx.strokeRect(12, 12, 576, 736);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('B.G. TUTORIAL HOME', 300, 75);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillText('বি.জি. টিউটোরিয়াল হোম', 300, 110);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '16px Arial, sans-serif';
      ctx.fillText('শিক্ষক: বাবুন ঘোষ • দক্ষিণ হাবড়া', 300, 140);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(110, 165, 380, 380);

      const svgElement = document.getElementById(svgId) || document.getElementById('website-qr-svg-modal') || document.querySelector('svg[id^="website-qr-svg"]');
      if (svgElement) {
        const xml = new XMLSerializer().serializeToString(svgElement);
        const svg64 = btoa(unescape(encodeURIComponent(xml)));
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 130, 185, 340, 340);

          ctx.fillStyle = '#fde68a';
          ctx.font = 'bold 18px Arial, sans-serif';
          ctx.fillText('https://bg-tutorial-home.vercel.app', 300, 585);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '14px Arial, sans-serif';
          ctx.fillText('Scan with any Camera or QR Scanner App to visit', 300, 620);

          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 14px Arial, sans-serif';
          ctx.fillText('✨ B.G. Tutorial Home • Official Portal', 300, 690);

          const link = document.createElement('a');
          link.download = 'bg-tutorial-home-qr-code.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        };
        img.src = 'data:image/svg+xml;base64,' + svg64;
      }
    } catch (err) {
      console.error('QR download error:', err);
    }
  };

  const [selectedMediaModal, setSelectedMediaModal] = useState(null);
  const [selectedChapterModal, setSelectedChapterModal] = useState(null);
  const t = translations[lang];

  // Core Database State
  const [customData, setCustomData] = useState({
    instituteName: 'B.G. TUTORIAL HOME (বি.জি. টিউটোরিয়াল হোম)',
    teacherName: 'বাবুন ঘোষ (Babun Ghosh)',
    phone: '9733974425',
    upiVpa: '9733974425@ybl',
    address: 'দক্ষিণ হাবড়া, (এস. এন দে রোড), হাবড়া, উত্তর ২৪ পরগণা',
    landmark: 'দক্ষিণ হাবড়া হাই স্কুলের সন্নিকটে, এস. এন দে রোড',
    facebookLink: 'https://www.facebook.com/share/1DoHjC9WYB/',
    securityPin: '980095',
    dob: '১লা ডিসেম্বর ১৯৮০ (1 December 1980)',
    experience: '১৫+ বছরের শিক্ষকতা অভিজ্ঞতা',
    education: [
      'শ্রী চৈতন্য কলেজ, হাবড়া (Sree Chaitanya College, Habra)',
      'দক্ষিণ হাবড়া হাই স্কুল (Dakshin Habra High School)',
      'হাবড়া হাই স্কুল — H.S. (Habra High School)'
    ]
  });

  const [students, setStudents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [feeRecords, setFeeRecords] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [homeworkList, setHomeworkList] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  
  // Student Portal Auth & Privacy State
  const [loggedInStudent, setLoggedInStudent] = useState(() => {
    try {
      const saved = localStorage.getItem('bg_current_student');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [initialStudentPortalId, setInitialStudentPortalId] = useState('');

  // PWA Android App Installation State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showAppInstallModal, setShowAppInstallModal] = useState(false);

  // Security & Developer Ownership Fingerprint
  const DEVELOPER_INFO = {
    creator: 'Rahul Dutta',
    role: 'Lead Digital Architect & Full-Stack Developer',
    engineeredFor: 'Babun Ghosh Sir (B.G. Tutorial Home)',
    releaseYear: '2026-2027 Long-Term Stable Edition',
    securityHash: 'BG-PORTAL-PROT-RAHUL-DUTTA-973397-2026'
  };

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const handleInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleTriggerAppInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsAppInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowAppInstallModal(true);
    }
  };

  // Student Registration Status Tracker State
  const [regSearchQuery, setRegSearchQuery] = useState('');
  const [hasSearchedReg, setHasSearchedReg] = useState(false);
  const [searchedRegResult, setSearchedRegResult] = useState(null);
  const [copiedIdNotice, setCopiedIdNotice] = useState(false);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('home');
  // Android & Mobile Browser Hardware Back Button Handler
  useEffect(() => {
    const handlePopState = () => {
      if (selectedMediaModal) {
        setSelectedMediaModal(null);
      } else if (selectedChapterModal) {
        setSelectedChapterModal(null);
      } else if (activeTab !== 'home') {
        setActiveTab('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedMediaModal, selectedChapterModal, activeTab]);
 
  // 'home', 'quiz', 'register', 'courses', 'admission', 'tribute', 'study', 'notices', 'payment', 'workspace'
  
  // Selected Class in Syllabus Guide
  const [selectedSyllabusClass, setSelectedSyllabusClass] = useState('Class 10');
  const DEFAULT_ROUTINE = [
    { id: 1, day: 'সোমবার', batch: 'Class 7 & 8', subject: 'গণিত ও সমন্বিত বিজ্ঞান', time: 'বিকাল ৪:০০ - ৫:৩০', location: 'টিউটোরিয়াল হোম, দক্ষিণ হাবড়া' },
    { id: 2, day: 'মঙ্গলবার', batch: 'Class 9 & 10', subject: 'মাধ্যমিক স্পেশাল গণিত ও বিজ্ঞান', time: 'সকাল ৮:০০ - ৯:৩০', location: 'টিউটোরিয়াল হোম, দক্ষিণ হাবড়া' },
    { id: 3, day: 'বুধবার', batch: 'Class 7 & 8', subject: 'গণিত ও সমন্বিত বিজ্ঞান', time: 'বিকাল ৪:০০ - ৫:৩০', location: 'টিউটোরিয়াল হোম, দক্ষিণ হাবড়া' },
    { id: 4, day: 'বৃহস্পতিবার', batch: 'Class 9 & 10', subject: 'মাধ্যমিক স্পেশাল গণিত ও বিজ্ঞান', time: 'সকাল ৮:০০ - ৯:৩০', location: 'টিউটোরিয়াল হোম, দক্ষিণ হাবড়া' },
    { id: 5, day: 'শুক্রবার', batch: 'Private Home Batch', subject: 'হোম টিউশন প্রাইভেট ভিজিট', time: 'বিকাল ৪:৩০ - ৬:৩০', location: 'বাণীপুর ও দক্ষিণ হাবড়া (হোম ভিজিট)' },
    { id: 6, day: 'শনিবার', batch: 'Class 11 & 12', subject: 'রাষ্ট্রবিজ্ঞান ও দর্শন (Sem 1-4)', time: 'সন্ধ্যা ৫:০০ - ৭:০০', location: 'টিউটোরিয়াল হোম, দক্ষিণ হাবড়া' },
    { id: 7, day: 'রবিবার', batch: 'All Batches Special', subject: 'সাপ্তাহিক মক টেস্ট ও ডাউট ক্লিয়ারিং', time: 'সকাল ৯:০০ - ১২:০০', location: 'টিউটোরিয়াল হোম, দক্ষিণ হাবড়া' }
  ];
  const [routine, setRoutine] = useState(() => {
    try {
      const saved = localStorage.getItem('bg_routine');
      if (saved !== null) {
        return JSON.parse(saved);
      }
      const local = JSON.parse(localStorage.getItem('bg_tutorial_portal_offline_db') || '{}');
      if (Array.isArray(local.routine)) {
        return local.routine;
      }
    } catch(e) {}
    return [];
  });


  // PhonePe & Payment State: Default EMPTY string as requested
  const [selectedFeeAmount, setSelectedFeeAmount] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Audio Voice Reader state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Wishes / Tributes State (Initialized empty; dummy data cleared)
  const [wishes, setWishes] = useState([]);
  const [newWish, setNewWish] = useState({ name: '', batch: '', message: '' });
  const [wishSuccess, setWishSuccess] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);

  // Online Student Registration Form State (Strictly for CURRENT/EXISTING students of Babun Sir)
  const [registerForm, setRegisterForm] = useState({
    studentName: '',
    grade: 'Class 10',
    schoolName: '',
    rollNo: '',
    targetYear: '2026',
    guardianName: '',
    guardianRelation: 'পিতা (Father)',
    phone: '', // Student WhatsApp
    guardianPhone: '', // Guardian Calling Phone
    tuitionType: 'টিউটোরিয়াল হোম ব্যাচ', // 'টিউটোরিয়াল হোম ব্যাচ' | 'হোম প্রাইভেট টিউশন'
    batchTimeline: '', // Student's own routine/timeline
    address: 'দক্ষিণ হাবড়া, উত্তর ২৪ পরগণা',
    landmark: '',
    mapLocation: '',
    notes: ''
  });
  const [regGpsLoading, setRegGpsLoading] = useState(false);
  const [registeredCard, setRegisteredCard] = useState(null);
  const [registerLoading, setRegisterLoading] = useState(false);

  // Admission Quick Inquiry Form State
  const [inquiryForm, setInquiryForm] = useState({
    studentName: '',
    guardianName: '',
    phone: '',
    guardianPhone: '',
    grade: 'Class 10',
    subjects: 'অঙ্ক ও বিজ্ঞান (Maths & Science)',
    area: 'দক্ষিণ হাবড়া (Dakshin Habra)',
    address: '',
    landmark: '',
    mapLocation: '',
    tuitionType: 'টিউটোরিয়াল হোম ব্যাচ',
    notes: ''
  });
  const [inquiryGpsLoading, setInquiryGpsLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);

  // GPS Auto-Detect for Student Registration
  const handleDetectRegGPS = () => {
    if (!navigator.geolocation) {
      alert('আপনার ডিভাইসে GPS লোকেশন সমর্থিত নয়। দয়া করে ঠিকানা বা ম্যাপ লিংক ম্যানুয়ালি লিখুন।');
      return;
    }
    setRegGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setRegGpsLoading(false);
        const mapUrl = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
        setRegisterForm(prev => ({ ...prev, mapLocation: mapUrl }));
        alert('📍 আপনার বাড়ির Google Maps লোকেশন সফলভাবে চিহ্নিত হয়েছে!');
      },
      (err) => {
        setRegGpsLoading(false);
        alert('GPS পারমিশন পাওয়া যায়নি। আপনি ঠিকানা বা গুগল ম্যাপস লিঙ্ক ম্যানুয়ালি পেস্ট করতে পারেন।');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // GPS Auto-Detect for Admission Inquiry
  const handleDetectInquiryGPS = () => {
    if (!navigator.geolocation) {
      alert('আপনার ডিভাইসে GPS ফিচার পাওয়া যায়নি।');
      return;
    }
    setInquiryGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setInquiryGpsLoading(false);
        const mapUrl = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
        setInquiryForm(prev => ({ ...prev, mapLocation: mapUrl }));
        alert('📍 আপনার বাড়ির Google Maps লোকেশন যুক্ত করা হয়েছে!');
      },
      (err) => {
        setInquiryGpsLoading(false);
        alert('GPS পারমিশন পাওয়া যায়নি।');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Student Self-Profile Update Handler (Saves changes made inside StudentPortal)
  const handleUpdateStudentProfile = (updatedStudent) => {
    setStudents(prev => {
      const idx = prev.findIndex(s => 
        (s.studentId && updatedStudent.studentId && s.studentId === updatedStudent.studentId) ||
        (s.id && String(s.id) === String(updatedStudent.id))
      );
      let next;
      if (idx >= 0) {
        next = [...prev];
        next[idx] = updatedStudent;
      } else {
        next = [...prev, updatedStudent];
      }
      saveToServer({ students: next });
      return next;
    });
  };

  // Text to Speech Helper
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (isSpeaking) {
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('আপনার ডিভাইসে স্পীচ সাপোর্ট নেই।');
    }
  };

  // Initial Fetch from Backend Server + LocalStorage Cache (100% PC-OFF Resilient)
  useEffect(() => {
    // 1. First restore all offline database items immediately
    try {
      const local = JSON.parse(localStorage.getItem('bg_tutorial_portal_offline_db') || '{}');
      if (local.profile && local.profile.teacherName) setCustomData(local.profile);
      if (Array.isArray(local.students) && local.students.length > 0) setStudents(local.students);
      if (Array.isArray(local.notices) && local.notices.length > 0) setNotices(local.notices);
      if (Array.isArray(local.feeRecords) && local.feeRecords.length > 0) setFeeRecords(local.feeRecords);
      if (Array.isArray(local.doubts) && local.doubts.length > 0) setDoubts(local.doubts);
      if (Array.isArray(local.homeworkList) && local.homeworkList.length > 0) setHomeworkList(local.homeworkList);
      if (Array.isArray(local.inquiries) && local.inquiries.length > 0) setInquiries(local.inquiries);
      if (Array.isArray(local.studyMaterials) && local.studyMaterials.length > 0) setStudyMaterials(local.studyMaterials);
      if (Array.isArray(local.wishes) && local.wishes.length > 0) setWishes(local.wishes);
      if (Array.isArray(local.registrations) && local.registrations.length > 0) setRegistrations(local.registrations);
      const savedRoutine = localStorage.getItem('bg_routine');
      if (savedRoutine !== null) {
        try {
          const parsed = JSON.parse(savedRoutine);
          if (Array.isArray(parsed)) setRoutine(parsed);
        } catch(e) {}
      } else if (Array.isArray(local.routine)) {
        setRoutine(local.routine);
      }
    } catch (e) {
      console.warn('Local cache hydrate note:', e);
    }

    // 2. Fetch live data if server is running
    fetch('/api/data')
      .then(res => res.json())
      .then(resData => {
        if (resData.success && resData.data) {
          const d = resData.data;
          if (d.profile && d.profile.teacherName) setCustomData(d.profile);
          if (Array.isArray(d.students)) setStudents(d.students);
          if (Array.isArray(d.notices)) setNotices(d.notices);
          if (Array.isArray(d.feeRecords)) setFeeRecords(d.feeRecords);
          if (Array.isArray(d.doubts)) setDoubts(d.doubts);
          if (Array.isArray(d.homeworkList)) setHomeworkList(d.homeworkList);
          if (Array.isArray(d.inquiries)) setInquiries(d.inquiries);
          if (Array.isArray(d.studyMaterials)) setStudyMaterials(d.studyMaterials);
          if (Array.isArray(d.wishes)) setWishes(d.wishes);
          if (Array.isArray(d.registrations)) setRegistrations(d.registrations);
          if (Array.isArray(d.routine)) setRoutine(d.routine);

          // Update cache
          try {
            localStorage.setItem('bg_tutorial_portal_offline_db', JSON.stringify(d));
          } catch(e) {}
        }
      })
      .catch(err => {
        console.log('Backend offline - Running smoothly in standalone mobile mode:', err);
      });
  }, []);

  // Auto-polling for pending student registration approval
  useEffect(() => {
    const isPending = (registeredCard && registeredCard.status !== 'approved') || 
                      (searchedRegResult && searchedRegResult.status !== 'approved' && searchedRegResult.status !== 'rejected');
    if (!isPending) return;

    const interval = setInterval(() => {
      fetch('/api/data')
        .then(res => res.json())
        .then(resData => {
          if (resData && resData.success && resData.data) {
            const d = resData.data;
            if (Array.isArray(d.registrations)) {
              setRegistrations(d.registrations);
              if (registeredCard) {
                const matched = d.registrations.find(r => r.id === registeredCard.id || r.regId === registeredCard.regId || (r.phone && r.phone === registeredCard.phone));
                if (matched && matched.status !== registeredCard.status) {
                  setRegisteredCard(matched);
                  setSearchedRegResult(matched);
                }
              } else if (searchedRegResult) {
                const matched = d.registrations.find(r => r.id === searchedRegResult.id || r.regId === searchedRegResult.regId || (r.phone && r.phone === searchedRegResult.phone));
                if (matched && matched.status !== searchedRegResult.status) {
                  setSearchedRegResult(matched);
                }
              }
            }
            if (Array.isArray(d.students)) setStudents(d.students);
          }
        })
        .catch(() => {});
    }, 3500);

    return () => clearInterval(interval);
  }, [registeredCard, searchedRegResult]);

  // Sync to Backend Server + Always Persist in LocalStorage (Works 100% when PC is OFF)
  const saveToServer = (delta) => {
    try {
      const stored = JSON.parse(localStorage.getItem('bg_tutorial_portal_offline_db') || '{}');
      const updated = { ...stored, ...delta };
      localStorage.setItem('bg_tutorial_portal_offline_db', JSON.stringify(updated));
    } catch(e) {
      console.warn('LocalStorage save note:', e);
    }

    fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(delta)
    }).catch(() => {
      // Backend offline, changes safely stored in browser localStorage
    });
  };

  // Add Wish Handler (Posts to live backend)
  const handleAddWish = async (e) => {
    e.preventDefault();
    if (!newWish.name || !newWish.message) return;
    setWishLoading(true);

    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWish)
      });
      const data = await res.json();
      if (data.success && data.wish) {
        setWishes(prev => [data.wish, ...prev]);
        setNewWish({ name: '', batch: '', message: '' });
        setWishSuccess(true);
        setTimeout(() => setWishSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to post wish:', err);
    } finally {
      setWishLoading(false);
    }
  };

  // Student Logout Handler
  const handleStudentLogout = () => {
    setLoggedInStudent(null);
    localStorage.removeItem('bg_current_student');
  };

  // Student Registration Status Search
  const handleCheckRegStatus = (e) => {
    if (e) e.preventDefault();
    setHasSearchedReg(true);
    const query = regSearchQuery.trim().toLowerCase();
    if (!query) {
      setSearchedRegResult(null);
      return;
    }
    const cleanDigits = query.replace(/\D/g, '');
    
    // Look up in registrations
    const foundInReg = (registrations || []).find(r => 
      (r.regId && r.regId.toLowerCase() === query) ||
      (cleanDigits.length >= 6 && r.phone && r.phone.replace(/\D/g, '').includes(cleanDigits)) ||
      (cleanDigits.length >= 6 && r.guardianPhone && r.guardianPhone.replace(/\D/g, '').includes(cleanDigits)) ||
      (r.studentName && r.studentName.toLowerCase().includes(query))
    );

    if (foundInReg) {
      const matchedStudent = (students || []).find(s => 
        (foundInReg.studentId && s.studentId === foundInReg.studentId) ||
        (cleanDigits.length >= 6 && s.phone && s.phone.replace(/\D/g, '').includes(cleanDigits))
      );
      if (matchedStudent) {
        setSearchedRegResult({ ...foundInReg, status: 'approved', studentId: matchedStudent.studentId || matchedStudent.roll });
      } else {
        setSearchedRegResult(foundInReg);
      }
      return;
    }

    // Look up in verified students list directly
    const foundInStudents = (students || []).find(s =>
      (s.studentId && s.studentId.toLowerCase() === query) ||
      (cleanDigits.length >= 6 && s.phone && s.phone.replace(/\D/g, '').includes(cleanDigits)) ||
      (s.name && s.name.toLowerCase().includes(query))
    );

    if (foundInStudents) {
      setSearchedRegResult({
        regId: foundInStudents.studentId || 'BG-VERIFIED',
        studentName: foundInStudents.name,
        grade: foundInStudents.batch,
        rollNo: foundInStudents.roll,
        status: 'approved',
        studentId: foundInStudents.studentId || foundInStudents.roll,
        schoolName: foundInStudents.school || foundInStudents.schoolName,
        phone: foundInStudents.phone
      });
      return;
    }

    setSearchedRegResult(null);
  };

  // Student Online Registration Handler (Offline & Server Capable)
  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    if (!registerForm.studentName || !registerForm.phone) return;
    setRegisterLoading(true);

    try {
      const res = await fetch('/api/register-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });
      const data = await res.json();
      if (data && data.success && data.registration) {
        setRegisteredCard(data.registration);
        setSearchedRegResult(data.registration);
        setHasSearchedReg(true);
        setRegSearchQuery(data.registration.phone || data.registration.regId);
        const updated = [data.registration, ...(registrations || [])];
        setRegistrations(updated);
        saveToServer({ registrations: updated });
        return;
      }
    } catch (err) {
      console.warn('Network offline, creating standalone registration:', err);
    }

    // Standalone fallback: Create valid registration locally
    const newRegId = 'BG-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const localReg = {
      id: Date.now(),
      regId: newRegId,
      ...registerForm,
      status: 'pending',
      date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
    };
    setRegisteredCard(localReg);
    setSearchedRegResult(localReg);
    setHasSearchedReg(true);
    setRegSearchQuery(localReg.phone || localReg.regId);
    const updated = [localReg, ...(registrations || [])];
    setRegistrations(updated);
    saveToServer({ registrations: updated });
    setRegisterLoading(false);
  };

  // Submit Admission Quick Inquiry
  const handleAdmissionSubmit = async (e) => {
    e.preventDefault();
    if (!inquiryForm.studentName || !inquiryForm.phone) return;
    setInquiryLoading(true);

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryForm)
      });
      const data = await res.json();
      if (data.success && data.inquiry) {
        setInquiries(prev => [data.inquiry, ...prev]);
        setInquirySuccess(true);
        setInquiryForm({
          studentName: '',
          guardianName: '',
          phone: '',
          grade: 'Class 10',
          subjects: 'অঙ্ক ও বিজ্ঞান (Maths & Science)',
          area: 'দক্ষিণ হাবড়া (Dakshin Habra)',
          tuitionType: 'টিউটোরিয়াল হোম ব্যাচ',
          notes: ''
        });
        setTimeout(() => setInquirySuccess(false), 5000);
      }
    } catch (err) {
      console.error('Inquiry error:', err);
    } finally {
      setInquiryLoading(false);
    }
  };

  // PhonePe UPI generation (If amount is empty, do NOT append &am=)
  const cleanPhone = (customData.phone || '9733974425').replace(/[^0-9]/g, '');
  const upiHandle = customData.upiVpa || `${cleanPhone}@ybl`;
  const amountParam = selectedFeeAmount && !isNaN(selectedFeeAmount) && Number(selectedFeeAmount) > 0 ? `&am=${selectedFeeAmount}` : '';
  const upiPayLink = `upi://pay?pa=${upiHandle}&pn=${encodeURIComponent('Babun Ghosh')}${amountParam}&cu=INR&tn=${encodeURIComponent('BG Tutorial Home Tuition Fees')}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Official Syllabus Bank Data for Class 7-12
  const SYLLABUS_ROADMAP = {
    'Class 7': [
      {
        unit: '১ম পর্যায়ক্রমিক মূল্যায়ন (1st Unit Test)',
        math: 'পূর্বপাঠের পুনরাবৃত্তি, অনুপাত, ভগ্নাংশের বর্গমূল, ত্রিভুজ অঙ্কন ও জ্যামিতিক ধারণা।',
        science: 'তাপ ও উষ্ণতা, আলোর প্রতিফলন ও আলোকের প্রাথমিক সূত্র, পরমাণু, অণু ও রাসায়নিক চিহ্ন।'
      },
      {
        unit: '২য় পর্যায়ক্রমিক মূল্যায়ন (2nd Unit Test)',
        math: 'সময় ও দূরত্ব, দ্বি-স্তম্ভ লেখচিত্র, বীজগাণিতিক সূত্রাবলি ও উৎপাদকে বিশ্লেষণ।',
        science: 'পদার্থের ভৌত ও রাসায়নিক পরিবর্তন, অম্ল, ক্ষারক ও লবণ, সময় ও গতি, মানুষের পুষ্টি ও খাদ্য উপাদান।'
      },
      {
        unit: '৩য় পর্যায়ক্রমিক মূল্যায়ন / বাৎসরিক (Final Unit Test)',
        math: 'ত্রিভুজের ধর্মাবলি, সরল সমীকরণ গঠন ও সমাধান, সর্বসমতা, বৃত্তের ক্ষেত্রফল ও পাই চিত্র।',
        science: 'পরিবেশের সজীব উপাদানের গঠন, উদ্ভিদের বিভিন্ন অংশের কাজ, মানবদেহ ও পরিবেশগত সংকট।'
      }
    ],
    'Class 8': [
      {
        unit: '১ম পর্যায়ক্রমিক মূল্যায়ন (1st Unit Test)',
        math: 'পূর্বপাঠের পুনরাবৃত্তি, মূলদ সংখ্যার ধারণা, বহুভুজ ও কোণ সংক্রান্ত উপপাদ্য, পাই চিত্র।',
        science: 'বল ও চাপ (ঘর্ষণ, তরল ও বায়ুর চাপ), স্পর্শহীন বল, পদার্থের প্রকৃতি ও পদার্থের গঠন।'
      },
      {
        unit: '২য় পর্যায়ক্রমিক মূল্যায়ন (2nd Unit Test)',
        math: 'বীজগাণিতিক সংখ্যামালার গুণ ও ভাগ, বীজগাণিতিক সংখ্যামালার ল.সা.গু ও গ.সা.গু, শতকরা, মিশ্রণ।',
        science: 'রাসায়নিক বিক্রিয়া ও সমতাবিধান, তড়িতের প্রকৃতি ও তড়িৎ প্রবাহ, কার্বন ও কার্বনঘটিত যৌগ।'
      },
      {
        unit: '৩য় পর্যায়ক্রমিক মূল্যায়ন / বাৎসরিক (Final Unit Test)',
        math: 'ত্রিভুজের কোণ ও বাহুর সম্পর্ক, সময় ও কার্য (ঐকিক নিয়ম), লেখচিত্র, সমীকরণ গঠন ও সমাধান।',
        science: 'অন্তঃক্ষরা গ্রন্থি ও বয়ঃসন্ধি, খাদ্য উৎপাদন ও কৃষি ব্যবস্থাপনা, চারপাশের পরিবেশের সংকট ও সংরক্ষণ।'
      }
    ],
    'Class 9': [
      {
        unit: '১ম পর্যায়ক্রমিক মূল্যায়ন (1st Unit Test)',
        math: 'বাস্তব সংখ্যা, সূচকের নিয়মাবলি, স্থানাঙ্ক জ্যামিতি (দূরত্ব সূত্র), রৈখিক সহসমীকরণ (দুই চলবিশিষ্ট)।',
        physicalScience: 'পরিমাপ ও একক পদ্ধতি, বল ও গতি (নিউটনের গতিসূত্র), পরমাণুর গঠন ও তেজস্ক্রিয়তা।',
        lifeScience: 'জীবন ও তার বৈচিত্র্য (ট্যাক্সোনমি ও পঞ্চরাজ্য শ্রেণীবিন্যাস), কোষের গঠন, অঙ্গাণু ও তাদের কাজ।'
      },
      {
        unit: '২য় পর্যায়ক্রমিক মূল্যায়ন (2nd Unit Test)',
        math: 'বহুপদী সংখ্যামালা, উৎপাদকে বিশ্লেষণ, লাভ ও ক্ষতি, ভেদ ও সামান্তরিক সংক্রান্ত উপপাদ্য।',
        physicalScience: 'পদার্থের ভৌত ও রাসায়নিক ধর্ম (পৃষ্ঠটান, সান্দ্রতা, প্লবতা ও আর্কিমিডিসের নীতি), দ্রবণ, অ্যাসিড-ক্ষার-লবণ।',
        lifeScience: 'উদ্ভিদ ও প্রাণীকলা তন্ত্র, মানবদেহের প্রধান অঙ্গ ও শারীরবৃত্তীয় প্রক্রিয়া, জৈব অণু।'
      },
      {
        unit: '৩য় পর্যায়ক্রমিক মূল্যায়ন / বাৎসরিক (Final Unit Test)',
        math: 'ক্ষেত্রফল সংক্রান্ত উপপাদ্য, বৃত্তের পরিধি ও বৃত্তের ক্ষেত্রফল, রাশিসংজ্ঞান বিভাজন ও পরিসংখ্যা বহুভুজ।',
        physicalScience: 'কার্য, ক্ষমতা ও শক্তি, শব্দ ও তরঙ্গ, রাসায়নিক গণনা ও মোলের ধারণা।',
        lifeScience: 'সালোকসংশ্লেষ, শ্বসন ও ক্রেবস চক্র, মানব সংবহনতন্ত্র ও রেচন ক্রিয়া।'
      }
    ],
    'Class 10': [
      {
        unit: '১ম পর্যায়ক্রমিক মূল্যায়ন (1st Unit Test)',
        math: 'একচলবিশিষ্ট দ্বিঘাত সমীকরণ, সরল সুদকষা, বৃত্ত সম্পর্কিত উপপাদ্য, আয়তঘন।',
        physicalScience: 'পরিবেশের জন্য ভাবনা, গ্যাসের আচরণ (চার্লস ও বয়েলের সূত্র), আলো (গলীয় দর্পণ ও প্রতিসরণ)।',
        lifeScience: 'জীবজগতে নিয়ন্ত্রণ ও সমন্বয় (উদ্ভিদ ও প্রাণীর হরমোন, মানব মস্তিষ্ক, প্রতিবর্ত ক্রিয়া, চক্ষুর গঠন)।'
      },
      {
        unit: '২য় পর্যায়ক্রমিক মূল্যায়ন (2nd Unit Test)',
        math: 'অনুপাত ও সমানুপাত, বৃত্তের স্পর্শক সংক্রান্ত উপপাদ্য, লম্ব বৃত্তাকার চোঙ ও গোলক, ভেদ।',
        physicalScience: 'আলোর লেন্স ও বিচ্ছুরণ, চলতড়িৎ (ওহমের সূত্র ও বর্তনী), পর্যায় সারণি, রাসায়নিক বন্ধন (আয়নীয় ও সমযোজী)।',
        lifeScience: 'জীবনের ধারাবাহিকতা (কোষ বিভাজন, মাইটোসিস ও মিয়োসিস, সপুষ্পক উদ্ভিদের জনন ও নিষেকের পর্যায়)।'
      },
      {
        unit: 'মাধ্যমিক টেস্ট ও ফাইনাল বোর্ড স্পেশাল (Full Madhyamik Pattern)',
        math: 'ত্রিকোণমিতিক অনুপাত ও অভেদাবলি, উচ্চতা ও দূরত্ব (Height & Distance), লম্ব বৃত্তাকার শঙ্কু, মিশ্র ঘনবস্তু, রাশিসংজ্ঞান (গড়, মধ্যমা ও ওজাইভ)।',
        physicalScience: 'তড়িৎপ্রবাহ ও রাসায়নিক বিক্রিয়া, ধাতুবিদ্যা (লোহা, তামা, অ্যালুমিনিয়াম), অজৈব ও জৈব রসায়ন (হাইড্রোকার্বন, ইথেন, অ্যাসিটিলিন)।',
        lifeScience: 'বংশগতি ও সাধারণ জিনগত রোগ (থ্যালাসেমিয়া ও বর্ণান্ধতা), অভিব্যক্তি ও অভিযোজন, পরিবেশ ও তার সম্পদ সংরক্ষণ।'
      }
    ],
    'Class 11': [
      {
        unit: 'সেমিস্টার ১ (নতুন WBCHSE MCQ স্পেশাল)',
        math: 'রাষ্ট্রবিজ্ঞান: রাষ্ট্রের সংজ্ঞা, উৎপত্তি তত্ত্বসমূহ (ঐশ্বরিক, বলপ্রয়োগ, ঐতিহাসিক), সার্বভৌমত্ব (একত্ববাদ ও বহুত্ববাদ), ভারতীয় সংবিধানের প্রস্তাবনা ও মৌলিক অধিকার।\nদর্শন: ভারতীয় দর্শন সম্প্রদায় (আস্তিক ও নাস্তিক), চার্বাক দর্শন (প্রত্যক্ষ প্রমাণ, জড়বাদ, দেহাত্মবাদ ও সুখবাদ), বৌদ্ধ দর্শন (চতুরার্য সত্য, ক্ষণিকবাদ, অনাত্মবাদ)।',
        science: 'উচ্চমাধ্যমিক নতুন সিলেবাসের ১০০% MCQ ও অবজেক্টিভ মডেল'
      },
      {
        unit: 'সেমিস্টার ২ (SAQ ও বর্ণনামূলক পরীক্ষা)',
        math: 'রাষ্ট্রবিজ্ঞান: আইন, স্বাধীনতা, সাম্য ও ন্যায়ের পারস্পরিক সম্পর্ক, গণতন্ত্র ও একনায়কতন্ত্র, ভারতীয় সংবিধানের মূল কাঠামো ও মৌলিক কর্তব্য।\nদর্শন: ন্যায় দর্শন (প্রমা ও প্রমাণ, চার প্রকার প্রমাণ, লৌকিক সন্নিকর্ষ), অদ্বৈত বেদান্ত (ব্রহ্ম, ঈশ্বর, মায়া ও মোক্ষ)।',
        science: 'SAQ ও সংক্ষিপ্ত ব্যাখ্যামূলক প্রশ্নোত্তরের পূর্ণ প্রস্তুতি'
      }
    ],
    'Class 12': [
      {
        unit: 'সেমিস্টার ৩ (নতুন WBCHSE দ্বাদশ MCQ স্পেশাল)',
        math: 'রাষ্ট্রবিজ্ঞান: আন্তর্জাতিক সম্পর্ক (উন্নয়ন ও মূল উপাদান), ঠান্ডা লড়াই পরবর্তী বিশ্ব ও দ্বিমেরুকরণ, সার্ক (SAARC), সম্মিলিত জাতিপুঞ্জ (নিরাপত্তা পরিষদ ও সাধারণ সভা)।\nদর্শন: যুক্তির স্বরূপ ও শ্রেণিবিভাগ, নিরপেক্ষ বচন ও চতুর্বর্গ পরিকল্পনা (A, E, I, O), বচনের বিরোধিতা ও অমাধ্যম অনুমান (আবর্তন ও বিবর্তন)।',
        science: 'দ্বাদশ শ্রেণীর সেমিস্টার ৩ এর জন্য স্পেশাল টেস্ট ও মক সেট'
      },
      {
        unit: 'সেমিস্টার ৪ (উচ্চমাধ্যমিক ফাইনাল বোর্ড পরীক্ষা)',
        math: 'রাষ্ট্রবিজ্ঞান: ভারতের কেন্দ্রীয় শাসন বিভাগ (রাষ্ট্রপতি ও প্রধানমন্ত্রী), আইন বিভাগ (সংসদ ও স্পিকার), বিচার বিভাগ (সুপ্রিম কোর্ট ও হাইকোর্ট), স্থানীয় স্বায়ত্তশাসন।\nদর্শন: নিরপেক্ষ ন্যায়ের সংস্থান ও মূর্তি বিচার, মিলের পরীক্ষামূলক পদ্ধতি (অন্বয়ী ও ব্যতিরেকী), আরোহমূলক দোষ বিচার।',
        science: 'উচ্চমাধ্যমিক ফাইনাল পরীক্ষার পূর্ণাঙ্গ মডেল টেস্ট'
      }
    ]
  };

  return (
    <ErrorBoundary>
    <div 
      className="w-full max-w-full overflow-x-clip min-h-screen font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white pb-16 lg:pb-0 relative transition-all duration-1000 ease-in-out"
      style={{ background: currentShader.gradient }}
    >
      {/* Dynamic 28-Palette Ambient Background Shaders (Noticeable 30% Deep Colors, Cycles every 4s) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-all duration-1000 ease-in-out">
        <div 
          className="absolute -top-40 -left-40 w-[45rem] sm:w-[60rem] h-[45rem] sm:h-[60rem] rounded-full blur-3xl transition-all duration-1000 ease-in-out opacity-50"
          style={{ backgroundColor: currentShader.orb1 }}
        />
        <div 
          className="absolute top-1/4 -right-40 w-[40rem] sm:w-[55rem] h-[40rem] sm:h-[55rem] rounded-full blur-3xl transition-all duration-1000 ease-in-out opacity-45"
          style={{ backgroundColor: currentShader.orb2 }}
        />
        <div 
          className="absolute -bottom-40 left-1/4 w-[45rem] sm:w-[60rem] h-[45rem] sm:h-[60rem] rounded-full blur-3xl transition-all duration-1000 ease-in-out opacity-50"
          style={{ backgroundColor: currentShader.orb3 }}
        />
      </div>
      
      {/* ================= STICKY MASTER NAVIGATION CONTAINER (FIXES LOGO CLIPPING / BLEED) ================= */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200">
        
        {/* Top Notification Bar for Habra Students */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-950 to-indigo-950 text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-6 border-b border-emerald-900/60">
          <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
            <div className="flex items-center space-x-2 truncate">
              <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider shrink-0 shadow-sm">
                {lang === 'bn' ? 'বিজ্ঞপ্তি' : 'Notice'}
              </span>
              <span className="truncate text-slate-200">
                {lang === 'bn' 
                  ? 'সপ্তম থেকে দ্বাদশ শ্রেণীর নতুন ব্যাচে ও হোম টিউশনে ভর্তি চলছে • দক্ষিণ হাবড়া ও পার্শ্ববর্তী এলাকা' 
                  : 'New Batches & Home Tuition open for Classes 7-12 in Dakshin Habra area.'}
              </span>
            </div>

            <div className="flex items-center space-x-2.5 shrink-0">
              

              {/* Website QR Code Trigger */}
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="flex items-center space-x-1 font-bold text-emerald-300 hover:text-white transition text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/50 shadow-sm hover:scale-105 active:scale-95"
                title="Website QR Code"
              >
                <QrCode className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
                <span>{lang === 'bn' ? 'QR কোড' : 'Website QR'}</span>
              </button>

              {/* Language Switcher */}
              <button
                type="button"
                onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
                className="flex items-center space-x-1 font-bold text-amber-300 hover:text-amber-200 transition text-[11px] px-1.5 py-0.5 rounded border border-amber-400/30"
              >
                <Globe className="w-3 h-3" />
                <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Navbar - Robust against logo vertical crushing & clipping */}
        <header className="py-2 sm:py-2.5">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full flex justify-between items-center gap-2">
            
            {/* Logo & Institute Name - Unshrinkable with nowrap text */}
            <div 
              onClick={() => setActiveTab('home')}
              className="shrink-0 flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group select-none py-1"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 group-hover:scale-105 transition shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="shrink-0 flex flex-col justify-center">
                <span className="font-black text-slate-900 text-sm sm:text-base lg:text-lg tracking-tight block whitespace-nowrap leading-snug">
                  {t.instituteName}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-semibold block whitespace-nowrap leading-tight mt-0.5">
                  {t.instituteTagline}
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 overflow-x-auto overscroll-x-contain scrollbar-none py-1">
              {[
                { id: 'home', label: t.navHome, icon: Home },
                { id: 'quiz', label: '🏆 AI মক টেস্ট', icon: Trophy, highlight: true },
                { id: 'student_portal', label: '🎓 স্টুডেন্ট পোর্টাল', icon: UserCheck, highlight: true },
                { id: 'register', label: '📝 শিক্ষার্থী রেজিস্ট্রেশন', icon: Award },
                { id: 'courses', label: t.navCourses, icon: BookOpen },
                { id: 'admission', label: t.navAdmission, icon: Inbox },
                { id: 'tribute', label: t.navTribute, icon: Heart, locked: !loggedInStudent },
                { id: 'study', label: t.navStudy, icon: FileText, locked: !loggedInStudent },
                { id: 'notices', label: t.navNotices, icon: Bell, locked: !loggedInStudent },
                { id: 'payment', label: t.navPayment, icon: QrCode, locked: !loggedInStudent }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' 
                        : tab.highlight 
                          ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap">{tab.label}</span>
                    {tab.locked && (
                      <span className="px-1 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300 ml-1 flex items-center space-x-0.5 shrink-0">
                        <Lock className="w-2.5 h-2.5 text-amber-700" />
                        <span>লক</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Action buttons */}
            <div className="flex items-center space-x-2 shrink-0">
              

              

              {/* Logged-in student indicator chip */}
              {loggedInStudent && (
                <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-extrabold text-emerald-900 truncate max-w-[100px]">{loggedInStudent.name}</span>
                  <button
                    type="button"
                    onClick={handleStudentLogout}
                    className="text-rose-600 hover:text-rose-700 font-bold ml-1 text-[11px] underline"
                    title="লগআউট"
                  >
                    লগআউট
                  </button>
                </div>
              )}

              <a 
                href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(lang === 'bn' ? 'নমস্কার স্যার, আমি বি.জি. টিউটোরিয়াল হোমে ভর্তির ব্যাপারে জানতে চাই।' : 'Hello Sir, I want to inquire about admission at B.G. Tutorial Home.')}`}
                target="_blank" 
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition active:scale-95 shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}</span>
              </a>

              {/* Discreet control button for Sir (Teacher Security Control Panel) */}
              <button
                type="button"
                onClick={() => setActiveTab('workspace')}
                className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200 transition active:scale-95 shrink-0"
                title="কন্ট্রোল প্যানেল"
              >
                <Lock className="w-4 h-4 text-slate-500" />
              </button>
            </div>

          </div>

          {/* Mobile Horizontal Category Bar */}
          <div className="flex lg:hidden overflow-x-auto overscroll-x-contain px-3 py-2 border-t border-slate-100 space-x-2 bg-slate-50/90 scrollbar-none w-full max-w-full items-center">
            {/* Mobile Glowing Creator Pill */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-500 rounded-full blur-[2px] opacity-75 animate-pulse"></div>
              <div className="relative px-2.5 py-1 bg-slate-950 rounded-full flex items-center space-x-1 border border-amber-400/40 select-none">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300 whitespace-nowrap">
                  B.G. Tutorial Home 🎓
                </span>
              </div>
            </div>

            
            {[
              { id: 'home', label: t.navHome },
              { id: 'workspace', label: '👨‍🏫 শিক্ষক প্যানেল', isSpecial: true },
              { id: 'quiz', label: '🏆 AI মক টেস্ট' },
              { id: 'student_portal', label: '🎓 স্টুডেন্ট পোর্টাল' },
              { id: 'register', label: '📝 রেজিস্ট্রেশন' },
              { id: 'courses', label: t.navCourses },
              { id: 'admission', label: 'নতুন ভর্তি' },
              { id: 'payment', label: 'PhonePe ফি 🔒' },
              { id: 'tribute', label: 'ট্রিবিউট 🔒' },
              { id: 'study', label: 'নোটস 🔒' },
              { id: 'notices', label: 'নোটিস 🔒' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold shrink-0 active:scale-95 transition ${
                  activeTab === tab.id ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        
        {/* ================= VIEW: QUIZ ARENA ================= */}
        {activeTab === 'quiz' && (
          <QuizArena lang={lang} />
        )}

        {/* ================= VIEW: STUDENT REGISTRATION & VERIFICATION PORTAL ================= */}
        {activeTab === 'register' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>বর্তমান শিক্ষার্থী ভেরিফিকেশন ও সেন্ট্রাল আইডি অনুমোদন পোর্টাল</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                🎓 শিক্ষার্থী অফিসিয়াল রেজিস্ট্রেশন (Student Registration)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
                এই রেজিস্ট্রেশনটি শুধুমাত্র <strong>বাবুন ঘোষ স্যারের কাছে পাঠরত বর্তমান শিক্ষার্থীদের</strong> জন্য। আপনার প্রাতিষ্ঠানিক তথ্য, অভিভাবকের নম্বর এবং বাসস্থান নির্ভুলভাবে লিখুন যাতে আপনার সেন্ট্রাল <strong>ইউনিক স্টুডেন্ট আইডি (Unique Student ID)</strong> তৈরি হয় এবং হোম টিউশনের ক্ষেত্রে স্যার সহজে আপনার বাড়িতে পৌঁছাতে পারেন।
              </p>
            </div>

            {/* REAL-TIME REGISTRATION & UNIQUE STUDENT ID STATUS SEARCH TRACKER */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 rounded-3xl border border-indigo-900/60 shadow-xl text-white space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-indigo-800/40 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      🔍 রেজিস্ট্রেশন ও ইউনিক স্টুডেন্ট আইডি স্ট্যাটাস অনুসন্ধান
                    </h3>
                    <p className="text-[11px] text-indigo-200">
                      আপনার নিবন্ধিত WhatsApp নম্বর বা ট্র্যাকিং আইডি দিয়ে অনুমোদনের স্ট্যাটাস যাচাই করুন
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-indigo-900/80 text-indigo-300 border border-indigo-700/50">
                  লাইভ ভেরিফিকেশন ইঞ্জিন
                </span>
              </div>

              <form onSubmit={handleCheckRegStatus} className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    placeholder="আপনার WhatsApp নম্বর (যেমন: 9832145678) বা ট্র্যাকিং আইডি..."
                    value={regSearchQuery}
                    onChange={(e) => setRegSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {regSearchQuery && (
                    <button
                      type="button"
                      onClick={() => { setRegSearchQuery(''); setHasSearchedReg(false); setSearchedRegResult(null); }}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-md active:scale-95 transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>স্ট্যাটাস চেক করুন</span>
                </button>
              </form>

              {/* SEARCH RESULTS FEEDBACK */}
              {hasSearchedReg && (
                <div className="pt-2 animate-fadeIn">
                  {searchedRegResult ? (
                    searchedRegResult.status === 'approved' ? (
                      /* APPROVED RESULT */
                      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="font-black text-emerald-300 text-sm">
                              🎉 অভিনন্দন! আপনার রেজিস্ট্রেশন শিক্ষক বাবুন স্যার কর্তৃক অনুমোদিত হয়েছে (Approved)
                            </span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
                            ACTIVE VERIFIED
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-emerald-900/40">
                          <div>
                            <span className="text-slate-400 text-[10px] block">শিক্ষার্থীর নাম</span>
                            <span className="font-extrabold text-white text-sm">{searchedRegResult.studentName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">শ্রেণী ও রোল</span>
                            <span className="font-bold text-emerald-300">{searchedRegResult.grade} (রোল: {searchedRegResult.rollNo || 'N/A'})</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">ইউনিক স্টুডেন্ট আইডি (Student Portal ID)</span>
                            <span className="font-mono font-black text-sm text-amber-400">{searchedRegResult.studentId}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(searchedRegResult.studentId);
                              setCopiedIdNotice(true);
                              setTimeout(() => setCopiedIdNotice(false), 2500);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1.5 border border-slate-700 transition"
                          >
                            <Copy className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{copiedIdNotice ? '✅ কপি করা হয়েছে!' : '📋 আইডি কপি করুন'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setInitialStudentPortalId(searchedRegResult.studentId);
                              setActiveTab('student_portal');
                            }}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center space-x-1.5 shadow-md active:scale-95 transition"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>🚀 সরাসরি স্টুডেন্ট পোর্টালে লগইন করুন</span>
                          </button>
                        </div>
                      </div>
                    ) : searchedRegResult.status === 'rejected' ? (
                      /* REJECTED RESULT */
                      <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/80 border border-rose-500/50 space-y-3">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                          <span className="font-black text-rose-300 text-sm">
                            ❌ দুঃখিত! আপনার আবেদনটি শিক্ষক বাবুন স্যার কর্তৃক বাতিল করা হয়েছে (Cancelled by Tutor)
                          </span>
                        </div>
                        <p className="text-xs text-rose-200/90 leading-relaxed">
                          বিদ্যালয়ের তথ্যে অমিল বা রোল নম্বর সংক্রান্ত জটিলতার কারণে এই আবেদনটি অনুমোদিত হয়নি। আপনি স্টুডেন্ট পোর্টালে লগইন করতে পারবেন না। বিস্তারিত জানতে বা সরাসরি যাচাইয়ের জন্য নিচে বাবুন স্যারের সাথে কথা বলুন।
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <a
                            href={`tel:${customData.phone || '9733974425'}`}
                            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow transition"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>📞 বাবুন স্যারকে কল করুন ({customData.phone || '9733974425'})</span>
                          </a>
                          <a
                            href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`নমস্কার বাবুন স্যার, আমার রেজিস্ট্রেশন আবেদন (${searchedRegResult.regId || searchedRegResult.studentName}) বাতিল দেখানো হচ্ছে। এই বিষয়ে কথা বলতে চাই।`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>💬 WhatsApp-এ স্যারের সাথে কথা বলুন</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      /* PENDING RESULT */
                      <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/80 border border-amber-500/50 space-y-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
                          <span className="font-black text-amber-300 text-sm">
                            ⏳ ভেরিফিকেশন অপেক্ষমান (Under Tutor Verification)
                          </span>
                        </div>
                        <p className="text-xs text-amber-200/90 leading-relaxed">
                          নমস্কার <strong>{searchedRegResult.studentName}</strong>! আপনার রেজিস্ট্রেশন আবেদনটি সফলভাবে গৃহীত হয়েছে। শিক্ষক বাবুন ঘোষ স্যার আপনার স্কুলের রোল নম্বর ও ব্যাচের তথ্য যাচাই করছেন। অনুমোদন (Approve) সম্পন্ন হওয়া মাত্রই এখানে আপনার ইউনিক স্টুডেন্ট আইডি দেখা যাবে।
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              fetch('/api/db')
                                .then(r => r.json())
                                .then(d => {
                                  if (d && d.registrations) setRegistrations(d.registrations);
                                  if (d && d.students) setStudents(d.students);
                                  handleCheckRegStatus();
                                });
                            }}
                            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition active:scale-95"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>🔄 স্ট্যাটাস রিফ্রেশ করুন</span>
                          </button>

                          <a
                            href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`নমস্কার বাবুন স্যার, আমি ${searchedRegResult.studentName}, শ্রেণী: ${searchedRegResult.grade}। বি.জি. টিউটোরিয়াল হোমে রেজিস্ট্রেশন করেছি (ট্র্যাকিং আইডি: ${searchedRegResult.regId})। অনুগ্রহ করে ভেরিফাই করে দিন।`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-bold text-xs flex items-center space-x-1.5 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>স্যারের সাথে WhatsApp-এ যোগাযোগ</span>
                          </a>
                        </div>
                      </div>
                    )
                  ) : (
                    /* NOT FOUND RESULT */
                    <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs text-slate-300 space-y-1">
                      <span className="font-extrabold text-amber-400 block">
                        🔍 কোনো তথ্য পাওয়া যায়নি
                      </span>
                      <p>
                        প্রদত্ত মোবাইল নম্বর বা ট্র্যাকিং আইডির কোনো পূর্ব-আবেদন খুঁজে পাওয়া যায়নি। আপনি কি ইতিমধ্যে ফর্ম ফিলাপ করেছেন? যদি না করে থাকেন, তবে নিচের ফর্মটি পূরণ করুন।
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* If registered successfully: Show Digital ID Card / Slip */}
            {registeredCard ? (
              <div className="glass-card glow-ring-emerald p-6 sm:p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-md">
                  অনলাইন আবেদন সম্পন্ন • ভেরিফিকেশন পেন্ডিং
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/70 pb-5">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg sm:text-xl">
                        {customData.instituteName}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium">
                        প্রতিষ্ঠাতা ও শিক্ষক: বাবুন ঘোষ • দক্ষিণ হাবড়া, এস. এন দে রোড
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-500 block font-bold">রেজিস্ট্রেশন ট্র্যাকিং নম্বর</span>
                    <span className="text-base sm:text-lg font-mono font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200 inline-block mt-0.5 shadow-sm">
                      {registeredCard.regId}
                    </span>
                  </div>
                </div>

                {/* Card Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm">
                    <span className="text-slate-400 block text-[11px] font-bold">শিক্ষার্থীর পুরো নাম</span>
                    <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{registeredCard.studentName}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm">
                    <span className="text-slate-400 block text-[11px] font-bold">শ্রেণী ও বিদ্যালয়ের রোল</span>
                    <span className="text-sm font-extrabold text-indigo-700 mt-0.5 block">{registeredCard.grade} (রোল: {registeredCard.rollNo || 'N/A'})</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm">
                    <span className="text-slate-400 block text-[11px] font-bold">বিদ্যালয়ের নাম</span>
                    <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{registeredCard.schoolName || 'হাবড়া হাই স্কুল'}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm">
                    <span className="text-slate-400 block text-[11px] font-bold">অভিভাবকের নাম</span>
                    <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{registeredCard.guardianName} ({registeredCard.guardianRelation || 'অভিভাবক'})</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm">
                    <span className="text-slate-400 block text-[11px] font-bold">শিক্ষার্থীর নিজস্ব WhatsApp</span>
                    <span className="text-sm font-mono font-extrabold text-emerald-700 mt-0.5 block">{registeredCard.phone}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm">
                    <span className="text-slate-400 block text-[11px] font-bold">অভিভাবকের কলিং নম্বর</span>
                    <span className="text-sm font-mono font-extrabold text-slate-900 mt-0.5 block">{registeredCard.guardianPhone || 'N/A'}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm">
                    <span className="text-slate-400 block text-[11px] font-bold">টিউশনের ধরন</span>
                    <span className="text-xs font-extrabold text-emerald-800 mt-0.5 block">{registeredCard.tuitionType || registeredCard.mode}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm sm:col-span-2">
                    <span className="text-slate-400 block text-[11px] font-bold">আপনার ব্যাচ শিডিউল / সময়সূচী</span>
                    <span className="text-xs font-extrabold text-indigo-800 mt-0.5 block">{registeredCard.batchTimeline || 'নিয়মিত ব্যাচ টাইমলাইন'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="font-extrabold text-emerald-950 block">📍 বাসস্থান: {registeredCard.address} {registeredCard.landmark ? `(ল্যান্ডমার্ক: ${registeredCard.landmark})` : ''}</span>
                    {registeredCard.mapLocation && (
                      <a
                        href={registeredCard.mapLocation}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-300 shadow-sm"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>🗺️ Google Maps-এ আপনার বাড়ির লোকেশন দেখুন</span>
                      </a>
                    )}
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-white border border-emerald-200 font-mono text-emerald-800 font-bold shrink-0">
                    আবেদনের তারিখ: {registeredCard.date}
                  </span>
                </div>

                {/* Slip Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button
                      onClick={() => window.print()}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow"
                    >
                      <Printer className="w-4 h-4" />
                      <span>রশিদ প্রিন্ট / PDF সংরক্ষণ</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('student_portal')}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center space-x-2 transition shadow active:scale-95"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>🎓 স্টুডেন্ট পোর্টালে যান</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <a
                      href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`নমস্কার বাবুন স্যার,\nআমি বি.জি. টিউটোরিয়াল হোমে রেজিস্ট্রেশন সম্পন্ন করেছি।\n\nআমার রেজিস্ট্রেশন ট্র্যাকিং নম্বর: ${registeredCard.regId}\nনাম: ${registeredCard.studentName}\nশ্রেণী: ${registeredCard.grade}\nরোল: ${registeredCard.rollNo}\nস্কুল: ${registeredCard.schoolName}\nহোয়াটসঅ্যাপ: ${registeredCard.phone}\nঅভিভাবকের নম্বর: ${registeredCard.guardianPhone}\nটিউশনের ধরন: ${registeredCard.tuitionType || registeredCard.mode}\nব্যাচ টাইমলাইন: ${registeredCard.batchTimeline || ''}\nঠিকানা: ${registeredCard.address}\nম্যাপ লিঙ্ক: ${registeredCard.mapLocation || 'নেই'}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs flex items-center justify-center space-x-2 shadow transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp-এ বাবুন স্যারকে পাঠান</span>
                    </a>

                    <button
                      onClick={() => setRegisteredCard(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                    >
                      নতুন ফর্ম
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Registration Form */
              <div className="glass-card p-6 sm:p-8 space-y-6">
                <form onSubmit={handleRegisterStudent} className="space-y-5 text-xs">
                  
                  {/* Step 1: Student & Class info */}
                  <div className="border-b border-slate-200 pb-3">
                    <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black">১</span>
                      <span>শিক্ষার্থীর প্রাতিষ্ঠানিক বিবরণ (Academic Information)</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">শিক্ষার্থীর পুরো নাম *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: অনিক রায়"
                        value={registerForm.studentName}
                        onChange={e => setRegisterForm({ ...registerForm, studentName: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-bold focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">শ্রেণী (Class / Grade) *</label>
                      <select
                        value={registerForm.grade}
                        onChange={e => setRegisterForm({ ...registerForm, grade: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-bold focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Class 7">সপ্তম শ্রেণী (Class 7)</option>
                        <option value="Class 8">অষ্টম শ্রেণী (Class 8)</option>
                        <option value="Class 9">নবম শ্রেণী (Class 9)</option>
                        <option value="Class 10">দশম শ্রেণী — মাধ্যমিক (Class 10)</option>
                        <option value="Class 11">একাদশ শ্রেণী (Class 11)</option>
                        <option value="Class 12">দ্বাদশ শ্রেণী (Class 12)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">বিদ্যালয়ের নাম (School Name) *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: দক্ষিণ হাবড়া হাই স্কুল"
                        value={registerForm.schoolName}
                        onChange={e => setRegisterForm({ ...registerForm, schoolName: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">স্কুল রোল নম্বর ও বিভাগ (Roll & Sec) *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: রোল 12, সেকশন A"
                        value={registerForm.rollNo}
                        onChange={e => setRegisterForm({ ...registerForm, rollNo: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-bold focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">টার্গেট বোর্ড পরীক্ষার বছর (Board Target)</label>
                      <select
                        value={registerForm.targetYear}
                        onChange={e => setRegisterForm({ ...registerForm, targetYear: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-bold focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="2026">2026 (Madhyamik / HS Target)</option>
                        <option value="2027">2027 (Madhyamik / HS Target)</option>
                        <option value="2028">2028</option>
                      </select>
                    </div>
                  </div>

                  {/* Step 2: Guardian & Contact */}
                  <div className="border-b border-slate-200 pb-3 pt-3">
                    <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black">২</span>
                      <span>অভিভাবকের বিবরণ ও যোগাযোগের পৃথক নম্বর</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">অভিভাবকের পুরো নাম *</label>
                      <input
                        type="text"
                        required
                        placeholder="পিতা / মাতা / অভিভাবকের নাম"
                        value={registerForm.guardianName}
                        onChange={e => setRegisterForm({ ...registerForm, guardianName: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">সম্পর্ক (Relation)</label>
                      <select
                        value={registerForm.guardianRelation}
                        onChange={e => setRegisterForm({ ...registerForm, guardianRelation: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="পিতা (Father)">পিতা (Father)</option>
                        <option value="মাতা (Mother)">মাতা (Mother)</option>
                        <option value="আইনগত অভিভাবক (Guardian)">আইনগত অভিভাবক (Guardian)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        📱 শিক্ষার্থীর নিজস্ব WhatsApp নম্বর * <span className="text-[10px] text-slate-400 font-normal">(ক্লাস নোটিশ ও মেটেরিয়াল পাওয়ার জন্য)</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: 9832145678"
                        value={registerForm.phone}
                        onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        📞 অভিভাবকের কলিং / যোগাযোগের নম্বর * <span className="text-[10px] text-slate-400 font-normal">(জরুরি যোগাযোগের জন্য)</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: 9433123456"
                        value={registerForm.guardianPhone}
                        onChange={e => setRegisterForm({ ...registerForm, guardianPhone: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Step 3: Tuition Mode & Student's Timeline */}
                  <div className="border-b border-slate-200 pb-3 pt-3">
                    <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black">৩</span>
                      <span>টিউশনের ধরন ও আপনার ব্যাচ সময়সূচী</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">টিউশনের মাধ্যম *</label>
                      <select
                        value={registerForm.tuitionType}
                        onChange={e => setRegisterForm({ ...registerForm, tuitionType: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-bold focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="টিউটোরিয়াল হোম ব্যাচ">🏫 সেন্টার ব্যাচ (বি.জি. টিউটোরিয়াল হোম)</option>
                        <option value="হোম প্রাইভেট টিউশন">🏠 হোম প্রাইভেট টিউশন (শিক্ষার্থীর বাড়িতে গিয়ে পড়ানো)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        ⏰ আপনার ব্যাচ সময়সূচী (Batch Timeline) *
                      </label>
                      <input
                        type="text"
                        required
                        value={registerForm.batchTimeline}
                        onChange={e => setRegisterForm({ ...registerForm, batchTimeline: e.target.value })}
                        placeholder="যেমন: সোম ও বুধ বিকাল ৪:৩০ - ৬:০০ কিংবা শুক্রবার সকাল"
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-bold text-indigo-700 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Step 4: Home Location & Google Maps */}
                  <div className="border-b border-slate-200 pb-3 pt-3">
                    <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black">৪</span>
                      <span>বাসস্থানের ঠিকানা ও Google Maps লোকেশন (হোম টিউশন ও নেভিগেশন)</span>
                    </h3>
                  </div>

                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">পূর্ণ আবাসিক ঠিকানা *</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: দক্ষিণ হাবড়া, এস. এন দে রোড, হাবড়া, উত্তর ২৪ পরগণা"
                          value={registerForm.address}
                          onChange={e => setRegisterForm({ ...registerForm, address: e.target.value })}
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">নিকটবর্তী ল্যান্ডমার্ক (ঐচ্ছিক)</label>
                        <input
                          type="text"
                          placeholder="যেমন: বাণীপুর মোড়ের কাছে / স্টেশনের ৩ নম্বর প্ল্যাটফর্মের পিছনে"
                          value={registerForm.landmark}
                          onChange={e => setRegisterForm({ ...registerForm, landmark: e.target.value })}
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Interactive Google Maps Auto GPS Detector */}
                    <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-extrabold text-indigo-950 block text-xs flex items-center space-x-1.5">
                            <MapPin className="w-4 h-4 text-indigo-600" />
                            <span>Google Maps লোকেশন সংযুক্তি (হোম টিউশনের জন্য অত্যন্ত আবশ্যক)</span>
                          </span>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            স্যার যাতে খুব সহজেই আপনার বাড়িতে পৌঁছাতে পারেন, সেজন্য নীচের বোতামে ক্লিক করে অটো-ডিটেক্ট করুন বা ম্যাপ লিংক পেস্ট করুন।
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleDetectRegGPS}
                          disabled={regGpsLoading}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-md active:scale-95 transition disabled:opacity-50 shrink-0"
                        >
                          <MapPin className="w-3.5 h-3.5 text-amber-300" />
                          <span>{regGpsLoading ? '📍 জিপিএস খোঁজা হচ্ছে...' : '📍 আমার বাড়ির লোকেশন অটো-ডিটেক্ট করুন'}</span>
                        </button>
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="গুগল ম্যাপস লিংক বা কোঅর্ডিনেট (যেমন: https://www.google.com/maps?q=22.8465,88.6321)"
                          value={registerForm.mapLocation}
                          onChange={e => setRegisterForm({ ...registerForm, mapLocation: e.target.value })}
                          className="w-full p-2 border border-indigo-200 rounded-xl bg-white font-mono text-[11px] text-indigo-900 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">কোনো বিশেষ সমস্যা, দুর্বলতা বা স্যারের প্রতি নোট (ঐচ্ছিক)</label>
                      <textarea
                        rows="2"
                        value={registerForm.notes}
                        onChange={e => setRegisterForm({ ...registerForm, notes: e.target.value })}
                        placeholder="যেমন: পাটিগণিতে ভীতি, বিজ্ঞানের সমীকরণ নিয়মিত রিভিশন প্রয়োজন..."
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                      ></textarea>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 hover:from-emerald-500 hover:to-indigo-600 text-white font-black text-sm shadow-xl shadow-emerald-600/25 active:scale-95 transition disabled:opacity-50"
                  >
                    {registerLoading ? 'রেজিস্ট্রেশন জমা হচ্ছে...' : '🎓 অনলাইন রেজিস্ট্রেশন সম্পন্ন করুন ও ভেরিফিকেশন স্লিপ নিন'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 1: HOME & ABOUT ================= */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            
            {/* HERO SECTION */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-2xl border border-slate-800">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.heroBadge}</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                    {t.heroHeading}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                    {t.heroDesc}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab('register')}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-emerald-500/30 transition active:scale-95"
                    >
                      <Award className="w-4 h-4" />
                      <span>🎓 শিক্ষার্থী রেজিস্ট্রেশন</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('quiz')}
                      className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition active:scale-95"
                    >
                      <Trophy className="w-4 h-4 text-slate-950" />
                      <span>🏆 AI মক টেস্ট অ্যারেনা</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsQrModalOpen(true)}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition active:scale-95 border border-indigo-400/40"
                    >
                      <QrCode className="w-4 h-4 text-amber-300" />
                      <span>{lang === 'bn' ? '📱 ওয়েবসাইট কিউআর' : '📱 Website QR Code'}</span>
                    </button>

                    <a
                      href={`tel:${customData.phone}`}
                      className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 flex items-center space-x-2 transition active:scale-95"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{t.heroBtnCall}</span>
                    </a>
                  </div>
                </div>

                {/* Right Teacher Card Preview */}
                <div className="lg:col-span-5">
                  <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/60 shadow-2xl relative">
                    <div 
                      onClick={() => setSelectedMediaModal({ src: teacherPortraitImg, fallbackSrc: './images/teacher-portrait.jpg', title: 'শিক্ষক বাবুন ঘোষ (Babun Ghosh)', desc: 'বি.জি. টিউটোরিয়াল হোম — ১৫+ বছরের শিক্ষকতা অভিজ্ঞতা।' })}
                      className="relative mx-auto w-36 h-36 mb-4 group cursor-pointer"
                    >
                      <img src={teacherPortraitImg} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "./images/teacher-portrait.jpg"; }}
                        alt="শিক্ষক বাবুন ঘোষ"
                        className="w-full h-full rounded-2xl object-cover border-4 border-amber-400 shadow-2xl group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <Maximize2 className="w-6 h-6 text-white" />
                      </div>
                      <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-md border-2 border-slate-900" title="যাচাইকৃত অভিজ্ঞ শিক্ষক">
                        <CheckCheck className="w-4 h-4" />
                      </span>
                    </div>

                    <div className="text-center space-y-1">
                      <h3 className="text-xl font-black text-white">{customData.teacherName}</h3>
                      <p className="text-xs text-emerald-400 font-semibold">{t.teacherTitle}</p>
                      <p className="text-xs text-slate-400 font-mono">অভিজ্ঞতা: {customData.experience}</p>
                    </div>

                    <div className="mt-5 space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center space-x-2.5">
                        <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-slate-300 truncate">শ্রী চৈতন্য কলেজ, হাবড়া (Alumni)</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center space-x-2.5">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-300 truncate">দক্ষিণ হাবড়া, এস. এন দে রোড</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center space-x-2.5">
                        <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="text-slate-300 font-mono">+91 {customData.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

                        {/* OFFICIAL WEBSITE QR CODE & KEYWORDS CARD */}
            <div className="bg-white/85 backdrop-blur-xl border border-white/70 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden transition-all duration-300 hover:shadow-2xl">

              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 text-center md:text-left flex-1">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{lang === 'bn' ? 'অফিসিয়াল পোর্টাল কিউআর ও কিওয়ার্ডস' : 'Official Portal QR Code & Keywords'}</span>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {lang === 'bn' ? 'মোবাইলে স্ক্যান করুন বা কিউআর কোড ডাউনলোড করুন' : 'Scan on Mobile or Download Website QR Card'}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                    {lang === 'bn'
                      ? 'যেকোনো স্মার্টফোন ক্যামেরা দিয়ে স্ক্যান করলেই সরাসরি খুলে যাবে বি.জি. টিউটোরিয়াল হোমের অফিসিয়াল ওয়েবসাইট। অভিভাবক ও ছাত্রছাত্রীদের মধ্যে শেয়ার করার জন্য নিচের বোতাম চেপে ফুল-এইচডি প্রিন্টেবল কিউআর কার্ড ডাউনলোড করুন।'
                      : 'Scan with any smartphone camera to instantly open B.G. Tutorial Home official portal. Click below to download a full-HD printable branded QR card to share with students and parents.'}
                  </p>

                  {/* SEO Keywords Pills */}
                  <div className="pt-1 flex flex-wrap gap-1.5 justify-center md:justify-start">
                    {['#BGTutorialHome', '#BabunGhosh', '#DakshinHabra', '#Class7to12Coaching', '#MathAndScience', '#MadhyamikWBBSE', '#HS_WBCHSE', '#HabraTuition'].map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100/90 text-slate-600 border border-slate-200/70">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3 justify-center md:justify-start">
                    <button
                      type="button"
                      onClick={() => handleDownloadWebsiteQr('website-qr-svg-home')}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-emerald-600/25 active:scale-95 transition"
                    >
                      <Download className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'QR কোড কার্ড ডাউনলোড (PNG)' : 'Download QR Card (PNG)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyPortalLink}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-2 border border-slate-300/80 active:scale-95 transition"
                    >
                      {copiedPortalLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedPortalLink ? (lang === 'bn' ? 'লিংক কপি হয়েছে!' : 'Link Copied!') : (lang === 'bn' ? 'লিংক কপি' : 'Copy Link')}</span>
                    </button>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent('বি.জি. টিউটোরিয়াল হোম (শিক্ষক: বাবুন ঘোষ - দক্ষিণ হাবড়া) অফিসিয়াল পোর্টাল: https://bg-tutorial-home.vercel.app')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center space-x-2 border border-emerald-300/60 active:scale-95 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp Share</span>
                    </a>
                  </div>
                </div>

                {/* QR Preview Card */}
                <div className="shrink-0 p-4 bg-white rounded-2xl border-2 border-emerald-500/30 shadow-lg flex flex-col items-center space-y-2.5">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <QRCodeSVG 
                      id="website-qr-svg-home"
                      value="https://bg-tutorial-home.vercel.app"
                      size={140}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <span className="text-[11px] font-black text-emerald-700 font-mono tracking-tight">
                    bg-tutorial-home.vercel.app
                  </span>
                </div>
              </div>
            </div>

            {/* TRUST STATS & VALUE HIGHLIGHTS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg mb-3">
                  🏆
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-black text-slate-900">১৫+ বছর</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">শিক্ষকতা অভিজ্ঞতা</p>
                  <p className="text-[10px] text-slate-400 mt-1">২০০৯ সাল থেকে হাবড়ায় বিশ্বস্ত নাম</p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg mb-3">
                  🎓
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-black text-slate-900">১০০০+</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">সফল কৃতী ছাত্রছাত্রী</p>
                  <p className="text-[10px] text-slate-400 mt-1">মাধ্যমিক ও উচ্চমাধ্যমিক স্তরে</p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg mb-3">
                  📍
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 leading-tight">দক্ষিণ হাবড়া</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">এস. এন. দে রোড সেন্টার</p>
                  <p className="text-[10px] text-slate-400 mt-1">দক্ষিণ হাবড়া হাইস্কুলের সন্নিকটে</p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-lg mb-3">
                  💯
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-black text-slate-900">১০০% যত্ন</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">কনসেপ্ট ও ইউনিট টেস্ট</p>
                  <p className="text-[10px] text-slate-400 mt-1">সাপ্তাহিক ওয়ান-টু-ওয়ান কেয়ার</p>
                </div>
              </div>
            </div>

            {/* STUDENT PRIVACY & DIGITAL ACCESS NOTICE BANNER */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-900/60 shadow-xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    🔒 সুরক্ষিত ডিজিটাল পোর্টাল ও প্রাইভেসি নিয়মাবলী
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
                    স্টাডি মেটেরিয়ালস, ডিজিটাল নোটিস বোর্ড, PhonePe ফি প্রদান এবং ট্রিবিউট ওয়াল শুধুমাত্র অনুমোদিত শিক্ষার্থীদের জন্য সংরক্ষিত। আপনার ইউনিক আইডি না থাকলে শিক্ষার্থী রেজিস্ট্রেশন করুন।
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('register')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition active:scale-95 shadow"
                >
                  📝 রেজিস্ট্রেশন করুন
                </button>
                <button
                  onClick={() => setActiveTab('student_portal')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition"
                >
                  🎓 আইডি দিয়ে লগইন
                </button>
              </div>
            </div>

            
            {/* OFFICIAL PHOTO GALLERY & COACHING MEDIA SHOWCASE */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-5">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>📸 অফিসিয়াল কোচিং সেন্টার ও প্রচারপত্র গ্যালারি</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    আমাদের টিউটোরিয়াল হোমের দৃশ্যপট ও অফিসিয়াল ব্যানার
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    দক্ষিণ হাবড়া, এস. এন দে রোড — বি.জি. টিউটোরিয়াল হোমের অফিশিয়াল ফ্লেক্স ব্যানার, সাইনবোর্ড ও ভিজিটিং কার্ড
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Poster */}
                <div 
                  onClick={() => setSelectedMediaModal({ src: teacherPosterImg, fallbackSrc: './images/teacher-poster.jpg', title: 'অফিসিয়াল কোচিং পোস্টার ও ফ্লেক্স ব্যানার', desc: 'সপ্তম থেকে দ্বাদশ শ্রেণীর ব্যাচ ও কোর্স বিবরণী সহ বি.জি. টিউটোরিয়াল হোমের অফিশিয়াল ফ্লেক্স।' })}
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm hover:shadow-xl transition cursor-pointer flex flex-col"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-slate-900 flex items-center justify-center relative">
                    <img src={teacherPosterImg} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "./images/teacher-poster.jpg"; }} 
                      alt="কোচিং ফ্লেক্স ব্যানার" 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                      <span className="text-white text-xs font-bold flex items-center space-x-1.5 bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>পূর্ণ আকারে জুম করে দেখুন</span>
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-white space-y-1 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">অফিসিয়াল ব্যানার</span>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition">কোচিং ফ্লেক্স ও পূর্ণ পাঠ্যক্রম</h4>
                      <p className="text-[11px] text-slate-500 mt-1">সপ্তম-দ্বাদশ শ্রেণীর বিষয়সমূহ, বৈশিষ্ট্য ও যোগাযোগের ঠিকানা</p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold">
                      <span>ছবিতে ক্লিক করুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Card 2: Signboard */}
                <div 
                  onClick={() => setSelectedMediaModal({ src: bannerBoardImg, fallbackSrc: './images/banner-board.jpg', title: 'টিউটোরিয়াল হোম সাইনবোর্ড (দক্ষিণ হাবড়া)', desc: 'দক্ষিণ হাবড়া হাই স্কুলের সন্নিকটে অবস্থিত সেন্টারের বাস্তব পরিচিতি ফলক।' })}
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm hover:shadow-xl transition cursor-pointer flex flex-col"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-slate-900 flex items-center justify-center relative">
                    <img src={bannerBoardImg} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "./images/banner-board.jpg"; }} 
                      alt="টিউটোরিয়াল হোম সাইনবোর্ড" 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                      <span className="text-white text-xs font-bold flex items-center space-x-1.5 bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>পূর্ণ আকারে জুম করে দেখুন</span>
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-white space-y-1 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">টিউটোরিয়াল সাইনবোর্ড</span>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition">সেন্টারের বাস্তব পরিচিতি ফলক</h4>
                      <p className="text-[11px] text-slate-500 mt-1">দক্ষিণ হাবড়া হাই স্কুলের নিকটস্থ মূল সেন্টারের সাইনবোর্ড</p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
                      <span>ছবিতে ক্লিক করুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Card 3: Visiting Card */}
                <div 
                  onClick={() => setSelectedMediaModal({ src: visitingCardImg, fallbackSrc: './images/visiting-card.jpg', title: 'অফিসিয়াল ভিজিটিং কার্ড — বাবুন ঘোষ', desc: 'শিক্ষক বাবুন ঘোষ মহাশয়ের ব্যক্তিগত ভিজিটিং কার্ড ও অফিশিয়াল ফোন নম্বর।' })}
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm hover:shadow-xl transition cursor-pointer flex flex-col"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-slate-900 flex items-center justify-center relative">
                    <img src={visitingCardImg} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "./images/visiting-card.jpg"; }} 
                      alt="ভিজিটিং কার্ড" 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                      <span className="text-white text-xs font-bold flex items-center space-x-1.5 bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>পূর্ণ আকারে জুম করে দেখুন</span>
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-white space-y-1 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">ভিজিটিং কার্ড</span>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition">অফিসিয়াল শিক্ষক পরিচয়পত্র</h4>
                      <p className="text-[11px] text-slate-500 mt-1">বাবুন স্যারের ব্যক্তিগত পরিচিতি ও সরাসরি যোগাযোগ নম্বর ৯৭৩৩৯৭৪৪২৫</p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-bold">
                      <span>ছবিতে ক্লিক করুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RESTORED FULL EDUCATOR PROFILE SECTION (As Requested) */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div 
                    onClick={() => setSelectedMediaModal({ src: teacherPortraitImg, fallbackSrc: './images/teacher-portrait.jpg', title: 'শিক্ষক বাবুন ঘোষ', desc: 'বি.জি. টিউটোরিয়াল হোমের প্রতিষ্ঠাতা ও শিক্ষক।' })}
                    className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md shrink-0 cursor-pointer hover:scale-105 transition"
                  >
                    <img src={teacherPortraitImg} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "./images/teacher-portrait.jpg"; }} alt="বাবুন ঘোষ" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 mb-1.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>দক্ষিণ হাবড়ার বিশিষ্ট গণিত ও বিজ্ঞান শিক্ষক</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                      শিক্ষক পরিচিতি — বাবুন ঘোষ (Babun Ghosh)
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      জন্ম: {customData.dob} • অভিজ্ঞতা: {customData.experience}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => speakText(`নমস্কার, আমি বাবুন ঘোষ। বি.জি. টিউটোরিয়াল হোমে সপ্তম থেকে দশম শ্রেণী পর্যন্ত অঙ্ক ও বিজ্ঞান এবং একাদশ ও দ্বাদশ শ্রেণীর রাষ্ট্রবিজ্ঞান ও দর্শন পরম স্নেহে পড়ানো হয়। আমাদের লক্ষ্য প্রতিটি ছাত্রছাত্রীর ভিত্তি মজবুত করা এবং ভালো ফল নিশ্চিত করা।`)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-2 transition"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                    <span>{isSpeaking ? 'থামান' : 'স্যারের বার্তা শুনুন'}</span>
                  </button>
                  <a
                    href={`tel:${customData.phone}`}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>সরাসরি কল</span>
                  </a>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Academic Background */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center space-x-2 text-indigo-700 font-extrabold text-sm">
                    <GraduationCap className="w-5 h-5" />
                    <span>শিক্ষা ও প্রাক্তন বিদ্যাপীঠ</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="font-bold text-slate-900 block">শ্রী চৈতন্য কলেজ, হাবড়া</span>
                      <span className="text-slate-500 text-[11px]">উচ্চশিক্ষা ও স্নাতক (Alumni)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="font-bold text-slate-900 block">দক্ষিণ হাবড়া হাই স্কুল</span>
                      <span className="text-slate-500 text-[11px]">মাধ্যমিক শিক্ষা</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="font-bold text-slate-900 block">হাবড়া হাই স্কুল</span>
                      <span className="text-slate-500 text-[11px]">উচ্চ মাধ্যমিক (H.S.)</span>
                    </div>
                  </div>
                </div>

                {/* Subjects & Curriculum */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-700 font-extrabold text-sm">
                    <BookOpen className="w-5 h-5" />
                    <span>পাঠদানের বিষয়সমূহ</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="font-bold text-emerald-800 block">সপ্তম থেকে দশম শ্রেণী (মাধ্যমিক)</span>
                      <span className="text-slate-600 text-[11px] leading-relaxed block mt-0.5">
                        MATHS (গণিত), SCIENCE (বিজ্ঞান), PHYSICS (ভৌত বিজ্ঞান), CHEMISTRY (রসায়ন), BIOLOGY (জীবন বিজ্ঞান)
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="font-bold text-indigo-800 block">একাদশ ও দ্বাদশ শ্রেণী (উচ্চমাধ্যমিক)</span>
                      <span className="text-slate-600 text-[11px] leading-relaxed block mt-0.5">
                        রাষ্ট্রবিজ্ঞান (Political Science) ও দর্শন (Philosophy)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Batch & Home Tuition Facilities */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-700 font-extrabold text-sm">
                    <Award className="w-5 h-5" />
                    <span>শিক্ষাদানের প্রধান বৈশিষ্ট্য</span>
                  </div>
                  <ul className="space-y-2 text-xs">
                    {[
                      'সহজ ভাষায় বোঝানো — কনসেপ্ট ক্লিয়ারিং',
                      'নিয়মিত অনুশীলন ও মক টেস্ট',
                      'পরীক্ষা প্রতি প্রস্তুতি ও স্পেশাল সাজেশন',
                      'ছোট ছোট দলে বিশেষ যত্ন ও নিয়মিত পর্যালোচনা',
                      'ভালো ফলের নিশ্চয়তা ও অভিভাবকদের নিয়মিত আপডেট',
                      'বাড়িতে গিয়ে পড়ানোর সুব্যবস্থা (Home Tuition in Habra Area)'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-slate-700">
                        <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>

            {/* HABRA BATCH RADAR & TODAY SCHEDULE */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-5">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-900 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>📅 হাবড়া সেন্টার লাইভ ব্যাচ রাডার</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    আজকের ক্লাস শিডিউল ও ব্যাচ নোটিশ
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    দক্ষিণ হাবড়া, এস. এন. দে রোড সেন্টারে নিয়মিত অনুষ্ঠিত পাঠদান সূচি
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1.5"></span>
                    সক্রিয় সেশন ২০২৬
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">সকাল ব্যাচ</span>
                    <span className="text-xs font-mono font-bold text-slate-500">০৮:০০ - ১০:০০</span>
                  </div>
                  <h4 className="font-black text-slate-900 text-base">Class 10 (মাধ্যমিক স্পেশাল)</h4>
                  <p className="text-xs text-slate-600">গণিত ও ভৌত বিজ্ঞান নিবিড় রিভিশন ও অধ্যায়ভিত্তিক প্রশ্ন সমাধান।</p>
                  <div className="pt-2 flex items-center text-[11px] text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    <span>দক্ষিণ হাবড়া মূল সেন্টার (এস.এন. দে রোড)</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-50 border border-emerald-100 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">বিকাল ব্যাচ</span>
                    <span className="text-xs font-mono font-bold text-slate-500">০৪:৩০ - ০৬:৩০</span>
                  </div>
                  <h4 className="font-black text-slate-900 text-base">Class 7 & 8 (ভিত গঠন)</h4>
                  <p className="text-xs text-slate-600">গণিত, বিজ্ঞানের বেসিক কনসেপ্ট ক্লিয়ারিং ও উইকলি হোমটাস্ক বিশ্লেষণ।</p>
                  <div className="pt-2 flex items-center text-[11px] text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    <span>দক্ষিণ হাবড়া হাইস্কুল সংলগ্ন ক্লাসরুম</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-slate-50 border border-amber-100 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-amber-800 bg-white px-2.5 py-1 rounded-lg border border-amber-200">সন্ধ্যা ব্যাচ</span>
                    <span className="text-xs font-mono font-bold text-slate-500">০৬:৪৫ - ০৮:৪৫</span>
                  </div>
                  <h4 className="font-black text-slate-900 text-base">Class 11 & 12 (উচ্চমাধ্যমিক)</h4>
                  <p className="text-xs text-slate-600">রাষ্ট্রবিজ্ঞান ও দর্শন (নতুন সেমিস্টার প্যাটার্ন ও বর্ণনামূলক উত্তর লেখা)।</p>
                  <div className="pt-2 flex items-center text-[11px] text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    <span>স্পেশাল কেয়ার ব্যাচ • সীমিত আসন</span>
                  </div>
                </div>
              </div>
            </div>

            

            {/* FEATURES SECTION */}
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{t.featuresTitle}</h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {lang === 'bn' ? 'সপ্তম থেকে দ্বাদশ শ্রেণীর ছাত্রছাত্রীদের জন্য সম্পূর্ণ পরিকল্পনা' : 'Structured pedagogical model for academic excellence'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { title: t.f1Title, desc: t.f1Desc, icon: Sparkles, color: 'text-emerald-600 bg-emerald-50' },
                  { title: t.f2Title, desc: t.f2Desc, icon: Award, color: 'text-amber-600 bg-amber-50' },
                  { title: t.f3Title, desc: t.f3Desc, icon: Users, color: 'text-blue-600 bg-blue-50' },
                  { title: t.f4Title, desc: t.f4Desc, icon: MapPin, color: 'text-purple-600 bg-purple-50' },
                  { title: t.f5Title, desc: t.f5Desc, icon: CheckCircle2, color: 'text-teal-600 bg-teal-50' },
                  { title: t.f6Title, desc: t.f6Desc, icon: MessageCircle, color: 'text-rose-600 bg-rose-50' }
                ].map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${f.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900 mb-1.5">{f.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ================= VIEW 2: COURSES ================= */}
        {activeTab === 'courses' && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-1">
              <h2 className="text-2xl font-black text-slate-900">{t.coursesTitle}</h2>
              <p className="text-xs text-slate-500">পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ ও উচ্চমাধ্যমিক শিক্ষা সংসদ অনুমোদিত পাঠ্যক্রম</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                  {t.cClass710}
                </span>
                <h3 className="text-lg font-black text-slate-900">{t.cClass710Subjects}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{t.cClass710Desc}</p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('quiz')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                  >
                    <span>মক টেস্ট প্র্যাকটিস করুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                  {t.cClass1112}
                </span>
                <h3 className="text-lg font-black text-slate-900">{t.cClass1112Subjects}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{t.cClass1112Desc}</p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('register')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                  >
                    <span>অনলাইনে ভর্তি আবেদন করুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 3: ADMISSION INQUIRY ================= */}
        {activeTab === 'admission' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                নতুন শিক্ষার্থী ভর্তি অনুসন্ধান (B.G. Tutorial Admission Inquiry)
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{t.admissionTitle}</h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">{t.admissionSubtitle}</p>
            </div>

            <div className="glass-card p-6 sm:p-8 space-y-5">
              {inquirySuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center space-x-2 animate-bounce">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{t.admissionSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleAdmissionSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.studentNameLabel} *</label>
                  <input
                    type="text"
                    required
                    placeholder="শিক্ষার্থীর নাম"
                    value={inquiryForm.studentName}
                    onChange={e => setInquiryForm({ ...inquiryForm, studentName: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-white font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{t.guardianNameLabel}</label>
                    <input
                      type="text"
                      placeholder="অভিভাবকের নাম"
                      value={inquiryForm.guardianName}
                      onChange={e => setInquiryForm({ ...inquiryForm, guardianName: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{t.phoneLabel} (WhatsApp) *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: 9832145678"
                      value={inquiryForm.phone}
                      onChange={e => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-white font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{t.gradeLabel}</label>
                    <select
                      value={inquiryForm.grade}
                      onChange={e => setInquiryForm({ ...inquiryForm, grade: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-white font-bold focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Class 7">Class 7 (সপ্তম শ্রেণী)</option>
                      <option value="Class 8">Class 8 (অষ্টম শ্রেণী)</option>
                      <option value="Class 9">Class 9 (নবম শ্রেণী)</option>
                      <option value="Class 10">Class 10 (মাধ্যমিক ব্যাচ)</option>
                      <option value="Class 11">Class 11 (উচ্চমাধ্যমিক)</option>
                      <option value="Class 12">Class 12 (উচ্চমাধ্যমিক)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">{t.tuitionTypeLabel}</label>
                    <select
                      value={inquiryForm.tuitionType}
                      onChange={e => setInquiryForm({ ...inquiryForm, tuitionType: e.target.value })}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-white font-bold focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="টিউটোরিয়াল হোম ব্যাচ">{t.tuitionBatchOption}</option>
                      <option value="হোম প্রাইভেট টিউশন">{t.tuitionHomeOption}</option>
                    </select>
                  </div>
                </div>

                {/* Location and Google Maps for home tuition */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">বাসস্থান / এলাকা *</label>
                      <input
                        type="text"
                        placeholder="যেমন: দক্ষিণ হাবড়া, এস. এন দে রোড"
                        value={inquiryForm.area}
                        onChange={e => setInquiryForm({ ...inquiryForm, area: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">ল্যান্ডমার্ক</label>
                      <input
                        type="text"
                        placeholder="যেমন: বাণীপুর মোড়ের কাছে"
                        value={inquiryForm.landmark}
                        onChange={e => setInquiryForm({ ...inquiryForm, landmark: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleDetectInquiryGPS}
                      disabled={inquiryGpsLoading}
                      className="px-3.5 py-2 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-extrabold text-xs flex items-center space-x-1.5 transition active:scale-95"
                    >
                      <MapPin className="w-3.5 h-3.5 text-indigo-700" />
                      <span>{inquiryGpsLoading ? 'লোকেশন চিহ্নিত হচ্ছে...' : '📍 Google Maps-এ বাড়ির লোকেশন যোগ করুন'}</span>
                    </button>
                    {inquiryForm.mapLocation && (
                      <span className="text-[11px] text-emerald-700 font-bold font-mono truncate max-w-xs">
                        ✅ ম্যাপ লোকেশন যুক্ত হয়েছে
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.notesOptionalLabel}</label>
                  <textarea
                    rows="2"
                    value={inquiryForm.notes}
                    onChange={e => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                    placeholder="কোন বিষয়ে পড়তে ইচ্ছুক বা কোনো প্রশ্ন থাকলে লিখুন..."
                    className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={inquiryLoading}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition active:scale-95"
                >
                  {inquiryLoading ? 'জমা দেওয়া হচ্ছে...' : t.submitAdmissionBtn}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= VIEW 4: TRIBUTE (PROTECTED BEHIND STUDENT LOGIN) ================= */}
        {activeTab === 'tribute' && (
          !loggedInStudent ? (
            <ProtectedAccessScreen
              tabName="ট্রিবিউট ওয়াল ও শ্রদ্ধার্ঘ্য বার্তা (Tribute Wall)"
              tabIcon={Heart}
              description="শিক্ষক বাবুন ঘোষ স্যারের ট্রিবিউট ওয়ালে শুভেচ্ছা ও শ্রদ্ধার্ঘ্য বার্তা পাঠাতে বা পড়তে অনুমোদিত শিক্ষার্থী হিসেবে স্টুডেন্ট পোর্টালে লগইন আবশ্যক।"
              onGoToLogin={() => setActiveTab('student_portal')}
              onGoToRegister={() => setActiveTab('register')}
              onGoToAdmission={() => setActiveTab('admission')}
              phone={customData.phone}
              lang={lang}
            />
          ) : (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-1">
              <h2 className="text-2xl font-black text-slate-900">{t.tributeTitle}</h2>
              <p className="text-xs text-slate-500">{t.tributeSubtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Wishes List (Only shows genuine submissions) */}
              <div className="lg:col-span-2 space-y-4">
                {wishes.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 space-y-3">
                    <Heart className="w-10 h-10 text-rose-400 mx-auto animate-pulse" />
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      এখনও কোনো শ্রদ্ধার্ঘ্য বার্তা পোস্ট হয়নি
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      আপনিই প্রথম আপনার প্রিয় বাবুন স্যারের উদ্দেশ্যে আন্তরিক শ্রদ্ধা, ধন্যবাদ ও স্মৃতি জানিয়ে ডানপাশের ফর্মটিতে লিখে পোস্ট করুন!
                    </p>
                  </div>
                ) : (
                  wishes.map(w => (
                    <div key={w.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="font-black text-slate-900">{w.name}</span>
                          <span className="text-slate-500 ml-2 font-medium">({w.batch})</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[11px]">{w.date}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{w.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Wish Form */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm h-fit space-y-3">
                <h3 className="font-bold text-sm text-slate-900">{t.addWishTitle}</h3>
                {wishSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold">
                    বার্তা সফলভাবে যুক্ত হয়েছে!
                  </div>
                )}
                <form onSubmit={handleAddWish} className="space-y-3 text-xs">
                  <input
                    type="text"
                    required
                    placeholder={t.yourName}
                    value={newWish.name}
                    onChange={e => setNewWish({ ...newWish, name: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                  />
                  <input
                    type="text"
                    placeholder={t.yourBatch}
                    value={newWish.batch}
                    onChange={e => setNewWish({ ...newWish, batch: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                  <textarea
                    rows="3"
                    required
                    placeholder={t.yourMessage}
                    value={newWish.message}
                    onChange={e => setNewWish({ ...newWish, message: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 leading-relaxed"
                  ></textarea>
                  <button
                    type="submit"
                    disabled={wishLoading}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl active:scale-95 transition disabled:opacity-50"
                  >
                    {wishLoading ? 'পোস্ট হচ্ছে...' : t.submitWish}
                  </button>
                </form>
              </div>
            </div>
          </div>
          )
        )}

        {/* ================= VIEW 5: PHONEPE & FEES (PROTECTED BEHIND STUDENT LOGIN) ================= */}
        {activeTab === 'payment' && (
          !loggedInStudent ? (
            <ProtectedAccessScreen
              tabName="PhonePe ফি প্রদান ও ট্রানজ্যাকশন পোর্টাল (Fee Portal)"
              tabIcon={QrCode}
              description="মাসিক টিউশন ফি প্রদান, QR কোড স্ক্যান ও ডিজিটাল রসিদ পেতে অনুমোদিত শিক্ষার্থী ইউনিক আইডি দিয়ে লগইন আবশ্যক।"
              onGoToLogin={() => setActiveTab('student_portal')}
              onGoToRegister={() => setActiveTab('register')}
              onGoToAdmission={() => setActiveTab('admission')}
              phone={customData.phone}
              lang={lang}
            />
          ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-slate-900">{t.paymentTitle}</h2>
              <p className="text-xs text-slate-500">{t.paymentSubtitle}</p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md text-center space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-black">
                <span>{t.phonepeHeading}</span>
              </div>

              {/* Verified QR Code */}
              <div className="space-y-3 inline-block">
                <div className="p-4 bg-purple-50 rounded-2xl inline-block border-2 border-purple-200 shadow-inner">
                  <QRCodeSVG id="phonepe-qr-svg" value={upiPayLink} size={180} level="H" />
                </div>
                <div>
                  <button
                    onClick={() => {
                      const svg = document.getElementById('phonepe-qr-svg');
                      if (!svg) return;
                      const svgData = new XMLSerializer().serializeToString(svg);
                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');
                      const img = new Image();
                      img.onload = () => {
                        canvas.width = 300;
                        canvas.height = 300;
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, 300, 300);
                        ctx.drawImage(img, 20, 20, 260, 260);
                        const pngFile = canvas.toDataURL('image/png');
                        const downloadLink = document.createElement('a');
                        downloadLink.download = 'Babun-Ghosh-Sir-PhonePe-QR.png';
                        downloadLink.href = pngFile;
                        downloadLink.click();
                      };
                      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                    }}
                    className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 transition active:scale-95 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>📥 QR Code ডাউনলোড করুন</span>
                  </button>
                </div>
              </div>

              {/* Custom Fee Amount Input (Optional - Blank by Default) */}
              <div className="space-y-2 max-w-xs mx-auto">
                <label className="text-xs font-bold text-slate-700 block">
                  ফি-এর পরিমাণ লিখুন (ঐচ্ছিক):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={selectedFeeAmount}
                    onChange={(e) => setSelectedFeeAmount(e.target.value)}
                    placeholder="যেমন: 250 বা ফাঁকা রাখুন"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm text-center text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  ফাঁকা রাখলে স্ক্যান করার সময় PhonePe / UPI অ্যাপে নিজের পছন্দমতো টাকা লেখা যাবে।
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">{t.accountName}</p>
                <p className="text-xs text-purple-700 font-mono font-bold">UPI VPA: {upiHandle}</p>
                <p className="text-[11px] text-slate-500">PhonePe নম্বর: +91 {customData.phone}</p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-2 pt-2">
                <button
                  onClick={() => copyToClipboard(customData.phone)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedUpi ? t.copied : t.copyUpi}</span>
                </button>

                <a
                  href={upiPayLink}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t.openUpiDirectBtn}</span>
                </a>
              </div>
            </div>
          </div>
          )
        )}

        {/* ================= VIEW 6: STUDY MATERIALS & OFFICIAL SYLLABUS (PROTECTED) ================= */}
        {activeTab === 'study' && (
          !loggedInStudent ? (
            <ProtectedAccessScreen
              tabName="স্টাডি মেটেরিয়ালস ও ক্লাসের খাতা (Study Materials)"
              tabIcon={FileText}
              description="অধ্যায়ভিত্তিক হ্যান্ডআউট, মাধ্যমিক সাজেশন ও ডিজিটালাইজড ক্লাসরুম নোটস শুধুমাত্র বি.জি. টিউটোরিয়ালের নিবন্ধিত শিক্ষার্থীদের জন্য সংরক্ষিত।"
              onGoToLogin={() => setActiveTab('student_portal')}
              onGoToRegister={() => setActiveTab('register')}
              onGoToAdmission={() => setActiveTab('admission')}
              phone={customData.phone}
              lang={lang}
            />
          ) : (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 gap-3">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {lang === 'bn' ? 'স্টাডি মেটেরিয়ালস ও বোর্ড সিলেবাস গাইড' : 'Study Notes & Board Material'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  WBBSE ও WBCHSE অফিশিয়াল সিলেবাস অনুযায়ী সপ্তম থেকে দ্বাদশ শ্রেণীর প্রতিটি ইউনিট টেস্টের পাঠ্যক্রম
                </p>
              </div>

              {/* Class Filter Bar */}
              <div className="flex flex-wrap gap-1 text-xs">
                {['Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(cls => (
                  <button
                    key={cls}
                    onClick={() => setSelectedSyllabusClass(cls)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
                      selectedSyllabusClass === cls
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Comprehensive Unit-by-Unit Official Syllabus Details with Interactive Chapter Cards */}
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-sm sm:text-base">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <span>{selectedSyllabusClass} — পর্যায়ক্রমিক মূল্যায়ন, বিশদ অধ্যায় ও নোটস আউটলাইন</span>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  কার্ডে ক্লিক করে মূল তত্ত্ব, ফর্মুলা ও স্যারের পরীক্ষার সাজেশন দেখুন
                </span>
              </div>

              {/* Units & Chapters Display */}
              <div className="space-y-8">
                {(DETAILED_SYLLABUS[selectedSyllabusClass] || []).map((unitObj, unitIdx) => (
                  <div key={unitObj.unitId || unitIdx} className="bg-slate-50/80 rounded-3xl p-5 sm:p-6 border border-slate-200/80 space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                      <h3 className="font-black text-slate-900 text-sm sm:text-base">
                        {unitObj.unitName}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(unitObj.chapters || []).map((chap, cIdx) => (
                        <div key={chap.id || cIdx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-100">
                                {chap.subject}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">WBBSE/WBCHSE</span>
                            </div>

                            <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                              {chap.chapterName}
                            </h4>

                            <div className="flex flex-wrap gap-1">
                              {(chap.topics || []).slice(0, 3).map((top, tIdx) => (
                                <span key={tIdx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                                  • {top}
                                </span>
                              ))}
                              {(chap.topics || []).length > 3 && (
                                <span className="text-[10px] text-slate-400 font-bold self-center">
                                  +{chap.topics.length - 3} আরো
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedChapterModal({
                              ...chap,
                              unitName: unitObj.unitName,
                              className: selectedSyllabusClass
                            })}
                            className="w-full mt-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white font-bold text-xs flex items-center justify-center space-x-1.5 border border-emerald-200 hover:border-emerald-600 transition shadow-sm"
                          >
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>বিস্তারিত নোটস ও ফর্মুলা দেখুন</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Downloadable Hand-Notes Section (Cleared of mock files as requested) */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    📥 শিক্ষক বাবুন স্যারের ক্লাসরুম হ্যান্ডরিটেন নোটস ও ফাইল
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    দক্ষিণ হাবড়া ব্যাচের ছাত্রছাত্রীদের জন্য স্যারের অনুমোদিত স্টাডি ফাইল
                  </p>
                </div>
              </div>

              {(!studyMaterials || studyMaterials.length === 0) ? (
                <div className="p-8 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 space-y-2">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-700 font-bold">
                    বাবুন স্যার দক্ষিণ হাবড়া ব্যাচের ছাত্রছাত্রীদের জন্য খুব শীঘ্রই নতুন হ্যান্ডরিটেন স্টাডি নোটস ও সাজেশন আপলোড করবেন।
                  </p>
                  <p className="text-[11px] text-slate-400">
                    শিক্ষক মোবাইল প্যানেল থেকে যেকোনো সময় নতুন নোটস যোগ করা যায়।
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studyMaterials.map((item) => (
                    <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {item.batch}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.size || '২.৫ MB'}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-slate-600 mb-3">{item.desc}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400">{item.type}</span>
                        <button 
                          onClick={() => {
                            const cleanT = `*বি.জি. টিউটোরিয়াল হোম — স্টাডি নোটস*\nনোটস: ${item.title} (${item.batch})\nশিক্ষক: বাবুন ঘোষ\nযোগাযোগ: 9733974425`;
                            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(cleanT)}`, '_blank');
                          }}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl flex items-center space-x-1 transition"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>শেয়ার</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          )
        )}

        {/* ================= VIEW 7: DIGITAL NOTICE BOARD (PROTECTED) ================= */}
        {activeTab === 'notices' && (
          !loggedInStudent ? (
            <ProtectedAccessScreen
              tabName="ডিজিটাল নোটিস বোর্ড (Classroom Notices)"
              tabIcon={Bell}
              description="ক্লাস সময়সূচি পরিবর্তন, পরীক্ষার ডেটশিট ও শিক্ষামূলক নোটিস দেখার জন্য শিক্ষার্থীর স্টুডেন্ট পোর্টালে লগইন থাকা বাধ্যতামূলক।"
              onGoToLogin={() => setActiveTab('student_portal')}
              onGoToRegister={() => setActiveTab('register')}
              onGoToAdmission={() => setActiveTab('admission')}
              phone={customData.phone}
              lang={lang}
            />
          ) : (
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-200">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {lang === 'bn' ? 'ডিজিটাল নোটিশ বোর্ড' : 'Digital Notice Board'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'bn' ? 'ক্লাস সূচি, পরীক্ষা এবং টিউশনের যেকোনো জরুরি ঘোষণা (বাবুন স্যার কর্তৃক সরাসরি প্রকাশিত)' : 'Official announcements published directly by Babun Sir.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                {notices.map(notice => (
                  <div key={notice.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        {notice.batch}
                      </span>
                      <span className="text-xs text-slate-400">{notice.date}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{notice.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">{notice.desc}</p>
                    
                    <button 
                      onClick={() => {
                        const encoded = encodeURIComponent(`📢 *বি.জি. টিউটোরিয়াল হোম (বাবুন ঘোষ)*\n${notice.title}\nব্যাচ: ${notice.batch}\n${notice.desc}`);
                        window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
                      }}
                      className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'WhatsApp-এ শেয়ার করুন' : 'Share to WhatsApp'}</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Routine Card */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm h-fit">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>ক্লাস সূচি (Weekly Routine)</span>
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="font-bold text-slate-900">সোম ও বুধবার (বিকাল ৪টা)</div>
                    <div className="text-slate-600">সপ্তম ও অষ্টম শ্রেণী — অঙ্ক ও বিজ্ঞান</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="font-bold text-slate-900">মঙ্গল ও বৃহস্পতিবার (সকাল ৮টা)</div>
                    <div className="text-slate-600">নবম ও দশম শ্রেণী — মাধ্যমিক স্পেশাল ব্যাচ</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="font-bold text-slate-900">শনিবার (সন্ধ্যা ৫টা)</div>
                    <div className="text-slate-600">একাদশ ও দ্বাদশ — রাষ্ট্রবিজ্ঞান ও দর্শন</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          )
        )}

        
        {/* ================= VIEW: ISOLATED STUDENT PRIVACY PORTAL ================= */}
        {activeTab === 'student_portal' && (
          <StudentPortal
            students={students}
            notices={notices}
            feeRecords={feeRecords}
            studyMaterials={studyMaterials}
            routine={routine}
            doubts={doubts}
            initialStudentId={initialStudentPortalId}
            onLoginStateChange={(st) => setLoggedInStudent(st)}
            onSaveDoubts={(newDoubts) => {
              setDoubts(newDoubts);
              saveToServer({ doubts: newDoubts });
            }}
            onUpdateStudentProfile={handleUpdateStudentProfile}
            customData={customData}
            setActiveTab={setActiveTab}
          />
        )}

        {/* ================= VIEW 8: TEACHER WORKSPACE ================= */}
        {activeTab === 'workspace' && (
          <ErrorBoundary onReset={() => setActiveTab('workspace')}>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center font-bold text-slate-700 bg-slate-50">
                লোড হচ্ছে...
              </div>
            }>
              <TeacherWorkspace 
              onPreviewStudentPortal={() => setActiveTab('student_portal')}
              lang={lang} 
              t={t} 
              customData={customData} 
              setCustomData={setCustomData}
              students={students}
              setStudents={setStudents}
              notices={notices}
              setNotices={setNotices}
              doubts={doubts}
              setDoubts={setDoubts}
              homeworkList={homeworkList}
              setHomeworkList={setHomeworkList}
              feeRecords={feeRecords}
              setFeeRecords={setFeeRecords}
              inquiries={inquiries}
              setInquiries={setInquiries}
              studyMaterials={studyMaterials}
              setStudyMaterials={setStudyMaterials}
              registrations={registrations}
              setRegistrations={setRegistrations}
              routine={routine}
              setRoutine={setRoutine}
              loggedInStudent={loggedInStudent}
              saveToServer={saveToServer}
            />
            </Suspense>
          </ErrorBoundary>
        )}

      </main>

      {/* Persistent Bottom Navigation for Mobile Thumbs */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1.5 flex items-center justify-between shadow-lg max-w-full w-full">
        {[
          { id: 'home', label: 'হোম', icon: Home },
          { id: 'quiz', label: 'মক টেস্ট', icon: Trophy, highlight: true },
          { id: 'student_portal', label: 'পোর্টাল', icon: UserCheck, highlight: true },
          { id: 'register', label: 'ভর্তি ফরম', icon: Award },
          { id: 'payment', label: 'PhonePe', icon: QrCode },
          { id: 'study', label: 'নোটস', icon: FileText }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
                isActive 
                  ? 'text-emerald-600 font-black' 
                  : item.highlight
                    ? 'text-amber-600 font-bold'
                    : 'text-slate-500 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-600' : ''}`} />
              <span className="text-[10px] mt-0.5 truncate w-full text-center">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 text-white border-t border-slate-800 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-3">
            <h4 className="font-black text-lg text-white">বি.জি. টিউটোরিয়াল হোম</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              সপ্তম থেকে দশম শ্রেণী (অঙ্ক ও বিজ্ঞান) এবং একাদশ ও দ্বাদশ শ্রেণীর (রাষ্ট্রবিজ্ঞান ও দর্শন) জন্য দক্ষিণ হাবড়ার নির্ভরযোগ্য বিদ্যাপীঠ।
            </p>
            <p className="text-xs text-emerald-400 font-semibold">
              শিক্ষক: বাবুন ঘোষ (Babun Ghosh)
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-400">
            <h4 className="font-bold text-white text-sm">ঠিকানা ও অবস্থান</h4>
            <p>📍 দক্ষিণ হাবড়া, (এস. এন দে রোড), হাবড়া, উত্তর ২৪ পরগণা</p>
            <p>📱 ফোন / WhatsApp: +91 {customData.phone}</p>
            <p>💳 PhonePe / UPI VPA: {upiHandle}</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">যোগাযোগ ও সোশ্যাল</h4>
            <div className="flex flex-col space-y-2 text-xs">
              <a href={customData.facebookLink} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center">
                <Globe className="w-3.5 h-3.5 mr-1.5" />
                Facebook: Babun Ghosh
              </a>
              <a href={`https://wa.me/91${cleanPhone}`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center">
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                WhatsApp Direct Chat
              </a>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-slate-400">
          <div>
            <p className="font-bold text-slate-300">
              © {new Date().getFullYear()} B.G. Tutorial Home • সর্বস্বত্ব সংরক্ষিত
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              শিক্ষক বাবুন ঘোষ স্যারের সম্মানে তৈরি অফিসিয়াল ডিজিটাল এডুকেশন পোর্টাল ও স্টুডেন্ট হাব
            </p>
          </div>

          {/* CREATIVE EYE-CATCHING DEVELOPER SHOWCASE WRAPPER */}
          <div className="relative group shrink-0 select-none cursor-default">
            {/* Multi-spectrum iridescent animated aura */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-400 via-emerald-400 via-indigo-500 to-pink-500 rounded-2xl blur-md opacity-85 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>

            {/* Glassmorphic Cyber Badge Wrapper */}
            <div className="relative px-5 sm:px-6 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/95 rounded-2xl border-2 border-emerald-400/90 shadow-[0_0_35px_rgba(52,211,153,0.6)] flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-inner">
                  <Code2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400/90 uppercase block">
                    Digital Portal Architect
                  </span>
                  <span className="text-sm sm:text-base font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-cyan-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]">
                    Created by Rahul ⚡
                  </span>
                </div>
              </div>

              <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 border border-emerald-400/50 font-mono tracking-tight shadow-sm">
                  Lead Architecture
                </span>
                <span className="text-rose-400 text-sm">❤️</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      
      {/* WEBSITE QR CODE & SHARE MODAL */}
      {isQrModalOpen && (
        <div 
          onClick={() => setIsQrModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative overflow-hidden"
          >
            <div 
              className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-30 transition-all duration-1000"
              style={{ backgroundColor: currentShader.orb1 }} 
            />

            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    {lang === 'bn' ? 'ওয়েবসাইট QR কোড' : 'Website QR Code'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    bg-tutorial-home.vercel.app
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsQrModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-6 flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-emerald-400/40">
                <QRCodeSVG 
                  id="website-qr-svg-modal"
                  value="https://bg-tutorial-home.vercel.app"
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs text-slate-300 font-medium">
                  {lang === 'bn' ? 'যেকোনো ক্যামেরা দিয়ে স্ক্যান করলেই ওয়েবসাইট খুলে যাবে' : 'Scan with any phone camera to open website'}
                </p>
                <p className="text-[11px] text-emerald-400 font-bold">
                  B.G. TUTORIAL HOME • Babun Ghosh Sir
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleDownloadWebsiteQr('website-qr-svg-modal')}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/25 active:scale-95 transition"
              >
                <Download className="w-4 h-4" />
                <span>{lang === 'bn' ? 'ডাউনলোড PNG' : 'Download PNG'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPortalLink}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 border border-slate-700 active:scale-95 transition"
              >
                {copiedPortalLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPortalLink ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'লিংক কপি' : 'Copy Link')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE CHAPTER STUDY NOTES & FORMULAS MODAL */}
      {selectedChapterModal && (
        <div 
          onClick={() => setSelectedChapterModal(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white flex items-start justify-between gap-4 border-b border-indigo-900/50">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {selectedChapterModal.className}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {selectedChapterModal.subject}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {selectedChapterModal.unitName}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {selectedChapterModal.chapterName}
                </h2>
              </div>

              <button
                onClick={() => setSelectedChapterModal(null)}
                className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Scroll */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-slate-800">
              
              {/* Topics Pills */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  অন্তর্ভুক্ত বিষয়বস্তু ও টপিক (Syllabus Coverage):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedChapterModal.topics || []).map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                      • {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Section 1: Main Concepts & Formulas */}
              <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-950 font-black text-sm">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  <span>১. মূল সূত্রাবলী ও ধারণাসমূহ (Key Concepts & Core Formulas)</span>
                </div>
                <pre className="font-sans whitespace-pre-line text-xs sm:text-sm text-indigo-950 leading-relaxed bg-white/80 p-4 rounded-xl border border-indigo-200/50 shadow-sm">
                  {selectedChapterModal.concepts}
                </pre>
              </div>

              {/* Section 2: Question Types & Marks Allocation */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-slate-900 font-black text-sm">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>২. অফিসিয়াল পরীক্ষার প্রশ্ন ধরণ ও নম্বর বিভাজন নির্দেশিকা</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-black text-[10px] inline-block">
                      ১ নম্বরের প্রশ্ন (MCQ / VSAQ)
                    </span>
                    <p className="text-slate-600 leading-relaxed">{selectedChapterModal.marksGuidance?.m1}</p>
                  </div>
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-black text-[10px] inline-block">
                      ২ নম্বরের প্রশ্ন (SAQ)
                    </span>
                    <p className="text-slate-600 leading-relaxed">{selectedChapterModal.marksGuidance?.m2}</p>
                  </div>
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-black text-[10px] inline-block">
                      ৪ / ৫ নম্বরের প্রশ্ন (LAQ)
                    </span>
                    <p className="text-slate-600 leading-relaxed">{selectedChapterModal.marksGuidance?.m4 || selectedChapterModal.marksGuidance?.m5}</p>
                  </div>
                </div>
              </div>

              {/* Section 3: Babun Sir's Pro Tip */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-1.5 text-amber-950">
                <div className="flex items-center space-x-2 font-black text-xs sm:text-sm text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>👨‍🏫 শিক্ষক বাবুন স্যারের বিশেষ পরীক্ষার পরামর্শ (Teacher's Special Exam Tip):</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                  "{selectedChapterModal.teacherTip}"
                </p>
              </div>

              {/* Section 4: Handwritten Notes Download / Inquire Placeholder */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[11px] font-black uppercase text-emerald-800 tracking-wider flex items-center justify-center sm:justify-start gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>ক্লাসরুম হ্যান্ডরিটেন স্টাডি মেটেরিয়াল ও PDF</span>
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {selectedChapterModal.notesPdf || 'Babun Sir Class Notes.pdf'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    দক্ষিণ হাবড়া বি.জি. টিউটোরিয়াল হোম ব্যাচের শিক্ষার্থীদের জন্য স্যারের অনুমোদিত বিস্তারিত কপি।
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const text = `নমস্কার বাবুন স্যার,\nআমি বি.জি. টিউটোরিয়াল হোমের ওয়েবসাইট থেকে ${selectedChapterModal.className}-এর "${selectedChapterModal.chapterName}" (${selectedChapterModal.subject}) অধ্যায়ের হ্যান্ডরিটেন স্টাডি নোটস ও সাজেশন পেতে চাই।`;
                      window.open(`https://wa.me/919733974425?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp-এ নোটস সংগ্রহ করুন</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs flex items-center space-x-1.5 shadow-sm transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>আউটলাইন প্রিন্ট</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                বি.জি. টিউটোরিয়াল হোম • শিক্ষক: বাবুন ঘোষ • দক্ষিণ হাবড়া
              </span>
              <button
                onClick={() => setSelectedChapterModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
              >
                বন্ধ করুন
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {selectedMediaModal && (
        <div 
          onClick={() => setSelectedMediaModal(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-black text-white text-base sm:text-lg">{selectedMediaModal.title}</h3>
                <p className="text-xs text-slate-400">{selectedMediaModal.desc}</p>
              </div>
              <button
                onClick={() => setSelectedMediaModal(null)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950">
              <img 
                src={selectedMediaModal.src} 
                onError={(e) => {
                  if (selectedMediaModal.fallbackSrc && e.currentTarget.src !== selectedMediaModal.fallbackSrc) {
                    e.currentTarget.src = selectedMediaModal.fallbackSrc;
                  }
                }}
                alt={selectedMediaModal.title} 
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">বি.জি. টিউটোরিয়াল হোম • দক্ষিণ হাবড়া</span>
              <a
                href={selectedMediaModal.src}
                target="_blank"
                rel="noreferrer"
                download
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center space-x-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ডাউনলোড / নতুন ট্যাবে দেখুন</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
    </ErrorBoundary>
  );
}
