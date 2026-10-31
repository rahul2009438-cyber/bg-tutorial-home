import React, { useState } from 'react';
import { 
  HeartPulse, User, Award, CheckCircle2, AlertTriangle, 
  Plus, Trash2, Printer, Edit3, ShieldAlert, Sparkles, BookOpen
} from 'lucide-react';

const COMMON_WEAKNESS_TAGS = [
  'পাটিগণিত (শতকরা, সুদকষা, অংশীদারি)',
  'বীজগণিত সমীকরণ ও অনুপাত',
  'জ্যামিতিক উপপাদ্য ও সম্পাদ্য',
  'ভৌতবিজ্ঞান গাণিতিক সমীকরণ ও সূত্র',
  'আলো ও তড়িৎ প্রবাহ সংক্রান্ত গণনা',
  'জীবনবিজ্ঞান চিত্রাঙ্কন ও রেখাচিত্র',
  'মেন্ডেলের বংশগতি ও ক্রোমোজোম তত্ত্ব',
  'রাষ্ট্রবিজ্ঞান বড় বর্ণনামূলক উত্তর লেখা',
  'দর্শন যুক্তি ও তর্কবিদ্যা (সিললিজম)',
  'হাতের লেখার গতি ও খাতার পরিচ্ছন্নতা',
  'পরীক্ষা ভীতি ও সময় ব্যবস্থাপনা'
];

export default function WeakStudentTracker({ 
  students = [], 
  customData = {}, 
  saveToServer 
}) {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || null);
  const [trackingList, setTrackingList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bg_weak_student_records') || '{}');
    } catch(e) {
      return {};
    }
  });

  const [newCustomTag, setNewCustomTag] = useState('');
  const [newNoteInput, setNewNoteInput] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const currentRecord = currentStudent ? (trackingList[currentStudent.id] || {
    status: 'under_observation',
    weaknesses: ['পাটিগণিত (শতকরা, সুদকষা, অংশীদারি)', 'ভৌতবিজ্ঞান গাণিতিক সমীকরণ ও সূত্র'],
    teacherAction: 'প্রতি ক্লাসের পর ১৫ মিনিট অতিরিক্ত ডাউট ক্লিয়ারিং সময় বরাদ্দ।',
    guardianDiscussion: 'অভিভাবককে বাড়িতে প্রতিদিন ১ ঘণ্টা অঙ্কের অনুশীলনে নজর রাখতে বলা হয়েছে।',
    logs: [
      { date: '২৪ অক্টোবর ২০২৬', note: 'পাটিগণিতের সূত্রে এখনো কিছু অস্পষ্টতা আছে, তবে ক্লাসে মনযোগ দিচ্ছে।' }
    ]
  }) : null;

  const updateCurrentRecord = (field, value) => {
    if (!currentStudent) return;
    const updated = {
      ...trackingList,
      [currentStudent.id]: {
        ...(trackingList[currentStudent.id] || currentRecord),
        [field]: value
      }
    };
    setTrackingList(updated);
    try {
      localStorage.setItem('bg_weak_student_records', JSON.stringify(updated));
    } catch (e) {}
    if (saveToServer) saveToServer({ weakStudentRecords: updated });
  };

  const handleToggleTag = (tag) => {
    const existing = currentRecord?.weaknesses || [];
    const updated = existing.includes(tag) 
      ? existing.filter(t => t !== tag) 
      : [...existing, tag];
    updateCurrentRecord('weaknesses', updated);
  };

  const handleAddCustomTag = () => {
    if (!newCustomTag.trim()) return;
    const existing = currentRecord?.weaknesses || [];
    if (!existing.includes(newCustomTag.trim())) {
      updateCurrentRecord('weaknesses', [...existing, newCustomTag.trim()]);
    }
    setNewCustomTag('');
  };

  const handleAddLog = () => {
    if (!newNoteInput.trim()) return;
    const newLogItem = {
      date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
      note: newNoteInput.trim()
    };
    const existingLogs = currentRecord?.logs || [];
    updateCurrentRecord('logs', [newLogItem, ...existingLogs]);
    setNewNoteInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-pink-700 to-amber-700 p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-6 h-6 text-amber-300" />
            <h2 className="text-lg sm:text-xl font-black">
              🎯 দুর্বল শিক্ষার্থী ট্র্যাকার ও স্পেশাল কেয়ার প্ল্যান
            </h2>
          </div>
          <p className="text-xs text-rose-100 mt-1 max-w-xl">
            কোন শিক্ষার্থী কোন বিষয়ে বা অধ্যায়ে পিছিয়ে পড়ছে তা চিহ্নিত করুন এবং অভিভাবক মিটিংয়ের জন্য ডায়াগনস্টিক রিপোর্ট প্রস্তুত করুন।
          </p>
        </div>

        {currentStudent && (
          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2.5 bg-white text-rose-900 rounded-2xl text-xs font-black flex items-center space-x-1.5 shadow-md active:scale-95 transition hover:bg-rose-50 shrink-0"
          >
            <Printer className="w-4 h-4 text-rose-700" />
            <span>কেয়ার রিপোর্ট প্রিন্ট করুন</span>
          </button>
        )}
      </div>

      {/* Main Grid: Student Selector + Diagnostic Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Student List */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
            <User className="w-4 h-4 text-rose-600" />
            <span>শিক্ষার্থী নির্বাচন করুন ({students.length} জন)</span>
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {students.map((st, idx) => {
              const rec = trackingList[st.id] || {};
              const isSelected = (currentStudent?.id === st.id);
              const weakCount = (rec.weaknesses || []).length;

              return (
                <button
                  key={st.id || idx}
                  type="button"
                  onClick={() => setSelectedStudentId(st.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between text-xs ${
                    isSelected 
                      ? 'bg-rose-50 border-rose-400 shadow-sm ring-1 ring-rose-400' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <span className="font-black text-slate-900 block">{st.name}</span>
                    <span className="text-[11px] text-slate-500 font-bold">{st.batch} • রোল: {st.roll || idx + 1}</span>
                  </div>

                  <div className="text-right">
                    {weakCount > 0 ? (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black rounded-full">
                        {weakCount} টি দুর্বল ক্ষেত্র
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        স্বাভাবিক
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Diagnostic Dashboard */}
        {currentStudent ? (
          <div className="lg:col-span-2 bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5 text-xs">
            {/* Student Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {currentStudent.name} — কেয়ার প্ল্যান
                </h3>
                <p className="text-xs text-slate-500 font-bold">
                  {currentStudent.batch} • রোল: {currentStudent.roll} • অভিভাবক: {currentStudent.guardianName || 'অভিভাবক'} ({currentStudent.phone || 'ফোন নেই'})
                </p>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">অগ্রগতি স্ট্যাটাস:</label>
                <select
                  value={currentRecord?.status || 'under_observation'}
                  onChange={e => updateCurrentRecord('status', e.target.value)}
                  className="p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold text-xs"
                >
                  <option value="under_observation">🟡 নিবিড় পর্যবেক্ষণে (Under Observation)</option>
                  <option value="doubt_class_assigned">🟠 অতিরিক্ত ডাউট ক্লাস বরাদ্দ</option>
                  <option value="improving">🟢 সন্তোষজনক উন্নতি লক্ষ্য করা গেছে</option>
                </select>
              </div>
            </div>

            {/* Weakness Tags */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-700">
                ১. চিহ্নিত দুর্বলতার ক্ষেত্রসমূহ (ট্যাপ করে যুক্ত বা বাদ দিন):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_WEAKNESS_TAGS.map(tag => {
                  const isChecked = (currentRecord?.weaknesses || []).includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                        isChecked 
                          ? 'bg-rose-600 text-white shadow-sm' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '} {tag}
                    </button>
                  );
                })}
              </div>

              {/* Custom Tag Input */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="অন্য কোনো নির্দিষ্ট দুর্বল বিষয় বা অধ্যায় লিখুন..."
                  value={newCustomTag}
                  onChange={e => setNewCustomTag(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                  className="flex-1 p-2 border border-slate-200 rounded-xl bg-slate-50 font-sans text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs"
                >
                  ট্যাগ যোগ করুন
                </button>
              </div>
            </div>

            {/* Teacher's Action Plan & Parent Advice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">২. স্যারের স্পেশাল কেয়ার অ্যাকশন প্ল্যান:</label>
                <textarea
                  rows="3"
                  value={currentRecord?.teacherAction || ''}
                  onChange={e => updateCurrentRecord('teacherAction', e.target.value)}
                  placeholder="যেমন: ক্লাসের পর ১৫ মিনিট আলাদা বসিয়ে অঙ্ক বুঝিয়ে দেওয়া..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-sans"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">৩. অভিভাবকের প্রতি বিশেষ পরামর্শ:</label>
                <textarea
                  rows="3"
                  value={currentRecord?.guardianDiscussion || ''}
                  onChange={e => updateCurrentRecord('guardianDiscussion', e.target.value)}
                  placeholder="যেমন: প্রতিদিন ১ ঘণ্টা বাড়িতে মোবাইল ছাড়া অনুশীলনে নজর রাখবেন..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-sans"
                />
              </div>
            </div>

            {/* Observation Diary Log */}
            <div className="space-y-3 pt-2">
              <label className="block font-bold text-slate-700">
                ৪. অগ্রগতি ডায়েরি ও শিক্ষক মন্তব্য (Observations Log):
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="আজকের অগ্রগতি সম্পর্কে ছোট নোট লিখুন..."
                  value={newNoteInput}
                  onChange={e => setNewNoteInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddLog())}
                  className="flex-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-sans"
                />
                <button
                  type="button"
                  onClick={handleAddLog}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm"
                >
                  লগ যোগ করুন
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {(currentRecord?.logs || []).map((l, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-start gap-2">
                    <span className="font-sans text-slate-800">{l.note}</span>
                    <span className="text-[10px] text-slate-500 font-bold shrink-0">{l.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-10 bg-white rounded-3xl border border-slate-200 text-center text-slate-400">
            শিক্ষার্থী তালিকা থেকে যেকোনো একজন শিক্ষার্থী নির্বাচন করুন।
          </div>
        )}
      </div>

      {/* PRINT MODAL: Student Care & Diagnostic Card */}
      {showPrintModal && currentStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-10 space-y-6 my-8 font-sans print:m-0 print:p-0 print:shadow-none">
            
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 print:hidden">
              <span className="font-black text-slate-800 text-sm">🖨️ অভিভাবক মিটিং কেয়ার কার্ড প্রিভিউ</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>এখনই প্রিন্ট করুন</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>

            {/* Official Report Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 uppercase">
                {customData.centerName || 'B.G. TUTORIAL HOME'}
              </h1>
              <p className="text-xs font-bold text-slate-700">
                দক্ষিণ হাবড়া, উত্তর ২৪ পরগণা • শিক্ষক: {customData.teacherName || 'বাবুন ঘোষ'} ({customData.phone || '9733974425'})
              </p>
              <h2 className="text-sm font-black bg-rose-100 text-rose-900 py-1 px-3 rounded-full inline-block mt-2">
                ব্যক্তিগত শিক্ষার্থী একাডেমিক কেয়ার ও ডায়াগনস্টিক রিপোর্ট
              </h2>
            </div>

            {/* Student Info Box */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold text-slate-800">
              <div>শিক্ষার্থীর নাম: {currentStudent.name}</div>
              <div>শ্রেণী / ব্যাচ: {currentStudent.batch}</div>
              <div>রোল নং: {currentStudent.roll}</div>
              <div>অভিভাবক: {currentStudent.guardianName || 'অভিভাবক'}</div>
            </div>

            {/* Weaknesses List */}
            <div className="space-y-2 text-xs">
              <strong className="text-rose-900 block border-b border-slate-300 pb-1">
                চিহ্নিত দুর্বলতার বিষয়সমূহ ও বিশেষ যত্নের ক্ষেত্র:
              </strong>
              <ul className="list-disc pl-5 space-y-1 text-slate-800">
                {(currentRecord?.weaknesses || []).map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>

            {/* Teacher Plan & Parent Advice */}
            <div className="space-y-3 text-xs border-t border-slate-300 pt-3">
              <div>
                <strong className="text-slate-900 block">কোচিং সেন্টারে গৃহীত বিশেষ ব্যবস্থা:</strong>
                <p className="text-slate-700 mt-0.5">{currentRecord?.teacherAction || 'বিশেষ তত্ত্বাবধানে নিয়মিত অধ্যায়ভিত্তিক অনুশীলন করানো হচ্ছে।'}</p>
              </div>

              <div>
                <strong className="text-slate-900 block">অভিভাবকদের প্রতি নিবেদন:</strong>
                <p className="text-slate-700 mt-0.5">{currentRecord?.guardianDiscussion || 'বাড়িতে প্রতিদিন নিয়ম করে লেখার অভ্যাসে একটু নজর দিন।'}</p>
              </div>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-end pt-12 border-t border-slate-300 text-xs font-bold text-slate-700">
              <div className="text-center">
                <div className="border-t border-slate-500 w-36 mb-1"></div>
                <span>অভিভাবকের স্বাক্ষর</span>
              </div>

              <div className="text-center">
                <div className="border-t border-slate-500 w-36 mb-1"></div>
                <span>শিক্ষকের স্বাক্ষর (বাবুন ঘোষ)</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
