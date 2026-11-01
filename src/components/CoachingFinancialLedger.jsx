import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight, 
  ArrowDownRight, Plus, Trash2, AlertCircle, CheckCircle2,
  Calendar, CreditCard, Tag, FileText, Search, ShieldCheck
} from 'lucide-react';
import { db, logAudit } from '../utils/db';
import { getLocalIndianDate, getLocalIndianMonth } from '../utils/dateUtils';

export default function CoachingFinancialLedger({ 
  students = [], 
  feeRecords = [], 
  customData = {} 
}) {
  const [expenses, setExpenses] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getLocalIndianMonth());
  
  // Expense Form State
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'ঘর ভাড়া (Room Rent)',
    amount: '',
    description: 'দক্ষিণ হাবড়া ক্লাসরুম মাসিক ভাড়া',
    date: getLocalIndianDate(),
    paymentMode: 'Cash'
  });

  // Discount Form State
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [discountForm, setDiscountForm] = useState({
    studentId: '',
    discountType: 'মেধাবৃত্তি (Merit Concession)',
    amount: 200,
    reason: 'পরীক্ষায় প্রথম স্থান অর্জনকারী',
    validUntil: '2026-12-31'
  });

  const [statusMsg, setStatusMsg] = useState('');
  const [duplicateReceiptWarning, setDuplicateReceiptWarning] = useState([]);

  const EXPENSE_CATEGORIES = [
    'ঘর ভাড়া (Room Rent)',
    'জেরক্স ও প্রিন্টিং খরচ (Xerox & Printing)',
    'বিদ্যুৎ ও পাখা বিল (Electricity)',
    'চক, মার্কার ও বোর্ড রক্ষণাবেক্ষণ (Stationery)',
    'পরীক্ষার খাতা ও প্রশ্নপত্র তৈরিকরণ (Exam Material)',
    'বিবিধ আপ্যায়ন ও জল (Miscellaneous)'
  ];

  useEffect(() => {
    loadLedgerData();
  }, [selectedMonth]);

  const loadLedgerData = async () => {
    try {
      if (db.expenses) {
        const exp = await db.expenses.toArray();
        const filteredExp = exp.filter(e => (e.date || '').startsWith(selectedMonth));
        setExpenses(filteredExp);
      }
      if (db.discounts) {
        const disc = await db.discounts.toArray();
        setDiscounts(disc);
      }

      // Check for duplicate receipts in feePayments
      if (db.feePayments) {
        const allFees = await db.feePayments.toArray();
        const receiptMap = new Map();
        const duplicates = [];
        allFees.forEach(f => {
          if (f.receiptNo) {
            if (receiptMap.has(f.receiptNo)) {
              duplicates.push(f.receiptNo);
            } else {
              receiptMap.set(f.receiptNo, true);
            }
          }
        });
        setDuplicateReceiptWarning(duplicates);
      }
    } catch (err) {
      console.warn('Ledger load error:', err);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
      alert('সঠিক টাকার অঙ্ক লিখুন');
      return;
    }

    try {
      await db.expenses.add({
        ...expenseForm,
        amount: Number(expenseForm.amount)
      });
      await logAudit('EXPENSE_RECORDED', 'FINANCE', `₹${expenseForm.amount} - ${expenseForm.category}`);
      setStatusMsg('✅ খরচের হিসাব সফলভাবে লেজারে যুক্ত হয়েছে!');
      setTimeout(() => setStatusMsg(''), 3000);
      setExpenseForm({
        category: 'জেরক্স ও প্রিন্টিং খরচ (Xerox & Printing)',
        amount: '',
        description: '',
        date: getLocalIndianDate(),
        paymentMode: 'Cash'
      });
      setShowExpenseForm(false);
      loadLedgerData();
    } catch (err) {
      alert('খরচ যুক্ত করতে ব্যর্থ: ' + err.message);
    }
  };

  const handleAddDiscount = async (e) => {
    e.preventDefault();
    if (!discountForm.studentId) {
      alert('শিক্ষার্থী নির্বাচন করুন');
      return;
    }

    try {
      const st = students.find(s => String(s.studentId || s.id) === String(discountForm.studentId));
      await db.discounts.add({
        ...discountForm,
        studentName: st ? st.name : 'Unknown',
        amount: Number(discountForm.amount)
      });
      await logAudit('DISCOUNT_GRANTED', 'FINANCE', `₹${discountForm.amount} to ${st?.name}`);
      setStatusMsg('✅ বিশেষ ছাড়/স্কলারশিপ সফলভাবে রেকর্ড করা হয়েছে!');
      setTimeout(() => setStatusMsg(''), 3000);
      setShowDiscountForm(false);
      loadLedgerData();
    } catch (err) {
      alert('ছাড় যুক্ত করতে ব্যর্থ: ' + err.message);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('এই খরচের এন্ট্রিটি মুছে ফেলতে চান?')) {
      await db.expenses.delete(id);
      loadLedgerData();
    }
  };

  const handleDeleteDiscount = async (id) => {
    if (window.confirm('এই ছাড় রেকর্ডটি মুছে ফেলতে চান?')) {
      await db.discounts.delete(id);
      loadLedgerData();
    }
  };

  // Financial Calculations for selected month
  const monthlyFeeRecords = (feeRecords || []).filter(f => (f.date || '').startsWith(selectedMonth));
  const totalTuitionRevenue = monthlyFeeRecords.reduce((a, b) => a + (Number(b.amount) || 0), 0);
  const totalOperationalExpenses = expenses.reduce((a, b) => a + (Number(b.amount) || 0), 0);
  const netSurplus = totalTuitionRevenue - totalOperationalExpenses;
  const totalDiscountsActive = discounts.reduce((a, b) => a + (Number(b.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-emerald-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            <span>আর্থিক লেজার ও ব্যালেন্স শিট • COACHING FINANCIAL LEDGER</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">টিউশন আয়, সেন্টারের পরিচালন ব্যয় ও ছাড় ব্যবস্থাপনা</h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            মাসিক সংগৃহীত টিউশন ফি এবং ঘর ভাড়া, জেরক্স, বিদ্যুতের মতো সেন্টারের মোট খরচের স্বয়ংক্রিয় হিসাব ও নিট ব্যালেন্স।
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2 px-3 rounded-2xl bg-white text-slate-900 text-xs font-bold shadow-md"
          />
        </div>
      </div>

      {/* Duplicate Receipt Detection Warning */}
      {duplicateReceiptWarning.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-center space-x-3 text-amber-900 text-xs font-bold">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            ⚠️ ডুপ্লিকেট মানি রসিদ শনাক্ত হয়েছে: রসিদ নং {duplicateReceiptWarning.join(', ')} একাধিকবার এন্ট্রি করা হয়েছে!
          </span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tuition Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>মাসিক মোট টিউশন আয়</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            ₹{totalTuitionRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500">
            {monthlyFeeRecords.length} জন শিক্ষার্থীর ফি সংগৃহীত
          </p>
        </div>

        {/* Operational Expenses */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>সেন্টার পরিচালন খরচ</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600">
            ₹{totalOperationalExpenses.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500">
            {expenses.length} টি খরচের হিসাব অন্তর্ভুক্ত
          </p>
        </div>

        {/* Net Balance / Surplus */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>নিট উদ্বৃত্ত / মুনাফা</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${netSurplus >= 0 ? 'text-indigo-700' : 'text-rose-700'}`}>
            ₹{netSurplus.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500">
            {netSurplus >= 0 ? '✅ ইতিবাচক আর্থিক স্বাস্থ্য' : '⚠️ খরচের পরিমাণ বেশি'}
          </p>
        </div>

        {/* Active Discounts */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>স্কলারশিপ ও বিশেষ ছাড়</span>
            <Tag className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            ₹{totalDiscountsActive.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500">
            {discounts.length} জন শিক্ষার্থী ছাড় সুবিধা প্রাপ্ত
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => { setShowExpenseForm(!showExpenseForm); setShowDiscountForm(false); }}
          className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center space-x-1.5 shadow transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{showExpenseForm ? 'খরচ ফর্ম বন্ধ' : 'নতুন সেন্টারের খরচ লিখুন'}</span>
        </button>

        <button
          type="button"
          onClick={() => { setShowDiscountForm(!showDiscountForm); setShowExpenseForm(false); }}
          className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center space-x-1.5 shadow transition active:scale-95"
        >
          <Tag className="w-4 h-4" />
          <span>{showDiscountForm ? 'ছাড় ফর্ম বন্ধ' : 'শিক্ষার্থী ছাড়/স্কলারশিপ বরাদ্দ'}</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-bold text-center">
          {statusMsg}
        </div>
      )}

      {/* New Expense Form */}
      {showExpenseForm && (
        <form onSubmit={handleAddExpense} className="p-6 bg-white rounded-3xl border border-rose-200 shadow-sm space-y-4 animate-fadeIn">
          <h4 className="font-black text-slate-900 text-sm">নতুন পরিচালন ব্যয়ের বিবরণ লিখুন</h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">ক্যাটাগরি</label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
              >
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">টাকার পরিমাণ (₹)</label>
              <input
                type="number"
                placeholder="যেমন: ১৫০০"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-black bg-white text-slate-900"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">তারিখ</label>
              <input
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">পেমেন্ট মোড</label>
              <select
                value={expenseForm.paymentMode}
                onChange={(e) => setExpenseForm({ ...expenseForm, paymentMode: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
              >
                <option value="Cash">নগদ (Cash)</option>
                <option value="UPI">UPI / Google Pay</option>
                <option value="Bank">ব্যাংক ট্রান্সফার</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="text-xs font-bold text-slate-600 block mb-1">বিবরণ / নোট</label>
              <input
                type="text"
                placeholder="যেমন: অক্টোবর মাসের জেরক্স খাতা ও প্রশ্ন প্রিন্টিং বিল"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow transition active:scale-95"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </form>
      )}

      {/* New Discount Form */}
      {showDiscountForm && (
        <form onSubmit={handleAddDiscount} className="p-6 bg-white rounded-3xl border border-amber-200 shadow-sm space-y-4 animate-fadeIn">
          <h4 className="font-black text-slate-900 text-sm">শিক্ষার্থী ছাড় বা স্কলারশিপ বরাদ্দ</h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">শিক্ষার্থী নির্বাচন</label>
              <select
                value={discountForm.studentId}
                onChange={(e) => setDiscountForm({ ...discountForm, studentId: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
                required
              >
                <option value="">-- বেছে নিন --</option>
                {students.map(s => (
                  <option key={s.id} value={s.studentId || s.id}>
                    {s.name} ({s.batch})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">ছাড়ের ধরণ</label>
              <select
                value={discountForm.discountType}
                onChange={(e) => setDiscountForm({ ...discountForm, discountType: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
              >
                <option value="মেধাবৃত্তি (Merit Concession)">মেধাবৃত্তি (Merit)</option>
                <option value="আর্থিক অসচ্ছলতা (Need-based)">আর্থিক অসচ্ছলতা (Need-based)</option>
                <option value="ভাই-বোন ছাড় (Sibling Discount)">ভাই-বোন ছাড় (Sibling)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">ছাড়ের পরিমাণ (₹)</label>
              <input
                type="number"
                value={discountForm.amount}
                onChange={(e) => setDiscountForm({ ...discountForm, amount: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-black bg-white text-slate-900"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">মেয়াদ শেষ</label>
              <input
                type="date"
                value={discountForm.validUntil}
                onChange={(e) => setDiscountForm({ ...discountForm, validUntil: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-xs font-bold text-slate-600 block mb-1">ছাড়ের কারণ</label>
              <input
                type="text"
                placeholder="যেমন: টেস্ট পরীক্ষায় সর্বোচ্চ নম্বর প্রাপ্ত"
                value={discountForm.reason}
                onChange={(e) => setDiscountForm({ ...discountForm, reason: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow transition active:scale-95"
              >
                ছাড় বরাদ্দ করুন
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Expenses Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
          <CreditCard className="w-4 h-4 text-rose-600" />
          <span>মাসিক সেন্টারের খরচের তালিকা ({selectedMonth})</span>
        </h3>

        {expenses.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl">
            চলতি মাসে কোনো ব্যয়ের তথ্য নথিভুক্ত করা হয়নি।
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {expenses.map(e => (
              <div key={e.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-900">{e.category}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                      {e.paymentMode}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{e.date}</span>
                  </div>
                  {e.description && <p className="text-slate-500 text-[11px] mt-0.5">{e.description}</p>}
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-black text-rose-600 text-sm">₹{Number(e.amount).toLocaleString('en-IN')}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteExpense(e.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Discounts Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
          <Tag className="w-4 h-4 text-amber-600" />
          <span>শিক্ষার্থী ছাড় ও স্কলারশিপ তালিকা</span>
        </h3>

        {discounts.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl">
            কোনো বিশেষ ছাড় বরাদ্দ নেই।
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {discounts.map(d => (
              <div key={d.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-900">{d.studentName}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                      {d.discountType}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">কারণ: {d.reason} (মেয়াদ: {d.validUntil})</p>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-black text-amber-600 text-sm">মাসে -₹{d.amount} ছাড়</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteDiscount(d.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
