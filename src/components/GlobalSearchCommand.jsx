import React, { useState, useEffect } from 'react';
import { Search, X, User, FileText, CreditCard, Award, ArrowRight, CornerDownLeft } from 'lucide-react';
import { db } from '../utils/db';

export default function GlobalSearchCommand({ isOpen, onClose, onSelectStudent }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    students: [],
    fees: [],
    exams: [],
    notices: []
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // toggle modal
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ students: [], fees: [], exams: [], notices: [] });
      return;
    }

    const searchAll = async () => {
      const q = query.toLowerCase();
      try {
        const [allStudents, allFees, allExams, allNotices] = await Promise.all([
          db.students.toArray(),
          db.feePayments.toArray(),
          db.examResults.toArray(),
          db.notices.toArray()
        ]);

        const matchedStudents = allStudents.filter(s =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.studentId && s.studentId.toLowerCase().includes(q)) ||
          (s.phone && s.phone.includes(q))
        ).slice(0, 5);

        const matchedFees = allFees.filter(f =>
          (f.studentName && f.studentName.toLowerCase().includes(q)) ||
          (f.receiptNo && f.receiptNo.toLowerCase().includes(q))
        ).slice(0, 5);

        const matchedExams = allExams.filter(e =>
          (e.studentName && e.studentName.toLowerCase().includes(q)) ||
          (e.examName && e.examName.toLowerCase().includes(q))
        ).slice(0, 5);

        const matchedNotices = allNotices.filter(n =>
          (n.title && n.title.toLowerCase().includes(q)) ||
          (n.content && n.content.toLowerCase().includes(q))
        ).slice(0, 3);

        setResults({
          students: matchedStudents,
          fees: matchedFees,
          exams: matchedExams,
          notices: matchedNotices
        });
      } catch (e) {
        console.warn('Search query error:', e);
      }
    };

    const debounce = setTimeout(searchAll, 200);
    return () => clearTimeout(debounce);
  }, [query]);

  if (!isOpen) return null;

  const totalResults = results.students.length + results.fees.length + results.exams.length + results.notices.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl text-white">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-emerald-400" />
          <input
            type="text"
            autoFocus
            placeholder="শিক্ষার্থী, আইডি, ফোন নম্বর, ফি রসিদ বা নোটিশ দিয়ে খুঁজুন..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {query.trim() && totalResults === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              "{query}" সংক্রান্ত কোনো রেকর্ড পাওয়া যায়নি।
            </div>
          )}

          {/* Students Group */}
          {results.students.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                শিক্ষার্থী ({results.students.length})
              </span>
              {results.students.map(s => (
                <div
                  key={s.studentId || s.id}
                  onClick={() => {
                    if (onSelectStudent) onSelectStudent(s);
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between cursor-pointer group transition"
                >
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold text-xs text-white group-hover:text-emerald-300 transition">
                        {s.name} ({s.batch})
                      </div>
                      <div className="text-[10px] text-slate-400">
                        UID: {s.studentId} • ফোন: {s.phone || '—'}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
                </div>
              ))}
            </div>
          )}

          {/* Fees Group */}
          {results.fees.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 block">
                ফি রসিদ ({results.fees.length})
              </span>
              {results.fees.map(f => (
                <div key={f.id} className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-4 h-4 text-teal-400" />
                    <div>
                      <div className="font-bold text-white">{f.studentName} — {f.month}</div>
                      <div className="text-[10px] text-slate-400 font-mono">#{f.receiptNo} • {f.date}</div>
                    </div>
                  </div>
                  <span className="font-black text-emerald-400">₹{f.amount}</span>
                </div>
              ))}
            </div>
          )}

          {/* Exams Group */}
          {results.exams.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                পরীক্ষার মার্কস ({results.exams.length})
              </span>
              {results.exams.map(e => (
                <div key={e.id} className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <Award className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-bold text-white">{e.studentName} — {e.examName}</div>
                      <div className="text-[10px] text-slate-400">{e.batch} • {e.date}</div>
                    </div>
                  </div>
                  <span className="font-black text-amber-300">{e.marks}/{e.totalMarks} ({e.percentage}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>দ্রুত অনুসন্ধান: শিক্ষার্থী, আইডি, ফি রসিদ</span>
          <span>ESC চেপে বন্ধ করুন</span>
        </div>
      </div>
    </div>
  );
}
