import React, { useState } from 'react';
import { 
  CreditCard, FileText, Printer, CheckCircle2, User, 
  Sparkles, Award, Shield, Phone, MapPin, Calendar, QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { db } from '../utils/db';

export default function StudentDocumentGenerator({ students = [], customData = {} }) {
  const [selectedStudentId, setSelectedStudentId] = useState(
    students[0]?.studentId || students[0]?.id || ''
  );
  const [docType, setDocType] = useState('id_card'); // 'id_card' | 'admission_form' | 'dossier'

  const currentYear = new Date().getFullYear();

  const [, setRefreshKey] = useState(0);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !student) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      try {
        if (db && db.students && student.id) {
          await db.students.update(student.id, { avatar: base64 });
        }
        student.avatar = base64;
        setRefreshKey(k => k + 1);
      } catch (err) {
        console.warn('Photo save error:', err);
      }
    };
    reader.readAsDataURL(file);
  };


  // Find currently selected student
  const student = students.find(s => String(s.studentId || s.id) === String(selectedStudentId)) || students[0];

  // Helper to compute standardized ID: BGTH-[YEAR]-[CLASS]-[ROLL]
  const computeStandardId = (st) => {
    if (!st) return `BGTH-${currentYear}-C10-01`;
    const classNum = (st.batch || 'Class 10').replace(/\D/g, '') || '10';
    const rollNum = String(st.roll || '1').padStart(2, '0');
    return `BGTH-${currentYear}-C${classNum}-${rollNum}`;
  };

  const standardizedId = student ? (student.studentId?.startsWith('BGTH-') ? student.studentId : computeStandardId(student)) : '';

  const qrData = student 
    ? `BG_TUTORIAL_HOME|ID:${standardizedId}|NAME:${student.name}|BATCH:${student.batch}|ROLL:${student.roll}|PHONE:9733974425`
    : '';

  return (
    <div className="space-y-6">
      {/* Top Banner (Print Hidden) */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-6 rounded-3xl shadow-lg border border-blue-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>শিক্ষার্থী ডকুমেন্ট ও আইডি কার্ড জেনারেটর • STUDENT DOCUMENT SUITE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">স্ট্যান্ডার্ড আইডি কার্ড, অ্যাডমিশন ফর্ম ও প্রফাইল ডসিয়ার</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            BGTH স্ট্যান্ডার্ডাইজড আইডি (যেমন: {standardizedId || 'BGTH-2026-C10-01'}) সহ অফলাইন কিউআর কোড বিশিষ্ট পকেট আইডি কার্ড এবং অফিসিয়াল ফর্ম প্রিন্ট করুন।
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-2xl bg-white text-slate-900 font-black text-xs flex items-center space-x-2 shadow-md hover:bg-slate-100 transition active:scale-95 shrink-0"
        >
          <Printer className="w-4 h-4 text-blue-600" />
          <span>ডকুমেন্ট প্রিন্ট করুন (Ctrl + P)</span>
        </button>
      </div>

      {/* Control Bar (Print Hidden) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        {/* Student Selector */}
        <div className="w-full sm:w-72">
          <label className="text-xs font-bold text-slate-600 block mb-1">শিক্ষার্থী নির্বাচন:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-extrabold text-slate-900 bg-white"
          >
            {students.map(s => (
              <option key={s.id} value={s.studentId || s.id}>
                {s.name} ({s.batch} • রোল {s.roll || 'N/A'})
              </option>
            ))}
          </select>
        </div>

        {/* Doc Type Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'id_card', label: '🪪 পকেট আইডি কার্ড (QR Code)', icon: CreditCard },
            { id: 'admission_form', label: '📄 ভর্তি কনফার্মেশন ফর্ম', icon: FileText },
            { id: 'dossier', label: '📁 অ্যাকাডেমিক ডসিয়ার ফাইল', icon: Award }
          ].map(t => {
            const Icon = t.icon;
            const active = docType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setDocType(t.id)}
                className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition active:scale-95 ${
                  active ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= DOCUMENT 1: POCKET ID CARD WITH QR ================= */}
      {docType === 'id_card' && student && (
        <div className="flex justify-center p-4 sm:p-8 bg-slate-100 rounded-3xl border border-slate-200 print:bg-white print:border-none print:p-0">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-300 print:shadow-none print:border-slate-800">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 text-center border-b-2 border-amber-400">
              <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block">
                STUDENT IDENTITY CARD
              </span>
              <h3 className="text-base font-black tracking-wide mt-0.5">B.G. TUTORIAL HOME</h3>
              <p className="text-[10px] text-slate-300">শিক্ষক: বাপুন ঘোষ • দক্ষিণ হাবড়া, এস. এন দে রোড</p>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="flex items-center space-x-4">
                {/* Photo Placeholder */}
                <div className="w-20 h-24 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                  <User className="w-8 h-8 text-slate-400" />
                  <span className="text-[9px] font-bold mt-1">পাসপোর্ট ছবি</span>
                </div>

                {/* Details */}
                <div className="space-y-1 text-xs">
                  <div className="font-extrabold text-sm text-slate-900">{student.name}</div>
                  <div className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block">
                    {standardizedId}
                  </div>
                  <div className="text-slate-600 text-[11px] pt-1">
                    <span className="font-bold text-slate-700">ব্যাচ:</span> {student.batch}
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    <span className="font-bold text-slate-700">ক্লাস রোল:</span> {student.roll || 'N/A'}
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    <span className="font-bold text-slate-700">স্কুল:</span> {student.school || student.schoolName || 'স্থানীয় হাইস্কুল'}
                  </div>
                </div>
              </div>

              {/* QR and Helpline Row */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">হেল্পলাইন / জরুরি ফোন</span>
                  <div className="text-xs font-mono font-black text-slate-900">
                    📞 {customData.phone || '9733974425'}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold">
                    বৈধতা: {currentYear}–{currentYear + 1} শিক্ষাবর্ষ
                  </div>
                </div>

                <div className="p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
                  <QRCodeSVG value={qrData} size={64} level="M" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-4 py-2 text-center text-[9px] text-slate-500 border-t border-slate-200 flex justify-between items-center">
              <span>B.G. Tutorial Home • Official</span>
              <span className="font-bold text-slate-700">শিক্ষকের স্বাক্ষর: _________________</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= DOCUMENT 2: ADMISSION CONFIRMATION FORM ================= */}
      {docType === 'admission_form' && student && (
        <div className="max-w-2xl mx-auto p-8 sm:p-10 bg-white rounded-3xl border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0 space-y-6">
          <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-900 uppercase tracking-wider">
              অফিসিয়াল ভর্তি নিশ্চিতকরণ ও অঙ্গীকারপত্র
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">B.G. TUTORIAL HOME</h2>
            <p className="text-xs text-slate-600">শিক্ষক: বাপুন ঘোষ • দক্ষিণ হাবড়া, উত্তর ২৪ পরগনা • ফোন: {customData.phone || '9733974425'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-bold block mb-1">স্টুডেন্ট আইডি:</span>
              <span className="font-mono font-black text-sm text-indigo-700">{standardizedId}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-bold block mb-1">ভর্তির শিক্ষাবর্ষ:</span>
              <span className="font-extrabold text-sm text-slate-800">{currentYear}–{currentYear + 1}</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-black text-slate-900 border-b pb-1">১. শিক্ষার্থীর ব্যক্তিগত তথ্য</h4>
            <div className="grid grid-cols-2 gap-3">
              <div><span className="font-bold text-slate-600">পূর্ণ নাম:</span> <span className="font-bold text-slate-900">{student.name}</span></div>
              <div><span className="font-bold text-slate-600">শ্রেণি ও ব্যাচ:</span> <span className="font-bold text-slate-900">{student.batch} (রোল {student.roll})</span></div>
              <div><span className="font-bold text-slate-600">স্কুল:</span> {student.school || student.schoolName || 'N/A'}</div>
              <div><span className="font-bold text-slate-600">ঠিকানা:</span> {student.address || 'দক্ষিণ হাবড়া, উত্তর ২৪ পরগনা'}</div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-black text-slate-900 border-b pb-1">২. অভিভাবকের তথ্য ও যোগাযোগ</h4>
            <div className="grid grid-cols-2 gap-3">
              <div><span className="font-bold text-slate-600">অভিভাবকের নাম:</span> {student.guardianName || 'অভিভাবক'}</div>
              <div><span className="font-bold text-slate-600">সম্পর্ক:</span> {student.guardianRelation || 'পিতা/মাতা'}</div>
              <div><span className="font-bold text-slate-600">যোগাযোগের ফোন:</span> {student.guardianPhone || student.phone}</div>
              <div><span className="font-bold text-slate-600">হোয়াটসঅ্যাপ নম্বর:</span> {student.phone}</div>
            </div>
          </div>

          <div className="space-y-2 text-[11px] text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-800">অঙ্গীকারনামা ও নিয়মাবলী:</h5>
            <ul className="list-disc list-inside space-y-1">
              <li>শিক্ষার্থীকে প্রতি ক্লাসে নির্ধারিত সময়ে উপস্থিত থাকতে হবে এবং বাড়ির কাজ নিয়মিত সম্পন্ন করতে হবে।</li>
              <li>বিনা অনুমতিতে অনুপস্থিত থাকলে অভিভাবককে অবহিত করা হবে।</li>
              <li>মাসের প্রথম সপ্তাহের মধ্যে টিউশন ফি পরিশোধযোগ্য।</li>
            </ul>
          </div>

          <div className="pt-8 flex justify-between items-center text-xs">
            <div className="text-center">
              <div className="border-t border-slate-400 w-40 pt-1 text-slate-600">অভিভাবকের স্বাক্ষর</div>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-900 w-44 pt-1 font-bold text-slate-900">বাপুন ঘোষ (শিক্ষক)</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= DOCUMENT 3: STUDENT DOSSIER ================= */}
      {docType === 'dossier' && student && (
        <div className="max-w-3xl mx-auto p-8 bg-white rounded-3xl border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0 space-y-6">
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                CONFIDENTIAL ACADEMIC DOSSIER
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">{student.name} — সম্পূর্ণ প্রোফাইল ডসিয়ার</h2>
              <p className="text-xs text-slate-500">স্ট্যান্ডার্ড আইডি: {standardizedId} • ব্যাচ: {student.batch}</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>B.G. TUTORIAL HOME</div>
              <div className="font-mono text-[11px]">{new Date().toLocaleDateString('bn-BD')}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 block mb-0.5">রোল নম্বর</span>
              <span className="text-base font-black text-slate-900">{student.roll || 'N/A'}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-emerald-600 block mb-0.5">স্বাস্থ্য ও পড়াশোনার রেটিং</span>
              <span className="text-base font-black text-emerald-800">{student.healthStars || 5} ★ ({student.healthCondition || 'Excellent'})</span>
            </div>
            <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200">
              <span className="text-indigo-600 block mb-0.5">ফি স্ট্যাটাস</span>
              <span className="text-base font-black text-indigo-800">{student.feesStatus || 'নিয়মিত (Paid)'}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-700 block">শিক্ষকের বিশেষ পর্যবেক্ষণ ও নোট:</span>
            <p className="text-slate-600 leading-relaxed">
              {student.weakRemarks || student.notes || 'শিক্ষার্থী ক্লাসে নিয়মিত এবং মনোযোগ সহকারে গণিত ও বিজ্ঞানের পাঠ গ্রহণ করছে। টেস্ট পরীক্ষায় ভালো ফলাফলের সম্ভাবনা রয়েছে।'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
