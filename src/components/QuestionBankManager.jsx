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
  const [testPaperTitle, setTestPaperTitle] = useState('ржкрж░рзНржпрж╛ржпрж╝ржХрзНрж░ржорж┐ржХ ржХрзНрж▓рж╛рж╕ ржЯрзЗрж╕рзНржЯ рзирзжрзирзм');

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
    chapter: 'ржЖрж▓рзЛ (Light)',
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
      chapter: 'ржкрж░рж┐ржмрзЗрж╢рзЗрж░ ржЬржирзНржп ржнрж╛ржмржирж╛',
      marks: 1,
      difficulty: 'Easy',
      question: 'ржмрж╛ржпрж╝рзБржоржгрзНржбрж▓рзЗрж░ ржХрзЛржи рж╕рзНрждрж░рзЗ ржЯрзНрж░ржкрзЛрж╕рзНржлрж┐ржпрж╝рж╛рж░ ржПржмржВ рж╕рзНржЯрзНрж░рзНржпрж╛ржЯрзЛрж╕рзНржлрж┐ржпрж╝рж╛рж░рзЗрж░ ржорж╛ржЭрзЗ рж╢рж╛ржирзНрждржоржгрзНржбрж▓ ржжрзЗржЦрж╛ ржпрж╛ржпрж╝?',
      answer: 'рж╕рзНржЯрзНрж░рзНржпрж╛ржЯрзЛрж╕рзНржлрж┐ржпрж╝рж╛рж░ рж╕рзНрждрж░рзЗ ржмрж╛ржпрж╝рзБрж░ ржкрж░рж┐ржЪрж▓ржи рж╕рзНрж░рзЛржд ржУ ржЭржбрж╝-ржмрзГрж╖рзНржЯрж┐ ржирж╛ ржерж╛ржХрж╛ржпрж╝ ржПржХрзЗ рж╢рж╛ржирзНрждржоржгрзНржбрж▓ ржмрж▓рж╛ рж╣ржпрж╝ред',
      formula: ''
    },
    {
      classLevel: 'Class 10',
      board: 'WBBSE',
      subject: 'Physical Science',
      chapter: 'ржЧрзНржпрж╛рж╕рзЗрж░ ржЖржЪрж░ржг',
      marks: 2,
      difficulty: 'Medium',
      question: 'ржЪрж╛рж░рзНрж▓рж╕рзЗрж░ рж╕рзВрждрзНрж░ржЯрж┐ ржмрж┐ржмрзГржд ржХрж░рзЛ ржПржмржВ ржкрж░ржо рж╢рзВржирзНржп рждрж╛ржкржорж╛рждрзНрж░рж╛рж░ рж╕ржВржЬрзНржЮрж╛ ржжрж╛ржУред',
      answer: 'рж╕рзНржерж┐рж░ ржЪрж╛ржкрзЗ ржирж┐рж░рзНржжрж┐рж╖рзНржЯ ржнрж░рзЗрж░ ржЧрзНржпрж╛рж╕рзЗрж░ ржЖржпрж╝рждржи ржкрзНрж░рждрж┐ ржбрж┐ржЧрзНрж░рж┐ рж╕рзЗрж▓рж╕рж┐ржпрж╝рж╛рж╕ рждрж╛ржкржорж╛рждрзНрж░рж╛ ржмрзГржжрзНржзрж┐ ржмрж╛ рж╣рзНрж░рж╛рж╕рзЗрж░ ржЬржирзНржп 0┬░C рждрж╛ржкржорж╛рждрзНрж░рж╛рж░ ржЖржпрж╝рждржирзЗрж░ 1/273 ржЕржВрж╢ ржмрзГржжрзНржзрж┐ ржмрж╛ рж╣рзНрж░рж╛рж╕ ржкрж╛ржпрж╝ред -273┬░C рждрж╛ржкржорж╛рждрзНрж░рж╛ржХрзЗ ржкрж░ржо рж╢рзВржирзНржп рждрж╛ржкржорж╛рждрзНрж░рж╛ ржмрж▓рзЗред',
      formula: 'V_t = V_0(1 + t/273)'
    },
    {
      classLevel: 'Class 10',
      board: 'WBBSE',
      subject: 'Physical Science',
      chapter: 'ржЖрж▓рзЛ (Light)',
      marks: 3,
      difficulty: 'Medium',
      question: 'рж╕рзНржирзЗрж▓рзЗрж░ рж╕рзВрждрзНрж░ржЯрж┐ рж▓рзЗржЦрзЛред ржЕржмрждрж▓ ржжрж░рзНржкржг ржХрзАржнрж╛ржмрзЗ ржмрж┐ржмрж░рзНржзрж┐ржд ржЕрж╕ржжржмрж┐ржорзНржм ржЧржаржи ржХрж░рзЗ рждрж╛ рж░рж╢рзНржорж┐ржЪрж┐рждрзНрж░рзЗрж░ рж╕рж╛рж╣рж╛ржпрзНржпрзЗ ржжрзЗржЦрж╛ржУред',
      answer: 'ржкрзНрж░рждрж┐рж╕рж░ржгрзЗрж░ ржжрзНржмрж┐рждрзАржпрж╝ рж╕рзВрждрзНрж░ (рж╕рзНржирзЗрж▓рзЗрж░ рж╕рзВрждрзНрж░): ржирж┐рж░рзНржжрж┐рж╖рзНржЯ ржжрзБржЯрж┐ ржорж╛ржзрзНржпржо ржУ ржирж┐рж░рзНржжрж┐рж╖рзНржЯ ржмрж░рзНржгрзЗрж░ ржЖрж▓рзЛрж░ ржЬржирзНржп ржЖржкрж╛рждржи ржХрзЛржгрзЗрж░ рж╕рж╛ржЗржи ржПржмржВ ржкрзНрж░рждрж┐рж╕рж░ржг ржХрзЛржгрзЗрж░ рж╕рж╛ржЗржирзЗрж░ ржЕржирзБржкрж╛ржд рж╕рж░рзНржмржжрж╛ ржзрзНрж░рзБржмржХред ржмрж╕рзНрждрзБ ржлрзЛржХрж╛рж╕ ржУ ржорзЗрж░рзБрж░ ржорж╛ржЭрзЗ ржерж╛ржХрж▓рзЗ ржмрж┐ржмрж░рзНржзрж┐ржд ржЕрж╕ржжржмрж┐ржорзНржм ржЧржарж┐ржд рж╣ржпрж╝ред',
      formula: 'sin i / sin r = ╬╝'
    },
    {
      classLevel: 'Class 10',
      board: 'WBBSE',
      subject: 'Physical Science',
      chapter: 'ржЪрж▓рждрзЬрж┐рзО (Current Electricity)',
      marks: 3,
      difficulty: 'Hard',
      question: 'ржУрж╣ржорзЗрж░ рж╕рзВрждрзНрж░ржЯрж┐ ржмрж┐ржмрзГржд ржХрж░рзЛред ржжрзБржЯрж┐ 10 ржУрж╣ржо рж░рзЛржзржХржХрзЗ рж╕ржорж╛ржирзНрждрж░рж╛рж▓ рж╕ржоржмрж╛ржпрж╝рзЗ ржпрзБржХрзНржд ржХрж░рж▓рзЗ рждрзБрж▓рзНржп рж░рзЛржз ржХржд рж╣ржмрзЗ?',
      answer: 'ржЙрж╖рзНржгрждрж╛ ржУ ржЕржирзНржпрж╛ржирзНржп ржнрзМржд ржЕржмрж╕рзНржерж╛ ржЕржкрж░рж┐ржмрж░рзНрждрж┐ржд ржерж╛ржХрж▓рзЗ ржХрзЛржирзЛ ржкрж░рж┐ржмрж╛рж╣рзАрж░ ржкрзНрж░ржмрж╛рж╣ржорж╛рждрзНрж░рж╛ ржкрж░рж┐ржмрж╛рж╣рзАрж░ ржжрзБржЗ ржкрзНрж░рж╛ржирзНрждрзЗрж░ ржмрж┐ржнржм ржкрзНрж░ржнрзЗржжрзЗрж░ рж╕ржорж╛ржирзБржкрж╛рждрж┐ржХред рж╕ржорж╛ржирзНрждрж░рж╛рж▓ рж╕ржоржмрж╛ржпрж╝рзЗ 1/R = 1/10 + 1/10 = 2/10, ржЕрждржПржм R = 5 ржУрж╣ржоред',
      formula: 'V = IR, 1/R = 1/R1 + 1/R2'
    },
    {
      classLevel: 'Class 10',
      board: 'WBBSE',
      subject: 'Mathematics',
      chapter: 'ржПржХржЪрж▓ржмрж┐рж╢рж┐рж╖рзНржЯ ржжрзНржмрж┐ржШрж╛ржд рж╕ржорзАржХрж░ржг',
      marks: 3,
      difficulty: 'Medium',
      question: 'рж╢рзНрж░рзАржзрж░ ржЖржЪрж╛рж░рзНржпрзЗрж░ рж╕рзВрждрзНрж░рзЗрж░ рж╕рж╛рж╣рж╛ржпрзНржпрзЗ рж╕ржорж╛ржзрж╛ржи ржХрж░рзЛ: 2x┬▓ - 7x + 3 = 0',
      answer: 'x = [-b ┬▒ тИЪ(b┬▓ - 4ac)] / (2a). ржПржЦрж╛ржирзЗ a=2, b=-7, c=3. ржирж┐рж░рзВржкржХ = 49 - 24 = 25. ржЕрждржПржм x = (7 ┬▒ 5)/4 тЗТ x = 3 ржЕржержмрж╛ x = 1/2.',
      formula: 'x = (-b ┬▒ тИЪ(b┬▓ - 4ac)) / (2a)'
    },
    {
      classLevel: 'Class 10',
      board: 'WBBSE',
      subject: 'Mathematics',
      chapter: 'ржмрзГрждрзНрждрзЗрж░ рж╕рзНржкрж░рзНрж╢ржХ рж╕ржВржХрзНрж░рж╛ржирзНржд ржЙржкржкрж╛ржжрзНржп',
      marks: 5,
      difficulty: 'Hard',
      question: 'ржкрзНрж░ржорж╛ржг ржХрж░рзЛ ржпрзЗ, ржмрзГрждрзНрждрзЗрж░ ржХрзЛржирзЛ ржмрж┐ржирзНржжрзБрждрзЗ рж╕рзНржкрж░рзНрж╢ржХ ржУ рж╕рзНржкрж░рзНрж╢ржмрж┐ржирзНржжрзБржЧрж╛ржорзА ржмрзНржпрж╛рж╕рж╛рж░рзНржз ржкрж░рж╕рзНржкрж░ рж▓ржорзНржмржнрж╛ржмрзЗ ржЕржмрж╕рзНржерж╛ржи ржХрж░рзЗред',
      answer: 'ржЙржкржкрж╛ржжрзНржп рзкрзж тАФ ржкрж╛ржарзНржпржкрзБрж╕рзНрждржХрзЗрж░ ржкрзНрж░ржорж╛ржг ржЕржирзБржпрж╛рзЯрзА рж╕рзНржкрж░рзНрж╢ржХрзЗрж░ ржЙржкрж░ ржпрзЗржХрзЛржирзЛ ржЕржкрж░ ржмрж┐ржирзНржжрзБ ржмрзГрждрзНрждрзЗрж░ ржмрж╛ржЗрж░рзЗ ржЕржмрж╕рзНржерж┐рждред рж╕рзБрждрж░рж╛ржВ рж╕рзНржкрж░рзНрж╢ржмрж┐ржирзНржжрзБржЧрж╛ржорзА ржмрзНржпрж╛рж╕рж╛рж░рзНржзржЗ ржХрзНрж╖рзБржжрзНрж░рждржо ржжрзВрж░рждрзНржм ржПржмржВ рждрж╛ рж╕рзНржкрж░рзНрж╢ржХрзЗрж░ ржУржкрж░ рж▓ржорзНржмред',
      formula: 'OP тКе AB'
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
      setStatusMsg('тЬЕ ржХрзГрждрзНрж░рж┐ржо ржкрзНрж░рж╢рзНржиржЯрж┐ рж╕ржлрж▓ржнрж╛ржмрзЗ ржЖржкржирж╛рж░ рж╕рзНржерж╛ржпрж╝рзА ржкрзНрж░рж╢рзНржиржнрж╛ржгрзНржбрж╛рж░рзЗ рж╕ржВрж░ржХрзНрж╖рж┐ржд рж╣ржпрж╝рзЗржЫрзЗ!');
      setTimeout(() => setStatusMsg(''), 3000);
      setShowProceduralModal(false);
      setGeneratedQuestion(null);
      loadQuestions();
    } catch (err) {
      alert('рж╕ржВрж░ржХрзНрж╖ржг ржмрзНржпрж░рзНрже: ' + err.message);
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
      setStatusMsg('тЬЕ ржкрзНрж░рж╢рзНржи рж╕ржлрж▓ржнрж╛ржмрзЗ ржкрзНрж░рж╢рзНржиржнрж╛ржгрзНржбрж╛рж░рзЗ ржпрзБржХрзНржд рж╣ржпрж╝рзЗржЫрзЗ!');
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
      alert('ржирж╢рзНржи ржкрзНрж░рж╢рзНржи рж╕ржВрж░ржХрзНрж╖ржг ржмрзНржпрж░рзНрже: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('ржПржЗ ржкрзНрж░рж╢рзНржиржЯрж┐ ржнрж╛ржгрзНржбрж╛рж░ ржерзЗржХрзЗ ржорзБржЫрзЗ ржлрзЗрж▓рждрзЗ ржЪрж╛ржи?')) {
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
            <span>ржкрзНрж░рж╢рзНржи ржнрж╛ржгрзНржбрж╛рж░ ржУ рж╕рзНржорж╛рж░рзНржЯ ржкрзНрж░рж╢рзНржиржкрждрзНрж░ ржорзЗржХрж╛рж░ тАв QUESTION REPOSITORY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">рж╢рзНрж░рзЗржгрж┐ржнрж┐рждрзНрждрж┐ржХ ржЕржзрзНржпрж╛ржпрж╝ ржЕржирзБржпрж╛ржпрж╝рзА ржХрзНржпрж╛ржЯрж╛ржЧрж░рж╛ржЗржЬржб ржкрзНрж░рж╢рзНржи ржмрзНржпрж╛ржВржХ</h2>
          <p className="text-xs text-indigo-100 mt-1 max-w-xl">
            WBBSE / WBCHSE ржорж╛ржзрзНржпржорж┐ржХ ржУ ржПржХрж╛ржжрж╢-ржжрзНржмрж╛ржжрж╢ рж╢рзНрж░рзЗржгрж┐рж░ ржкржжрж╛рж░рзНржержмрж┐ржЬрзНржЮрж╛ржи ржУ ржЧржгрж┐рждрзЗрж░ ржкрзНрж░рж╢рзНржи ржлрж┐рж▓рзНржЯрж╛рж░ ржХрж░рзБржи ржПржмржВ рзз-ржХрзНрж▓рж┐ржХрзЗ ржЯрзЗрж╕рзНржЯ рж╢рж┐ржЯ рждрзИрж░рж┐ ржХрж░рзБржиред
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
            <span>тЪб ржкрзНрж░рж╕рж┐ржбрж┐ржЙрж░рж╛рж▓ ржХрзЛрж╢рзНржЪрзЗржи ржЗржЮрзНржЬрж┐ржи</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 rounded-2xl bg-white text-indigo-900 font-black text-xs flex items-center space-x-1.5 shadow-md hover:bg-slate-100 transition active:scale-95"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>{showAddForm ? 'ржлрж░рзНржо ржмржирзНржз ржХрж░рзБржи' : 'ржирждрзБржи ржкрзНрж░рж╢рзНржи ржпрзЛржЧ ржХрж░рзБржи'}</span>
          </button>

          <button
            type="button"
            onClick={handleAutoPick5}
            className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center space-x-1.5 shadow-md transition active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>рзз-ржХрзНрж▓рж┐ржХрзЗ рзлржЯрж┐ ржкрзНрж░рж╢рзНржирзЗрж░ ржоржХ ржЯрзЗрж╕рзНржЯ</span>
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
                ржкрзНрж░рж╕рж┐ржбрж┐ржЙрж░рж╛рж▓ рж░рж┐ржпрж╝рзЗрж▓-ржЯрж╛ржЗржо ржкрзНрж░рж╢рзНржи рж╕ржВрж╢рзНрж▓рзЗрж╖ржг ржЗржЮрзНржЬрж┐ржи (Procedural Math & Physics Engine)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowProceduralModal(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              тЬХ ржмржирзНржз ржХрж░рзБржи
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            ржЧрж╛ржгрж┐рждрж┐ржХ ржУ ржмрзИржЬрзНржЮрж╛ржирж┐ржХ рж╕рзВрждрзНрж░рж╛ржирзБржпрж╛ржпрж╝рзА рж╕рзНржмржпрж╝ржВржХрзНрж░рж┐ржпрж╝ржнрж╛ржмрзЗ ржкрж░рж┐ржмрж░рзНрждржирж╢рзАрж▓ рж╕ржВржЦрзНржпрж╛ржпрзБржХрзНржд рж╕ржорзНржкрзВрж░рзНржг ржирж┐рж░рзНржнрзБрж▓ ржкрзНрж░рж╢рзНржи ржУ рж╕рзНржЯрзЗржк-ржмрж╛ржЗ-рж╕рзНржЯрзЗржк ржмрж╛ржВрж▓рж╛ рж╕ржорж╛ржзрж╛ржи рждрзИрж░рж┐ ржХрж░рзБржиред
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-400 block mb-1">ржЯржкрж┐ржХ ржирж┐рж░рзНржмрж╛ржЪржи ржХрж░рзБржи</label>
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
                <span>ржирждрзБржи рж╕ржВржЦрзНржпрж╛ ржжрж┐ржпрж╝рзЗ рждрзИрж░рж┐ ржХрж░рзБржи</span>
              </button>
            </div>
          </div>

          {generatedQuestion && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-800/80 border border-cyan-500/30 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-black text-cyan-300">
                  {generatedQuestion.title} тАв {generatedQuestion.classLevel}
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
                <span className="font-bold text-emerald-300 block">рж╕ржарж┐ржХ ржЙрждрзНрждрж░ ржУ рж╕ржорж╛ржзрж╛ржи ржзрж╛ржк:</span>
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
                  <span>ржкрзНрж░рж╢рзНржиржнрж╛ржгрзНржбрж╛рж░рзЗ рж╕рзЗржн ржХрж░рзБржи</span>
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
            <span>ржкрзНрж░рж╢рзНржи ржнрж╛ржгрзНржбрж╛рж░рзЗ ржирждрзБржи ржкрзНрж░рж╢рзНржи ржпрзБржХрзНржд ржХрж░рзБржи</span>
          </h3>

          <form onSubmit={handleAddQuestion} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">рж╢рзНрж░рзЗржгрж┐ / рж▓рзЗржнрзЗрж▓</label>
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
              <label className="text-xs font-bold text-slate-600 block mb-1">ржмрзЛрж░рзНржб</label>
              <select
                value={newQ.board}
                onChange={(e) => setNewQ({ ...newQ, board: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
              >
                <option value="WBBSE">WBBSE (ржорж╛ржзрзНржпржорж┐ржХ)</option>
                <option value="WBCHSE">WBCHSE (ржЙржЪрзНржЪржорж╛ржзрзНржпржорж┐ржХ)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">ржмрж┐рж╖ржпрж╝</label>
              <select
                value={newQ.subject}
                onChange={(e) => setNewQ({ ...newQ, subject: e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
              >
                  <option value="Physical Science">ржнрзМрждржмрж┐ржЬрзНржЮрж╛ржи (Physical Science)</option>
                <option value="Mathematics">ржЧржгрж┐ржд (Mathematics)</option>
                <option value="Life Science">ржЬрзАржмржиржмрж┐ржЬрзНржЮрж╛ржи (Life Science)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">ржЕржзрзНржпрж╛ржпрж╝ / ржЪрзНржпрж╛ржкрзНржЯрж╛рж░</label>
              <input
                type="text"
                placeholder="ржпрзЗржоржи: ржЧрзНржпрж╛рж╕рзЗрж░ ржЖржЪрж░ржг / ржЖрж▓рзЛ / рж╕ржорзАржХрж░ржг"
                value={newQ.chapter}
                onChange={(e) => setNewQ({ ...newQ, chapter: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white text-slate-900"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">ржорж╛ржи (Marks)</label>
              <select
                value={newQ.marks}
                onChange={(e) => setNewQ({ ...newQ, marks: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
              >
                <option value={1}>рзз ржиржорзНржмрж░ (MCQ / ржЕрждрж┐рж╕ржВржХрзНрж╖рж┐ржкрзНржд)</option>
                <option value={2}>рзи ржиржорзНржмрж░ (рж╕ржВржХрзНрж╖рж┐ржкрзНржд / ржЧрж╛ржгрж┐рждрж┐ржХ)</option>
                <option value={3}>рзй ржиржорзНржмрж░ (ржмрзНржпрж╛ржЦрзНржпрж╛ржорзВрж▓ржХ)</option>
                <option value={5}>рзл ржиржорзНржмрж░ (ржжрзАрж░рзНржШ ржЙрждрзНрждрж░ржзрж░рзНржорзА / ржЙржкржкрж╛ржжрзНржп)</option>
              </select>
            </div>

            <div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">ржХрж╛ржарж┐ржирзНржп (Difficulty)</label>
              <select
                value={newQ.difficulty}
                onChange={(e) => setNewQ({ ...newQ, difficulty: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
              >
                <option value="Easy">рж╕рж╣ржЬ (Easy)</option>
                <option value="Medium">ржорж╛ржЭрж╛рж░рж┐ (Medium)</option>
                <option value="Hard">ржХржарж┐ржи (Hard)</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="text-xs font-bold text-slate-600 block mb-1">ржкрзНрж░рж╢рзНржи</label>
              <textarea
                rows={2}
                placeholder="ржкрзНрж░рж╢рзНржирзЗрж░ ржмржпрж╝рж╛ржи ржмрж╛ржВрж▓рж╛ржпрж╝ рж▓рж┐ржЦрзБржи..."
                value={newQ.question}
                onChange={(e) => setNewQ({ ...newQ, question: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white text-slate-900"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-600 block mb-1">ржоржбрзЗрж▓ ржЙрждрзНрждрж░ / рж╣рж┐ржирзНржЯ</label>
              <input
                type="text"
                placeholder="рж╕ржВржХрзНрж╖рж┐ржкрзНржд рж╕ржорж╛ржзрж╛ржи ржмрж╛ ржЙрждрзНрждрж░рзЗрж░ ржорзВрж▓ ржкржпрж╝рзЗржирзНржЯ..."
                value={newQ.answer}
                onChange={(e) => setNewQ({ ...newQ, answer: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">рж╕рзВрждрзНрж░ / рж╕рзВрждрзНрж░ рж╕ржВржХрзЗржд (ржпржжрж┐ ржерж╛ржХрзЗ)</label>
              <input
                type="text"
                placeholder="ржпрзЗржоржи: PV = nRT"
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
                ржмрж╛рждрж┐рж▓
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition active:scale-95"
              >
                рж╕ржВрж░ржХрзНрж╖ржг ржХрж░рзБржи
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
            placeholder="ржкрзНрж░рж╢рзНржи ржмрж╛ ржЕржзрзНржпрж╛ржпрж╝ ржЕржирзБрж╕ржирзНржзрж╛ржи..."
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
          <option value="All">рж╕ржХрж▓ рж╢рзНрж░рзЗржгрж┐</option>
          {['Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="p-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-700"
        >
          <option value="All">рж╕ржХрж▓ ржмрж┐рж╖ржпрж╝</option>
          <option value="Physical Science">ржнрзМрждржмрж┐ржЬрзНржЮрж╛ржи</option>
          <option value="Mathematics">ржЧржгрж┐ржд</option>
          <option value="Life Science">ржЬрзАржмржиржмрж┐ржЬрзНржЮрж╛ржи</option>
        </select>

        <select
          value={filterMarks}
          onChange={(e) => setFilterMarks(e.target.value)}
          className="p-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-700"
        >
          <option value="All">рж╕ржХрж▓ ржорж╛ржи (Marks)</option>
          <option value="1">рзз ржиржорзНржмрж░</option>
          <option value="2">рзи ржиржорзНржмрж░</option>
          <option value="3">рзй ржиржорзНржмрж░</option>
          <option value="5">рзл ржиржорзНржмрж░</option>
        </select>

        {selectedQuestionIds.size > 0 && (
          <button
            type="button"
            onClick={() => setShowTestPaperPreview(!showTestPaperPreview)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md transition active:scale-95 flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>ржирж┐рж░рзНржмрж╛ржЪрж┐ржд {selectedQuestionIds.size}ржЯрж┐ ржкрзНрж░рж╢рзНржирзЗрж░ ржЯрзЗрж╕рзНржЯ рж╢рж┐ржЯ</span>
          </button>
        )}
      </div>

      {/* ================= 1-CLICK CUSTOM EXAM PAPER PREVIEW (PRINT READY) ================= */}
      {showTestPaperPreview && (
        <div className="bg-white p-8 rounded-3xl border-2 border-indigo-300 shadow-xl space-y-6 print:border-none print:shadow-none print:p-0">
          <div className="flex justify-between items-center print:hidden border-b pb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full">
                ржкрзНрж░рж┐ржирзНржЯ ржкрзНрж░рж┐ржнрж┐ржЙ ржорзЛржб
              </span>
              <span className="text-xs text-slate-500">
                ржорзЛржЯ ржкрзНрж░рж╢рзНржи: {selectedQuestionsList.length} ржЯрж┐ тАв ржкрзВрж░рзНржгржорж╛ржи: {totalPaperMarks}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>ржкрзНрж░рж┐ржирзНржЯ ржХрж░рзБржи (A4)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowTestPaperPreview(false)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                ржкрзНрж░рж┐ржнрж┐ржЙ ржмржирзНржз ржХрж░рзБржи
              </button>
            </div>
          </div>

          {/* Institutional Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-wide">B.G. TUTORIAL HOME</h1>
            <p className="text-xs text-slate-600 font-medium">рж╢рж┐ржХрзНрж╖ржХ: ржмрж╛ржкрзБржи ржШрзЛрж╖ тАв ржжржХрзНрж╖рж┐ржг рж╣рж╛ржмржбрж╝рж╛, ржЙрждрзНрждрж░ рзирзк ржкрж░ржЧржирж╛ тАв ржлрзЛржи: {customData.phone || '9733974425'}</p>
            <div className="pt-2 flex justify-between items-center text-xs font-bold text-slate-800 border-t border-slate-200 mt-2">
              <span>{testPaperTitle}</span>
              <span>рж╢рзНрж░рзЗржгрж┐: {filterClass}</span>
              <span>ржкрзВрж░рзНржгржорж╛ржи: {totalPaperMarks}</span>
              <span>рж╕ржоржпрж╝: {totalPaperMarks > 20 ? 'рзз ржШржгрзНржЯрж╛' : 'рзйрзж ржорж┐ржирж┐ржЯ'}</span>
            </div>
          </div>

          {/* Student details line */}
          <div className="flex justify-between text-xs text-slate-700 border-b border-dashed border-slate-300 pb-2">
            <span>ржирж╛ржо: _____________________________________</span>
            <span>рж░рзЛрж▓: ________</span>
            <span>рждрж╛рж░рж┐ржЦ: _________</span>
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
                      [рж╕ржВржХрзЗржд / рж╕рзВрждрзНрж░: {q.formula}]
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
              рж╢рж┐ржХрзНрж╖ржХ ржорЪЗВЮВЪ╚ГВЪ'ВЪУВЮ7ВЪУВЪ└ГВЪLГВЪ╗ВЪ√ВЪ├ВЮ7ВЪWВЪ ВЪГВЪуВЮ7ВЪWВЪ ВЪ╕АбQ!HЭLБ9M]HБ-dдш(ААААААААААААЁ╜═┴Е╕°(ААААААААААААёСе╪БН▒Е══9Е╡ФЇЙЭ╔еРБЭ╔еР╡Н╜▒╠┤─Б═┤щЭ╔еР╡Н╜▒╠┤╚БЭЕ└┤╠Б╤Хс╨╡l─┼┴сtБ╤Хс╨╡═▒Е╤Ф┤╪└└И°(АААААААААААААБэ═Х▒ХН╤ХСE╒Х═╤е╜╣═1е═╨╣╡Е└аб─░БеСрдАЇ°Аа(ААААААААААААААААёСе╪БнХфїэеСсЇБН▒Е══9Е╡ФЇЙ└┤╚╕╘БЙЬ╡═▒Е╤Ф┤╘└Б╔╜╒╣СХР╡с░БЙ╜╔СХ╚БЙ╜╔СХ╚╡═▒Е╤Ф┤╚└└Б═┴ЕНФ╡ф┤└╕╘И°(ААААААААААААААААААё═┴Е╕БН▒Е══9Е╡ФЇЙЩ╜╣╨╡Й╜▒РБ╤Хс╨╡═▒Е╤Ф┤ф└└И∙эеСрАмА┼Ї╕Бэ─╣НбЕ┴╤Х╔ЇАбэ─╣╡Е╔н═ЇГВЪгВЪ╗ВЮ7ВЪ│ВЪ└дшЁ╜═┴Е╕°(ААААААААААААААААААё└БН▒Е══9Е╡ФЇЙ╤Хс╨╡═▒Е╤Ф┤▄└└И∙э─╣Е╣═▌Х╚БёЁАЯВЪ│ВЪ ВЪ█ВЪШГВЪ│ВЪ ВЪ│ВЪ├ВЪМГВЪWВЮ7ВЪ╦ВЪ√ВЪуВЮГВЪВЪ╦ВЮ/ВЪkВЪ ВЪРГВЪчВЮВЮВЪoВЮВЦРЭЇЁ╜└°(ААААААААААААААААЁ╜Се╪°(ААААААААААААААдеЇ(ААААААААААААЁ╜Се╪°(ААААААААААЁ╜Се╪°(ААААААААЁ╜Се╪°(ААААААеЇ((АААААБь╝иБE╒Х═╤е╜╣╠БIХ┴╜═е╤╜╔фБ1е═╨Аи╜Ї(ААААААёСе╪БН▒Е══9Е╡ФЇЙЙЬ╡▌бе╤ФБ└┤╪Б╔╜╒╣СХР┤═с░БЙ╜╔СХ╚БЙ╜╔СХ╚╡═▒Е╤Ф┤╚└└Б═бЕС╜▄╡═┤Б═┴ЕНФ╡ф┤╨И°(ААААААААёСе╪БН▒Е══9Е╡ФЇЙЩ▒ХрБй╒═╤еЩф╡ЙХ╤▌ХХ╕Бе╤Х╡╠╡НХ╣╤Х╚И°(ААААААААААёа╠БН▒Е══9Е╡ФЇЙЩ╜╣╨╡Й▒ЕНмБ╤Хс╨╡═▒Е╤Ф┤ф└└Б╤Хс╨╡═┤БЩ▒ХрБе╤Х╡╠╡НХ╣╤Х╚Б═┴ЕНФ╡р┤╚И°(ААААААААААААё	╜╜н=┴Х╕БН▒Е══9Е╡ФЇЙ▄┤╨Ба┤╨Б╤Хс╨╡е╣СеЭ╝┤╪└└ИА╝°(ААААААААААААё═┴Е╕√ВЪуВЪВЪ├ВЪWВЮ7ВЪ▀ВЪ ВЪРГВЪлВЮ7ВЪ├ВЪ█ВЮ7ВЪаГВЪ╖ВЪ√ВЪПВЮ7ВЪЗВЪ√ВЪ└АбэЩе▒╤Х╔ХСE╒Х═╤е╜╣╠╣▒Х╣Э╤бЇГВЪВЪ№ГВЪлВЮ7ВЪ├ВЪ█ВЮ7ВЪадЁ╜═┴Е╕°(ААААААААААЁ╜а╠°(ААААААААААё═┴Е╕БН▒Е══9Е╡ФЇЙ╤Хс╨╡с╠Б╤Хс╨╡═▒Е╤Ф┤╘└└И°(АААААААААААГВЪлВЮ7ВЪ├ВЪ█ВЮ7ВЪаГВЪ│ВЪ√ВЪoВЪ√ВЪГВЪWВЪ├ВЪУВЮГВЪлВЪ√ВЪ█ВЮВЪ└ГВЪkВЮВЪWВЪ│ВЪWВЮ7ВЪуВЮГВЪWВЮ7ВЪ╦ВЪ ВЪTГВЪWВЪ├ВЮВЪа(ААААААААААЁ╜═┴Е╕°(ААААААААЁ╜Се╪°((АААААААБэЩе▒╤Х╔ХСE╒Х═╤е╜╣╠╣▒Х╣Э╤аАЇЇЇА└А№Аа(ААААААААААёСе╪БН▒Е══9Е╡ФЇЙ└┤рБ╤Хс╨╡НХ╣╤Х╚Б╤Хс╨╡═▒Е╤Ф┤╨└└Б╤Хс╨╡с╠БЩ╜╣╨╡Й╜▒РБЙЬ╡═▒Е╤Ф┤╘└Б╔╜╒╣СХР┤╔с░БЙ╜╔СХ╚БЙ╜╔СХ╚╡═▒Е╤Ф┤╚└└И°(АААААААААААГВЪ?ВЪГВЪпВЪ ВЪ╦ВЮ7ВЪВЪ√ВЪ├ВЮГВЪWВЮ/ВЪгВЮ,ГВЪлВЮ7ВЪ├ВЪ█ВЮ7ВЪаГВЪлВЪ√ВЪOВЮВЪ°ГВЪ┐ВЪ√ВЮВЪгВЪ ВЦРГВЪгВЪУВЮВЪаГВЪлВЮ7ВЪ├ВЪ█ВЮ7ВЪаГВЪ┐ВЮВЪWВЮ7ВЪРГВЪWВЪ├ВЪУВЮГВЪ'ВЪлВЪ├ВЮВЪ└ГВЪ│ВЪ√ВЪВЪгВЮГВЪWВЮ7ВЪ╦ВЪ ВЪTГВЪWВЪ├ВЮВЪгВЦР(ААААААААААЁ╜Се╪°(ААААААААдАшАа(ААААААААААёСе╪БН▒Е══9Е╡ФЇЙСе┘еСФ╡фБСе┘еСФ╡═▒Е╤Ф┤─└└И°(АААААААААААБэЩе▒╤Х╔ХСE╒Х═╤е╜╣╠╣╡Е└аб─дАЇ°Бь(АААААААААААААБН╜╣═╨Бе═MХ▒ХН╤ХРАЇБ═Х▒ХН╤ХСE╒Х═╤е╜╣%С╠╣бЕ╠б─╣еРдь(АААААААААААААБ╔Х╤╒╔╕Аа(ААААААААААААААААёСе╪БнХфїэ─╣еСЇБН▒Е══9Е╡ФЇЙ┴ф┤╠╕╘БЩ▒ХрБе╤Х╡╠╡═╤Е╔╨Бй╒═╤еЩф╡ЙХ╤▌ХХ╕БЭЕ└┤╠Б╤Хс╨╡с╠Бб╜┘Х╚щЙЬ╡═▒Е╤Ф┤╘└╝▄└Б└┤╚Б╔╜╒╣СХР┤╔с░Б╤╔Е╣═е╤е╜╕И°(ААААААААААААААААААёСе╪БН▒Е══9Е╡ФЇЙЩ▒ХрБе╤Х╡╠╡═╤Е╔╨Б═┴ЕНФ╡р┤╠И°(ААААААААААААААААААААёе╣┴╒╨(АААААААААААААААААААААБ╤х┴ФЇЙНбХНнЙ╜рИ(АААААААААААААААААААААБНбХНнХРїэе═MХ▒ХН╤ХСЇ(АААААААААААААААААААААБ╜╣бЕ╣ЭФїьадАЇ°Б╤╜ЭЭ▒ХMХ▒ХН╤E╒Х═╤е╜╕б─╣еРеЇ(АААААААААААААААААААААБН▒Е══9Е╡ФЇЙ╡╨┤─Б╔╜╒╣СХРБ╤Хс╨╡е╣СеЭ╝┤╪└└Б▄┤╨Ба┤╨БН╒╔═╜╚╡┴╜е╣╤Х╚И(АААААААААААААААААААА╝°(ААААААААААААААААААААёСе╪БН▒Е══9Е╡ФЇЙ═┴ЕНФ╡ф┤─И°(ААААААААААААААААААААААёСе╪БН▒Е══9Е╡ФЇЙЩ▒ХрБЩ▒Хр╡▌╔Е└Бе╤Х╡╠╡НХ╣╤Х╚БЭЕ└┤─╕╘И°(ААААААААААААААААААААААААё═┴Е╕БН▒Е══9Е╡ФЇЙ┴р┤╚Б┴ф┤└╕╘Б╔╜╒╣СХРБЙЬ╡е╣СеЭ╝┤─└└Б╤Хс╨╡е╣СеЭ╝┤р└└Б╤Хс╨╡l─┴┴сtБЩ╜╣╨╡Й▒ЕНмИ°(АААААААААААААААААААААААААБэ─╣Н▒Е══1Х┘Х▒Ї(ААААААААААААААААААААААААЁ╜═┴Е╕°(ААААААААААААААААААААААААё═┴Е╕БН▒Е══9Е╡ФЇЙ┴р┤╚Б┴ф┤└╕╘Б╔╜╒╣СХРБЙЬ╡═▒Е╤Ф┤─└└Б╤Хс╨╡═▒Е╤Ф┤▄└└Б╤Хс╨╡l─┴┴сtБЩ╜╣╨╡Й╜▒РИ°(АААААААААААААААААААААААААБэ─╣═╒ЙйХН╤Ї(ААААААААААААААААААААААААЁ╜═┴Е╕°(ААААААААААААААААААААААААё═┴Е╕БН▒Е══9Е╡ФЇЙ┴р┤╚Б┴ф┤└╕╘Б╔╜╒╣СХРБЙЬ╡Е╡ЙХ╚┤─└└Б╤Хс╨╡Е╡ЙХ╚┤ф└└Б╤Хс╨╡l─┴┴сtБЩ╜╣╨╡Й╜▒РИ°(АААААААААААААААААААААААААБэ─╣НбЕ┴╤Х╔Ї(ААААААААААААААААААААААААЁ╜═┴Е╕°(ААААААААААААААААААААААААё═┴Е╕БН▒Е══9Е╡ФЇЙ┴р┤╚Б┴ф┤└╕╘Б╔╜╒╣СХРБЙЬ╡┴╒╔┴▒Ф┤─└└Б╤Хс╨╡┴╒╔┴▒Ф┤р└└Б╤Хс╨╡l─┴┴сtБЩ╜╣╨╡Й▒ЕНмИ°(АААААААААААААААААААААААААБэ─╣╡Е╔н═ЇГВЪгВЪ╗ВЮ7ВЪ│ВЪ└(ААААААААААААААААААААААААЁ╜═┴Е╕°(ААААААААААААААААААААААААё═┴Е╕БН▒Е══9Е╡ФїэБ┴р┤╚Б┴ф┤└╕╘Б╔╜╒╣СХРБ╤Хс╨╡l─┴┴сtБЩ╜╣╨╡Й╜▒РАСь(АААААААААААААААААААААААААБ─╣СеЩЩеН╒▒╤фАЇЇЇАЭЕ═фЬА№АЭЙЬ╡Х╡Х╔Е▒Р┤─└└Б╤Хс╨╡Х╡Х╔Е▒Р┤р└└ЬАш(АААААААААААААААААААААААААБ─╣СеЩЩеН╒▒╤фАЇЇЇАЭ5ХСе╒┤ЬА№АЭЙЬ╡Й▒╒Ф┤─└└Б╤Хс╨╡Й▒╒Ф┤р└└ЬАшАЭЙЬ╡╔╜═Ф┤─└└Б╤Хс╨╡╔╜═Ф┤р└└Ь(АААААААААААААААААААААААБїБЇ°(АААААААААААААААААААААААААБэ─╣СеЩЩеН╒▒╤хЇ(ААААААААААААААААААААААААЁ╜═┴Е╕°(ААААААААААААААААААААААЁ╜Се╪°(ААААААААААААААААААААААё└БН▒Е══9Е╡ФЇЙЩ╜╣╨╡Хс╤╔ЕЙ╜▒РБ╤Хс╨╡═▒Е╤Ф┤ф└└Б╤Хс╨╡═┤Б╡╨┤─И∙э─╣┼╒Х═╤е╜╣ЇЁ╜└°(АААААААААААААААААААААБэ─╣Е╣═▌Х╚АШШАа(ААААААААААААААААААААААААё└БН▒Е══9Е╡ФЇЙ╤Хс╨╡═▒Е╤Ф┤╪└└Б╤Хс╨╡с╠И°(ААААААААААААААААААААААААААё═┴Е╕БН▒Е══9Е╡ФЇЙЩ╜╣╨╡Й╜▒РБ╤Хс╨╡═▒Е╤Ф┤▄└└И√ВЪ'ВЪУВЮ7ВЪУВЪ└┐ВЪчВЪ ВЪгВЮ7ВЪ|шЁ╜═┴Е╕°Бэ─╣Е╣═▌Х╔Ї(ААААААААААААААААААААААААЁ╜└°(ААААААААААААААААААААААеЇ(ААААААААААААААААААААЁ╜Се╪°(ААААААААААААААААААЁ╜Се╪°((ААААААААААААААААААёСе╪БН▒Е══9Е╡ФЇЙЩ▒ХрБе╤Х╡╠╡НХ╣╤Х╚Б═┴ЕНФ╡р┤─Б═б╔е╣м┤└И°(ААААААААААААААААААААёЙ╒╤╤╜╕(АААААААААААААААААААААБ╤х┴ФЇЙЙ╒╤╤╜╕И(АААААААААААААААААААААБ╜╣▒еНмїьадАЇ°БбЕ╣С▒ХХ▒Х╤Фб─╣еРеЇ(АААААААААААААААААААААБН▒Е══9Е╡ФЇЙ└┤─Б╤Хс╨╡═▒Е╤Ф┤╨└└Бб╜┘Х╚щ╤Хс╨╡╔╜═Ф┤╪└└Б╔╜╒╣СХРБ╤╔Е╣═е╤е╜╕И(АААААААААААААААААААААБ╤е╤▒ФЇЛВЪ╗ВЮВЪoВЮВЪаИ(АААААААААААААААААААА°(ААААААААААААААААААААААёQ╔Е═а╚БН▒Е══9Е╡ФЇЙ▄┤╠╕╘Ба┤╠╕╘ИА╝°(ААААААААААААААААААААЁ╜Й╒╤╤╜╕°(ААААААААААААААААААЁ╜Се╪°(ААААААААААААААААЁ╜Се╪°(ААААААААААААААдь(АААААААААААБЇеЇ(ААААААААААЁ╜Се╪°(ААААААААеЇ(ААААААЁ╜Се╪°(ААААЁ╜Се╪°(ААдь)Ї(