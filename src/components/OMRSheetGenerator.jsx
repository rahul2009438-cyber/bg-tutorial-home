import React, { useState } from 'react';
import { Printer, CheckCircle, HelpCircle, Sparkles, ArrowLeft } from 'lucide-react';

export default function OMRSheetGenerator({ customData = {}, onBack }) {
  const [questionCount, setQuestionCount] = useState(30); // 20, 30, 50
  const [examName, setExamName] = useState('পর্যায়ক্রমিক মক টেস্ট ২০২৬');
  const [subject, setSubject] = useState('গণিত ও ভৌতবিজ্ঞান');
  const [batch, setBatch] = useState('Class 10');

  const questions = Array.from({ length: questionCount }, (_, i) => i + 1);
  const options = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-6">
      {/* Controls (Hidden in print) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 p-6 rounded-3xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OMR শিট জেনারেটর • PHASE 4</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">স্ট্যান্ডার্ড ওএমআর অ্যান্সার শিট প্রিন্টার</h2>
          <p className="text-xs text-indigo-200/80 mt-1">২০, ৩০ অথবা ৫০ প্রশ্নের জন্য প্রিন্ট-রেডি বাবল শিট তৈরি ও এক-ক্লিকে প্রিন্ট।</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs flex items-center space-x-2 shadow-lg shadow-indigo-500/30 transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>OMR শিট প্রিন্ট করুন</span>
          </button>
        </div>
      </div>

      {/* Config Bar (Hidden in print) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white print:hidden">
        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">প্রশ্নের সংখ্যা</label>
          <div className="flex space-x-2">
            {[20, 30, 50].map(cnt => (
              <button
                key={cnt}
                type="button"
                onClick={() => setQuestionCount(cnt)}
                className={`flex-1 py-1.5 rounded-xl font-black text-xs border transition ${
                  questionCount === cnt
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                {cnt} টি
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">পরীক্ষার নাম</label>
          <input
            type="text"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">বিষয়</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">শ্রেণী / ব্যাচ</label>
          <input
            type="text"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Printable OMR Sheet Container */}
      <div className="bg-white text-slate-900 p-8 rounded-3xl border border-slate-300 shadow-xl max-w-4xl mx-auto print:border-none print:shadow-none print:m-0 print:p-4">
        {/* Sheet Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {customData.coachingName || 'বি.জি. টিউটোরিয়াল হোম'}
          </h1>
          <p className="text-xs font-bold text-slate-700">
            দক্ষিণ হাবড়া, এস. এন. দে রোড • পরিচালক ও শিক্ষক: {customData.teacherName || 'বাবুন ঘোষ'} (ফোন: {customData.phone || '9733974425'})
          </p>
          <div className="inline-block mt-2 px-4 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs font-black uppercase tracking-wider">
            OMR উত্তরপত্র — {examName}
          </div>
        </div>

        {/* Student Info Filling Fields */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl border border-slate-300 text-xs mb-6 bg-slate-50/50">
          <div>
            <span className="font-bold text-slate-600 block">শিক্ষার্থীর নাম:</span>
            <div className="border-b border-dotted border-slate-400 h-6"></div>
          </div>
          <div>
            <span className="font-bold text-slate-600 block">রোল নম্বর:</span>
            <div className="border-b border-dotted border-slate-400 h-6"></div>
          </div>
          <div>
            <span className="font-bold text-slate-600 block">শ্রেণী: <strong className="text-slate-900">{batch}</strong></span>
            <span className="font-bold text-slate-600 block mt-1">বিষয়: <strong className="text-slate-900">{subject}</strong></span>
          </div>
          <div>
            <span className="font-bold text-slate-600 block">শিক্ষকের স্বাক্ষর:</span>
            <div className="border-b border-dotted border-slate-400 h-6"></div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-[10px] text-slate-600 mb-6 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
          <strong>নির্দেশাবলী:</strong> উত্তরপত্র পূরণের জন্য শুধুমাত্র নীল বা কালো বলপেন ব্যবহার করুন। সঠিক বৃত্তটি সম্পূর্ণভাবে ভরাট করুন। কোনো অবাঞ্ছিত দাগ দেবেন না।
        </div>

        {/* Bubbles Grid (Columns of 10 or 15) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: Math.ceil(questionCount / 10) }, (_, colIdx) => {
            const startQ = colIdx * 10 + 1;
            const endQ = Math.min(questionCount, (colIdx + 1) * 10);
            const colQuestions = questions.slice(startQ - 1, endQ);

            return (
              <div key={colIdx} className="space-y-2 border border-slate-200 p-3 rounded-xl">
                <div className="flex items-center justify-between text-[11px] font-black border-b pb-1 text-slate-600">
                  <span>প্রশ্ন নং</span>
                  <div className="flex space-x-3 pr-2">
                    <span>A</span><span>B</span><span>C</span><span>D</span>
                  </div>
                </div>

                {colQuestions.map(qNum => (
                  <div key={qNum} className="flex items-center justify-between py-1 text-xs font-bold border-b border-slate-100">
                    <span className="w-8 font-mono">{String(qNum).padStart(2, '0')}.</span>
                    <div className="flex space-x-2">
                      {options.map(opt => (
                        <div
                          key={opt}
                          className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500 font-mono hover:bg-slate-200 cursor-pointer"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
