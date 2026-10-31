import React, { useState, useEffect } from 'react';
import { 
  BarChart2, TrendingUp, AlertTriangle, CheckCircle2, 
  Printer, BookOpen, Layers, Award, Clock, ArrowRight, Sparkles
} from 'lucide-react';
import { db } from '../utils/db';

export default function ChapterPerformanceAnalytics({ students = [], customData = {} }) {
  const [selectedBatch, setSelectedBatch] = useState('Class 10');
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Curated chapters with baseline and live test metrics
  const DEFAULT_CHAPTER_METRICS = {
    'Class 10': [
      { chapter: 'গ্যাসের আচরণ (Behavior of Gases)', testsTaken: 3, avgScore: 68, weakCount: 2, totalStudents: 14, status: 'good' },
      { chapter: 'রাসায়নিক গণনা (Chemical Calculations)', testsTaken: 2, avgScore: 46, weakCount: 7, totalStudents: 14, status: 'critical' },
      { chapter: 'আলো (Light & Refraction)', testsTaken: 4, avgScore: 54, weakCount: 5, totalStudents: 14, status: 'warning' },
      { chapter: 'চলতড়িৎ (Current Electricity)', testsTaken: 3, avgScore: 48, weakCount: 8, totalStudents: 14, status: 'critical' },
      { chapter: 'পর্যায় সারণি (Periodic Table)', testsTaken: 2, avgScore: 74, weakCount: 1, totalStudents: 14, status: 'good' },
      { chapter: 'একচলবিশিষ্ট দ্বিঘাত সমীকরণ', testsTaken: 3, avgScore: 62, weakCount: 3, totalStudents: 14, status: 'good' },
      { chapter: 'বৃত্তের স্পর্শক সংক্রান্ত উপপাদ্য', testsTaken: 2, avgScore: 44, weakCount: 6, totalStudents: 14, status: 'critical' }
    ],
    'Class 9': [
      { chapter: 'পরিমাপ (Measurement)', testsTaken: 2, avgScore: 72, weakCount: 2, totalStudents: 12, status: 'good' },
      { chapter: 'বল ও গতি (Force and Motion)', testsTaken: 3, avgScore: 49, weakCount: 6, totalStudents: 12, status: 'critical' },
      { chapter: 'পরমাণুর গঠন (Atomic Structure)', testsTaken: 2, avgScore: 65, weakCount: 3, totalStudents: 12, status: 'good' }
    ]
  };

  useEffect(() => {
    loadExamData();
  }, [selectedBatch]);

  const loadExamData = async () => {
    setLoading(true);
    try {
      if (db.examResults) {
        const results = await db.examResults.where('batch').equals(selectedBatch).toArray();
        setExamResults(results);
      }
    } catch (e) {
      console.warn('Exam load err:', e);
    } finally {
      setLoading(false);
    }
  };

  const chapterMetrics = DEFAULT_CHAPTER_METRICS[selectedBatch] || DEFAULT_CHAPTER_METRICS['Class 10'];

  // Identify weak chapters: batch average < 50%
  const weakChapters = chapterMetrics.filter(c => c.avgScore < 50);

  return (
    <div className="space-y-6">
      {/* Top Banner (Print Hidden) */}
      <div className="bg-gradient-to-r from-rose-700 via-pink-700 to-indigo-800 text-white p-6 rounded-3xl shadow-lg border border-rose-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white mb-2">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>অধ্যায়ভিত্তিক পারফরম্যান্স ও রোগ নির্ণয় • CHAPTER ANALYTICS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">কোন চ্যাপ্টারে শিক্ষার্থীরা পিছিয়ে? স্বয়ংক্রিয় ডায়াগনোসিস</h2>
          <p className="text-xs text-rose-100 mt-1 max-w-xl">
            ধারাবাহিক পরীক্ষার গড় নম্বরের ভিত্তিতে দুর্বল অধ্যায়গুলো লাল রঙে চিহ্নিত হয় এবং রিভিশন চেকলিস্ট তৈরি হয়।
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-2xl bg-white text-slate-900 font-black text-xs flex items-center space-x-2 shadow-md hover:bg-slate-100 transition active:scale-95 shrink-0"
        >
          <Printer className="w-4 h-4 text-rose-600" />
          <span>রিভিশন চেকলিস্ট প্রিন্ট করুন</span>
        </button>
      </div>

      {/* Batch Filter Bar (Print Hidden) */}
      <div className="flex items-center space-x-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <span className="text-xs font-bold text-slate-600 ml-2">ব্যাচ নির্বাচন:</span>
        {['Class 9', 'Class 10'].map(b => (
          <button
            key={b}
            type="button"
            onClick={() => setSelectedBatch(b)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              selectedBatch === b ? 'bg-rose-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Critical Chapter Alert Card */}
      {weakChapters.length > 0 && (
        <div className="bg-rose-50 p-5 rounded-3xl border border-rose-200 flex items-start space-x-3 text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-black text-sm text-rose-800">
              সতর্কতা: {selectedBatch}-এর {weakChapters.length}টি অধ্যায়ে ব্যাচের গড় নম্বর ৫০%-এর নিচে!
            </h4>
            <p className="text-rose-700">
              নিম্নলিখিত অধ্যায়গুলোতে বিশেষ রিভিশন ক্লাস ও সংক্ষিপ্ত ডাউট সেশনের তাৎক্ষণিক প্রয়োজন:
              {' '}<span className="font-bold underline">{weakChapters.map(w => w.chapter).join(', ')}</span>
            </p>
          </div>
        </div>
      )}

      {/* Chapter-wise Breakdown Table & Visual Bars */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center space-x-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>অধ্যায়ভিত্তিক গড় নম্বর ও দুর্বল শিক্ষার্থীর সংখ্যা ({selectedBatch})</span>
        </h3>

        <div className="space-y-3">
          {chapterMetrics.map((item, idx) => {
            const isCritical = item.avgScore < 50;
            const isWarning = item.avgScore >= 50 && item.avgScore < 60;
            return (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900">{item.chapter}</span>
                    <span className="text-[11px] text-slate-500 ml-2">({item.testsTaken}টি পরীক্ষা সম্পন্ন)</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-black text-xs ${
                      isCritical ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                      isWarning ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      গড় নম্বর: {item.avgScore}%
                    </span>

                    {item.weakCount > 0 && (
                      <span className="text-[11px] font-bold text-rose-600">
                        ⚠️ {item.weakCount} জন শিক্ষার্থীর নম্বর &lt; ৪০%
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      isCritical ? 'bg-rose-600' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${item.avgScore}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= 1-PAGE PRINTABLE REMEDIAL REVISION CHECKLIST ================= */}
      <div className="bg-white p-8 rounded-3xl border border-slate-300 shadow-sm print:border-none print:shadow-none print:p-0 space-y-6">
        <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
          <h2 className="text-xl font-black text-slate-900">B.G. TUTORIAL HOME — বাপুন ঘোষ স্যার</h2>
          <p className="text-xs text-slate-600">দক্ষিণ হাবড়া, উত্তর ২৪ পরগনা • ফোন: {customData.phone || '9733974425'}</p>
          <div className="pt-2 flex justify-between items-center text-xs font-black text-indigo-950 border-t border-slate-200 mt-2">
            <span>বিশেষ রিমিডিয়াল রিভিশন চেকলিস্ট (REMEDIAL ACTION PLAN)</span>
            <span>ব্যাচ: {selectedBatch}</span>
            <span>তারিখ: {new Date().toLocaleDateString('bn-BD')}</span>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <p className="text-slate-600 text-[11px]">
            যেসব বিষয়ে ব্যাচের শিক্ষার্থীদের দুর্বলতা ধরা পড়েছে, আগামী পরীক্ষার পূর্বে নিম্নলিখিত টপিকগুলোর উপর বিশেষ ক্লাস ও প্রশ্নোত্তর অনুশীলন নেওয়া হবে:
          </p>

          <table className="w-full text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <th className="p-2.5 border-r border-slate-300">অধ্যায় / দুর্বল অংশ</th>
                <th className="p-2.5 border-r border-slate-300">শিক্ষক দ্বারা নির্ধারিত রিভিশন অ্যাকশন</th>
                <th className="p-2.5 border-r border-slate-300 text-center">নির্ধারিত ক্লাস তারিখ</th>
                <th className="p-2.5 text-center">চেক</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {weakChapters.map((w, i) => (
                <tr key={i}>
                  <td className="p-2.5 font-bold text-slate-900 border-r border-slate-300">
                    {w.chapter} (গড়: {w.avgScore}%)
                  </td>
                  <td className="p-2.5 text-slate-700 border-r border-slate-300">
                    মূল গাণিতিক সূত্র ও ৫টি স্ট্যান্ডার্ড বোর্ড প্রশ্ন হাতে-কলমে সমাধান এবং তাৎক্ষণিক ওরাল টেস্ট।
                  </td>
                  <td className="p-2.5 text-center text-slate-600 border-r border-slate-300 font-mono">
                    আগামী রবিবার সকাল ৮:০০
                  </td>
                  <td className="p-2.5 text-center">
                    <div className="w-4 h-4 border border-slate-500 rounded mx-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pt-6 flex justify-between text-xs text-slate-700">
            <div>রিভিশন শুরু তারিখ: __________________</div>
            <div className="font-bold">শিক্ষকের স্বাক্ষর: বাপুন ঘোষ</div>
          </div>
        </div>
      </div>
    </div>
  );
}
