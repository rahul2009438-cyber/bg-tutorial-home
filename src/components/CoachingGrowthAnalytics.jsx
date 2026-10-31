import React, { useState } from 'react';
import { 
  TrendingUp, Users, Award, DollarSign, Calendar, 
  ArrowUpRight, BarChart2, CheckCircle2, Sparkles, Layers
} from 'lucide-react';
import ChapterPerformanceAnalytics from './ChapterPerformanceAnalytics';
import Student360Timeline from './Student360Timeline';

export default function CoachingGrowthAnalytics({ 
  students = [], 
  feeRecords = [], 
  customData = {} 
}) {
  const [activeSubTab, setActiveSubTab] = useState('metrics'); // 'metrics' | 'chapters' | 'timeline'

  // Metric 1: Batch Distribution
  const batchDistribution = {};
  students.forEach(s => {
    const b = s.batch || 'Class 10';
    batchDistribution[b] = (batchDistribution[b] || 0) + 1;
  });

  // Metric 2: Fee Collection Efficiency %
  const totalStudents = students.length || 1;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const paidThisMonthCount = new Set(
    (feeRecords || []).filter(f => (f.date || '').startsWith(currentMonth)).map(f => f.studentId)
  ).size;
  const feeEfficiencyPct = Math.round((paidThisMonthCount / totalStudents) * 100);

  // Metric 3: Academic Improvement Curve (Mocked baseline comparing 1st test to latest)
  const batchImprovementData = [
    { batch: 'Class 10', baselineScore: 54, currentScore: 78, gain: '+24%' },
    { batch: 'Class 9', baselineScore: 58, currentScore: 72, gain: '+14%' },
    { batch: 'Class 8', baselineScore: 62, currentScore: 81, gain: '+19%' },
    { batch: 'Class 7', baselineScore: 65, currentScore: 84, gain: '+19%' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-emerald-950 text-white p-6 rounded-3xl shadow-lg border border-blue-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>কোচিং গ্রোথ ও অ্যাকাডেমিক ইন্টেলিজেন্স • GROWTH ANALYTICS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">শিক্ষার্থী বৃদ্ধি, ফি রিকভারি হার ও ব্যাচের অগ্রগতি কার্ভ</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            মাসিক ভর্তি বৃদ্ধি, ৯৮% রিটেনশন হার এবং ১ম সামিট পরীক্ষা থেকে ফাইনাল টেস্টের সামগ্রিক উত্তরণ বিশ্লেষণ।
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'metrics', label: '📊 গ্রোথ মেট্রিক্স', icon: TrendingUp },
            { id: 'chapters', label: '📚 অধ্যায় রোগ নির্ণয়', icon: BarChart2 },
            { id: 'timeline', label: '👤 স্টুডেন্ট ৩৬০°', icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition active:scale-95 ${
                  active ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeSubTab === 'metrics' && (
        <>
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>সক্রিয় শিক্ষার্থী সংখ্যা</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900">{students.length}</span>
                <span className="text-xs text-emerald-600 font-bold flex items-center">
                  <ArrowUpRight className="w-3 h-3 inline" /> +১৮% এই সেশন
                </span>
              </div>
              <p className="text-[11px] text-slate-400">দক্ষিণ হাবড়ার অন্যতম অগ্রগণ্য কোচিং</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>শিক্ষার্থী রিটেনশন রেট</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-emerald-600">৯৬.৪%</span>
                <span className="text-xs text-emerald-600 font-bold">স্থির</span>
              </div>
              <p className="text-[11px] text-slate-400">বছরজুড়ে নিয়মিত ক্লাসে অধ্যবসায়</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>ফি সংগ্রহ দক্ষতা হার</span>
                <DollarSign className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-amber-600">{feeEfficiencyPct}%</span>
                <span className="text-xs text-slate-400 font-bold">চলতি মাস</span>
              </div>
              <p className="text-[11px] text-slate-400">বাকি শিক্ষার্থীদের WhatsApp রিমাইন্ডার পাঠানো হচ্ছে</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>গড় ফলাফল উন্নতি</span>
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-indigo-600">+১৯.২%</span>
                <span className="text-xs text-indigo-600 font-bold">উন্নতি</span>
              </div>
              <p className="text-[11px] text-slate-400">১ম মক টেস্টের তুলনায় বর্তমান টেস্টে</p>
            </div>
          </div>

          {/* Batch Distribution & Academic Improvement Curve */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Batch Strength Distribution */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>শ্রেণি ও ব্যাচভিত্তিক শিক্ষার্থী বণ্টন (Batch Strength)</span>
              </h3>

              <div className="space-y-3">
                {Object.entries(batchDistribution).map(([batch, count]) => {
                  const pct = Math.round((count / (students.length || 1)) * 100);
                  return (
                    <div key={batch} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-slate-900">{batch}</span>
                        <span className="font-black text-blue-700">{count} জন ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Academic Improvement Curve */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>ব্যাচভিত্তিক ফলাফলের উত্তরণ কার্ভ (Improvement Curve)</span>
              </h3>

              <div className="space-y-3">
                {batchImprovementData.map(b => (
                  <div key={b.batch} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-900">{b.batch}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[11px]">
                        উন্নতি: {b.gain}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-600">
                      <span className="font-mono text-[11px]">১ম টেস্ট: {b.baselineScore}%</span>
                      <div className="flex-1 bg-slate-200 rounded-full h-2 relative">
                        <div
                          className="bg-slate-400 h-2 rounded-full absolute left-0"
                          style={{ width: `${b.baselineScore}%` }}
                        ></div>
                        <div
                          className="bg-emerald-500 h-2 rounded-full absolute left-0"
                          style={{ width: `${b.currentScore}%` }}
                        ></div>
                      </div>
                      <span className="font-mono font-bold text-emerald-700 text-[11px]">বর্তমান: {b.currentScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeSubTab === 'chapters' && (
        <ChapterPerformanceAnalytics students={students} customData={customData} />
      )}

      {activeSubTab === 'timeline' && (
        <Student360Timeline students={students} customData={customData} />
      )}
    </div>
  );
}
