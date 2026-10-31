import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, Award, AlertCircle, BarChart3, 
  CheckCircle2, Filter, Calendar, BookOpen, Layers
} from 'lucide-react';
import { db } from '../utils/db';

export default function AcademicAnalytics({ students = [] }) {
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [examResults, setExamResults] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        const [exams, att] = await Promise.all([
          db.examResults.toArray(),
          db.attendance.toArray()
        ]);
        setExamResults(exams);
        setAttendance(att);
      } catch (e) {
        console.warn('Analytics load error:', e);
      } finally {
        setLoading(false);
      }
    };
    loadAnalyticsData();
  }, []);

  const batches = ['All', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Madhyamik Special'];

  // Filter records by batch
  const filteredExams = selectedBatch === 'All' 
    ? examResults 
    : examResults.filter(e => e.batch === selectedBatch);

  const filteredAttendance = selectedBatch === 'All'
    ? attendance
    : attendance.filter(a => a.batch === selectedBatch);

  const filteredStudents = selectedBatch === 'All'
    ? students
    : students.filter(s => s.batch === selectedBatch);

  // Computations
  const totalExamsGiven = filteredExams.length;
  const avgPercentage = totalExamsGiven > 0
    ? (filteredExams.reduce((a, b) => a + (Number(b.percentage) || 0), 0) / totalExamsGiven).toFixed(1)
    : '0';

  const highestScore = totalExamsGiven > 0
    ? Math.max(...filteredExams.map(e => Number(e.percentage) || 0))
    : 0;

  const lowestScore = totalExamsGiven > 0
    ? Math.min(...filteredExams.map(e => Number(e.percentage) || 0))
    : 0;

  const weakScoresCount = filteredExams.filter(e => Number(e.percentage) < 40).length;

  const totalAttDays = filteredAttendance.length;
  const presentDays = filteredAttendance.filter(a => a.status === 'P').length;
  const overallAttRate = totalAttDays > 0
    ? ((presentDays / totalAttDays) * 100).toFixed(1)
    : '100';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-800/40 p-6 rounded-3xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>অ্যাডভান্সড একাডেমিক অ্যানালিটিক্স ড্যাশবোর্ড</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">ক্লাসরুম পারফরম্যান্স ও লার্নিং মেট্রিক্স</h2>
          <p className="text-xs text-indigo-200/80 mt-1">
            সংরক্ষিত পরীক্ষার মার্কস ও দৈনিক হাজিরার তথ্য থেকে সরাসরি নির্ণিত নির্ভরযোগ্য পরিসংখ্যান।
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500"
          >
            {batches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>গড় পরীক্ষার স্কোর</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{avgPercentage}%</div>
          <p className="text-[11px] text-slate-400 mt-1">{totalExamsGiven} টি সংরক্ষিত ফলাফল</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>সামগ্রিক হাজিরা হার</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-indigo-400">{overallAttRate}%</div>
          <p className="text-[11px] text-slate-400 mt-1">{filteredStudents.length} জন সক্রিয় শিক্ষার্থী</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>সর্বোচ্চ ও সর্বনিম্ন স্কোর</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{highestScore}% / {lowestScore}%</div>
          <p className="text-[11px] text-slate-400 mt-1">ব্যাচের সর্বোচ্চ বনাম সর্বনিম্ন</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>দুর্বল মূল্যায়ন সংখ্যা</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400">{weakScoresCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">প্রাপ্ত নম্বর &lt; 40%</p>
        </div>
      </div>

      {/* Recent Exam Breakdown Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl text-white">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-black">সাম্প্রতিক পরীক্ষার ফলাফল বিশ্লেষণ ({filteredExams.length} টি)</span>
          <span className="text-[11px] font-bold text-slate-400">ব্যাচ: {selectedBatch}</span>
        </div>

        {filteredExams.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            নির্বাচিত ব্যাচের কোনো পরীক্ষার ফলাফল পাওয়া যায়নি। ইউনিফাইড ব্যাচ কমান্ড সেন্টার থেকে মার্কস সংরক্ষণ করুন।
          </div>
        ) : (
          <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto">
            {filteredExams.slice(-15).reverse().map((ex, i) => (
              <div key={i} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-800/40 transition">
                <div>
                  <div className="font-bold text-white flex items-center space-x-2">
                    <span>{ex.studentName || 'শিক্ষার্থী'}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({ex.batch})</span>
                  </div>
                  <div className="text-[10px] text-slate-400">{ex.examName} • {ex.date}</div>
                </div>

                <div className="text-right">
                  <span className={`font-black ${
                    Number(ex.percentage) < 40 ? 'text-rose-400' : Number(ex.percentage) >= 80 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {ex.marks} / {ex.totalMarks} ({ex.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
