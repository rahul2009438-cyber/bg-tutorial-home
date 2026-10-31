import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Phone, Send, Search, Filter, 
  Calendar, CheckCircle2, AlertCircle, Info, ExternalLink, Trash2, Plus
} from 'lucide-react';
import { db, logAudit, logCommunication } from '../utils/db';

export default function ParentCommunicationLog({ students = [], customData = {} }) {
  const [logs, setLogs] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [topicFilter, setTopicFilter] = useState('সকল বিষয়');
  const [searchQuery, setSearchQuery] = useState('');
  const [manualNote, setManualNote] = useState({
    studentId: '',
    topic: 'অনুপস্থিতি সতর্কতা (Absent Alert)',
    summary: 'অভিভাবকের সাথে ফোনে কথা হয়েছে — আগামী কাল ক্লাসে উপস্থিত থাকবে।'
  });
  const [statusMsg, setStatusMsg] = useState('');

  const TOPICS = [
    'সকল বিষয়',
    'অনুপস্থিতি সতর্কতা (Absent Alert)',
    'পরীক্ষার মার্কশিট (Exam Marksheet)',
    'ফি বকেয়া রিমাইন্ডার (Fee Reminder)',
    'দুর্বল বিষয়ে বিশেষ পরামর্শ (Weak Area Guidance)',
    'সাধারণ নোটিশ ও রুটিন (General Routine)'
  ];

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      if (!db.communicationLogs) return;
      const all = await db.communicationLogs.reverse().toArray();
      setLogs(all);
    } catch (e) {
      console.warn('Comm logs error:', e);
    }
  };

  const handleManualLog = async (e) => {
    e.preventDefault();
    if (!manualNote.studentId) {
      alert('দয়া করে শিক্ষার্থী নির্বাচন করুন');
      return;
    }
    const st = students.find(s => String(s.studentId || s.id) === String(manualNote.studentId));
    const phone = st ? (st.guardianPhone || st.phone) : '';

    await logCommunication(
      manualNote.studentId,
      phone,
      'ম্যানুয়াল নোট / কল',
      `[${manualNote.topic}] ${manualNote.summary}`
    );

    setStatusMsg('✅ যোগাযোগের তথ্য সফলভাবে লগবুকে সংরক্ষিত হয়েছে!');
    setTimeout(() => setStatusMsg(''), 3000);
    setManualNote({
      studentId: '',
      topic: 'অনুপস্থিতি সতর্কতা (Absent Alert)',
      summary: ''
    });
    loadLogs();
  };

  const handleTriggerWhatsApp = async (st, topic, templateMsg) => {
    const phone = (st.guardianPhone || st.phone || '').replace(/\D/g, '');
    if (!phone) {
      alert('অভিভাবকের ফোন নম্বর পাওয়া যায়নি!');
      return;
    }

    // Auto-log before opening intent
    await logCommunication(
      st.studentId || st.id,
      phone,
      'WhatsApp লিংক ওপেন (Client-Side Intent)',
      `[${topic}] ${templateMsg.slice(0, 100)}...`
    );

    const waUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(templateMsg)}`;
    window.open(waUrl, '_blank');
    loadLogs();
  };

  const handleDeleteLog = async (id) => {
    if (window.confirm('এই লগ রেকর্ডটি কি মুছে ফেলতে চান?')) {
      await db.communicationLogs.delete(id);
      loadLogs();
    }
  };

  // Filter logs
  const filteredLogs = logs.filter(item => {
    const matchesTopic = topicFilter === 'সকল বিষয়' || (item.summary || '').includes(topicFilter.split(' ')[0]);
    const matchesSearch = !searchQuery || 
      (item.summary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.guardianPhone || '').includes(searchQuery);
    const matchesStudent = !selectedStudentId || String(item.studentId) === String(selectedStudentId);
    return matchesTopic && matchesSearch && matchesStudent;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-700 text-white p-6 rounded-3xl shadow-lg border border-teal-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>অভিভাবক যোগাযোগ লগবুক • GUARDIAN COMMUNICATION LOG</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">সকল কল ও মেসেজ যোগাযোগের পূর্ণাঙ্গ ইতিহাস</h2>
          <p className="text-xs text-teal-100 mt-1 max-w-xl">
            প্রতিটি WhatsApp মেসেজ লিংক ওপেন এবং ফোন কলের তারিখ, সময় ও বিষয়বস্তু ক্লায়েন্ট-সাইড মেমরিতে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে।
          </p>
        </div>

        <div className="p-3 bg-white/10 rounded-2xl border border-white/20 text-xs text-teal-100 flex items-center space-x-2 shrink-0">
          <Info className="w-4 h-4 text-amber-300 shrink-0" />
          <span>WhatsApp লিংকগুলো আপনার ব্রাউজারের wa.me ইনটেন্ট ব্যবহার করে</span>
        </div>
      </div>

      {/* Manual Log Entry Card */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center space-x-2">
          <Plus className="w-4 h-4 text-emerald-600" />
          <span>ম্যানুয়াল যোগাযোগ বা কথোপকথনের নোট সংরক্ষণ করুন</span>
        </h3>

        <form onSubmit={handleManualLog} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">শিক্ষার্থী নির্বাচন</label>
            <select
              value={manualNote.studentId}
              onChange={(e) => setManualNote({ ...manualNote, studentId: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
              required
            >
              <option value="">-- শিক্ষার্থী বেছে নিন --</option>
              {students.map(s => (
                <option key={s.id} value={s.studentId || s.id}>
                  {s.name} ({s.batch} • রোল {s.roll})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">যোগাযোগের বিষয়</label>
            <select
              value={manualNote.topic}
              onChange={(e) => setManualNote({ ...manualNote, topic: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
            >
              <option value="অনুপস্থিতি সতর্কতা (Absent Alert)">অনুপস্থিতি সতর্কতা (Absent Alert)</option>
              <option value="পরীক্ষার মার্কশিট (Exam Marksheet)">পরীক্ষার মার্কশিট (Exam Marksheet)</option>
              <option value="ফি বকেয়া রিমাইন্ডার (Fee Reminder)">ফি বকেয়া রিমাইন্ডার (Fee Reminder)</option>
              <option value="পড়াশোনার অগ্রগতি (Study Progress)">পড়াশোনার অগ্রগতি (Study Progress)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">কথোপকথনের বিবরণ / সারসংক্ষেপ</label>
            <input
              type="text"
              placeholder="যেমন: অভিভাবক জানালেন আগামী সপ্তাহে ক্লাসে পাঠাবেন"
              value={manualNote.summary}
              onChange={(e) => setManualNote({ ...manualNote, summary: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-white"
              required
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shadow-md transition active:scale-95"
            >
              লগবুকে যুক্ত করুন
            </button>
          </div>
        </form>

        {statusMsg && (
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-300 text-teal-800 text-xs font-bold text-center">
            {statusMsg}
          </div>
        )}
      </div>

      {/* Quick 1-Tap Trigger Section */}
      <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3">
        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
          <Send className="w-3.5 h-3.5 text-teal-600" />
          <span>১-ক্লিকে টেমপ্লেট WhatsApp মেসেজ পাঠান ও স্বয়ংক্রিয় লগ তৈরি করুন</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {students.slice(0, 3).map(st => {
            const absentMsg = `নমস্কার, বি.জি. টিউটোরিয়াল হোম থেকে বাপুন স্যার। আপনার সন্তান ${st.name} ক্লাসে অনুপস্থিত রয়েছে। কোনো সমস্যা থাকলে দয়া করে জানাবেন।`;
            const feeMsg = `নমস্কার, বি.জি. টিউটোরিয়াল হোম থেকে বাপুন স্যার। আপনার সন্তান ${st.name}-এর মাসিক টিউশন ফি সংগ্রহ প্রক্রিয়াধীন রয়েছে।`;

            return (
              <div key={st.id} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-900">{st.name}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                    {st.batch}
                  </span>
                </div>
                <div className="flex space-x-1.5">
                  <button
                    type="button"
                    onClick={() => handleTriggerWhatsApp(st, 'অনুপস্থিতি সতর্কতা', absentMsg)}
                    className="flex-1 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] border border-rose-200 transition"
                  >
                    অনুপস্থিতি অ্যালার্ট
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTriggerWhatsApp(st, 'ফি রিমাইন্ডার', feeMsg)}
                    className="flex-1 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] border border-emerald-200 transition"
                  >
                    ফি রিমাইন্ডার
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logs Table / History */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>যোগাযোগের লগবুক ইতিহাস ({filteredLogs.length} টি এন্ট্রি)</span>
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="ফোন বা বিষয় দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-1.5 px-3 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
            />
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="p-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white"
            >
              {TOPICS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-slate-200">
            এখনো কোনো যোগাযোগের তথ্য নথিভুক্ত হয়নি।
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map(log => {
              const matchedStudent = students.find(s => String(s.studentId || s.id) === String(log.studentId));
              return (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900">
                        {matchedStudent ? matchedStudent.name : 'অভিভাবক'}
                      </span>
                      <span className="font-mono text-[11px] text-teal-600 font-bold">
                        📞 {log.guardianPhone || 'N/A'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px] font-bold">
                        {log.type}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs">{log.summary}</p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 text-slate-400 text-[11px]">
                    <span>{new Date(log.timestamp).toLocaleString('bn-BD')}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteLog(log.id)}
                      className="p-1 hover:bg-rose-50 text-rose-500 rounded transition"
                      title="মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
