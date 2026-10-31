import { generateFullExam } from '../utils/dynamicExamEngine';
import React, { useState, useEffect } from 'react';
import { 
  Trophy, CheckCircle2, XCircle, RotateCcw, Award, 
  Share2, ArrowRight, BookOpen, Brain, Sparkles, HelpCircle,
  Clock, Check, ChevronDown, ChevronUp, Printer, RefreshCw,
  FileText, Lightbulb, Compass, Star, Settings, CheckCheck,
  Flame, BookmarkCheck
} from 'lucide-react';

export default function QuizArena({ lang }) {
  // Class & Subject & Pattern Selectors
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSubject, setSelectedSubject] = useState('math'); 
  const [selectedPattern, setSelectedPattern] = useState('unit1'); 
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'mcq', 'vsaq', 'saq', 'laq'

  // Practice Set Data State
  const [loading, setLoading] = useState(false);
  const [practiceSet, setPracticeSet] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Interactive MCQ State
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [certificateIssued, setCertificateIssued] = useState(false);

  // Expandable Answer states for VSAQ, SAQ & LAQ
  const [expandedVsaq, setExpandedVsaq] = useState({});
  const [expandedSaq, setExpandedSaq] = useState({});
  const [expandedLaq, setExpandedLaq] = useState({});

  // Synchronous Class Change Handler ensuring 100% strict board subject mapping
  const handleClassChange = (newClass) => {
    setSelectedClass(newClass);
    if (newClass === 'Class 11' || newClass === 'Class 12') {
      const validHS = ['math', 'physics', 'chemistry', 'lifescience', 'biology', 'polscience', 'philosophy'];
      if (!validHS.includes(selectedSubject)) {
        setSelectedSubject('math');
      }
      setSelectedPattern(newClass === 'Class 11' ? 'sem1' : 'sem3');
    } else if (newClass === 'Class 10') {
      if (selectedSubject !== 'math' && selectedSubject !== 'physics' && selectedSubject !== 'lifescience') {
        setSelectedSubject('math');
      }
      setSelectedPattern('unit1');
    } else if (newClass === 'Class 9') {
      if (selectedSubject !== 'math' && selectedSubject !== 'physics' && selectedSubject !== 'lifescience' && selectedSubject !== 'science') {
        setSelectedSubject('math');
      }
      setSelectedPattern('unit1');
    } else {
      if (selectedSubject !== 'math' && selectedSubject !== 'science') {
        setSelectedSubject('math');
      }
      setSelectedPattern('unit1');
    }
  };

  useEffect(() => {
    if (selectedClass === 'Class 11' || selectedClass === 'Class 12') {
      const validHS = ['math', 'physics', 'chemistry', 'lifescience', 'biology', 'polscience', 'philosophy'];
      if (!validHS.includes(selectedSubject)) {
        setSelectedSubject('math');
      }
      if (selectedClass === 'Class 11' && selectedPattern !== 'sem1' && selectedPattern !== 'sem2') {
        setSelectedPattern('sem1');
      }
      if (selectedClass === 'Class 12' && selectedPattern !== 'sem3' && selectedPattern !== 'sem4') {
        setSelectedPattern('sem3');
      }
    } else if (selectedClass === 'Class 10') {
      if (selectedSubject !== 'math' && selectedSubject !== 'physics' && selectedSubject !== 'lifescience') {
        setSelectedSubject('math');
      }
      if (selectedPattern !== 'unit1' && selectedPattern !== 'unit2' && selectedPattern !== 'madhyamik') {
        setSelectedPattern('unit1');
      }
    } else if (selectedClass === 'Class 9') {
      if (selectedSubject !== 'math' && selectedSubject !== 'physics' && selectedSubject !== 'lifescience' && selectedSubject !== 'science') {
        setSelectedSubject('math');
      }
      if (selectedPattern !== 'unit1' && selectedPattern !== 'unit2' && selectedPattern !== 'unit3') {
        setSelectedPattern('unit1');
      }
    } else {
      if (selectedSubject !== 'math' && selectedSubject !== 'science') {
        setSelectedSubject('math');
      }
      if (selectedPattern !== 'unit1' && selectedPattern !== 'unit2' && selectedPattern !== 'unit3') {
        setSelectedPattern('unit1');
      }
    }
  }, [selectedClass]);

  useEffect(() => {
    if (!practiceSet) {
      fetchPracticeSet();
    }
  }, []);

  // Fetch or Generate Practice Set (Triggered ONLY on user action)
  const fetchPracticeSet = async () => {
    setLoading(true);
    setSelectedAnswers({});
    setShowExplanation({});
    setShowResults(false);
    setCertificateIssued(false);
    setExpandedVsaq({});
    setExpandedSaq({});
    setExpandedLaq({});

    // Truly dynamic seed generated on each click
    const dynamicSeed = Math.floor(Math.random() * 90000000) + 10000000;

    try {
      // 100% Client-Side Exam Generation Engine (Works on Vercel & Offline without 404!)
      const pSet = generateFullExam(selectedClass, selectedSubject, selectedPattern, dynamicSeed);
      if (pSet) {
        setPracticeSet(pSet);
        setHasGenerated(true);
      } else {
        const res = await fetch('/api/practice-set', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grade: selectedClass,
            subject: selectedSubject,
            examType: selectedPattern,
            seed: dynamicSeed,
            temperature: 0.7
          })
        });
        const data = await res.json();
        if (data.success && data.practiceSet) {
          setPracticeSet(data.practiceSet);
          setHasGenerated(true);
        }
      }
    } catch (e) {
      console.warn('Practice set generation fallback:', e);
      try {
        const pSet = generateFullExam(selectedClass, selectedSubject, selectedPattern, dynamicSeed);
        setPracticeSet(pSet);
        setHasGenerated(true);
      } catch (err) {
        console.error('Practice set error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Answer selection for MCQ
  const handleSelectOption = (qId, optionIdx) => {
    if (showResults) return; 
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const toggleExplanation = (qId) => {
    setShowExplanation(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const toggleVsaqAnswer = (qId) => {
    setExpandedVsaq(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const toggleSaqAnswer = (qId) => {
    setExpandedSaq(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const toggleLaqAnswer = (qId) => {
    setExpandedLaq(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const calculateScore = () => {
    const mcqs = practiceSet?.sections?.sectionA?.questions || practiceSet?.mcqs || [];
    if (mcqs.length === 0) return { score: 0, total: 0, percentage: 0 };
    let correctCount = 0;
    mcqs.forEach(q => {
      if (selectedAnswers[q.id] === q.correct) {
        correctCount++;
      }
    });
    return {
      score: correctCount,
      total: mcqs.length,
      percentage: Math.round((correctCount / mcqs.length) * 100)
    };
  };

  const getSubjectName = (subjCode) => {
    switch (subjCode) {
      case 'math': return 'গণিত (Mathematics)';
      case 'science': return 'পরিবেশ ও বিজ্ঞান (Integrated Science)';
      case 'physics': return selectedClass === 'Class 11' || selectedClass === 'Class 12' ? 'পদার্থবিদ্যা (Physics)' : 'ভৌতবিজ্ঞান (Physical Science)';
      case 'chemistry': return 'রসায়ন (Chemistry)';
      case 'lifescience':
      case 'biology': return selectedClass === 'Class 11' || selectedClass === 'Class 12' ? 'জীববিজ্ঞান (Biological Science)' : 'জীবনবিজ্ঞান (Life Science)';
      case 'polscience': return 'রাষ্ট্রবিজ্ঞান (Political Science)';
      case 'philosophy': return 'দর্শন (Philosophy)';
      default: return 'সাধারণ পাঠ';
    }
  };

  const getPatternName = (patternCode) => {
    switch (patternCode) {
      case 'unit1': return '১ম পর্যায়ক্রমিক মূল্যায়ন (1st Unit Test)';
      case 'unit2': return '২য় পর্যায়ক্রমিক মূল্যায়ন (2nd Unit Test)';
      case 'unit3': return '৩য় পর্যায়ক্রমিক / বাৎসরিক ফাইনাল (Final Exam)';
      case 'madhyamik': return 'মাধ্যমিক ও টেস্ট স্পেশাল চূড়ান্ত প্রস্তুতি (WBBSE Final 90 Marks)';
      case 'sem1': return 'একাদশ শ্রেণী — সেমিস্টার ১ (WBCHSE নতুন OMR MCQ স্পেশাল - 35 Marks)';
      case 'sem2': return 'একাদশ শ্রেণী — সেমিস্টার ২ (SAQ ও বর্ণনামূলক পরীক্ষা - 40 Marks)';
      case 'sem3': return 'দ্বাদশ শ্রেণী — সেমিস্টার ৩ (WBCHSE দ্বাদশ MCQ স্পেশাল - 35 Marks)';
      case 'sem4': return 'দ্বাদশ শ্রেণী — সেমিস্টার ৪ (উচ্চমাধ্যমিক ফাইনাল বোর্ড পরীক্ষা - 40 Marks)';
      default: return 'বোর্ড স্ট্যান্ডার্ড পরীক্ষা';
    }
  };

  const { score, total, percentage } = calculateScore();

  const secA = practiceSet?.sections?.sectionA?.questions || practiceSet?.mcqs || [];
  const secB = practiceSet?.sections?.sectionB?.questions || [];
  const secC = practiceSet?.sections?.sectionC?.questions || [];
  const secD = practiceSet?.sections?.sectionD?.questions || practiceSet?.laqs || [];

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-900/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>WBBSE ও WBCHSE অফিসিয়াল পূর্ণমান ও সিলেবাস ভিত্তিক (100% Dynamic Engine)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {lang === 'bn' ? '🏆 AI ফুল-মার্কস মক টেস্ট ও প্র্যাকটিস অ্যারেনা' : '🏆 AI Full-Marks Mock Test & Practice Arena'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              সপ্তম থেকে দ্বাদশ শ্রেণীর ১ম ও ২য় ইউনিট টেস্ট (৪০ নম্বর), মাধ্যমিক টেস্ট/ফাইনাল (৯০ নম্বর) এবং একাদশ ও দ্বাদশের সেমিস্টার প্যাটার্নে পূর্ণাঙ্গ প্রশ্নপত্র। প্রতিটি ক্লিক সম্পূর্ণ নতুন ও ভিন্ন প্রশ্নপত্র তৈরি করে।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              disabled={!hasGenerated}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center space-x-2 transition disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>প্রশ্নপত্র প্রিন্ট / PDF</span>
            </button>
            {hasGenerated && (
              <button
                onClick={fetchPracticeSet}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>✨ নতুন AI প্রশ্নপত্র তৈরি করুন</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILTER & CONFIGURATION CONTROL BAR */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-sm sm:text-base">
            <Settings className="w-4 h-4 text-indigo-600" />
            <span>শ্রেণী, বিষয় ও পরীক্ষার প্যাটার্ন নির্বাচন করুন</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            বাবুন স্যারের নির্দেশিত সিলেবাস ও পূর্ণমান
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Class Select */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">১. শ্রেণী (Grade / Class):</label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Class 7">সপ্তম শ্রেণী (Class 7 - WBBSE)</option>
              <option value="Class 8">অষ্টম শ্রেণী (Class 8 - WBBSE)</option>
              <option value="Class 9">নবম শ্রেণী (Class 9 - WBBSE)</option>
              <option value="Class 10">দশম শ্রেণী — মাধ্যমিক স্পেশাল (Class 10 - WBBSE)</option>
              <option value="Class 11">একাদশ শ্রেণী — নতুন সেমিস্টার (Class 11 - WBCHSE)</option>
              <option value="Class 12">দ্বাদশ শ্রেণী — উচ্চমাধ্যমিক সেমিস্টার (Class 12 - WBCHSE)</option>
            </select>
          </div>

          {/* Subject Select — Strictly Mapped as Required */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">২. বিষয় (Subject):</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              {(selectedClass === 'Class 7' || selectedClass === 'Class 8') && (
                <>
                  <option value="math">গণিত (Mathematics)</option>
                  <option value="science">পরিবেশ ও বিজ্ঞান (Integrated Science)</option>
                </>
              )}
              {selectedClass === 'Class 9' && (
                <>
                  <option value="math">গণিত (Mathematics)</option>
                  <option value="physics">ভৌতবিজ্ঞান (Physical Science)</option>
                  <option value="lifescience">জীবনবিজ্ঞান (Life Science)</option>
                  <option value="science">পরিবেশ ও বিজ্ঞান (Integrated Science)</option>
                </>
              )}
              {selectedClass === 'Class 10' && (
                <>
                  <option value="math">গণিত (Mathematics)</option>
                  <option value="physics">ভৌতবিজ্ঞান (Physical Science)</option>
                  <option value="lifescience">জীবনবিজ্ঞান (Life Science)</option>
                </>
              )}
              {(selectedClass === 'Class 11' || selectedClass === 'Class 12') && (
                <>
                  <option value="math">গণিত (Mathematics)</option>
                  <option value="physics">পদার্থবিদ্যা (Physics)</option>
                  <option value="chemistry">রসায়ন (Chemistry)</option>
                  <option value="lifescience">জীববিজ্ঞান (Biological Science)</option>
                  <option value="polscience">রাষ্ট্রবিজ্ঞান (Political Science)</option>
                  <option value="philosophy">দর্শন (Philosophy)</option>
                </>
              )}
            </select>
          </div>

          {/* Exam Pattern Select */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">৩. পরীক্ষার প্যাটার্ন (Official Pattern):</label>
            <select
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              {(selectedClass === 'Class 7' || selectedClass === 'Class 8') && (
                <>
                  <option value="unit1">১ম পর্যায়ক্রমিক মূল্যায়ন (1st Unit - 25 Marks)</option>
                  <option value="unit2">২য় পর্যায়ক্রমিক মূল্যায়ন (2nd Unit - 25 Marks)</option>
                  <option value="unit3">৩য় পর্যায়ক্রমিক / বাৎসরিক ফাইনাল (70 Marks)</option>
                </>
              )}
              {selectedClass === 'Class 9' && (
                <>
                  <option value="unit1">১ম পর্যায়ক্রমিক মূল্যায়ন (1st Unit Test - 40 Marks)</option>
                  <option value="unit2">২য় পর্যায়ক্রমিক মূল্যায়ন (2nd Unit Test - 40 Marks)</option>
                  <option value="unit3">৩য় পর্যায়ক্রমিক / বাৎসরিক ফাইনাল (Annual - 90 Marks)</option>
                </>
              )}
              {selectedClass === 'Class 10' && (
                <>
                  <option value="unit1">১ম পর্যায়ক্রমিক মূল্যায়ন (1st Unit Test - 40 Marks)</option>
                  <option value="unit2">২য় পর্যায়ক্রমিক মূল্যায়ন (2nd Unit Test - 40 Marks)</option>
                  <option value="madhyamik">মাধ্যমিক ও টেস্ট স্পেশাল চূড়ান্ত প্রস্তুতি (Full 90 Marks)</option>
                </>
              )}
              {selectedClass === 'Class 11' && (
                <>
                  <option value="sem1">সেমিস্টার ১ (WBCHSE নতুন OMR MCQ স্পেশাল - 35 Marks)</option>
                  <option value="sem2">সেমিস্টার ২ (SAQ ও বর্ণনামূলক পরীক্ষা - 40 Marks)</option>
                </>
              )}
              {selectedClass === 'Class 12' && (
                <>
                  <option value="sem3">সেমিস্টার ৩ (WBCHSE দ্বাদশ MCQ স্পেশাল - 35 Marks)</option>
                  <option value="sem4">সেমিস্টার ৪ (উচ্চমাধ্যমিক ফাইনাল বোর্ড পরীক্ষা - 40 Marks)</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Big Generate Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            নির্বাচিত বিষয়: <span className="font-bold text-indigo-700">{getSubjectName(selectedSubject)}</span> | 
            প্যাটার্ন: <span className="font-bold text-slate-700">{getPatternName(selectedPattern)}</span>
          </div>

          <button
            onClick={fetchPracticeSet}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition active:scale-95 disabled:opacity-60"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'AI সিলেবাস অনুযায়ী নতুন প্রশ্নপত্র প্রস্তুত হচ্ছে...' : '✨ সম্পূর্ণ প্রশ্নপত্র তৈরি করুন (Generate AI Full Exam Paper)'}</span>
          </button>
        </div>
      </div>

      {/* INITIAL PROMPT IF NOT GENERATED YET */}
      {!hasGenerated && !loading && (
        <div className="bg-slate-50 rounded-3xl p-10 border-2 border-dashed border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-extrabold text-slate-800">
              শ্রেণী ও বিষয় নির্বাচন করে উপরের বাটনে ক্লিক করুন
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ (WBBSE) ও উচ্চমাধ্যমিক শিক্ষা সংসদ (WBCHSE) নিয়মাবলী অনুযায়ী ক্লাস ১০-এর ১ম ইউনিট টেস্টের ৪০ নম্বরের প্রশ্নপত্র বা মাধ্যমিকের ৯০ নম্বরের পূর্ণাঙ্গ প্রশ্নপত্র জেনারেট করুন। প্রতিটি তৈরি সম্পূর্ণ স্বতন্ত্র ও নতুন হবে।
            </p>
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-700">
            WBBSE ও WBCHSE অফিসিয়াল প্যাটার্ন অনুযায়ী নতুন প্রশ্নপত্র ও সমাধান তৈরি হচ্ছে...
          </p>
          <p className="text-xs text-slate-400 font-mono">
            দক্ষিণ হাবড়া বি.জি. টিউটোরিয়াল হোম — বাবুন ঘোষ স্টাডি ইঞ্জিন
          </p>
        </div>
      )}

      {/* GENERATED PRACTICE SET CONTENT */}
      {hasGenerated && practiceSet && !loading && (
        <div className="space-y-6">
          
          {/* OFFICIAL BOARD EXAM HEADER BANNER */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-indigo-600 shadow-md text-slate-900 space-y-4">
            <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-600 block">
                {practiceSet.meta?.board || 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ (WBBSE)'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                {practiceSet.meta?.institute || 'বি.জি. টিউটোরিয়াল হোম (শিক্ষক: বাবুন ঘোষ)'}
              </h2>
              <p className="text-xs font-bold text-slate-600">
                {practiceSet.meta?.examTitle || getPatternName(selectedPattern)} • {getSubjectName(selectedSubject)}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-black text-slate-800 pt-1">
                <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
                  🎯 পূর্ণমান: {practiceSet.meta?.totalMarks || 40}
                </span>
                <span className="bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300">
                  ⏱️ সময়: {practiceSet.meta?.timeAllowed || '১ ঘণ্টা ১৫ মিনিট'}
                </span>
                <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-300">
                  📍 কেন্দ্র: {practiceSet.meta?.location || 'দক্ষিণ হাবড়া, এস. এন দে রোড'}
                </span>
              </div>
            </div>

            {/* Student Exam ID Header for Printing */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border-b border-dashed border-slate-300 pb-4">
              <div>
                <span className="text-slate-400 font-bold block">পরীক্ষার্থীর নাম:</span>
                <input 
                  type="text" 
                  placeholder="নাম লিখুন..." 
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full mt-1 p-1.5 border-b border-slate-400 bg-transparent font-bold focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <span className="text-slate-400 font-bold block">শ্রেণী ও বিভাগ:</span>
                <span className="font-bold text-slate-800 block mt-1">{selectedClass}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">রোল নম্বর:</span>
                <input 
                  type="text" 
                  placeholder="রোল নং..." 
                  className="w-full mt-1 p-1.5 border-b border-slate-400 bg-transparent font-bold focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Official WBCHSE Sem 4 Notice if No MCQs */}
            {secA.length === 0 && (
              <div className="p-4 rounded-2xl bg-indigo-50/90 border border-indigo-200 text-indigo-950 flex items-start space-x-3 text-xs leading-relaxed">
                <span className="text-lg">ℹ️</span>
                <div>
                  <span className="font-extrabold block text-indigo-900 text-sm">WBCHSE অফিসিয়াল গাইডলাইন অনুসারে সেমিস্টার ৪ সম্পূর্ণ বর্ণনামূলক:</span>
                  <span>উচ্চমাধ্যমিক সেমিস্টার ৪ ফাইনাল পরীক্ষায় কোনো প্রকার বহুবিকল্পভিত্তিক (MCQ) প্রশ্ন থাকে না। এটি সম্পূর্ণভাবে সংক্ষিপ্ত ব্যাখ্যামূলক (২ নম্বর), ধারণাগত বিশ্লেষণ (৪ নম্বর) এবং বিস্তারিত দীর্ঘ রচনাধর্মী (৮ নম্বর) প্রশ্নের সমন্বয়ে গঠিত (মোট ৪০ নম্বর)।</span>
                </div>
              </div>
            )}

            {/* Section Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'সব বিভাগ (All Sections)' },
                  ...(secA.length > 0 ? [{ id: 'mcq', label: `বিভাগ 'ক': MCQ (${secA.length})` }] : []),
                  ...(secB.length > 0 ? [{ id: 'vsaq', label: `বিভাগ 'খ': অতি সংক্ষিপ্ত (${secB.length})` }] : []),
                  ...(secC.length > 0 ? [{ id: 'saq', label: `বিভাগ 'গ': সংক্ষিপ্ত (${secC.length})` }] : []),
                  ...(secD.length > 0 ? [{ id: 'laq', label: `বিভাগ 'ঘ': দীর্ঘ প্রশ্ন (${secD.length})` }] : []),
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {secA.length > 0 && !showResults && (
                <button
                  onClick={() => setShowResults(true)}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition"
                >
                  MCQ উত্তর যাচাই ও স্কোর দেখুন
                </button>
              )}
            </div>
          </div>

          {/* ================= SECTION A: MCQs ================= */}
          {(activeTab === 'all' || activeTab === 'mcq') && secA.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>বিভাগ 'ক' — বহুবিকল্পভিত্তিক প্রশ্ন (MCQ) • পূর্ণমান: {secA.length * 1}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    সঠিক উত্তরটি নির্বাচন করে লেখো (প্রতিটি প্রশ্নের মান ১)
                  </h3>
                </div>

                {showResults && (
                  <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <Trophy className="w-4 h-4 text-emerald-600" />
                    <span>আপনার স্কোর: {score} / {total} ({percentage}%)</span>
                  </div>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {secA.map((q, qIdx) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isCorrect = isAnswered && selectedAnswers[q.id] === q.correct;
                  const showExp = showExplanation[q.id];

                  return (
                    <div key={q.id || qIdx} className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 transition space-y-4 bg-slate-50/50">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-bold text-slate-900 text-sm leading-relaxed">
                          <span className="inline-block w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black text-center leading-6 mr-2">
                            {qIdx + 1}
                          </span>
                          {q.question}
                        </h4>
                        <span className="text-xs font-mono font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                          [১ নম্বর]
                        </span>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {(q.options || []).map((opt, optIdx) => {
                          const isSelected = selectedAnswers[q.id] === optIdx;
                          let btnStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700';

                          if (showResults) {
                            if (optIdx === q.correct) {
                              btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                            } else if (isSelected) {
                              btnStyle = 'border-rose-400 bg-rose-50 text-rose-800';
                            } else {
                              btnStyle = 'opacity-50 border-slate-200 bg-white';
                            }
                          } else if (isSelected) {
                            btnStyle = 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold ring-2 ring-indigo-500/20';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={`p-3 rounded-xl border text-left text-xs sm:text-sm transition flex items-center justify-between gap-2 ${btnStyle}`}
                            >
                              <div className="flex items-center space-x-2.5">
                                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {showResults && optIdx === q.correct && (
                                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                              {showResults && isSelected && optIdx !== q.correct && (
                                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation toggle */}
                      <div className="pt-1 flex items-center justify-between text-xs">
                        <button
                          onClick={() => toggleExplanation(q.id)}
                          className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center space-x-1"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>{showExp ? 'ব্যাখ্যা লুকান' : 'সহজ ব্যাখ্যা দেখুন'}</span>
                        </button>
                      </div>

                      {showExp && (
                        <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950 leading-relaxed">
                          <span className="font-bold block mb-1 text-indigo-900">💡 বাবুন স্যারের সঠিক ব্যাখ্যা:</span>
                          <p>{q.explanation || 'এই প্রশ্নের উত্তর পাঠ্যবইয়ের সংশ্লিষ্ট অধ্যায় থেকে অনুসৃত।'}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Reset or retry MCQ button */}
              {showResults && (
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-700 font-semibold">
                    মোট স্কোর: <span className="font-bold text-emerald-700">{score} / {total}</span> ({percentage}%) • {percentage >= 80 ? 'অসাধারণ প্রস্তুতি! 🌟' : percentage >= 50 ? 'ভালো হয়েছে, নিয়মিত অনুশীলন চালিয়ে যান। 👍' : 'আরো প্রস্তুতি প্রয়োজন। বই ও নোটস রিভিশন দিন! 📚'}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAnswers({});
                      setShowResults(false);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow transition hover:bg-indigo-500 flex items-center space-x-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>পুনরায় পরীক্ষা দিন (Re-attempt)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= SECTION B: VSAQ ================= */}
          {(activeTab === 'all' || activeTab === 'vsaq') && secB.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-50 text-teal-700 mb-1">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>বিভাগ 'খ' — অতি সংক্ষিপ্ত উত্তরভিত্তিক প্রশ্ন (VSAQ) • পূর্ণমান: {secB.length * 1}</span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  একটি বাক্যে বা এক কথায় উত্তর দাও / শূন্যস্থান পূরণ / সত্য-মিথ্যা (প্রতিটি প্রশ্নের মান ১)
                </h3>
              </div>

              <div className="space-y-4">
                {secB.map((q, qIdx) => (
                  <div key={q.id || qIdx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-800 text-xs sm:text-sm leading-relaxed">
                        <span className="font-black text-teal-700 mr-2">২.{qIdx + 1}</span>
                        {q.question}
                      </p>
                      <span className="text-xs font-mono font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                        [১ নম্বর]
                      </span>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => toggleVsaqAnswer(q.id || qIdx)}
                        className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>{expandedVsaq[q.id || qIdx] ? 'উত্তর লুকান' : 'মডেল উত্তর দেখুন'}</span>
                      </button>
                    </div>

                    {expandedVsaq[q.id || qIdx] && (
                      <div className="p-3 bg-teal-50/60 border border-teal-100 rounded-xl text-xs space-y-1 text-teal-950">
                        <p><span className="font-bold text-teal-900">উত্তর:</span> {q.answer}</p>
                        {q.explanation && (
                          <p className="text-slate-600"><span className="font-bold">ব্যাখ্যা:</span> {q.explanation}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= SECTION C: SAQ ================= */}
          {(activeTab === 'all' || activeTab === 'saq') && secC.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-50 text-purple-700 mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>বিভাগ 'গ' — সংক্ষিপ্ত উত্তরভিত্তিক প্রশ্ন (SAQ) • পূর্ণমান: {secC.length * 2}</span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  সংক্ষেপে নিম্নলিখিত প্রশ্নগুলির উত্তর দাও (প্রতিটি প্রশ্নের মান ২)
                </h3>
              </div>

              <div className="space-y-4">
                {secC.map((q, qIdx) => (
                  <div key={q.id || qIdx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-800 text-xs sm:text-sm leading-relaxed">
                        <span className="font-black text-purple-700 mr-2">৩.{qIdx + 1}</span>
                        {q.question}
                      </p>
                      <span className="text-xs font-mono font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                        [২ নম্বর]
                      </span>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => toggleSaqAnswer(q.id || qIdx)}
                        className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center space-x-1"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>{expandedSaq[q.id || qIdx] ? 'সমাধান লুকান' : 'ধাপে ধাপে আদর্শ সমাধান ও উত্তর দেখুন'}</span>
                      </button>
                    </div>

                    {expandedSaq[q.id || qIdx] && (
                      <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-xl text-xs space-y-1.5 text-purple-950">
                        <p><span className="font-bold text-purple-900">আদর্শ উত্তর:</span> {q.answer}</p>
                        {q.explanation && (
                          <p className="text-slate-600 leading-relaxed"><span className="font-bold">বিস্তারিত ব্যাখ্যা:</span> {q.explanation}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= SECTION D: LAQ ================= */}
          {(activeTab === 'all' || activeTab === 'laq') && secD.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 mb-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>বিভাগ 'ঘ' — দীর্ঘ উত্তরভিত্তিক ও গাণিতিক সমস্যা (LAQ) • পূর্ণমান: {secD.length * 4}</span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  উপপাদ্য, বিস্তৃত গাণিতিক বিশ্লেষণ ও বর্ণনামূলক প্রশ্নোত্তর (প্রতিটি প্রশ্নের মান ৪/৫)
                </h3>
              </div>

              <div className="space-y-5">
                {secD.map((q, qIdx) => (
                  <div key={q.id || qIdx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-bold text-slate-800 text-xs sm:text-sm leading-relaxed">
                        <span className="font-black text-amber-700 mr-2">৪.{qIdx + 1}</span>
                        {q.question}
                      </p>
                      <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shrink-0">
                        [{q.marks || 4} নম্বর]
                      </span>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => toggleLaqAnswer(q.id || qIdx)}
                        className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center space-x-1"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>{expandedLaq[q.id || qIdx] ? 'সমাধান লুকান' : 'বোর্ডের পূর্ণ নম্বর পাওয়ার মতো স্টেপ-বাই-স্টেপ সমাধান'}</span>
                      </button>
                    </div>

                    {expandedLaq[q.id || qIdx] && (
                      <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-xs space-y-2 text-slate-900">
                        <span className="font-bold text-amber-950 block">📝 বাবুন স্যারের ক্লাসরুম সমাধান সংকেত:</span>
                        <pre className="font-sans whitespace-pre-line text-slate-800 leading-relaxed text-xs bg-white p-3 rounded-lg border border-amber-100">
                          {q.solution || q.answer || 'এই প্রশ্নের বিশদ সমাধান টিউটোরিয়াল হোমের ক্লাসরুমে করানো হয়।'}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
