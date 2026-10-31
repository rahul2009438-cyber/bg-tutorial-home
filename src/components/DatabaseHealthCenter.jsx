import React, { useState, useEffect } from 'react';
import { 
  Database, HardDrive, Download, Upload, CheckCircle2, 
  AlertTriangle, RefreshCw, ShieldCheck, Clock, FileText, ArrowRight 
} from 'lucide-react';
import { getDbHealth, exportDatabaseBackup, restoreDatabaseBackup, db, logAudit } from '../utils/db';

export default function DatabaseHealthCenter({ customData = {} }) {
  const [health, setHealth] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [restoreMode, setRestoreMode] = useState('merge'); // 'merge' | 'replace'
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const h = await getDbHealth();
      setHealth(h);
      const logs = await db.auditLogs.reverse().limit(20).toArray();
      setAuditLogs(logs);
    } catch (e) {
      console.warn('Health check error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportDatabaseBackup();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `BG_Tutorial_Home_Backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setStatusMsg('ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে! ✓');
      refreshData();
    } catch (err) {
      setStatusMsg('ব্যাকআপ ব্যর্থ: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileRestore = (e) => {
    const fileReader = new FileReader();
    if (!e.target.files || e.target.files.length === 0) return;

    fileReader.readAsText(e.target.files[0], 'UTF-8');
    fileReader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (restoreMode === 'replace') {
          if (!window.confirm('সতর্কতা: Replace মোডে বিদ্যমান সকল ডেটা মুছে ব্যাকআপ ডেটা দিয়ে প্রতিস্থাপিত হবে। আপনি কি নিশ্চিত?')) {
            return;
          }
        }
        await restoreDatabaseBackup(parsed, restoreMode);
        setStatusMsg(`সফলভাবে ডেটা রিস্টোর সম্পন্ন হয়েছে (${restoreMode} মোড)! ✓`);
        refreshData();
      } catch (err) {
        setStatusMsg('রিস্টোর ত্রুটি: ' + err.message);
      }
    };
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-800/40 p-6 rounded-3xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>ডাটাবেস হেলথ মনিটর ও ব্যাকআপ সেন্টার</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">অফলাইন-ফার্স্ট IndexedDB ও অডিট ট্রেইল</h2>
          <p className="text-xs text-emerald-200/80 mt-1">
            ১০০% নিরাপদ অফলাইন স্থানীয় ডেটা স্টোরেজ, এক-ক্লিক জেসন ব্যাকআপ, মার্জ/রিপ্লেস রিস্টোর ও অডিট লগ।
          </p>
        </div>

        <button
          type="button"
          onClick={refreshData}
          className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          title="রিফ্রেশ করুন"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center space-x-2 ${
          statusMsg.includes('সফল') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Database Health Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white">
          <div className="text-xs text-slate-400 mb-1">শিক্ষার্থী সংখ্যা</div>
          <div className="text-2xl font-black text-emerald-400">{health?.counts?.students || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">নথিভুক্ত ছাত্রছাত্রী</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white">
          <div className="text-xs text-slate-400 mb-1">হাজিরা রেকর্ড</div>
          <div className="text-2xl font-black text-teal-400">{health?.counts?.attendance || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">দৈনিক উপস্থিতির তথ্য</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white">
          <div className="text-xs text-slate-400 mb-1">ফি প্রাপ্তি রসিদ</div>
          <div className="text-2xl font-black text-indigo-400">{health?.counts?.fees || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">পেমেন্ট লেজার</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white">
          <div className="text-xs text-slate-400 mb-1">পরীক্ষার মার্কস</div>
          <div className="text-2xl font-black text-amber-400">{health?.counts?.examResults || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">সংরক্ষিত স্কোর</div>
        </div>
      </div>

      {/* Storage Estimate Box if available */}
      {health?.storageEstimate && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <HardDrive className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="font-bold text-slate-200">স্থানীয় ব্রাউজার স্টোরেজ ব্যবহার: </span>
              <span className="font-mono text-emerald-400">{health.storageEstimate.usageMb} MB</span>
              <span className="text-slate-500"> / {health.storageEstimate.quotaMb} MB ({health.storageEstimate.usagePercent}%)</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            স্টোরেজ সুস্থ ও সক্রিয়
          </span>
        </div>
      )}

      {/* Backup and Restore Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Panel */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm">সম্পূর্ণ ব্যাকআপ ডাউনলোড (JSON Export)</h3>
              <p className="text-[11px] text-slate-400">সকল শিক্ষার্থী, হাজিরা, পরীক্ষার ফলাফল ও ফি রসিদের কপি সংরক্ষণ করুন।</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            এক ক্লিকে সম্পূর্ণ ব্যাকআপ ফাইল ডাউনলোড করে পেনড্রাইভ বা গুগল ড্রাইভে রাখতে পারবেন।
          </p>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'ব্যাকআপ তৈরি হচ্ছে...' : 'সম্পূর্ণ ব্যাকআপ ফাইল ডাউনলোড করুন'}</span>
          </button>
        </div>

        {/* Restore Panel */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm">ব্যাকআপ থেকে ডেটা রিস্টোর (JSON Restore)</h3>
              <p className="text-[11px] text-slate-400">পূর্বে ডাউনলোড করা যেকোনো ব্যাকআপ ফাইল থেকে রিস্টোর করুন।</p>
            </div>
          </div>

          <div className="flex space-x-3 text-xs">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="radio"
                name="restoreMode"
                value="merge"
                checked={restoreMode === 'merge'}
                onChange={() => setRestoreMode('merge')}
              />
              <span className="font-bold text-slate-300">Merge (নতুন তথ্য যুক্ত হবে)</span>
            </label>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="radio"
                name="restoreMode"
                value="replace"
                checked={restoreMode === 'replace'}
                onChange={() => setRestoreMode('replace')}
              />
              <span className="font-bold text-rose-300">Replace (সব প্রতিস্থাপিত হবে)</span>
            </label>
          </div>

          <label className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center space-x-2 cursor-pointer transition active:scale-95">
            <Upload className="w-4 h-4" />
            <span>ব্যাকআপ JSON ফাইল নির্বাচন করুন</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileRestore}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Local Audit Log */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl text-white">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-black">সাম্প্রতিক লোকাল অডিট ট্রেইল (Audit Logs)</span>
          <span className="text-[11px] text-slate-400">{auditLogs.length} টি অ্যাকশন রেকর্ড</span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            এখনও কোনো সিস্টেম অ্যাকশন রেকর্ড হয়নি।
          </div>
        ) : (
          <div className="divide-y divide-slate-800 max-h-60 overflow-y-auto">
            {auditLogs.map((log, i) => (
              <div key={i} className="p-3 flex items-center justify-between text-xs hover:bg-slate-800/40">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                    {log.action}
                  </span>
                  <span className="text-slate-300 text-[11px]">{log.details}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
