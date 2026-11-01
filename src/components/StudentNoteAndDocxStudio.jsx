import React, { useState, useEffect, useRef } from 'react';
import { db } from '../utils/db';
import { generateStudyNoteAi } from '../utils/realAiEngine';
import { 
  FileText, 
  Sparkles, 
  Mic, 
  MicOff, 
  Download, 
  Printer, 
  Save, 
  Trash2, 
  BookOpen, 
  CheckCircle, 
  RefreshCw, 
  FileCode, 
  Copy,
  Layers,
  Search
} from 'lucide-react';

export default function StudentNoteAndDocxStudio({ 
  isTeacherMode = false, 
  lang = 'bn' 
}) {
  const [classLevel, setClassLevel] = useState('Class 10');
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('একচল বিশিষ্ট দ্বিঘাত সমীকরণ');
  const [noteTitle, setNoteTitle] = useState('দ্বিঘাত সমীকরণের মূল সূত্র ও প্রয়োগ');
  const [noteContent, setNoteContent] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [savedNotes, setSavedNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition & Load Saved Notes
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'bn-IN'; // Bengali (India)

      recog.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setNoteContent(prev => prev + ' ' + transcript);
        }
      };

      recog.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recog;
    }

    loadSavedNotes();
  }, []);

  const loadSavedNotes = async () => {
    try {
      const all = await db.studentNotes.toArray();
      setSavedNotes(all.reverse());
    } catch (e) {
      console.warn('Failed to load notes from db.studentNotes:', e);
    }
  };

  // Toggle Bengali Voice Dictation
  const toggleVoiceDictation = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('আপনার ব্রাউজারে ভয়েস ডিকটেশন সমর্থিত নয়। Google Chrome ব্রাউজার ব্যবহার করুন।');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Recognition start error:', e);
      }
    }
  };

  // Generate Notes with Real AI Router
  const handleGenerateAiNote = async () => {
    if (!topic.trim()) {
      alert('অনুগ্রহ করে নোটের টপিক বা অধ্যায়ের নাম লিখুন।');
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await generateStudyNoteAi({
        classLevel,
        subject,
        topic,
        language: lang
      });

      setNoteContent(generated);
      if (!noteTitle) {
        setNoteTitle(`${subject} - ${topic} (স্টাডি নোট)`);
      }
      setToastMsg('✨ AI স্টাডি নোট সফলভাবে তৈরি হয়েছে!');
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error('Note generation failed:', err);
      alert('নোট জেনারেট করতে ত্রুটি ঘটেছে: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Note to IndexedDB
  const handleSaveNote = async () => {
    if (!noteContent.trim()) {
      alert('খালি নোট সংরক্ষণ করা যাবে না।');
      return;
    }

    try {
      const record = {
        title: noteTitle || `${subject} - ${topic}`,
        classLevel,
        subject,
        topic,
        content: noteContent,
        noteType: isTeacherMode ? 'Teacher Master Note' : 'Student Study Note',
        createdAt: new Date().toISOString()
      };

      if (selectedNoteId) {
        await db.studentNotes.update(selectedNoteId, record);
        setToastMsg('💾 নোট সফলভাবে আপডেট করা হয়েছে!');
      } else {
        const newId = await db.studentNotes.add(record);
        setSelectedNoteId(newId);
        setToastMsg('💾 নতুন নোট সফলভাবে ডেটাবেসে সংরক্ষিত হয়েছে!');
      }

      await loadSavedNotes();
      setTimeout(() => setToastMsg(''), 3000);
    } catch (e) {
      console.error('Error saving note:', e);
      alert('নোট সংরক্ষণে ত্রুটি: ' + e.message);
    }
  };

  // Delete note
  const handleDeleteNote = async (id) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই নোটটি মুছে ফেলতে চান?')) return;
    try {
      await db.studentNotes.delete(id);
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
        setNoteContent('');
        setNoteTitle('');
      }
      await loadSavedNotes();
      setToastMsg('🗑️ নোট মুছে ফেলা হয়েছে!');
      setTimeout(() => setToastMsg(''), 2500);
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  // Load Note into Editor
  const handleLoadNote = (note) => {
    setSelectedNoteId(note.id);
    setNoteTitle(note.title || '');
    setClassLevel(note.classLevel || 'Class 10');
    setSubject(note.subject || 'Mathematics');
    setTopic(note.topic || '');
    setNoteContent(note.content || '');
  };

  // Export as Word (.doc)
  const handleDownloadDocx = () => {
    if (!noteContent) {
      alert('ডাউনলোড করার মতো কোনো নোটের বিষয়বস্তু নেই।');
      return;
    }

    const titleSafe = (noteTitle || 'BG_Tutorial_Home_Notes').replace(/[/\\?%*:|"<>]/g, '_');
    const formattedHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${titleSafe}</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.6; margin: 40px; color: #1e293b; }
          h1 { color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 6px; }
          .header-box { text-align: center; border: 1px solid #cbd5e1; padding: 16px; margin-bottom: 24px; background: #f8fafc; }
          .meta { font-size: 11pt; color: #64748b; margin-top: 4px; }
          .content { font-size: 12pt; white-space: pre-wrap; line-height: 1.8; }
          .footer { margin-top: 40px; font-size: 10pt; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <h1 style="margin: 0; font-size: 22pt;">B.G. TUTORIAL HOME</h1>
          <div style="font-size: 13pt; font-weight: bold; color: #0284c7; margin-top: 4px;">নির্দেশনায়: শিক্ষক বাবুন ঘোষ</div>
          <div class="meta">ভিআইপি রোড, দক্ষিণ হাবড়া, উত্তর ২৪ পরগনা | মোবা: ৯৭৩৩৯৭৪hex / 9733974425</div>
          <div class="meta" style="font-weight: bold; margin-top: 6px;">শ্রেণী: ${classLevel} | বিষয়: ${subject} | তারিখ: ${new Date().toLocaleDateString('bn-BD')}</div>
        </div>
        <h2 style="color: #0f172a;">${noteTitle || topic}</h2>
        <div class="content">${noteContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        <div class="footer">
          B.G. Tutorial Home • Official Study Notes • Created by Rahul ⚡
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', formattedHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${titleSafe}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Trigger Native Print Dialog for PDF
  const handlePrintPdf = () => {
    window.print();
  };

  // Filter notes
  const filteredNotes = savedNotes.filter(n => 
    (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.topic || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Blueprint 7.0 Smart Study Studio</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-300" />
            <span>স্মার্ট স্টাডি নোটস, PDF ও Word (.DOCX) স্টুডিও</span>
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            যেকোনো অধ্যায়ের স্টাডি নোট তৈরি করুন, বাংলা ভয়েস ডিকটেশন দিয়ে লিখুন, AI দিয়ে অটো-জেনারেট করুন এবং ১-ক্লিকে প্রিন্ট বা Word ফাইলে সেভ করুন।
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadDocx}
            className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2.5 rounded-2xl text-xs font-bold transition-all"
            title="Microsoft Word (.doc) ফাইল ডাউনলোড"
          >
            <Download className="w-4 h-4 text-emerald-300" />
            <span>Word (.doc) ডাউনলোড</span>
          </button>
          <button
            onClick={handlePrintPdf}
            className="inline-flex items-center gap-2 bg-white text-indigo-900 hover:bg-blue-50 px-4 py-2.5 rounded-2xl text-xs font-black shadow-md transition-all"
            title="PDF প্রিন্ট বা সেভ করুন"
          >
            <Printer className="w-4 h-4 text-indigo-700" />
            <span>PDF প্রিন্ট</span>
          </button>
        </div>
      </div>

      {/* Toast Notice */}
      {toastMsg && (
        <div className="bg-indigo-600 text-white p-4 rounded-2xl font-bold flex items-center gap-3 animate-fade-in shadow-lg print:hidden">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls & Saved Notes List (print:hidden) */}
        <div className="lg:col-span-4 space-y-4 print:hidden">
          {/* Metadata Controls */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>নোটের তথ্য ও বিষয়</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">শ্রেণী (Class):</label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold bg-slate-50 focus:outline-indigo-500"
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
              <label className="block text-xs font-bold text-slate-600 mb-1">বিষয় (Subject):</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold bg-slate-50 focus:outline-indigo-500"
              >
                <option value="Mathematics">গণিত (Mathematics)</option>
                <option value="Physical Science">ভৌতবিজ্ঞান (Physical Science)</option>
                <option value="Life Science">জীবনবিজ্ঞান (Life Science)</option>
                <option value="Political Science">রাষ্ট্রবিজ্ঞান (Political Science)</option>
                <option value="Philosophy">দর্শন ও যুক্তিবিজ্ঞান (Philosophy)</option>
                <option value="History">ইতিহাস (History)</option>
                <option value="Geography">ভূগোল (Geography)</option>
                <option value="English">ইংরেজি (English)</option>
                <option value="Bengali">বাংলা (Bengali)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">অধ্যায় / টপিক:</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold bg-slate-50 focus:outline-indigo-500"
                placeholder="যেমন: অনুপাত ও সমানুপাত"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">নোটের শিরোনাম:</label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold bg-slate-50 focus:outline-indigo-500"
                placeholder="যেমন: পাটিগণিতের সম্পূর্ণ সূত্র তালিকা"
              />
            </div>

            {/* AI Generate Button */}
            <button
              onClick={handleGenerateAiNote}
              disabled={isGenerating}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white font-extrabold py-2.5 rounded-xl shadow-md text-xs disabled:opacity-50 transition-all"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>AI নোট তৈরি করছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>AI দিয়ে নোট তৈরি করুন</span>
                </>
              )}
            </button>
          </div>

          {/* Saved Notes Vault */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>সংরক্ষিত নোটস ({savedNotes.length})</span>
              </h3>
              <button
                onClick={() => {
                  setSelectedNoteId(null);
                  setNoteTitle('');
                  setNoteContent('');
                }}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                + নতুন নোট
              </button>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="নোট খুঁজুন..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-indigo-500"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 divide-y divide-slate-50 pr-1">
              {filteredNotes.length > 0 ? (
                filteredNotes.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleLoadNote(n)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${
                      selectedNoteId === n.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-xs text-slate-800 truncate">{n.title || n.topic}</div>
                      <div className="text-[10px] text-slate-500">{n.classLevel} • {n.subject}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(n.id);
                      }}
                      className="text-slate-300 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  কোনো নোট পাওয়া যায়নি।
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Note Editor & Printable Document */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 print:border-none print:shadow-none print:p-0">
            {/* Editor Toolbar (print:hidden) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 print:hidden">
              <div className="flex items-center gap-2">
                {/* Voice Dictation Button */}
                <button
                  onClick={toggleVoiceDictation}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isListening 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title="বাংলায় কথা বলুন, স্বয়ংক্রিয়ভাবে টেক্সট যুক্ত হবে"
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-indigo-600" />}
                  <span>{isListening ? 'শুনছি... (Stop)' : 'বাংলা ভয়েস টাইপিং'}</span>
                </button>

                <button
                  onClick={() => setNoteContent(prev => prev + '\n\n**গুরুত্বপূর্ণ প্রশ্নোত্তর:**\nপ্র: \nউ: ')}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  + প্রশ্নোত্তর
                </button>
                <button
                  onClick={() => setNoteContent(prev => prev + '\n\n• মূল সূত্র: ')}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  • বুলেট পয়েন্ট
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveNote}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-1.5 rounded-xl text-xs shadow-md transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>সেভ করুন</span>
                </button>
              </div>
            </div>

            {/* Official Printable Header (Visible on print & in document view) */}
            <div className="border-b-2 border-indigo-900 pb-3 mb-4 text-center">
              <h1 className="text-xl md:text-2xl font-black text-indigo-950 uppercase tracking-wide">
                B.G. TUTORIAL HOME
              </h1>
              <p className="text-xs font-bold text-sky-700">
                নির্দেশনায়: শিক্ষক বাবুন ঘোষ | অভিজ্ঞ শিক্ষক (১৫+ বছর)
              </p>
              <p className="text-[11px] text-slate-500">
                ভিআইপি রোড, দক্ষিণ হাবড়া, উত্তর ২৪ পরগনা • মোবা: ৯৭৩৩৯৭৪hex / 9733974425
              </p>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mt-2 pt-2 border-t border-slate-200">
                <span>শ্রেণী: {classLevel}</span>
                <span>বিষয়: {subject}</span>
                <span>তারিখ: {new Date().toLocaleDateString('bn-BD')}</span>
              </div>
            </div>

            {/* Document Content Area */}
            <div className="space-y-3">
              <h2 className="text-lg font-black text-slate-900">
                {noteTitle || topic || 'স্টাডি নোটস'}
              </h2>

              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="এখানে নোট লিখুন অথবা উপরের 'AI দিয়ে নোট তৈরি করুন' বোতামে ক্লিক করুন। বাংলা ভয়েস ডিকটেশন দিয়েও টাইপ করতে পারেন..."
                rows={18}
                className="w-full border border-slate-200 rounded-2xl p-4 text-sm font-medium leading-relaxed bg-slate-50/50 focus:bg-white focus:outline-indigo-500 font-sans print:border-none print:p-0 print:bg-transparent print:resize-none"
              />
            </div>

            {/* Printable Minimalist Footer */}
            <div className="text-center pt-4 border-t border-slate-200 text-xs text-slate-400">
              B.G. Tutorial Home • দক্ষিণ হাবড়া • Created by Rahul ⚡
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
