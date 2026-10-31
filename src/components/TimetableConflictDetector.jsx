import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, Plus, Trash2, CheckCircle2, Sparkles } from 'lucide-react';
import { db, logAudit } from '../utils/db';

export default function TimetableConflictDetector({ customData = {} }) {
  const [routines, setRoutines] = useState([]);
  const [day, setDay] = useState('সোমবার');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('17:30');
  const [batch, setBatch] = useState('Class 10');
  const [subject, setSubject] = useState('গণিত (Mathematics)');

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    try {
      const data = await db.routines.toArray();
      setRoutines(data);
    } catch (e) {
      console.warn('Error loading routines:', e);
    }
  };

  const daysOfWeek = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];

  // Conflict Detection Logic
  const checkConflicts = () => {
    const conflicts = [];
    for (let i = 0; i < routines.length; i++) {
      for (let j = i + 1; j < routines.length; j++) {
        const r1 = routines[i];
        const r2 = routines[j];
        if (r1.day === r2.day) {
          // Parse time overlap
          const [start1, end1] = (r1.time || '').split('-').map(t => t.trim());
          const [start2, end2] = (r2.time || '').split('-').map(t => t.trim());
          if (start1 && end1 && start2 && end2) {
            if (start1 < end2 && start2 < end1) {
              conflicts.push({
                day: r1.day,
                batch1: r1.batch,
                batch2: r2.batch,
                time1: r1.time,
                time2: r2.time
              });
            }
          }
        }
      }
    }
    return conflicts;
  };

  const conflicts = checkConflicts();

  const handleAddSlot = async (e) => {
    e.preventDefault();
    const timeFormatted = `${startTime} - ${endTime}`;

    const newSlot = {
      day,
      time: timeFormatted,
      batch,
      subject
    };

    try {
      await db.routines.add(newSlot);
      await logAudit('ROUTINE_ADD', 'TIMETABLE', `${batch} (${day} ${timeFormatted})`);
      loadRoutines();
    } catch (err) {
      alert('রুটিন যোগ করতে ব্যর্থ: ' + err.message);
    }
  };

  const handleDeleteSlot = async (id) => {
    try {
      await db.routines.delete(id);
      loadRoutines();
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-violet-950 via-slate-900 to-slate-900 border border-violet-800/40 p-6 rounded-3xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>স্মার্ট টাইমটেবিল ও ব্যাচ কনফ্লিক্ট ডিটেক্টর</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">সাপ্তাহিক রুটিন ও সময়সূচী ব্যবস্থাপনা</h2>
          <p className="text-xs text-violet-200/80 mt-1">
            একই সময়ে একাধিক ব্যাচের ওভারল্যাপ বা সময়সূচীর সংঘাত স্বয়ংক্রিয়ভাবে সনাক্ত করে সংকেত দিন।
          </p>
        </div>
      </div>

      {/* Conflict Warning Box if any */}
      {conflicts.length > 0 ? (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-rose-200 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-xs text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>সময়সূচীর সংঘাত সনাক্ত হয়েছে ({conflicts.length} টি কনফ্লিক্ট)</span>
          </div>
          <div className="text-xs space-y-1">
            {conflicts.map((c, i) => (
              <div key={i} className="pl-2 border-l-2 border-rose-500">
                {c.day}: <strong>{c.batch1} ({c.time1})</strong> এবং <strong>{c.batch2} ({c.time2})</strong> একই সময়ে নির্ধারিত রয়েছে।
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>কোনো সময়সূচীর সংঘাত নেই। সকল ব্যাচের ক্লাসের সময় নিখুঁতভাবে বিন্যস্ত রয়েছে।</span>
        </div>
      )}

      {/* Add Time Slot Form */}
      <form onSubmit={handleAddSlot} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-white">
        <h3 className="text-xs font-black text-white flex items-center space-x-2">
          <Plus className="w-4 h-4 text-violet-400" />
          <span>নতুন ক্লাসের সময়সূচী যোগ করুন</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">বার / দিন</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-violet-500"
            >
              {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">শুরু</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">সমাপ্তি</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">ব্যাচ</label>
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-violet-500"
            >
              {['Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Madhyamik Special'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">বিষয়</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="বিষয়..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-slate-950 font-black text-xs flex items-center space-x-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>রুটিনে যোগ করুন</span>
        </button>
      </form>

      {/* Routine Display Grouped by Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {daysOfWeek.map(d => {
          const slots = routines.filter(r => r.day === d);
          return (
            <div key={d} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-black text-xs text-violet-300">{d}</span>
                <span className="text-[10px] text-slate-500">{slots.length} টি ক্লাস</span>
              </div>

              {slots.length === 0 ? (
                <p className="text-[11px] text-slate-600 py-3 text-center">ক্লাস নেই</p>
              ) : (
                <div className="space-y-2">
                  {slots.map(s => (
                    <div key={s.id} className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{s.batch} — {s.subject}</div>
                        <div className="text-[10px] text-violet-300 font-mono mt-0.5">{s.time}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(s.id)}
                        className="text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
