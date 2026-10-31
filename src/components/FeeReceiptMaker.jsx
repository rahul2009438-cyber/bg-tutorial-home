import React, { useState } from 'react';
import { 
  CreditCard, DollarSign, Printer, Send, Plus, 
  Trash2, CheckCircle2, User, Search, FileText, ArrowRight
} from 'lucide-react';

const MONTH_NAMES = [
  'জানুয়ারি ২০২৬', 'ফেব্রুয়ারি ২০২৬', 'মার্চ ২০২৬', 'এপ্রিল ২০২৬',
  'মে ২০২৬', 'জুন ২০২৬', 'জুলাই ২০২৬', 'আগস্ট ২০২৬',
  'সেপ্টেম্বর ২০২৬', 'অক্টোবর ২০২৬', 'নভেম্বর ২০২৬', 'ডিসেম্বর ২০২৬'
];

export default function FeeReceiptMaker({ 
  students = [], 
  feeRecords = [], 
  setFeeRecords, 
  customData = {}, 
  saveToServer 
}) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [feeForm, setFeeForm] = useState({
    studentName: '',
    roll: '',
    batch: 'Class 10',
    guardianName: '',
    phone: '',
    month: 'অক্টোবর ২০২৬',
    amount: '৬০০',
    paymentMode: 'নগদ (Cash)',
    notes: 'নিয়মিত মাসিক টিউশন ফি প্রদান সম্পন্ন।'
  });

  const [filterSearch, setFilterSearch] = useState('');
  const [printableRecord, setPrintableRecord] = useState(null);
  const [successNotice, setSuccessNotice] = useState('');

  const teacherName = customData.teacherName || 'বাবুন ঘোষ';
  const coachingName = customData.centerName || 'B.G. TUTORIAL HOME';

  const handleSelectStudent = (stId) => {
    setSelectedStudentId(stId);
    const st = students.find(s => String(s.id) === String(stId));
    if (st) {
      const isHigherClass = (st.batch || '').includes('11') || (st.batch || '').includes('12');
      const isHomeTuition = (st.tuitionType || st.type || '').includes('Home') || (st.type || '').includes('হোম');
      const defaultAmt = isHomeTuition ? '১২০০' : isHigherClass ? '৮০০' : '৬০০';

      setFeeForm(prev => ({
        ...prev,
        studentName: st.name,
        roll: st.roll || '',
        batch: st.batch || 'Class 10',
        guardianName: st.guardianName || '',
        phone: st.phone || st.guardianPhone || '',
        amount: defaultAmt
      }));
    }
  };

  const handleCreateReceipt = (e) => {
    e.preventDefault();
    if (!feeForm.studentName || !feeForm.amount) return;

    const receiptNo = `BG-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord = {
      id: Date.now(),
      receiptNo,
      ...feeForm,
      amount: Number(feeForm.amount) || 0,
      date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
      timestamp: Date.now(),
      status: 'Paid'
    };

    const updated = [newRecord, ...(feeRecords || [])];
    if (setFeeRecords) setFeeRecords(updated);
    if (saveToServer) saveToServer({ feeRecords: updated });
    try {
      localStorage.setItem('bg_fee_records', JSON.stringify(updated));
    } catch(e) {}

    setSuccessNotice(`✅ রসিদ নং ${receiptNo} সফলভাবে তৈরি হয়েছে!`);
    setPrintableRecord(newRecord);
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  const handleDeleteRecord = (id) => {
    if (!window.confirm('আপনি কি এই ফি রসিদটি বাতিল ও মুছে ফেলতে চান?')) return;
    const filtered = (feeRecords || []).filter(r => r.id !== id);
    if (setFeeRecords) setFeeRecords(filtered);
    if (saveToServer) saveToServer({ feeRecords: filtered });
    try {
      localStorage.setItem('bg_fee_records', JSON.stringify(filtered));
    } catch(e) {}
  };

  const sendWhatsAppReceipt = (rec) => {
    const phone = (rec.phone || '').replace(/\D/g, '').slice(-10);
    if (!phone) {
      alert('এই শিক্ষার্থীর কোনো বৈধ ফোন নম্বর নেই!');
      return;
    }
    const msg = `🧾 *B.G. TUTORIAL HOME — ফি প্রাপ্তি রসিদ*\n\nরসিদ নং: ${rec.receiptNo}\nশিক্ষার্থীর নাম: ${rec.studentName}\nশ্রেণী: ${rec.batch} (রোল: ${rec.roll || '-'})\nমাস: ${rec.month}\nটাকার পরিমাণ: ₹${rec.amount}/-\nপরিশোধের মাধ্যম: ${rec.paymentMode}\nতারিখ: ${rec.date}\n\nধন্যবাদান্তে,\nশিক্ষক: ${teacherName}\n${coachingName} (দক্ষিণ হাবড়া)\nযোগাযোগ: ${customData.phone || '9733974425'}`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Financial Metrics
  const totalCollected = (feeRecords || []).reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  const totalReceipts = (feeRecords || []).length;

  const filteredRecords = (feeRecords || []).filter(r => {
    if (!filterSearch.trim()) return true;
    const q = filterSearch.toLowerCase();
    return (r.studentName || '').toLowerCase().includes(q) ||
           (r.receiptNo || '').toLowerCase().includes(q) ||
           (r.batch || '').toLowerCase().includes(q) ||
           (r.month || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-indigo-900 p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-amber-300" />
            <h2 className="text-lg sm:text-xl font-black">
              🧾 প্রিন্টযোগ্য ডিজিটাল ফি রসিদ ও ক্যাশ রেজিস্টার
            </h2>
          </div>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            শিক্ষার্থী নির্বাচন করে কয়েক সেকেন্ডে প্রাতিষ্ঠানিক ফি রসিদ বানান। ১-ক্লিকে প্রিন্ট স্লিপ বের করুন এবং অভিভাবকের হোয়াটসঅ্যাপে অফিসিয়াল মেসেজ পাঠান।
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
          <div>
            <span className="text-[10px] text-emerald-200 uppercase font-black tracking-wider block">মোট সংগৃহীত ফি</span>
            <span className="text-lg font-black text-amber-300">₹{totalCollected.toLocaleString()}</span>
          </div>
          <div className="h-8 w-px bg-white/20"></div>
          <div>
            <span className="text-[10px] text-emerald-200 uppercase font-black tracking-wider block">মোট রসিদ সংখ্যা</span>
            <span className="text-lg font-black text-white">{totalReceipts} টি</span>
          </div>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl font-bold text-xs flex items-center space-x-2 shadow-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Main Grid: Generator Form + Historical Records */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Generator Form */}
        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center space-x-2">
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>নতুন ফি রসিদ প্রস্তুত করুন</span>
          </h3>

          <form onSubmit={handleCreateReceipt} className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">শিক্ষার্থী নির্বাচন (Database) *</label>
              <select
                value={selectedStudentId}
                onChange={e => handleSelectStudent(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
              >
                <option value="">-- শিক্ষার্থী নির্বাচন করুন ({students.length} জন) --</option>
                {students.map((st, idx) => (
                  <option key={st.id || idx} value={st.id}>
                    {st.name} — {st.batch} (রোল: {st.roll || idx + 1})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">শিক্ষার্থীর নাম *</label>
                <input
                  type="text"
                  required
                  value={feeForm.studentName}
                  onChange={e => setFeeForm({ ...feeForm, studentName: e.target.value })}
                  placeholder="নাম"
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">রোল নং</label>
                <input
                  type="text"
                  value={feeForm.roll}
                  onChange={e => setFeeForm({ ...feeForm, roll: e.target.value })}
                  placeholder="রোল"
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">শ্রেণী / ব্যাচ</label>
                <input
                  type="text"
                  value={feeForm.batch}
                  onChange={e => setFeeForm({ ...feeForm, batch: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ফি প্রদানের মাস *</label>
                <select
                  value={feeForm.month}
                  onChange={e => setFeeForm({ ...feeForm, month: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-emerald-800"
                >
                  {MONTH_NAMES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">টাকার পরিমাণ (₹) *</label>
                <input
                  type="number"
                  required
                  value={feeForm.amount}
                  onChange={e => setFeeForm({ ...feeForm, amount: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-black text-emerald-800 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">পদ্ধতি</label>
                <select
                  value={feeForm.paymentMode}
                  onChange={e => setFeeForm({ ...feeForm, paymentMode: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                >
                  <option value="নগদ (Cash)">নগদ (Cash)</option>
                  <option value="Google Pay / PhonePe (UPI)">UPI / Google Pay</option>
                  <option value="ব্যাংক ট্রান্সফার">ব্যাংক ট্রান্সফার</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">অভিভাবকের ফোন (WhatsApp এর জন্য)</label>
              <input
                type="text"
                value={feeForm.phone}
                onChange={e => setFeeForm({ ...feeForm, phone: e.target.value })}
                placeholder="10-সংখ্যার মোবাইল নম্বর"
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition"
            >
              🧾 রসিদ তৈরি ও প্রিন্ট প্রিভিউ দেখুন
            </button>
          </form>
        </div>

        {/* Historical Receipts Table */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>সংরক্ষিত ফি রসিদ হিস্ট্রি ({filteredRecords.length} টি)</span>
              </h3>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
                placeholder="🔍 নাম, রসিদ নং বা মাস খুঁজুন..."
                className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-sans"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">রসিদ নং</th>
                  <th className="p-2.5">শিক্ষার্থী ও শ্রেণী</th>
                  <th className="p-2.5">মাস</th>
                  <th className="p-2.5">টাকা</th>
                  <th className="p-2.5">তারিখ ও মাধ্যম</th>
                  <th className="p-2.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono font-bold text-slate-900">{rec.receiptNo}</td>
                    <td className="p-2.5">
                      <span className="font-bold text-slate-900 block">{rec.studentName}</span>
                      <span className="text-[11px] text-slate-500 font-bold">{rec.batch} • রোল: {rec.roll || '-'}</span>
                    </td>
                    <td className="p-2.5 font-bold text-slate-700">{rec.month}</td>
                    <td className="p-2.5 font-black text-emerald-700 text-sm">₹{rec.amount}</td>
                    <td className="p-2.5 text-[11px] text-slate-500">
                      <span>{rec.date}</span>
                      <span className="block font-semibold text-slate-600">{rec.paymentMode}</span>
                    </td>
                    <td className="p-2.5 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setPrintableRecord(rec)}
                        title="রসিদ প্রিন্ট করুন"
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => sendWhatsAppReceipt(rec)}
                        title="WhatsApp এ পাঠান"
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteRecord(rec.id)}
                        title="মুছুন"
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-400 italic">
                      কোনো ফি রসিদ পাওয়া যায়নি।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PRINTABLE RECEIPT MODAL */}
      {printableRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 my-8 font-sans print:m-0 print:p-0 print:shadow-none border-2 border-slate-800">
            
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 print:hidden">
              <span className="font-black text-slate-800 text-sm">🖨️ অফিসিয়াল ফি রসিদ স্লিপ</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>এখনই প্রিন্ট করুন</span>
                </button>
                <button
                  onClick={() => setPrintableRecord(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>

            {/* Official Receipt Header */}
            <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
              <h1 className="text-xl font-black text-slate-950 uppercase tracking-wide">
                {coachingName}
              </h1>
              <p className="text-[11px] font-bold text-slate-700">
                দক্ষিণ হাবড়া (এস. এন. দে রোড), উত্তর ২৪ পরগণা • ফোন: {customData.phone || '9733974425'}
              </p>
              <div className="inline-block bg-slate-900 text-white text-[11px] font-black px-4 py-0.5 rounded-full mt-1">
                মাসিক টিউশন ফি রসিদ (FEE RECEIPT)
              </div>
            </div>

            {/* Receipt No & Date */}
            <div className="flex justify-between text-xs font-bold text-slate-800 border-b border-dashed border-slate-300 pb-2">
              <span>রসিদ নং: <strong className="font-mono text-emerald-800">{printableRecord.receiptNo}</strong></span>
              <span>তারিখ: {printableRecord.date}</span>
            </div>

            {/* Student Details Grid */}
            <div className="space-y-2 text-xs text-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <div>শিক্ষার্থীর নাম: <strong>{printableRecord.studentName}</strong></div>
                <div>শ্রেণী / ব্যাচ: <strong>{printableRecord.batch}</strong></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>রোল নং: <strong>{printableRecord.roll || '-'}</strong></div>
                <div>মাস: <strong>{printableRecord.month}</strong></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>পরিশোধের মাধ্যম: <strong>{printableRecord.paymentMode}</strong></div>
                <div>স্ট্যাটাস: <strong className="text-emerald-700">পরিশোধিত (PAID)</strong></div>
              </div>
            </div>

            {/* Amount Box */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 flex justify-between items-center text-xs font-black">
              <span>মোট প্রদত্ত টাকার পরিমাণ:</span>
              <span className="text-lg text-emerald-900 font-mono">₹{printableRecord.amount}/-</span>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-end pt-10 border-t border-slate-300 text-xs font-bold text-slate-700">
              <div className="text-center">
                <span className="text-[10px] text-slate-500 italic block">সিল / স্ট্যাম্প</span>
                <span>B.G. TUTORIAL HOME</span>
              </div>

              <div className="text-center">
                <div className="border-t border-slate-500 w-36 mb-1"></div>
                <span>শিক্ষকের স্বাক্ষর ({teacherName})</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
