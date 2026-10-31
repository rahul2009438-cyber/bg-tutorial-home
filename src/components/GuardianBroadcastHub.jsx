import React, { useState } from 'react';
import { 
  Send, Users, MessageCircle, Copy, Check, Phone, 
  AlertTriangle, Clock, Calendar, CheckCircle2, ShieldAlert, Megaphone
} from 'lucide-react';

export default function GuardianBroadcastHub({ 
  students = [], 
  customData = {} 
}) {
  const [selectedBatch, setSelectedBatch] = useState('All Students');
  const [presetType, setPresetType] = useState('rain');
  const [customMsg, setCustomMsg] = useState('');
  const [copiedNumbers, setCopiedNumbers] = useState(false);
  const [broadcastLog, setBroadcastLog] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bg_broadcast_log') || '[]');
    } catch (e) {
      return [];
    }
  });

  const teacherName = customData.teacherName || 'বাবুন ঘোষ';
  const coachingName = customData.centerName || 'B.G. TUTORIAL HOME';
  const helpline = customData.phone || '9733974425';

  const PRESETS = {
    rain: {
      title: '🌧️ ভারী বৃষ্টি বা দুর্যোগের কারণে ক্লাসের সময় পরিবর্তন',
      text: `নমস্কার অভিভাবক মহাশয়/মহাশয়া,\nB.G. TUTORIAL HOME-এর পক্ষ থেকে জানানো হচ্ছে যে প্রবল প্রতিকূল আবহাওয়া/বৃষ্টির কারণে আজকের ব্যাচের ক্লাসের সময়সূচী পরিবর্তন করা হলো। নতুন সময় খুব শীঘ্রই হোয়াটসঅ্যাপ গ্রুপে জানিয়ে দেওয়া হবে। শিক্ষার্থীরা ঘরে বসেই পড়াশোনা চালিয়ে যাক।\n\n— শিক্ষক: ${teacherName}\nযোগাযোগ: ${helpline}`
    },
    sunday_special: {
      title: '⏰ রবিবার অতিরিক্ত স্পেশাল ও ডাউট ক্লিয়ারিং ক্লাস',
      text: `নমস্কার অভিভাবকবৃন্দ,\nআগামী রবিবার সকাল ৯:০০ টা থেকে B.G. TUTORIAL HOME-এ শিক্ষার্থীদের বিশেষ ডাউট ক্লিয়ারিং ও অধ্যায়ভিত্তিক রিভিশন ক্লাস অনুষ্ঠিত হবে। সকল শিক্ষার্থীকে নির্ধারিত সময়ে উপস্থিত থাকার অনুরোধ করা হচ্ছে।\n\n— শিক্ষক: ${teacherName}\nযোগাযোগ: ${helpline}`
    },
    exam_alert: {
      title: '📝 আসন্ন টেস্ট পরীক্ষা ও মক টেস্ট প্রস্তুতি',
      text: `শ্রদ্ধেয় অভিভাবক,\nআপনার সন্তান [Student_Name]-এর আসন্ন বোর্ড ও স্কুল পরীক্ষার চূড়ান্ত প্রস্তুতির জন্য আগামী সপ্তাহে সেন্টারে বিশেষ মক টেস্ট নেওয়া হবে। নিয়মিত রিভিশন ও বাড়িতে লেখার অভ্যাসে একটু নজর দেবেন। কোনো প্রশ্ন থাকলে সরাসরি স্যারের সাথে কথা বলুন।\n\n— ${coachingName}\nহেল্পলাইন: ${helpline}`
    },
    fee_reminder: {
      title: '💳 মাসিক টিউশন পারিশ্রমিক সংক্রান্ত বিনীত অনুরোধ',
      text: `শ্রদ্ধেয় অভিভাবক,\nB.G. TUTORIAL HOME-এ আপনার সন্তান [Student_Name]-এর চলতি মাসের টিউশন ফি বাবুন স্যারের নিকট অথবা অনলাইনে জমা দেওয়ার জন্য বিনীত অনুরোধ জানানো হচ্ছে। রসিদ সংগ্রহ করে নেবেন।\n\nধন্যবাদান্তে,\n${teacherName} (B.G. TUTORIAL HOME)`
    },
    admission_open: {
      title: '📢 নতুন শিক্ষাবর্ষে ভর্তি ও ব্যাচ সংক্রান্ত তথ্য',
      text: `নমস্কার,\nB.G. TUTORIAL HOME (দক্ষিণ হাবড়া)-এ নতুন শিক্ষাবর্ষে ৭ম থেকে ১২শ শ্রেণীর নতুন ব্যাচে সীমিত আসনে ভর্তি চলছে। বিজ্ঞান, গণিত, রাষ্ট্রবিজ্ঞান ও দর্শনে নিবিড় যত্নের অঙ্গীকার। বিস্তারিত জানতে যোগাযোগ করুন: ${helpline}`
    },
    custom: {
      title: '✍️ নিজের ভাষায় কাস্টম জরুরি নোটিশ',
      text: ''
    }
  };

  const currentMessageTemplate = presetType === 'custom' ? customMsg : PRESETS[presetType]?.text;

  // Filter students based on batch
  const filteredStudents = (students || []).filter(s => {
    if (selectedBatch === 'All Students') return true;
    return (s.batch || '').toLowerCase().includes(selectedBatch.toLowerCase());
  });

  const handleCopyAllNumbers = () => {
    const phones = filteredStudents
      .map(s => s.phone || s.guardianPhone)
      .filter(Boolean)
      .map(p => p.replace(/\D/g, '').slice(-10))
      .filter(p => p.length === 10);

    const uniquePhones = Array.from(new Set(phones)).join(', ');
    if (uniquePhones) {
      navigator.clipboard.writeText(uniquePhones);
      setCopiedNumbers(true);
      setTimeout(() => setCopiedNumbers(false), 3000);
    } else {
      alert('নির্বাচিত ব্যাচে কোনো ফোন নম্বর পাওয়া যায়নি!');
    }
  };

  const getPersonalizedUrl = (student) => {
    const phone = (student.phone || student.guardianPhone || '').replace(/\D/g, '').slice(-10);
    if (!phone) return null;
    const personalized = currentMessageTemplate.replace(/\[Student_Name\]/g, student.name || 'শিক্ষার্থী');
    return `https://wa.me/91${phone}?text=${encodeURIComponent(personalized)}`;
  };

  const handleLogBroadcast = () => {
    const newLogItem = {
      id: Date.now(),
      batch: selectedBatch,
      preset: PRESETS[presetType]?.title || 'কাস্টম বার্তা',
      date: new Date().toLocaleString('bn-BD'),
      recipientCount: filteredStudents.length
    };
    const updated = [newLogItem, ...broadcastLog].slice(0, 10);
    setBroadcastLog(updated);
    try {
      localStorage.setItem('bg_broadcast_log', JSON.stringify(updated));
    } catch(e) {}
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Megaphone className="w-6 h-6 text-amber-300" />
            <h2 className="text-lg sm:text-xl font-black">
              📢 জরুরি অভিভাবক ব্রডকাস্ট ও নোটিফিকেশন সেন্টার
            </h2>
          </div>
          <p className="text-xs text-teal-100 mt-1 max-w-xl">
            বৃষ্টি, ছুটি, অতিরিক্ত ক্লাস বা পরীক্ষার নোটিশ এক ক্লিকে যেকোনো ব্যাচের সকল অভিভাবকদের হোয়াটসঅ্যাপে সরাসরি পাঠিয়ে দিন।
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyAllNumbers}
          className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-xs flex items-center space-x-1.5 shadow-md active:scale-95 transition shrink-0"
        >
          {copiedNumbers ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
          <span>{copiedNumbers ? '✅ নম্বর কপি হয়েছে!' : '📋 সকল নম্বর কপি করুন'}</span>
        </button>
      </div>

      {/* Target Batch & Preset Selection */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center space-x-2">
          <Users className="w-4 h-4 text-emerald-600" />
          <span>১. টার্গেট ব্যাচ ও বার্তার ধরণ নির্বাচন</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">কোন ব্যাচে বার্তা পাঠাবেন? *</label>
            <select
              value={selectedBatch}
              onChange={e => setSelectedBatch(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
            >
              <option value="All Students">সকল শিক্ষার্থী ও অভিভাবক ({students.length} জন)</option>
              <option value="Class 7">Class 7 (সপ্তম শ্রেণী)</option>
              <option value="Class 8">Class 8 (অষ্টম শ্রেণী)</option>
              <option value="Class 9">Class 9 (নবম শ্রেণী)</option>
              <option value="Class 10">Class 10 (মাধ্যমিক দশম)</option>
              <option value="Class 11">Class 11 (একাদশ শ্রেণী)</option>
              <option value="Class 12">Class 12 (দ্বাদশ শ্রেণী)</option>
              <option value="Private Home Batch">প্রাইভেট হোম টিউশন ব্যাচ</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">বার্তার বিষয়বস্তু (Preset Templates) *</label>
            <select
              value={presetType}
              onChange={e => setPresetType(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-emerald-800"
            >
              <option value="rain">🌧️ বৃষ্টির জন্য ক্লাস সময় পরিবর্তন</option>
              <option value="sunday_special">⏰ রবিবার অতিরিক্ত ডাউট ক্লাস</option>
              <option value="exam_alert">📝 আসন্ন পরীক্ষা ও মক টেস্ট সতর্কতা</option>
              <option value="fee_reminder">💳 মাসিক টিউশন ফি জমার রিমাইন্ডার</option>
              <option value="admission_open">📢 নতুন শিক্ষাবর্ষে ভর্তির নোটিশ</option>
              <option value="custom">✍️ নিজের ভাষায় কাস্টম মেসেজ লিখুন</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">
              বার্তার লাইভ প্রিভিউ ও এডিট (সরাসরি মেসেজ পরিবর্তন করতে পারেন)
            </label>
            {presetType === 'custom' ? (
              <textarea
                rows="4"
                value={customMsg}
                onChange={e => setCustomMsg(e.target.value)}
                placeholder="অভিভাবকদের জন্য আপনার প্রয়োজনীয় বার্তাটি বাংলায় এখানে লিখুন..."
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-xs font-sans leading-relaxed"
              ></textarea>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans whitespace-pre-line text-slate-800 leading-relaxed">
                {currentMessageTemplate}
              </div>
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              💡 প্রতিটি শিক্ষার্থীর নামের জায়গায় <code className="bg-slate-200 px-1 rounded text-slate-800">[Student_Name]</code> লিখলে স্বয়ংক্রিয়ভাবে সেই শিক্ষার্থীর নাম বসে যাবে।
            </p>
          </div>
        </div>
      </div>

      {/* Target Guardians Table & 1-Tap WhatsApp Actions */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center space-x-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>২. টার্গেট অভিভাবক তালিকা ({filteredStudents.length} জন)</span>
            </h3>
            <p className="text-xs text-slate-500">
              নিচের যেসকল শিক্ষার্থীর অভিভাবককে মেসেজ পাঠাতে চান, সরাসরি WhatsApp বাটনে ট্যাপ করুন।
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogBroadcast}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"
          >
            💾 ব্রডকাস্ট হিস্ট্রিতে রেকর্ড রাখুন
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">রোল</th>
                <th className="p-2.5">শিক্ষার্থীর নাম</th>
                <th className="p-2.5">শ্রেণী / ব্যাচ</th>
                <th className="p-2.5">অভিভাবকের নাম ও ফোন</th>
                <th className="p-2.5 text-right">সরাসরি ব্রডকাস্ট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.map((st, idx) => {
                const phone = st.phone || st.guardianPhone || '';
                const url = getPersonalizedUrl(st);

                return (
                  <tr key={st.id || idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">{st.roll || idx + 1}</td>
                    <td className="p-2.5 font-bold text-slate-900">{st.name}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-bold text-[10px]">
                        {st.batch}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span className="font-medium text-slate-800">{st.guardianName || 'অভিভাবক'}</span>
                      <span className="block text-[11px] text-slate-500 font-mono font-bold">{phone || 'নম্বর নেই'}</span>
                    </td>
                    <td className="p-2.5 text-right">
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm active:scale-95 transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>WhatsApp পাঠান</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-rose-500 font-bold">নম্বর নেই</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-400 italic">
                    এই ব্যাচে কোনো শিক্ষার্থী খুঁজে পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast History Log */}
      {broadcastLog.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <span className="font-bold text-slate-700 block">📜 সাম্প্রতিক ব্রডকাস্ট রেকর্ড (History):</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {broadcastLog.map(item => (
              <div key={item.id} className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px]">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{item.preset}</span>
                  <span className="text-emerald-700">{item.batch}</span>
                </div>
                <div className="flex justify-between text-slate-500 mt-1">
                  <span>{item.date}</span>
                  <span>{item.recipientCount} জন অভিভাবক</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
