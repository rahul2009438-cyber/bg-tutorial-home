import React, { useState, useEffect } from 'react';
import { 
  CreditCard, DollarSign, Calendar, Users, CheckCircle2, 
  Clock, AlertCircle, Plus, Search, Printer, Share2, Sparkles, Filter 
} from 'lucide-react';
import { db, logAudit } from '../utils/db';

export default function FeeLedger({ customData = {}, students = [] }) {
  const [feeRecords, setFeeRecords] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    return months[new Date().getMonth()];
  });

  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState(500);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadFeeRecords();
  }, []);

  const loadFeeRecords = async () => {
    try {
      const records = await db.feePayments.toArray();
      setFeeRecords(records);
    } catch (e) {
      console.warn('Error loading fees:', e);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!studentId) {
      alert('শিক্ষার্থী নির্বাচন করুন');
      return;
    }

    const st = students.find(s => (s.studentId || s.id) === studentId);
    if (!st) return;

    const receiptNo = `REC-${Date.now().toString().slice(-6)}`;
    const newRecord = {
      receiptNo,
      studentId,
      studentName: st.name,
      batch: st.batch || 'Class 10',
      month: selectedMonth,
      amount: Number(amount) || 0,
      paymentMode,
      date
    };

    try {
      await db.feePayments.add(newRecord);
      await logAudit('FEE_PAYMENT', 'FINANCE', `Receipt ${receiptNo} for ${st.name} (₹${amount})`);
      loadFeeRecords();
      alert(`রসিদ নং ${receiptNo} সফলভাবে তৈরি হয়েছে!`);
    } catch (err) {
      alert('ফি সংরক্ষণ ব্যর্থ: ' + err.message);
    }
  };

  // Filter records
  const filteredRecords = feeRecords.filter(f => {
    const matchBatch = selectedBatch === 'All' || f.batch === selectedBatch;
    const matchSearch = !searchTerm || 
      (f.studentName && f.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.receiptNo && f.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchBatch && matchSearch;
  });

  // Analytics
  const totalCollected = filteredRecords.reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
  const cashCollected = filteredRecords.filter(f => f.paymentMode === 'Cash').reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
  const onlineCollected = filteredRecords.filter(f => f.paymentMode !== 'Cash').reduce((acc, f) => acc + (Number(f.amount) || 0), 0);

  const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-800/40 p-6 rounded-3xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>স্মার্ট ফি ম্যানেজমেন্ট ও ফিনান্সিয়াল লেজার</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">মাসিক টিউশন ফি সংগ্রহ ও রসিদ লেজার</h2>
          <p className="text-xs text-emerald-200/80 mt-1">
            ক্যাশ এবং ইউপিআই / ফোনপে পেমেন্ট ট্র্যাকিং, বকেয়া পর্যবেক্ষণ এবং আর্থিক হিসাব বিবরণী।
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition print:hidden"
        >
          <Printer className="w-4 h-4" />
          <span>লেজার রিপোর্ট প্রিন্ট</span>
        </button>
      </div>

      {/* Financial Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white">
          <div className="text-xs text-slate-400 mb-1">মোট সংগৃহীত ফি</div>
          <div className="text-3xl font-black text-emerald-400">₹{totalCollected}</div>
          <div className="text-[11px] text-slate-500 mt-1">{filteredRecords.length} টি অনুমোদিত রসিদ</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white">
          <div className="text-xs text-slate-400 mb-1">নগদ প্রদান (Cash)</div>
          <div className="text-3xl font-black text-teal-400">₹{cashCollected}</div>
          <div className="text-[11px] text-slate-500 mt-1">সরাসরি হাতে প্রাপ্ত</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white">
          <div className="text-xs text-slate-400 mb-1">অনলাইন / PhonePe (UPI)</div>
          <div className="text-3xl font-black text-indigo-400">₹{onlineCollected}</div>
          <div className="text-[11px] text-slate-500 mt-1">ডিজিটাল পেমেন্ট মোড</div>
        </div>
      </div>

      {/* Record Payment Entry Form */}
      <form onSubmit={handleRecordPayment} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-white print:hidden">
        <h3 className="text-xs font-black text-white flex items-center space-x-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>নতুন ফি রসিদ ইস্যু করুন</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">শিক্ষার্থী</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">শিক্ষার্থী বেছে নিন...</option>
              {students.map(s => (
                <option key={s.studentId || s.id} value={s.studentId || s.id}>
                  {s.name} ({s.batch}) {s.roll ? `- Roll ${s.roll}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">মাস</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
            >
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">টাকার পরিমাণ (₹)</label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">পেমেন্ট মাধ্যম</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Cash">Cash (নগদ)</option>
              <option value="UPI / PhonePe">UPI / PhonePe (9733974425)</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">তারিখ</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center space-x-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>রসিদ যুক্ত করুন ও সংরক্ষণ করুন</span>
        </button>
      </form>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 print:hidden">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="শিক্ষার্থীর নাম বা রসিদ নং দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 pl-9 pr-4 py-2.5 rounded-2xl text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-white rounded-2xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-emerald-500"
        >
          {['All', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl text-white">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-black">ফি জমার ডিজিটাল খাতা ({filteredRecords.length} টি রসিদ)</span>
          <span className="text-[11px] font-bold text-slate-400">ব্যাচ: {selectedBatch}</span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            কোনো ফি জমার রেকর্ড পাওয়া যায়নি।
          </div>
        ) : (
          <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto">
            {filteredRecords.slice().reverse().map(rec => (
              <div key={rec.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white">{rec.studentName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {rec.batch}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">#{rec.receiptNo}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    মাস: <strong className="text-slate-300">{rec.month}</strong> • মাধ্যম: {rec.paymentMode} • তারিখ: {rec.date}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-base font-black text-emerald-400">₹{rec.amount}/-</span>
                  <button
                    type="button"
                    onClick={() => {
                      const msg = `🧾 *বি.জি. টিউটোরিয়াল হোম — ফি প্রাপ্তি রসিদ*\n\nরসিদ নং: ${rec.receiptNo}\nশিক্ষার্থী: *${rec.studentName}* (${rec.batch})\nমাস: ${rec.month}\nটাকার পরিমাণ: ₹${rec.amount}/-\nমাধ্যম: ${rec.paymentMode}\nতারিখ: ${rec.date}\n\nধন্যবাদান্তে,\nশিক্ষক: ${customData.teacherName || 'বাবুন ঘোষ'}\nদক্ষিণ হাবড়া • ফোন: ${customData.phone || '9733974425'}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition print:hidden"
                    title="রসিদ হোয়াটসঅ্যাপে পাঠান"
                  >
                    <Share2 className="w-4 h-4" />
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
