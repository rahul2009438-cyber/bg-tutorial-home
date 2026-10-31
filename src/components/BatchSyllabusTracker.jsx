import React, { useState, useEffect } from 'react';
import { 
  BookOpen, CheckCircle2, Clock, AlertCircle, Award, 
  Share2, Printer, ChevronDown, ChevronUp, Sparkles, 
  Search, Filter, CheckSquare, MessageCircle, BarChart3,
  Calendar, Layers, FileText, ArrowRight, HelpCircle
} from 'lucide-react';
import { DETAILED_SYLLABUS } from '../data/syllabusData';

export default function BatchSyllabusTracker({ 
  customData = {}, 
  saveToServer 
}) {
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSubject, setSelectedSubject] = useState('সকল বিষয়');
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);

  // Status mapping: { [chapterId]: 'planned' | 'in_progress' | 'completed' | 'revision_done' }
  const [chapterStatusMap, setChapterStatusMap] = useState(() => {
    try {
      const saved = localStorage.getItem('bg_syllabus_progress');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default initial mock progress for Babun Sir
    return {
      'c10-u1-m1': 'completed',
      'c10-u1-m2': 'completed',
      'c10-u1-s1': 'completed',
      'c10-u2-m1': 'revision_done',
      'c10-u2-s1': 'in_progress',
      'c9-u1-m1': 'completed',
      'c7-u1-m1': 'completed'
    };
  });

  const handleUpdateStatus = (chapterId, newStatus) => {
    const updated = { ...chapterStatusMap, [chapterId]: newStatus };
    setChapterStatusMap(updated);
    try {
      localStorage.setItem('bg_syllabus_progress', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    if (saveToServer) {
      saveToServer({ syllabusProgress: updated });
    }
  };

  // Get raw units & chapters for selected class
  const classUnits = DETAILED_SYLLABUS[selectedClass] || [];
  
  // Extract all chapters
  const allClassChapters = [];
  classUnits.forEach(unit => {
    (unit.chapters || []).forEach(ch => {
      allClassChapters.push({
        ...ch,
        unitName: unit.unitName,
        unitId: unit.unitId
      });
    });
  });

  // Extract unique subjects for class
  const classSubjects = ['সকল বিষয়', ...Array.from(new Set(allClassChapters.map(ch => ch.subject)))];

  // Filter chapters
  const filteredChapters = allClassChapters.filter(ch => {
    const matchSubject = selectedSubject === 'সকল বিষয়' || ch.subject === selectedSubject;
    const matchSearch = !searchQuery || 
      ch.chapterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ch.topics && ch.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchSubject && matchSearch;
  });

  // Calculate statistics
  const totalCount = allClassChapters.length;
  const completedCount = allClassChapters.filter(ch => 
    chapterStatusMap[ch.id] === 'completed' || chapterStatusMap[ch.id] === 'revision_done'
  ).length;
  const inProgressCount = allClassChapters.filter(ch => chapterStatusMap[ch.id] === 'in_progress').length;
  const revisionDoneCount = allClassChapters.filter(ch => chapterStatusMap[ch.id] === 'revision_done').length;
  const pendingCount = Math.max(0, totalCount - completedCount - inProgressCount);
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Guardian Broadcast Text
  const completedNames = allClassChapters
    .filter(ch => chapterStatusMap[ch.id] === 'completed' || chapterStatusMap[ch.id] === 'revision_done')
    .map(ch => ch.chapterName)
    .slice(0, 4);

  const inProgressNames = allClassChapters
    .filter(ch => chapterStatusMap[ch.id] === 'in_progress')
    .map(ch => ch.chapterName);

  const broadcastMessage = `📢 *বি.জি. টিউটোরিয়াল হোম — সিলেবাস কভারেজ ও রিভিশন বুলেটিন* 📢\n` +
    `শিক্ষক: ${customData.teacherName || 'বাবুন ঘোষ'} | দক্ষিণ হাবড়া\n\n` +
    `শ্রদ্ধেয় অভিভাবক,\n` +
    `আপনার অবগতির জন্য জানানো যাচ্ছে যে *${selectedClass}* ব্যাচে আমাদের সিলেবাসের অগ্রগতি নিম্নরূপ:\n\n` +
    `📊 *মোট সিলেবাস কভারেজ:* ${percentage}%\n` +
    `✅ *সম্পন্ন অধ্যায়:* ${completedCount}টি (${completedNames.join(', ')}${completedCount > 4 ? ' ইত্যাদি' : ''})\n` +
    `🔄 *চলমান পাঠ:* ${inProgressNames.length > 0 ? inProgressNames.join(', ') : 'চলতি অধ্যায় টেস্ট প্রস্তুতি'}\n` +
    `🎯 *লক্ষ্য:* আসন্ন বোর্ড ও পর্যায়ক্রমিক মূল্যায়ন পরীক্ষার জন্য নিয়মিত স্পেশাল ড্রিল ও মক টেস্ট চলছে।\n\n` +
    `ছাত্রছাত্রীদের বাড়িতে দৈনিক প্র্যাকটিস তদারকি করার জন্য বিশেষ অনুরোধ জানানো হচ্ছে।\n\n` +
    `— বাবন ঘোষ\n` +
    `বি.জি. টিউটোরিয়াল হোম (মোবাইল: ${customData.phone || '+91 9733974425'})`;

  const copyBroadcastText = () => {
    navigator.clipboard.writeText(broadcastMessage);
    setCopiedBroadcast(true);
    setTimeout(() => setCopiedBroadcast(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>অফিশিয়াল WBBSE ও WBCHSE বোর্ড কারিকুলাম ট্র্যাকার</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black">
            🎯 ব্যাচভিত্তিক সিলেবাস কভারেজ ও রিভিশন কন্ট্রোল হাব
          </h2>
          <p className="text-emerald-100 text-xs mt-1 max-w-xl">
            অধ্যায়ভিত্তিক পাঠ অগ্রগতি ট্র্যাক করুন, বোর্ড পরীক্ষার স্পেশাল টিপস দেখুন এবং ১-ক্লিকে অভিভাবকদের সিলেবাস রিপোর্ট পাঠান।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setBroadcastModalOpen(true)}
            className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-2xl text-xs font-bold flex items-center space-x-2 transition border border-white/30 active:scale-95 shadow"
          >
            <MessageCircle className="w-4 h-4 text-emerald-300" />
            <span>অভিভাবক বুলেটিন WhatsApp</span>
          </button>
          <button
            onClick={() => setPrintModalOpen(true)}
            className="px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl text-xs font-black flex items-center space-x-2 transition shadow-md active:scale-95"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>সিলেবাস অডিট শিট প্রিন্ট</span>
          </button>
        </div>
      </div>

      {/* Class Batch & Subject Filter Tabs */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Class Selectors */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {['Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(cls => (
              <button
                key={cls}
                onClick={() => {
                  setSelectedClass(cls);
                  setSelectedSubject('সকল বিষয়');
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition shrink-0 ${
                  selectedClass === cls
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cls} {cls === 'Class 10' && '🔥 মাধ্যমিক'} {cls === 'Class 12' && '🎓 উঃ মাঃ'}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="অধ্যায় বা বিষয় খুঁজুন..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 flex items-center space-x-1 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>বিষয় ফিল্টার:</span>
          </span>
          {classSubjects.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedSubject === sub
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Real-Time Progress Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{percentage}%</div>
            <div className="text-[11px] font-bold text-slate-500">সিলেবাস কভারেজ</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-black text-teal-700">{completedCount} / {totalCount}</div>
            <div className="text-[11px] font-bold text-slate-500">সম্পন্ন অধ্যায়</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-black text-amber-700">{inProgressCount}</div>
            <div className="text-[11px] font-bold text-slate-500">চলমান ক্লাস</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-black text-purple-700">{revisionDoneCount}</div>
            <div className="text-[11px] font-bold text-slate-500">মক টেস্ট ও রিভিশন শেষ</div>
          </div>
        </div>
      </div>

      {/* Progress Bar Display */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-slate-800 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{selectedClass} সার্বিক অগ্রগতি বার</span>
          </span>
          <span className="text-emerald-700 font-black">{percentage}% পূর্ণাঙ্গ</span>
        </div>
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
          <div 
            className="bg-emerald-500 h-full transition-all duration-700 ease-out" 
            style={{ width: `${percentage}%` }}
            title={`সম্পন্ন: ${percentage}%`}
          />
          <div 
            className="bg-amber-400 h-full transition-all duration-700 ease-out" 
            style={{ width: `${totalCount > 0 ? (inProgressCount / totalCount) * 100 : 0}%` }}
            title={`চলমান: ${inProgressCount} অধ্যায়`}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 font-medium pt-1">
          <span>⚪ বাকি: {pendingCount}টি অধ্যায়</span>
          <span>🟡 চলমান: {inProgressCount}টি অধ্যায়</span>
          <span>🟢 সম্পন্ন: {completedCount}টি অধ্যায়</span>
        </div>
      </div>

      {/* Chapter Matrix List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>{selectedClass} কারিকুলাম ও অধ্যায় তালিকা ({filteredChapters.length}টি অধ্যায়)</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            স্ট্যাটাস বদলাতে ব্যাজে ক্লিক করুন
          </span>
        </div>

        {filteredChapters.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-xs font-bold text-slate-700">কোনো অধ্যায় খুঁজে পাওয়া যায়নি</div>
            <p className="text-[11px] text-slate-500">অন্য বিষয় বা ফিল্টার নির্বাচন করুন।</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChapters.map(ch => {
              const currentStatus = chapterStatusMap[ch.id] || 'planned';
              const isExpanded = expandedChapterId === ch.id;

              return (
                <div 
                  key={ch.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition hover:border-slate-300"
                >
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Chapter Title & Meta */}
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {ch.subject}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {ch.unitName}
                        </span>
                      </div>
                      <div className="text-sm sm:text-base font-black text-slate-900">
                        {ch.chapterName}
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(ch.topics || []).slice(0, 3).map(top => (
                          <span key={top} className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                            • {top}
                          </span>
                        ))}
                        {(ch.topics || []).length > 3 && (
                          <span className="text-[10px] text-slate-400 font-bold self-center">
                            +{(ch.topics || []).length - 3}টি টপিক
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Toggles */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                      <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(ch.id, 'planned')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            currentStatus === 'planned' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          পরিকল্পিত
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(ch.id, 'in_progress')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            currentStatus === 'in_progress' ? 'bg-amber-400 text-amber-950 font-black shadow-xs' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          🟡 চলমান
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(ch.id, 'completed')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            currentStatus === 'completed' ? 'bg-emerald-600 text-white font-black shadow-xs' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          🟢 সম্পন্ন
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(ch.id, 'revision_done')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            currentStatus === 'revision_done' ? 'bg-purple-600 text-white font-black shadow-xs' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          ⭐ রিভিশন শেষ
                        </button>
                      </div>

                      <button
                        onClick={() => setExpandedChapterId(isExpanded ? null : ch.id)}
                        className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
                        title="বিস্তারিত দেখুন"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Teaching Tips & Concepts */}
                  {isExpanded && (
                    <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 space-y-3 text-xs leading-relaxed">
                      {ch.concepts && (
                        <div>
                          <div className="font-black text-slate-800 mb-1 flex items-center space-x-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            <span>মূল ধারণা ও সারসংক্ষেপ (Key Concepts):</span>
                          </div>
                          <p className="text-slate-700 whitespace-pre-line bg-white p-3 rounded-xl border border-slate-200">
                            {ch.concepts}
                          </p>
                        </div>
                      )}

                      {ch.teacherTip && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                          <span className="font-black block mb-0.5">💡 বাবুন স্যারের বিশেষ এক্সাম টিপস:</span>
                          <span>{ch.teacherTip}</span>
                        </div>
                      )}

                      {ch.marksGuidance && (
                        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-950">
                          <span className="font-black block mb-1">📋 নম্বর বিভাজন ও সম্ভাব্য প্রশ্নের ধরন:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                            {ch.marksGuidance.m1 && (
                              <div className="bg-white p-2 rounded-lg border border-indigo-100">
                                <span className="font-bold text-indigo-700 block">১ নম্বর প্রশ্ন:</span>
                                <span>{ch.marksGuidance.m1}</span>
                              </div>
                            )}
                            {ch.marksGuidance.m2 && (
                              <div className="bg-white p-2 rounded-lg border border-indigo-100">
                                <span className="font-bold text-indigo-700 block">২ নম্বর প্রশ্ন:</span>
                                <span>{ch.marksGuidance.m2}</span>
                              </div>
                            )}
                            {(ch.marksGuidance.m4 || ch.marksGuidance.m5) && (
                              <div className="bg-white p-2 rounded-lg border border-indigo-100">
                                <span className="font-bold text-indigo-700 block">৪/৫ নম্বর প্রশ্ন:</span>
                                <span>{ch.marksGuidance.m4 || ch.marksGuidance.m5}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: GUARDIAN BULLETIN MODAL */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">অভিভাবক সিলেবাস বুলেটিন (WhatsApp)</h3>
                  <p className="text-[11px] text-slate-500 font-medium">{selectedClass} ব্যাচ প্রগ্রেস রিপোর্ট</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBroadcastModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="font-bold text-slate-700 block">প্রস্তুতকৃত বাংলা বুলেটিন বার্তা:</label>
              <textarea
                rows="8"
                readOnly
                value={broadcastMessage}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs leading-relaxed text-slate-800"
              />
            </div>

            <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBroadcastModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
              >
                বন্ধ করুন
              </button>

              <button
                type="button"
                onClick={copyBroadcastText}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 transition active:scale-95"
              >
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>{copiedBroadcast ? '✅ কপি সম্পন্ন!' : '📋 টেক্সট কপি করুন'}</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(broadcastMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp-এ শেয়ার করুন</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE SYLLABUS AUDIT SHEET */}
      {printModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 print:p-0 print:border-none print:shadow-none">
            {/* Action Bar (hidden on print) */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 print:hidden">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">অফিসিয়াল সিলেবাস অডিট ও কভারেজ শিট</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট নিন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="border border-slate-300 p-6 rounded-2xl bg-white space-y-4 print:border-none print:p-0">
              <div className="text-center pb-4 border-b border-slate-300 space-y-1">
                <h1 className="text-xl font-black text-slate-900 tracking-wide">বি.জি. টিউটোরিয়াল হোম</h1>
                <p className="text-xs font-bold text-slate-600">দক্ষিণ হাবড়া, এস. এন. দে রোড • মোবাইল: {customData.phone || '+91 9733974425'}</p>
                <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-800 mt-1">
                  সিলেবাস ও পাঠ অগ্রগতি রেজিস্টার — ব্যাচ: {selectedClass} ({new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long' })})
                </div>
              </div>

              {/* Progress Summary Table */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold py-2 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">মোট অধ্যায়</span>
                  <span className="text-slate-900 font-black">{totalCount}টি</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">সম্পন্ন</span>
                  <span className="text-emerald-700 font-black">{completedCount}টি</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">চলমান</span>
                  <span className="text-amber-700 font-black">{inProgressCount}টি</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">অগ্রগতি</span>
                  <span className="text-indigo-700 font-black">{percentage}%</span>
                </div>
              </div>

              {/* Chapters Table */}
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-left font-black text-slate-700">
                    <th className="p-2 border-r border-slate-200 w-12 text-center">ক্র.নং</th>
                    <th className="p-2 border-r border-slate-200">বিষয় ও অধ্যায়ের নাম</th>
                    <th className="p-2 border-r border-slate-200">ইউনিট / মূল্যায়ন</th>
                    <th className="p-2 border-r border-slate-200 w-28 text-center">স্ট্যাটাস</th>
                    <th className="p-2 w-28 text-center">স্বাক্ষর / তারিখ</th>
                  </tr>
                </thead>
                <tbody>
                  {allClassChapters.map((ch, idx) => {
                    const st = chapterStatusMap[ch.id] || 'planned';
                    const statusText = {
                      'planned': 'পরিকল্পিত',
                      'in_progress': 'চলমান পাঠ',
                      'completed': 'সম্পন্ন ✅',
                      'revision_done': 'রিভিশন শেষ ⭐'
                    }[st];

                    return (
                      <tr key={ch.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <div className="font-bold text-slate-900">{ch.chapterName}</div>
                          <div className="text-[10px] text-slate-500">{ch.subject}</div>
                        </td>
                        <td className="p-2 border-r border-slate-200 text-[11px] text-slate-600">
                          {ch.unitName}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-center font-bold text-[11px]">
                          <span className={`px-2 py-0.5 rounded ${
                            st === 'completed' || st === 'revision_done' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : st === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {statusText}
                          </span>
                        </td>
                        <td className="p-2 text-center border-slate-200">
                          <div className="h-6 border-b border-dashed border-slate-300" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Footer Signatures */}
              <div className="pt-8 flex justify-between items-end text-xs font-bold text-slate-700">
                <div>
                  <p>মুদ্রণের তারিখ: {new Date().toLocaleDateString('bn-BD')}</p>
                  <p className="text-[10px] text-slate-400">বি.জি. টিউটোরিয়াল হোম ডিজিটাল একাডেমি সিস্টেম</p>
                </div>
                <div className="text-center">
                  <div className="h-10 border-b border-slate-400 w-48 mb-1" />
                  <p>শিক্ষকের স্বাক্ষর ও সীল</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
