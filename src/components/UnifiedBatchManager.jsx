import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Check, X, Mic, MicOff, AlertCircle, Save, Share2, 
  MessageCircle, Phone, ArrowRight, Award, TrendingUp, Calendar, 
  Volume2, CheckCircle2, RefreshCw, Sparkles, Filter, ChevronRight
} from 'lucide-react';
import { db, logAudit } from '../utils/db';

export default function UnifiedBatchManager({ 
  customData = {}, 
  students = [], 
  setStudents,
  lang = 'bn',
  onBack
}) {
  const [selectedBatch, setSelectedBatch] = useState('Class 10');
  const [examName, setExamName] = useState('পর্যায়ক্রমিক মূল্যায়ন');
  const [totalExamMarks, setTotalExamMarks] = useState(50);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [weakThreshold, setWeakThreshold] = useState(40); // default <40%
  
  // Attendance state: { [studentId]: 'P' | 'A' | 'L' }
  const [attendanceMap, setAttendanceMap] = useState({});
  // Marks state: { [studentId]: marksNumber }
  const [marksMap, setMarksMap] = useState({});
  const [saveStatus, setSaveStatus] = useState('');

  // Web Speech API Voice Entry State (Bengali bn-IN)
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [voiceTargetStudentId, setVoiceTargetStudentId] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Filter students for the current batch
  const batchStudents = students.filter(s => (s.batch || 'Class 10') === selectedBatch);

  // Initialize attendance (All present by default)
  useEffect(() => {
    const initialAtt = {};
    batchStudents.forEach(st => {
      initialAtt[st.studentId || st.id] = attendanceMap[st.studentId || st.id] || 'P';
    });
    setAttendanceMap(initialAtt);
  }, [selectedBatch, students]);

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = false;
      recognizer.lang = 'bn-IN';

      recognizer.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setSpeechTranscript(text);
        // Extract numbers from Bengali or English speech
        const extracted = parseBengaliNumber(text);
        if (extracted !== null && voiceTargetStudentId) {
          setMarksMap(prev => ({
            ...prev,
            [voiceTargetStudentId]: Math.min(totalExamMarks, Math.max(0, extracted))
          }));
        }
        setIsListening(false);
      };

      recognizer.onerror = () => {
        setIsListening(false);
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognizer;
    }
  }, [voiceTargetStudentId, totalExamMarks]);

  const toggleAttendance = (stId) => {
    setAttendanceMap(prev => {
      const current = prev[stId] || 'P';
      const next = current === 'P' ? 'A' : (current === 'A' ? 'L' : 'P');
      return { ...prev, [stId]: next };
    });
  };

  const handleMarkChange = (stId, val) => {
    const num = val === '' ? '' : Math.max(0, Math.min(totalExamMarks, Number(val)));
    setMarksMap(prev => ({ ...prev, [stId]: num }));
  };

  const startVoiceInput = (stId) => {
    if (!speechSupported || !recognitionRef.current) {
      alert('আপনার ব্রাউজারে ভয়েস রিকগনিশন সমর্থিত নয়। ম্যানুয়ালি নম্বর টাইপ করুন।');
      return;
    }
    setVoiceTargetStudentId(stId);
    setSpeechTranscript('শুনছি... বাংলায় নম্বর বলুন (যেমন: চল্লিশ বা ৪৫)');
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch {
      setIsListening(false);
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Convert Bengali numerals or words to digits
  const parseBengaliNumber = (str) => {
    if (!str) return null;
    const bnDigits = { '০': 0, '১': 1, '২': 2, '৩': 3, '৪': 4, '৫': 5, '৬': 6, '৭': 7, '৮': 8, '৯': 9 };
    let normalized = str.replace(/[০-৯]/g, d => bnDigits[d]);
    const numMatch = normalized.match(/\d+/);
    if (numMatch) return parseInt(numMatch[0], 10);
    // Basic Bengali verbal numbers
    const wordMap = {
      'দশ': 10, 'কুড়ি': 20, 'বিশ': 20, 'ত্রিশ': 30, 'তিরিশ': 30, 'চল্লিশ': 40,
      'পয়তাল্লিশ': 45, 'পঞ্চাশ': 50, 'ষাট': 60, 'সত্তর': 70, 'আশি': 80, 'নব্বই': 90, 'একশ': 100
    };
    for (const [w, n] of Object.entries(wordMap)) {
      if (str.includes(w)) return n;
    }
    return null;
  };

  // Save both attendance & exam marks in IndexedDB
  const handleSaveBatchRecords = async () => {
    try {
      setSaveStatus('সংরক্ষণ হচ্ছে...');
      const recordsToSave = [];

      for (const st of batchStudents) {
        const stId = st.studentId || st.id;
        const attStatus = attendanceMap[stId] || 'P';
        
        // Save attendance record
        await db.attendance.add({
          studentId: stId,
          batch: selectedBatch,
          date: attendanceDate,
          status: attStatus,
          timestamp: new Date().toISOString()
        });

        // Save exam marks if entered
        const rawMark = marksMap[stId];
        if (rawMark !== undefined && rawMark !== '') {
          const marks = Number(rawMark);
          const percentage = ((marks / totalExamMarks) * 100).toFixed(1);
          await db.examResults.add({
            studentId: stId,
            studentName: st.name,
            batch: selectedBatch,
            examName,
            marks,
            totalMarks: totalExamMarks,
            percentage: Number(percentage),
            date: attendanceDate
          });
        }
      }

      await logAudit('BATCH_COMMAND_SAVE', 'ATTENDANCE_AND_EXAM', `Saved for ${batchStudents.length} students in ${selectedBatch}`);
      setSaveStatus('সফলভাবে সংরক্ষিত হয়েছে! ✓');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      setSaveStatus('সংরক্ষণ ব্যর্থ হয়েছে: ' + err.message);
    }
  };

  // WhatsApp Alert for Absent Students
  const sendAbsentWhatsApp = (st) => {
    const phone = (st.guardianPhone || st.phone || '').replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;
    const teacherName = customData.teacherName || 'বাবুন ঘোষ';
    const teacherPhone = customData.phone || '9733974425';
    
    const msg = `নমস্কার, বি.জি. টিউটোরিয়াল হোম (দক্ষিণ হাবড়া) থেকে ${teacherName} স্যার বলছি।\n\nআপনার সন্তান *${st.name}* (ব্যাচ: ${selectedBatch}, রোল: ${st.roll || '-'}) আজকের (${attendanceDate}) ক্লাসে অনুপস্থিত রয়েছে।\nগুরুত্বপূর্ণ পাঠদান ও পরীক্ষার কারণে নিয়মিত উপস্থিতি প্রয়োজন। কোনো সমস্যা থাকলে সরাসরি যোগাযোগ করুন: ${teacherPhone}।`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // WhatsApp Marks Report
  const sendMarksWhatsApp = (st) => {
    const stId = st.studentId || st.id;
    const mark = marksMap[stId];
    if (mark === undefined || mark === '') return;
    const pct = ((Number(mark) / totalExamMarks) * 100).toFixed(1);
    const phone = (st.guardianPhone || st.phone || '').replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;

    const msg = `📊 *বি.জি. টিউটোরিয়াল হোম — পরীক্ষার ফলাফল রিপোর্ট*\n\nশিক্ষার্থী: *${st.name}* (রোল: ${st.roll || '-'})\nব্যাচ: ${selectedBatch}\nপরীক্ষার নাম: ${examName}\nপ্রাপ্ত নম্বর: *${mark} / ${totalExamMarks}* (${pct}%)\nমূল্যায়ন তারিখ: ${attendanceDate}\n\nধন্যবাদান্তে,\nশিক্ষক: ${customData.teacherName || 'বাবুন ঘোষ'}\nদক্ষিণ হাবড়া • ফোন: ${customData.phone || '9733974425'}`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const batches = ['Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Madhyamik Special'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-3xl border border-emerald-700/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ইউনিফাইড ব্যাচ কমান্ড সেন্টার • PHASE 5</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">ব্যাচ হাজিরা ও ভয়েস-মার্কস কন্ট্রোল রুম</h2>
          <p className="text-xs text-emerald-200/80 mt-1">এক ক্লিকে হাজিরা টগল, বাংলায় সরাসরি ভয়েস মার্কস এন্ট্রি ও ওয়ান-ট্যাপ হোয়াটসঅ্যাপ অ্যালার্ট।</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleSaveBatchRecords}
            className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/30 transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>রেকর্ড সংরক্ষণ করুন</span>
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center space-x-2 ${
          saveStatus.includes('সফল') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Control Configuration Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-white">
        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">ব্যাচ নির্বাচন করুন</label>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
          >
            {batches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">তারিখ</label>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
          >
          </input>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">পরীক্ষার নাম</label>
          <input
            type="text"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="পরীক্ষার নাম..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">মোট পূর্ণমান</label>
          <input
            type="number"
            value={totalExamMarks}
            onChange={(e) => setTotalExamMarks(Number(e.target.value) || 50)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Voice Status Alert if Active */}
      {isListening && (
        <div className="p-4 rounded-2xl bg-indigo-950/80 border border-indigo-500/50 text-indigo-200 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <Mic className="w-5 h-5 text-indigo-400 animate-bounce" />
            <span className="text-xs font-bold">{speechTranscript || 'বাংলায় নম্বর বলুন...'}</span>
          </div>
          <button
            type="button"
            onClick={stopVoiceInput}
            className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            থামান
          </button>
        </div>
      )}

      {/* Student List Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black text-white">{selectedBatch}-এর মোট শিক্ষার্থী ({batchStudents.length} জন)</span>
          </div>
          <span className="text-[11px] font-bold text-slate-400">সবুজ = উপস্থিত (P), লাল = অনুপস্থিত (A), হলুদ = ছুটি (L)</span>
        </div>

        {batchStudents.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            এই ব্যাচে কোনো নথিভুক্ত শিক্ষার্থী পাওয়া যায়নি। শিক্ষার্থী তালিকায় নতুন ছাত্রছাত্রী যোগ করুন।
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {batchStudents.map((st) => {
              const stId = st.studentId || st.id;
              const att = attendanceMap[stId] || 'P';
              const mark = marksMap[stId];
              const isMarkEntered = mark !== undefined && mark !== '';
              const pct = isMarkEntered ? ((Number(mark) / totalExamMarks) * 100) : null;
              const isWeak = pct !== null && pct < weakThreshold;

              return (
                <div key={stId} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-slate-800/40 transition">
                  {/* Student Info */}
                  <div className="flex items-center space-x-3 min-w-[200px]">
                    <div className="w-9 h-9 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-xs text-white">
                      {st.roll || '—'}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white flex items-center space-x-2">
                        <span>{st.name}</span>
                        {isWeak && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            মনোযোগ প্রয়োজন (&lt;{weakThreshold}%)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {st.studentId || 'ID: —'} • {st.phone || st.guardianPhone || 'ফোন নেই'}
                      </div>
                    </div>
                  </div>

                  {/* Attendance 1-Tap Toggle */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => toggleAttendance(stId)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs border transition flex items-center space-x-1.5 ${
                        att === 'P'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                          : att === 'A'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                      }`}
                    >
                      <span>{att === 'P' ? '✓ উপস্থিত (P)' : att === 'A' ? '✗ অনুপস্থিত (A)' : '○ ছুটি (L)'}</span>
                    </button>

                    {att === 'A' && (
                      <button
                        type="button"
                        onClick={() => sendAbsentWhatsApp(st)}
                        title="অভিভাবককে অনুপস্থিতি অ্যালার্ট পাঠান"
                        className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Marks Entry (Manual + Voice bn-IN) */}
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max={totalExamMarks}
                        placeholder={`/${totalExamMarks}`}
                        value={mark !== undefined ? mark : ''}
                        onChange={(e) => handleMarkChange(stId, e.target.value)}
                        className={`w-20 bg-slate-800 border rounded-xl px-2.5 py-1.5 text-xs font-bold text-center text-white focus:outline-none ${
                          isWeak ? 'border-rose-500 text-rose-300' : 'border-slate-700 focus:border-emerald-500'
                        }`}
                      />
                      {pct !== null && (
                        <span className={`block text-[10px] text-center font-bold mt-0.5 ${
                          isWeak ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {pct.toFixed(0)}%
                        </span>
                      )}
                    </div>

                    {/* Bengali Voice Button */}
                    <button
                      type="button"
                      onClick={() => startVoiceInput(stId)}
                      title="বাংলায় নম্বর বলুন"
                      className={`p-1.5 rounded-xl border transition ${
                        isListening && voiceTargetStudentId === stId
                          ? 'bg-indigo-500 text-white border-indigo-400 animate-pulse'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:border-slate-600'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    {/* Send Marks WhatsApp */}
                    {isMarkEntered && (
                      <button
                        type="button"
                        onClick={() => sendMarksWhatsApp(st)}
                        title="রেজাল্ট হোয়াটসঅ্যাপে পাঠান"
                        className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}
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
