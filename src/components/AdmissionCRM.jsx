import React, { useState, useEffect } from 'react';
import { UserPlus, Phone, MessageSquare, Check, X, Clock, AlertCircle, Share2, Filter, Sparkles } from 'lucide-react';
import { db, logAudit } from '../utils/db';

export default function AdmissionCRM({ customData = {}, setStudents }) {
  const [admissions, setAdmissions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [newStudentName, setNewStudentName] = useState('');
  const [newGuardianName, setNewGuardianName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newClass, setNewClass] = useState('Class 10');

  useEffect(() => {
    loadAdmissions();
  }, []);

  const loadAdmissions = async () => {
    try {
      const records = await db.admissions.toArray();
      setAdmissions(records);
    } catch (e) {
      console.warn('Error loading admissions:', e);
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newPhone.trim()) return;

    const lead = {
      studentName: newStudentName.trim(),
      guardianName: newGuardianName.trim(),
      phone: newPhone.trim(),
      classApplied: newClass,
      status: 'New', // New, Contacted, Interested, Follow-up, Admitted, Not proceeding
      createdAt: new Date().toISOString()
    };

    try {
      await db.admissions.add(lead);
      await logAudit('ADMISSION_LEAD_ADD', 'ADMISSIONS', `${lead.studentName} (${lead.classApplied})`);
      setNewStudentName('');
      setNewGuardianName('');
      setNewPhone('');
      loadAdmissions();
    } catch (err) {
      alert('সংরক্ষণ ব্যর্থ: ' + err.message);
    }
  };

  const updateLeadStatus = async (id, newStatus) => {
    try {
      const lead = await db.admissions.get(id);
      if (!lead) return;

      await db.admissions.update(id, { status: newStatus });

      // If Admitted, automatically create a verified student record!
      if (newStatus === 'Admitted') {
        const generatedUid = `BG-2026-${lead.classApplied.replace(/\s+/g, '')}-${Math.floor(10 + Math.random() * 89)}`;
        const newStudent = {
          studentId: generatedUid,
          name: lead.studentName,
          batch: lead.classApplied,
          roll: '',
          phone: lead.phone,
          guardianPhone: lead.phone,
          status: 'Active',
          createdAt: new Date().toISOString()
        };
        await db.students.add(newStudent);
        if (setStudents) {
          setStudents(prev => [...prev, newStudent]);
        }
        await logAudit('STUDENT_ENROLLED_FROM_LEAD', 'STUDENTS', `Created ${generatedUid} for ${lead.studentName}`);
        alert(`অভিনন্দন! শিক্ষার্থীকে সফলভাবে ভর্তি করা হয়েছে। নতুন আইডি: ${generatedUid}`);
      }

      loadAdmissions();
    } catch (e) {
      alert('স্ট্যাটাস আপডেট ব্যর্থ: ' + e.message);
    }
  };

  const filteredLeads = statusFilter === 'All'
    ? admissions
    : admissions.filter(a => a.status === statusFilter);

  const statuses = ['New', 'Contacted', 'Interested', 'Follow-up', 'Admitted', 'Not proceeding'];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 border border-teal-800/40 p-6 rounded-3xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-2">
            <UserPlus className="w-3.5 h-3.5" />
            <span>অ্যাডমিশন সিআরএম ও ফলো-আপ ট্র্যাকার</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">নতুন ভর্তির অনুসন্ধান ও শিক্ষার্থী অনবোর্ডিং</h2>
          <p className="text-xs text-teal-200/80 mt-1">
            ভর্তি অনুসন্ধানের পর্যায় ট্র্যাকিং, এক-ক্লিকে কল/হোয়াটসঅ্যাপ এবং ভর্তিকৃত ছাত্রের অটোমেটিক ইউনিক আইডি জেনারেশন।
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-teal-500"
        >
          <option value="All">সকল স্ট্যাটাস ({admissions.length})</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Add Lead Form */}
      <form onSubmit={handleAddLead} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-white">
        <h3 className="text-xs font-black text-white flex items-center space-x-2">
          <UserPlus className="w-4 h-4 text-teal-400" />
          <span>নতুন অনুসন্ধান / ছাত্র তথ্য যোগ করুন</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">শিক্ষার্থীর নাম</label>
            <input
              type="text"
              required
              placeholder="নাম লিখুন..."
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">অভিভাবকের নাম (ঐচ্ছিক)</label>
            <input
              type="text"
              placeholder="অভিভাবকের নাম..."
              value={newGuardianName}
              onChange={(e) => setNewGuardianName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">ফোন নম্বর</label>
            <input
              type="tel"
              required
              placeholder="মোবাইল নম্বর..."
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">শ্রেণী</label>
            <select
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-teal-500"
            >
              {['Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Madhyamik Special'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center space-x-2 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>অনুসন্ধান নথিভুক্ত করুন</span>
        </button>
      </form>

      {/* Leads List */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl text-white">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-black">ভর্তি অনুসন্ধান তালিকা ({filteredLeads.length} জন)</span>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            কোনো ভর্তি অনুসন্ধান পাওয়া যায়নি।
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredLeads.map(lead => (
              <div key={lead.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-slate-800/40 transition">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-xs text-white">{lead.studentName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      {lead.classApplied}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      lead.status === 'Admitted' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      lead.status === 'Interested' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                      lead.status === 'Follow-up' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-3">
                    <span>ফোন: <strong className="text-slate-300">{lead.phone}</strong></span>
                    {lead.guardianName && <span>• অভিভাবক: {lead.guardianName}</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href={`tel:${lead.phone}`}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="সরাসরি কল করুন"
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      const msg = `নমস্কার, আমি বি.জি. টিউটোরিয়াল হোম (দক্ষিণ হাবড়া) থেকে বাবুন ঘোষ বলছি। ${lead.studentName}-এর ${lead.classApplied}-এ ভর্তির অনুসন্ধান সংক্রান্ত বিষয়ে কথা বলতে যোগাযোগ করলাম। কোনো প্রশ্ন থাকলে জানাতে পারেন। ফোন: ${customData.phone || '9733974425'}`;
                      window.open(`https://wa.me/91${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition"
                    title="হোয়াটসঅ্যাপে কথা বলুন"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <select
                    value={lead.status}
                    onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none"
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
