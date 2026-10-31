import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Calendar, CheckCircle2, Clock, Trash2, Share2, Sparkles, Filter } from 'lucide-react';
import { db, logAudit } from '../utils/db';

export default function HomeworkManager({ customData = {}, students = [] }) {
  const [selectedBatch, setSelectedBatch] = useState('Class 10');
  const [homeworkList, setHomeworkList] = useState([]);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('গণিত');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    loadHomeworks();
  }, [selectedBatch]);

  const loadHomeworks = async () => {
    try {
      const data = await db.homeworks.where('batch').equals(selectedBatch).toArray();
      setHomeworkList(data);
    } catch (e) {
      console.warn('Error loading homeworks:', e);
    }
  };

  const handleCreateHomework = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newHw = {
      batch: selectedBatch,
      subject,
      title: title.trim(),
      dueDate,
      instructions: instructions.trim(),
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    try {
      await db.homeworks.add(newHw);
      await logAudit('HOMEWORK_CREATE', 'HOMEWORK', `${title} (${selectedBatch})`);
      setTitle('');
      setInstructions('');
      loadHomeworks();
    } catch (err) {
      alert('হোমওয়ার্ক সংরক্ষণ ব্যর্থ: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('আপনি কি এই হোমওয়ার্ক টাস্কটি মুছে ফেলতে চান?')) return;
    try {
      await db.homeworks.delete(id);
      loadHomeworks();
    } catch (e) {
      console.warn(e);
    }
  };

  const shareOnWhatsApp = (hw) => {
    const teacherName = customData.teacherName || 'বাবুন ঘোষ';
    const teacherPhone = customData.phone || '9733974425';
    const msg = `📚 *বি.জি. টিউটোরিয়াল হোম — হোমওয়ার্ক টাস্ক*\n\nশ্রেণী: *${hw.batch}*\nবিষয়: ${hw.subject}\nটাস্ক: *${hw.title}*\nজমা দেওয়ার শেষ তারিখ: *${hw.dueDate}*\nবিবরণ: ${hw.instructions || 'নোটবুক ও টেক্সটবুক অনুশীলন সম্পন্ন করতে হবে।'}\n\nশিক্ষক: ${teacherName}\nফোন: ${teacherPhone}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-slate-900 border border-sky-800/40 p-6 rounded-3xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>হোমওয়ার্ক ও অ্যাসাইনমেন্ট ম্যানেজার</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">ব্যাচভিত্তিক হোমওয়ার্ক প্রদান ও ট্র্যাকিং</h2>
          <p className="text-xs text-sky-200/80 mt-1">
            প্রতিটি ব্যাচের জন্য বিষয়ভিত্তিক হোমওয়ার্ক দিন এবং এক ক্লিকে হোয়াটসঅ্যাপে শিক্ষার্থীদের পাঠান।
          </p>
        </div>

        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-sky-500"
        >
          {['Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Create New Homework Form */}
      <form onSubmit={handleCreateHomework} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-white">
        <h3 className="text-xs font-black text-white flex items-center space-x-2">
          <Plus className="w-4 h-4 text-sky-400" />
          <span>নতুন হোমওয়ার্ক তৈরি করুন ({selectedBatch})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">টাস্কের নাম / চ্যাপ্টার</label>
            <input
              type="text"
              required
              placeholder="যেমন: কোশষে দেখি ১.২ সম্পূর্ণ..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">বিষয়</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-sky-500"
            >
              <option value="গণিত">গণিত</option>
              <option value="ভৌতবিজ্ঞান">ভৌতবিজ্ঞান</option>
              <option value="জীবনবিজ্ঞান">জীবনবিজ্ঞান</option>
              <option value="রাষ্ট্রবিজ্ঞান">রাষ্ট্রবিজ্ঞান</option>
              <option value="দর্শন">দর্শন</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">জমা দেওয়ার শেষ তারিখ</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">বিশেষ নির্দেশাবলী (ঐচ্ছিক)</label>
          <textarea
            rows="2"
            placeholder="শিক্ষার্থীদের জন্য কোনো বিশেষ নিয়মাবলী থাকলে লিখুন..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-sky-500"
          ></textarea>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center space-x-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>অ্যাসাইনমেন্ট প্রকাশ করুন</span>
        </button>
      </form>

      {/* Homework List */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl text-white">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-black">{selectedBatch}-এর সক্রিয় অ্যাসাইনমেন্ট ({homeworkList.length} টি)</span>
        </div>

        {homeworkList.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            এই ব্যাচে বর্তমানে কোনো অ্যাসাইনমেন্ট দেওয়া নেই।
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {homeworkList.map(hw => (
              <div key={hw.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-xs text-white">{hw.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {hw.subject}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-3">
                    <span>শেষ তারিখ: <strong className="text-slate-300">{hw.dueDate}</strong></span>
                    {hw.instructions && <span>• {hw.instructions}</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => shareOnWhatsApp(hw)}
                    className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition"
                    title="হোয়াটসঅ্যাপে শেয়ার করুন"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(hw.id)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
