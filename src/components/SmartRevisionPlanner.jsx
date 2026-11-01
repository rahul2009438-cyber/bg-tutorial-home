import React, { useState, useEffect } from 'react';
import { db } from '../utils/db';
import { Calendar, Clock, BookOpen, CheckCircle2, AlertCircle, Printer, Sparkles, Plus, Trash2 } from 'lucide-react';

export default function SmartRevisionPlanner({ customData = {} }) {
  const [selectedBatch, setSelectedBatch] = useState('Class 10');
  const [targetExamDate, setTargetExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  const [revisionItems, setRevisionItems] = useState([
    { id: 1, chapter: 'একচলবিশিষ্ট দ্বিঘাত সমীকরণ (Quadratic Equation)', subject: 'গণিত', priority: 'High', daysNeeded: 4, completed: true },
    { id: 2, chapter: 'গ্যাসের আচরণ ও বয়েল-চার্লসের সূত্র', subject: 'ভৌতবিজ্ঞান', priority: 'High', daysNeeded: 3, completed: false },
    { id: 3, chapter: 'বৃত্ত সম্পর্কিত উপপাদ্য (Circle Theorems)', subject: 'গণিত', priority: 'Medium', daysNeeded: 4, completed: false },
    { id: 4, chapter: 'চলতড়িৎ ও ওহমের সূত্র (Ohm’s Law & Electricity)', subject: 'ভৌতবিজ্ঞান', priority: 'High', daysNeeded: 5, completed: false },
    { id: 5, chapter: 'অনুপাত ও সমানুপাত (Ratio & Proportion)', subject: 'গণিত', priority: 'Medium', daysNeeded: 3, completed: false },
    { id: 6, chapter: 'রাসায়নিক গণনা (Chemical Calculations)', subject: 'ভৌতবিজ্ঞান', priority: 'Medium', daysNeeded: 3, completed: false }
  ]);

  const [newChapter, setNewChapter] = useState('');
  const [newSubject, setNewSubject] = useState('গণিত');
  const [newDays, setNewDays] = useState(3);

  const toggleComplete = (id) => {
    const updated = revisionItems.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
saveItems(updated);
  };

  const addItem = (e) => {
    e.preventDefault();
    if (!newChapter.trim()) return;
    const updated = [
      ...revisionItems,
      {
        id: Date.now(),
        chapter: newChapter.trim(),
        subject: newSubject,
        priority: 'Medium',
        daysNeeded: Number(newDays) || 3,
        completed: false
      }
    ];
    saveItems(updated);
    setNewChapter('');
  };

  const removeItem = (id) => {
    const updated = revisionItems.filter(item => item.id !== id);
saveItems(updated);
  };

  // Remaining days to exam
  const daysToExam = Math.max(0, Math.ceil((new Date(targetExamDate) - new Date()) / (1000 * 60 * 60 * 24)));
  const totalDaysNeeded = revisionItems.reduce((acc, it) => acc + (it.completed ? 0 : it.daysNeeded), 0);
  const isOverloaded = totalDaysNeeded > daysToExam;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 border border-amber-700/40 p-6 rounded-3xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>স্মার্ট রিভিশন প্ল্যানার ও ক্যালেন্ডার</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">পরীক্ষামুখী পদ্ধতিগত সিলেবাস রিভিশন রোডম্যাপ</h2>
          <p className="text-xs text-amber-200/80 mt-1">
            আসন্ন পরীক্ষার তারিখ অনুযায়ী প্রয়োজনীয় দিন গণনা ও অধ্যায়ভিত্তিক রিভিশন ট্র্যাকার।
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition print:hidden"
        >
          <Printer className="w-4 h-4" />
          <span>রিভিশন প্ল্যান প্রিন্ট করুন</span>
        </button>
      </div>

      {/* Target Setting & Pace Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white">
        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">ব্যাচ</label>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
          >
            {['Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">আসন্ন পরীক্ষার তারিখ</label>
          <input
            type="date"
            value={targetExamDate}
            onChange={(e) => setTargetExamDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className={`p-3 rounded-xl border flex items-center justify-between ${
          isOverloaded ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
        }`}>
          <div>
            <div className="text-[10px] uppercase font-black">বাকি সময়</div>
            <div className="text-xl font-black">{daysToExam} দিন</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-black">প্রয়োজনীয় দিন</div>
            <div className="text-xl font-black">{totalDaysNeeded} দিন</div>
          </div>
        </div>
      </div>

      {isOverloaded && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>সতর্কতা: অবশিষ্ট দিনের তুলনায় রিভিশনের জন্য প্রয়োজনীয় দিন বেশি। অগ্রাধিকার ভিত্তিতে চ্যাপ্টার রিভিশন শুরু করার পরামর্শ দেওয়া হচ্ছে।</span>
        </div>
      )}

      {/* Add New Revision Chapter */}
      <form onSubmit={addItem} className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 print:hidden">
        <input
          type="text"
          placeholder="নতুন রিভিশন অধ্যায়ের নাম লিখুন..."
          value={newChapter}
          onChange={(e) => setNewChapter(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
        />
        <select
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
        >
          <option value="গণিত">গণিত</option>
          <option value="ভৌতবিজ্ঞান">ভৌতবিজ্ঞান</option>
          <option value="জীবনবিজ্ঞান">জীবনবিজ্ঞান</option>
          <option value="রাষ্ট্রবিজ্ঞান">রাষ্ট্রবিজ্ঞান</option>
        </select>
        <input
          type="number"
          min="1"
          max="30"
          value={newDays}
          onChange={(e) => setNewDays(e.target.value)}
          placeholder="দিন"
          className="w-20 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-center text-white focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-1 transition"
        >
          <Plus className="w-4 h-4" />
          <span>যোগ করুন</span>
        </button>
      </form>

      {/* Chapters Revision Checklist */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl text-white">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-black">রিভিশন চেকলিস্ট ও অধ্যায়ভিত্তিক পরিকল্পনা ({revisionItems.length} টি)</span>
          <span className="text-[11px] text-slate-400">সম্পন্ন: {revisionItems.filter(i => i.completed).length} / {revisionItems.length}</span>
        </div>

        <div className="divide-y divide-slate-800">
          {revisionItems.map(item => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => toggleComplete(item.id)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition ${
                    item.completed ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600 hover:border-slate-400'
                  }`}
                >
                  {item.completed && <CheckCircle2 className="w-4 h-4" />}
                </button>
                <div>
                  <div className={`text-xs font-bold ${item.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                    {item.chapter}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    বিষয়: {item.subject} • আনুমানিক সময়: {item.daysNeeded} দিন
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  item.priority === 'High' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {item.priority === 'High' ? 'উচ্চ অগ্রাধিকার' : 'সাধারণ'}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition print:hidden"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
