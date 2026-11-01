import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Search, Filter, Printer, Trash2, 
  CheckCircle2, Sparkles, FileText, Download, Check, Award,
  Cpu, RefreshCw, ChevronRight, Zap
} from 'lucide-react';
import { db, logAudit } from '../utils/db';
import { 
  PROCEDURAL_TOPICS, 
  generateProceduralQuestion 
} from '../engine/proceduralQuestionEngine';

export default function QuestionBankManager({ customData = {} }) {
  const [questions, setQuestions] = useState([]);
  const [filterClass, setFilterClass] = useState('Class 10');
  const [filterBoard, setFilterBoard] = useState('WBBSE');
  const [filterSubject, setFilterSubject] = useState('Physical Science');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterMarks, setFilterMarks] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection for custom paper generator
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(new Set());
  const [showTestPaperPreview, setShowTestPaperPreview] = useState(false);
  const [testPaperTitle, setTestPaperTitle] = useState('পর্যায়ক্রমিক ক্লাস টেস্ট ২০২৬');

  // Procedural Synthesis Engine State
  const [showProceduralModal, setShowProceduralModal] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState('ohms_law');
  const [generatedQuestion, setGeneratedQuestion] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQ, setNewQ] = useState({
    classLevel: 'Class 10',
    board: 'WBBSE',
    subject: 'Physical Science',
    chapter: 'আলো (Light)',
    marks: 2,
    difficulty: 'Medium',
    question: '',
    answer: '',
    formula: ''
  });
  const [statusMsg, setStatusMsg] = useState('');

  // Default seed questions for WBBSE / WBCHSE
  const SEED_QUESTIONS = [
    {
      classLevel: 'Class 10',
      board: 'WBBSE',
      subject: 'Physical Science',
      chapter: 'পরিবেশের জন্য ভাবনা',
      marks: 1,
      difficulty: 'Easy',
      question: 'বায়ুমণ্ডলের কোন স্তরে ট্রপোস্ফিয়ার এবং স্ট্র্যাটোস্ফিয়ারের মাঝে শান্তমণ্ডল দেখা যায়?',
      answer: 'স্ট্র্যাটোস্ফিয়ার স্তরে বায়ুর পরিচলন স্রোত ও ঝড়-বৃষ্টি না থাকায় একে শান্তমণ্ডল বলা হয়।',
      formula: ''
    },
    {
      classLevel: 'Class 10',
      board: 'WBBSE',
      subject: 'Physical Science',
      chapter: 'গ্যাসের আচরণ',
      marks: 2,
      difficulty: 'Medium',
      question: 'চার্লসের সূত্রটি বিবৃত করো এবং পরম শূন্য তাপমাত্রার সংজ্ঞা দাও।',
      answer: 'স্থির চাপে নির্দিষ্ট ভরের গ্যাসের আয়তন প্রতি ডিগ্রি সেলসিয়াস তাপমাত্রা বৃদ্ধি বা হ্রাসের জন্য 0°C তাপমাত্রার আয়তনের 1/273 অংশ বৃদ্ধি বা হ্রাস পায়। -273°C তাপমাত্রাকে পরম শূন্য তাপমাত্রা বলে।',
      formula: 'V_t = V_0(1 + t/273)'
    },
    {
      classLevel: 'Class 10',
      board: 'WBBSE',
      subject: 'Physical Science',
      chapter: 'আলো (Light)',
      marks: 3,
      difficulty: 'Medium',
      question: 'স্নেলের সূত্রটি লেখো। অবতল দর্পণ কীভাবে বিবর্ধিত অসদবিম্ব গঠন করে তা রশ্মিচিত্রের সাহায্যে দেখাও।',
      answer: 'প্রতিসরণের দ্বিতীয় সূত্র (স্নেলের সূত্র): নির্দিষ্ট দুটি মাধ্যম ও নির্দিষ্ট বর্ণের আলোর জন্য আপাতন কোণের সাইন এবং প্রতিসরণ কোণের সাইনের অনুপাত সর্বদা ধ্রুবক। বস্তু ফোকাস ও মেরুর মাঝে থাকলে বিবর্ধিত অসদবিম্ব গঠিত হয়।',
      formula: 'sin i / sin r = μ'
    },
    {
      classLevel: 'Class 10',
      board: 'WBBSE',
      subject: 'Physical Science',
      chapter: 'চলতড়িৎ (Current Electricity)',
      marks: 3,
      difficulty: 'Hard',
      question: 'ওহমের সূত্রটি বিবৃত করো। দুটি 10 ওহম রোধককে সমান্তরাল সমবায়ে যুক্ত করলে তুল্য রোধ কত হবে?',
      answer: 'উষ্ণতা ও অন্যান্য ভৌত অবস্থা অপরিবর্তিত থাকলে কোনো পরিবাহীর প্রবাহমাত্রা পরিবাহীর দুই প্রান্তের বিভব প্রভেদের সমানুপাতিক। সমান্তরাল সমবায়ে 1/R = 1/10 + 1/10 = 2/10, অতএব R = 5 ওহম।',
      formula: 'V = IR, 1/R = 1/R1 + 1/R2'
    },
    {
      classLevel: 'Class 10',
      board: 'WBBSE',
      subject: 'Mathematics',
      chapter: 'একচলবিশিষ্ট দ্বিঘাত সমীকরণ',
      marks: 3,
      difficulty: 'Medium',
      question: 'শ্রীধর আচার্যের সূত্রের সাহায্যে সমাধান করো: 2x² - 7x + 3 = 0',
      answer: 'x = [-b ± √(b² - 4ac)] / (2a). এখানে a=2, b=-7, c=3. নিরূপক = 49 - 24 = 25. অতএব x = (7 ± 5)/4 ⇒ x = 3 অথবা x = 1/2.',
      formula: 'x = (-b ± √(b² - 4ac)) / (2a)'
    },
    {
      classLevel: 'Class 10',
      board: 'WBBSE',
      subject: 'Mathematics',
      chapter: 'বৃত্তের স্পর্শক সংক্রান্ত উপপাদ্য',
      marks: 5,
      difficulty: 'Hard',
      question: 'প্রমাণ করো যে, বৃত্তের কোনো বিন্দুতে স্পর্শক ও স্পর্শবিন্দুগামী ব্যাসার্ধ পরস্পর লম্বভাবে অবস্থান করে।',
      answer: 'উপপাদ্য ৪০ — পাঠ্যপুস্তকের প্রমাণ অনুযায়ী স্পর্শকের উপর যেকোনো অপর বিন্দু বৃত্তের বাইরে অবস্থিত। সুতরাং স্পর্শবিন্দুগামী ব্যাসার্ধই ক্ষুদ্রতম দূরত্ব এবং তা স্পর্শকের ওপর লম্ব।',
      formula: 'OP ⊥ AB'
    }
  ];

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      if (!db.questionBank) return;
      let all = await db.questionBank.toArray();
      if (all.length === 0) {
        // Pre-populate with default high-yield questions
        for (const item of SEED_QUESTIONS) {
          await db.questionBank.add(item);
        }
        all = await db.questionBank.toArray();
      }
      setQuestions(all);
    } catch (e) {
      console.warn('Question bank load err:', e);
    }
  };

  const handleSynthesizeQuestion = () => {
    setIsGenerating(true);
    try {
      const q = generateProceduralQuestion(selectedTopicId);
      setGeneratedQuestion(q);
    } catch (err) {
      console.error('Synthesis error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProceduralToBank = async () => {
    if (!generatedQuestion) return;
    try {
      await db.questionBank.add({
        classLevel: generatedQuestion.classLevel.includes('Class 10') ? 'Class 10' : generatedQuestion.classLevel.includes('Class 8') ? 'Class 8' : 'Class 9',
        board: 'WBBSE',
        subject: generatedQuestion.subject || 'Physical Science',
        chapter: generatedQuestion.title,
        marks: generatedQuestion.marks || 2,
        difficulty: 'Medium',
        question: generatedQuestion.question,
        answer: generatedQuestion.correctAnswer || (generatedQuestion.solutionSteps || []).join(' | '),
        formula: generatedQuestion.solutionSteps?.[0] || ''
      });
      await logAudit('QUESTION_SYNTHESIZED_SAVED', 'QUESTION_BANK', generatedQuestion.title);
      setStatusMsg('✅ কৃত্রিম প্রশ্নটি সফলভাবে আপনার স্থায়ী প্রশ্নভাণ্ডারে সংরক্ষিত হয়েছে!');
      setTimeout(() => setStatusMsg(''), 3000);
      setShowProceduralModal(false);
      setGeneratedQuestion(null);
      loadQuestions();
    } catch (err) {
      alert('সংরক্ষণ ব্যর্থ: ' + err.message);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQ.question) return;

    try {
      await db.questionBank.add({
        ...newQ,
        marks: Number(newQ.marks) || 1
      });
      await logAudit('QUESTION_ADDED', 'QUESTION_BANK', `${newQ.chapter} (${newQ.marks} marks)`);
      setStatusMsg('✅ প্রশ্ন সফলভাবে প্রশ্নভাণ্ডারে যুক্ত হয়েছে!');
      setTimeout(() => setStatusMsg(''), 3000);
      setNewQ({
        classLevel: 'Class 10',
        board: 'WBBSE',
      subject: 'Physical Science',
        chapter: '',
        marks: 2,
        difficulty: 'Medium',
        question: '',
        answer: '',
        formula: ''
      });
      setShowAddForm(false);
      locadQuestions();
    } catch (err) {
      alert('নশ্ন প্রশ্ন সংরক্ষণ ব্যর্থ: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('এই প্রশ্নটি ভাণ্ডার থেকে মুছে ফেলতে চান?')) {
      await db.questionBank.delete(id);
      loadQuestions();
    }
  };

  // Toggle selection for exam paper
  const toggleSelectQuestion = (id) => {
    const next = new Set(selectedQuestionIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedQuestionIds(next);
  };

  // 1-Click quick pick: Auto select 5 questions
  const handleAutoPick5 = () => {
    const filtered = filteredQuestions.slice(0, 5);
    const ids = new Set(filtered.map(q => q.id));
    setSelectedQuestionIds(ids);
    setShowTestPaperPreview(true);
  };

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    const matchesClass = filterClass === 'All' || q.classLevel === filterClass;
    const matchesBoard = filterBoard === 'All' || q.board === filterBoard;
    const matchesSubject = filterSubject === 'All' || q.subject === filterSubject;
    const matchesDifficulty = filterDifficulty === 'All' || q.difficulty === filterDifficulty;
    const matchesMarks = filterMarks === 'All' || String(q.marks) === String(filterMarks);
    const matchesSearch = !searchQuery || 
      (q.question && q.question.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.chapter && q.chapter.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesClass && matchesBoard && matchesSubject && matchesDifficulty && matchesMarks && matchesSearch;
  });

  const selectedQuestionsList = questions.filter(q => selectedQuestionIds.has(q.id));
  const totalPaperMarks = selectedQuestionsList.reduce((a, b) => a + (Number(b.marks) || 1), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner (Print Hidden) */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 text-white p-6 rounded-3xl shadow-lg border border-indigo-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>প্রশ্ন ভাণ্ডার ও স্মার্ট প্রশ্নপত্র মেকার • QUESTION REPOSITORY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">শ্রেণিভিত্তিক অধ্যায় অনুযায়ী ক্যাটাগরাইজড প্রশ্ন ব্যাংক</h2>
          <p className="text-xs text-indigo-100 mt-1 max-w-xl">
            WBBSE / WBCHSE মাধ্যমিক ও একাদশ-দ্বাদশ শ্রেণির পদার্থবিজ্ঞান ও গণিতের প্রশ্ন ফিল্টার করুন এবং ১-ক্লিকে টেস্ট শিট তৈরি করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShowProceduralModal(true);
              if (!generatedQuestion) handleSynthesizeQuestion();
            }}
            className="px-4 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs flex items-center space-x-1.5 shadow-md transition active:scale-95"
          >
            <Cpu className="w-4 h-4 text-slate-950" />
            <span>⚡ প্রসিডিউরাল কোশ্চেন ইঞ্জিন</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 rounded-2xl bg-white text-indigo-900 font-black text-xs flex items-center space-x-1.5 shadow-md hover:bg-slate-100 transition active:scale-95"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>{showAddForm ? 'ফর্ম বন্ধ করুন' : 'নতুন প্রশ্ন যোগ করুন'}</span>
          </button>

          <button
            type="button"
            onClick={handleAutoPick5}
            className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center space-x-1.5 shadow-md transition active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>১-ক্লিকে ৫টি প্রশ্নের মক টেস্ট</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-2xl animate-fadeIn">
          {statusMsg}
        </div>
      )}

      {/* Procedural Question Synthesizer Modal / Panel */}
      {showProceduralModal && (
        <div className="bg-slate-900 text-white p-6 rounded-3xl border border-cyan-500/40 shadow-xl space-y-4 print:hidden animate-fadeIn">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h3 className="font-black text-sm text-cyan-200">
                প্রসিডিউরাল রিয়েল-টাইম প্রশ্ন সংশ্লেষণ ইঞ্জিন (Procedural Math & Physics Engine)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowProceduralModal(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕ বন্ধ করুন
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            গাণিতিক ও বৈজ্ঞানিক সূত্রানুযায়ী স্বয়ংক্রিয়ভাবে পরিবর্তনশীল সংখ্যাযুক্ত সম্পূর্ণ নির্ভুল প্রশ্ন ও স্টেপ-বাই-স্টেপ বাংলা সমাধান তৈরি করুন।
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-400 block mb-1">টপিক নির্বাচন করুন</label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-300"
              >
                {PROCEDURAL_TOPICS.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.classLevel})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSynthesizeQuestion}
                disabled={isGenerating}
                className="w-full p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-md transition active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>নতুন সংখ্যা দিয়ে তৈরি করুন</span>
              </button>
            </div>
          </div>

          {generatedQuestion && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-800/80 border border-cyan-500/30 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-black text-cyan-300">
                  {generatedQuestion.title} • {generatedQuestion.classLevel}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/50">
                  {generatedQuestion.type} ({generatedQuestion.marks} Marks)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white leading-relaxed">
                {generatedQuestion.question}
              </div>

              {generatedQuestion.options && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {generatedQuestion.options.map((opt, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-800 border border-slate-700 font-mono text-slate-300">
                      ({String.fromCharCode(65 + i)}) {opt}
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-200 space-y-1">
                <span className="font-bold text-emerald-300 block">সঠিক উত্তর ও সমাধান ধাপ:</span>
                <p className="font-bold text-white">{generatedQuestion.correctAnswer}</p>
                {generatedQuestion.solutionSteps && (
                  <ul className="list-disc list-inside space-y-0.5 text-emerald-300/80 text-[11px] pt-1">
                    {generatedQuestion.solutionSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveProceduralToBank}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition active:scale-95 flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>প্রশ্নভাণ্ডারে সেভ করুন</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Form (Print Hidden) */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-3xl border border-indigo-200 shadow-sm space-y-4 print:hidden animate-fadeIn">
          <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>প্রশ্ন ভাণ্ডারে নতুন প্রশ্ন যুক্ত করুন</span>
          </h3>

          <form onSubmit={handleAddQuestion} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">শ্রেণি / লেভেল</label>
              <select
                value={newQ.classLevel}
                onChange={(e) => setNewQ({ ...newQ, classLevel: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
              >
                {['Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">বোর্ড</label>
              <select
                value={newQ.board}
                onChange={(e) => setNewQ({ ...newQ, board: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
              >
                <option value="WBBSE">WBBSE (মাধ্যমিক)</option>
                <option value="WBCHSE">WBCHSE (উচ্চমাধ্যমিক)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">বিষয়</label>
              <select
                value={newQ.subject}
                onChange={(e) => setNewQ({ ...newQ, subject: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
              >
                  <option value="Physical Science">ভৌতবিজ্ঞান (Physical Science)</option>
                <option value="Mathematics">গণিত (Mathematics)</option>
                <option value="Life Science">জীবনবিজ্ঞান (Life Science)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">অধ্যায় / চ্যাপ্টার</label>
              <input
                type="text"
                placeholder="যেমন: গ্যাসের আচরণ / আলো / সমীকরণ"
                value={newQ.chapter}
                onChange={(e) => setNewQ({ ...newQ, chapter: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white text-slate-900"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">মান (Marks)</label>
              <select
                value={newQ.marks}
                onChange={(e) => setNewQ({ ...newQ, marks: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
              >
                <option value={1}>১ নম্বর (MCQ / অতিসংক্ষিপ্ত)</option>
                <option value={2}>২ নম্বর (সংক্ষিপ্ত / গাণিতিক)</option>
                <option value={3}>৩ নম্বর (ব্যাখ্যামূলক)</option>
                <option value={5}>৫ নম্বর (দীর্ঘ উত্তরধর্মী / উপপাদ্য)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">কাঠিন্য (Difficulty)</label>
              <select
                value={newQ.difficulty}
                onChange={(e) => setNewQ({ ...newQ, difficulty: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
              >
                <option value="Easy">সহজ (Easy)</option>
                <option value="Medium">মাঝারি (Medium)</option>
                <option value="Hard">কঠিন (Hard)</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="text-xs font-bold text-slate-600 block mb-1">প্রশ্ন</label>
              <textarea
                rows={2}
                placeholder="প্রশ্নের বয়ান বাংলায় লিখুন..."
                value={newQ.question}
                onChange={(e) => setNewQ({ ...newQ, question: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white text-slate-900"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-600 block mb-1">মডেল উত্তর / হিন্ট</label>
              <input
                type="text"
                placeholder="সংক্ষিপ্ত সমাধান বা উত্তরের মূল পয়েন্ট..."
                value={newQ.answer}
                onChange={(e) => setNewQ({ ...newQ, answer: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">সূত্র / সূত্র সংকেত (যদি থাকে)</label>
              <input
                type="text"
                placeholder="যেমন: PV = nRT"
                value={newQ.formula}
                onChange={(e) => setNewQ({ ...newQ, formula: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono bg-white text-slate-900"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition active:scale-95"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Bar (Print Hidden) */}
      <div className="bg-slate-100 p-4 rounded-3xl flew flex-wrap items-center gap-3 text-xs print:hidden">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="প্রশ্ন বা অধ্যায় অনুসন্ধান..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 px-3 rounded-xl border border-slate-300 bg-white text-slate-900"
          />
        </div>

        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="p-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-700"
        >
          <option value="All">সকল শ্রেণি</option>
          {['Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="p-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-700"
        >
          <option value="All">সকল বিষয়</option>
          <option value="Physical Science">ভৌতবিজ্ঞান</option>
          <option value="Mathematics">গণিত</option>
          <option value="Life Science">জীবনবিজ্ঞান</option>
        </select>

        <select
          value={filterMarks}
          onChange={(e) => setFilterMarks(e.target.value)}
          className="p-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-700"
        >
          <option value="All">সকল মান (Marks)</option>
          <option value="1">১ নম্বর</option>
          <option value="2">২ নম্বর</option>
          <option value="3">৩ নম্বর</option>
          <option value="5">৫ নম্বর</option>
        </select>

        {selectedQuestionIds.size > 0 && (
          <button
            type="button"
            onClick={() => setShowTestPaperPreview(!showTestPaperPreview)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md transition active:scale-95 flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>নির্বাচিত {selectedQuestionIds.size}টি প্রশ্নের টেস্ট শিট</span>
          </button>
        )}
      </div>

      {/* ================= 1-CLICK CUSTOM EXAM PAPER PREVIEW (PRINT READY) ================= */}
      {showTestPaperPreview && (
        <div className="bg-white p-8 rounded-3xl border-2 border-indigo-300 shadow-xl space-y-6 print:border-none print:shadow-none print:p-0">
          <div className="flex justify-between items-center print:hidden border-b pb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full">
                প্রিন্ট প্রিভিউ মোড
              </span>
              <span className="text-xs text-slate-500">
                মোট প্রশ্ন: {selectedQuestionsList.length} টি • পূর্ণমান: {totalPaperMarks}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট করুন (A4)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowTestPaperPreview(false)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                প্রিভিউ বন্ধ করুন
              </button>
            </div>
          </div>

          {/* Institutional Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-wide">B.G. TUTORIAL HOME</h1>
            <p className="text-xs text-slate-600 font-medium">শিক্ষক: বাপুন ঘোষ • দক্ষিণ হাবড়া, উত্তর ২৪ পরগনা • ফোন: {customData.phone || '9733974425'}</p>
            <div className="pt-2 flex justify-between items-center text-xs font-bold text-slate-800 border-t border-slate-200 mt-2">
              <span>{testPaperTitle}</span>
              <span>শ্রেণি: {filterClass}</span>
              <span>পূর্ণমান: {totalPaperMarks}</span>
              <span>সময়: {totalPaperMarks > 20 ? '১ ঘণ্টা' : '৩০ মিনিট'}</span>
            </div>
          </div>

          {/* Student details line */}
          <div className="flex justify-between text-xs text-slate-700 border-b border-dashed border-slate-300 pb-2">
            <span>নাম: _____________________________________</span>
            <span>রোল: ________</span>
            <span>তারিখ: _________</span>
          </div>

          {/* Questions List */}
          <div className="space-y-4 text-xs leading-relaxed">
            {selectedQuestionsList.map((q, idx) => (
              <div key={q.id} className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-slate-900 font-medium">
                    <span className="font-extrabold mr-2">{idx + 1}.</span>
                    <span>{q.question}</span>
                  </div>
                  {q.formula && (
                    <span className="text-[10px] text-slate-400 font-mono block">
                      [সংকেত / সূত্র: {q.formula}]
                    </span>
                  )}
                </div>
                <div className="font-bold text-slate-700 shrink-0 font-mono">
                  [{q.marks}]
                </div>
              </div>
            ))}
          </div>

          {/* Model Answer Key & Marking Scheme (Print Optional) */}
          <div className="mt-8 pt-4 border-t-2 border-slate-800 text-xs space-y-2">
            <span className="font-black text-slate-900 block uppercase tracking-wider text-[11px]">
              ???????? ???? ????? ? ??????? ????? (TEACHER'S ANSWER KEY):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-600">
              {selectedQuestionsList.map((q, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                  <span className="font-bold text-slate-900">{idx + 1}. {q.chapter} ({q.marks} ?????):</span>
                  <p className="text-slate-700">{q.answer || '???? ????? ?????? ?????? ??????'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Questions Repository List */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>???????? ?????? ??????? ({filteredQuestions.length} ?? ??????)</span>
          </h3>
          <span className="text-xs text-slate-500">
            ?????? ????? ???? ????? ???????? ????? ????
          </span>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-slate-200">
            ?? ???????? ???? ?????? ????? ?????? ???? ?????? ????? ???? ????? ????? ????? ?????
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredQuestions.map((q) => {
              const isSelected = selectedQuestionIds.has(q.id);
              return (
                <div key={q.id} className="py-3.5 flex items-start justify-between gap-3 text-xs hover:bg-slate-50/70 p-2 rounded-2xl transition">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectQuestion(q.id)}
                      className="mt-1 rounded text-indigo-600 w-4 h-4 cursor-pointer"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-black">
                          {q.classLevel}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {q.subject}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                          {q.chapter}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-black">
                          {q.marks} ?????
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                          q.difficulty === 'Medium' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="font-extrabold text-slate-900 text-sm mt-1">{q.question}</p>
                      {q.answer && (
                        <p className="text-slate-600 text-xs">
                          <span className="font-bold text-slate-700">?????/?????:</span> {q.answer}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDelete(q.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                      title="?????"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
