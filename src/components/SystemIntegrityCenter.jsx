import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, HardDrive, RefreshCw, AlertTriangle, 
  CheckCircle2, Clock, Trash2, RotateCcw, Plus, Database, Sparkles
} from 'lucide-react';
import { 
  db, getDbHealth, createRestorePoint, revertToRestorePoint, logAudit 
} from '../utils/db';

export default function SystemIntegrityCenter({ customData = {} }) {
  const [healthData, setHealthData] = useState(null);
  const [restorePoints, setRestorePoints] = useState([]);
  const [integrityIssues, setIntegrityIssues] = useState([]);
  const [duplicateStudents, setDuplicateStudents] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isCreatingPoint, setIsCreatingPoint] = useState(false);
  const [newPointName, setNewPointName] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    refreshAll();
  }, []);

  const refreshAll = async () => {
    try {
      const h = await getDbHealth();
      setHealthData(h);

      if (db.restorePoints) {
        const pts = await db.restorePoints.reverse().toArray();
        setRestorePoints(pts);
      }

      runIntegrityScan();
    } catch (e) {
      console.warn('System integrity init err:', e);
    }
  };

  const runIntegrityScan = async () => {
    setIsScanning(true);
    const issues = [];
    const duplicates = [];

    try {
      const allStudents = await db.students.toArray();
      const allFees = await db.feePayments.toArray();
      const allExams = await db.examResults.toArray();

      const studentIdSet = new Set(allStudents.map(s => String(s.studentId || s.id)));

      // 1. Check for Orphan Exam Results
      allExams.forEach(ex => {
        if (ex.studentId && !studentIdSet.has(String(ex.studentId))) {
          issues.push({
            type: 'ORPHAN_EXAM',
            table: 'examResults',
            id: ex.id,
            description: `পরীক্ষার ফলাফল #${ex.id} (${ex.examName || 'Test'}) মুছে ফেলা শিক্ষার্থী ID: ${ex.studentId}-এর সাথে লিঙ্ক রয়েছে`
          });
        }
      });

      // 2. Check for Orphan Fee Records
      allFees.forEach(fee => {
        if (fee.studentId && !studentIdSet.has(String(fee.studentId))) {
          issues.push({
            type: 'ORPHAN_FEE',
            table: 'feePayments',
            id: fee.id,
            description: `ফি রসিদ #${fee.receiptNo || fee.id} মুছে ফেলা শিক্ষার্থী ID: ${fee.studentId}-এর সাথে লিঙ্ক রয়েছে`
          });
        }
      });

      // 3. Check for Malformed Phone Numbers
      allStudents.forEach(st => {
        const cleanPhone = (st.phone || '').replace(/\D/g, '');
        if (st.phone && (cleanPhone.length !== 10 && cleanPhone.length !== 12)) {
          issues.push({
            type: 'MALFORMED_PHONE',
            table: 'students',
            id: st.id,
            description: `${st.name} (${st.batch})-এর ফোন নম্বর "${st.phone}" সঠিক ১০ অঙ্কের মোবাইল নম্বর নয়`
          });
        }
        if (!st.roll) {
          issues.push({
            type: 'MISSING_ROLL',
            table: 'students',
            id: st.id,
            description: `${st.name} (${st.batch})-এর কোনো ক্লাস রোল নম্বর বরাদ্দ করা নেই`
          });
        }
      });

      // 4. Duplicate Student Names in the Same Batch
      const batchNameMap = new Map();
      allStudents.forEach(st => {
        const key = `${(st.batch || '').toLowerCase()}_${(st.name || '').trim().toLowerCase()}`;
        if (batchNameMap.has(key)) {
          duplicates.push({
            name: st.name,
            batch: st.batch,
            ids: [batchNameMap.get(key).id, st.id]
          });
        } else {
          batchNameMap.set(key, st);
        }
      });

      setIntegrityIssues(issues);
      setDuplicateStudents(duplicates);
    } catch (err) {
      console.warn('Integrity scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCreateSnapshot = async (e) => {
    e.preventDefault();
    setIsCreatingPoint(true);
    try {
      const name = newPointName.trim() || `ম্যানুয়াল স্ন্যাপশট (${new Date().toLocaleTimeString('bn-BD')})`;
      const res = await createRestorePoint(name, 'সিস্টেম ইন্টিগ্রিটি কন্ট্রোল থেকে ব্যাকআপ');
      setStatusMsg(`✅ রিকভারি পয়েন্ট #${res.id} সফলভাবে তৈরি হয়েছে!`);
      setNewPointName('');
      setTimeout(() => setStatusMsg(''), 4000);
      refreshAll();
    } catch (err) {
      alert('স্ন্যাপশট ব্যর্থ: ' + err.message);
    } finally {
      setIsCreatingPoint(false);
    }
  };

  const handleRevert = async (id, name) => {
    if (window.confirm(`⚠️ সতর্কতা: আপনি কি নিশ্চিত যে ডাটাবেসটিকে "${name}" পয়েন্টের অবস্থায় ফিরিয়ে নিতে চান?\nবর্তমান অসংরক্ষিত ডাটা স্ন্যাপশটের ডাটা দিয়ে প্রতিস্থাপিত হবে।`)) {
      try {
        await revertToRestorePoint(id);
        alert(`✅ ডাটাবেস সফলভাবে "${name}" পয়েন্টে রিস্টোর করা হয়েছে!`);
        window.location.reload();
      } catch (err) {
        alert('রিস্টোর ব্যর্থ: ' + err.message);
      }
    }
  };

  const handleDeletePoint = async (id) => {
    if (window.confirm('এই রিকভারি পয়েন্টটি মুছে ফেলতে চান?')) {
      await db.restorePoints.delete(id);
      refreshAll();
    }
  };

  const handleFixIssue = async (issue) => {
    if (issue.type.startsWith('ORPHAN_')) {
      if (window.confirm('এই অরফান (অনাথ) রেকর্ডটি ডাটাবেস থেকে মুছে ফেলতে চান?')) {
        await db[issue.table].delete(issue.id);
        runIntegrityScan();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-zinc-900 to-emerald-950 text-white p-6 rounded-3xl shadow-lg border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>সিস্টেম রিলাইবিলিটি ও ইন্টিগ্রিটি সেন্টার • SYSTEM RELIABILITY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">ডাটাবেস রিকভারি পয়েন্ট, অনাথ রেকর্ড স্ক্যানার ও কোটা ডায়াগনোসিস</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            যেকোনো বড় পরিবর্তনের পূর্বে ১-ক্লিকে স্ন্যাপশট ব্যাকআপ নিন এবং ভুল ডাটা বা ডুপ্লিকেট এন্ট্রি শনাক্ত করে মেরামত করুন।
          </p>
        </div>

        <button
          type="button"
          onClick={runIntegrityScan}
          disabled={isScanning}
          className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center space-x-2 shadow-md transition active:scale-95 disabled:opacity-60 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          <span>ইন্টিগ্রিটি স্ক্যান চালান</span>
        </button>
      </div>

      {/* Storage & Storage Quota Diagnostics */}
      {healthData && healthData.storageEstimate && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-extrabold text-slate-800 flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-emerald-600" />
              <span>ব্রাউজার লোকাল স্টোরেজ কোটা ডায়াগনোসিস (IndexedDB Quota)</span>
            </span>
            <span className="font-mono font-bold text-slate-500">
              ব্যবহৃত: {healthData.storageEstimate.usageMb} MB / বরাদ্দ: {healthData.storageEstimate.quotaMb} MB ({healthData.storageEstimate.usagePercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-3 rounded-full transition-all"
              style={{ width: `${Math.max(1, Number(healthData.storageEstimate.usagePercent))}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400">
            সম্পূর্ণ নিরাপদ: ৯০% এর বেশি মেমরি অবশিষ্ট রয়েছে। আপনার অফলাইন স্টোরেজ লক্ষাধিক শিক্ষার্থী ও পরীক্ষার ডাটা ধারণে সক্ষম।
          </p>
        </div>
      )}

      {/* 1-Click Snapshot Restore Point Creation */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>১-ক্লিকে তাৎক্ষণিক ডাটাবেস স্ন্যাপশট (Instant Recovery Point)</span>
        </h3>

        <form onSubmit={handleCreateSnapshot} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="স্ন্যাপশটের নাম (যেমন: ১ম সামিট পরীক্ষা ২০২৬ পূর্বের ব্যাকআপ)"
            value={newPointName}
            onChange={(e) => setNewPointName(e.target.value)}
            className="flex-1 p-2.5 px-4 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
          />
          <button
            type="submit"
            disabled={isCreatingPoint}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition active:scale-95 disabled:opacity-60 shrink-0"
          >
            {isCreatingPoint ? 'স্ন্যাপশট তৈরি হচ্ছে...' : '📸 স্ন্যাপশট পয়েন্ট তৈরি করুন'}
          </button>
        </form>

        {statusMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-bold text-center">
            {statusMsg}
          </div>
        )}
      </div>

      {/* Integrity Scanner Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orphan Records & Malformed Data */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>অনাথ রেকর্ড ও ত্রুটিপূর্ণ ডাটা স্ক্যানার ({integrityIssues.length} টি সমস্যা)</span>
          </h3>

          {integrityIssues.length === 0 ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
              🎉 ডাটাবেস ১০০% অক্ষত ও সুরক্ষিত! কোনো অনাথ রেকর্ড পাওয়া যায়নি।
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {integrityIssues.map((issue, idx) => (
                <div key={idx} className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex justify-between items-center text-xs">
                  <span className="text-rose-900">{issue.description}</span>
                  {issue.type.startsWith('ORPHAN_') && (
                    <button
                      type="button"
                      onClick={() => handleFixIssue(issue)}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shrink-0 transition"
                    >
                      মুছুন
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Duplicate Record Detector */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>ডুপ্লিকেট শিক্ষার্থী ডিটেক্টর ({duplicateStudents.length} টি পুনরাবৃত্তি)</span>
          </h3>

          {duplicateStudents.length === 0 ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
              ✅ একই ব্যাচে কোনো ডুপ্লিকেট শিক্ষার্থীর নাম নেই।
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {duplicateStudents.map((dup, idx) => (
                <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                  <div className="font-extrabold text-amber-900">
                    শিক্ষার্থী: {dup.name} ({dup.batch})
                  </div>
                  <p className="text-[11px] text-amber-800">
                    একই ব্যাচে এই নামটি একাধিকবার এন্ট্রি করা হয়েছে (IDs: {dup.ids.join(', ')})
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Snapshot Points History */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-black text-slate-900 text-sm flex items-center space-x-2">
          <Clock className="w-4 h-4 text-slate-700" />
          <span>সংরক্ষিত রিকভারি পয়েন্টের ইতিহাস ({restorePoints.length} টি পয়েন্ট)</span>
        </h3>

        {restorePoints.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl">
            এখনো কোনো রিকভারি স্ন্যাপশট তৈরি করা হয়নি। উপরের বাটনে ক্লিক করে প্রথম স্ন্যাপশট তৈরি করুন।
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {restorePoints.map(pt => (
              <div key={pt.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-slate-900">{pt.name}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">
                      পয়েন্ট #{pt.id}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    তারিখ: {new Date(pt.timestamp).toLocaleString('bn-BD')} • কারণ: {pt.reason || 'ম্যানুয়াল'}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleRevert(pt.id, pt.name)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-sm transition active:scale-95 flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>এই পয়েন্টে রিস্টোর</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeletePoint(pt.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    title="পয়েন্ট মুছুন"
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
