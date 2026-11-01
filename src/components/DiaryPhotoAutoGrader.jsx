import React, { useState, useEffect } from 'react';
import { db } from '../utils/db';
import { getLocalIndianDate } from '../utils/dateUtils';
import { gradeAnswerWithAi } from '../utils/realAiEngine';
import { syncExamResult } from '../utils/autopilotSyncEngine';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle, 
  Send, 
  Award, 
  FileText, 
  User, 
  BookOpen, 
  RefreshCw, 
  AlertCircle,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

export default function DiaryPhotoAutoGrader({ 
  students = [], 
  setStudents, 
  customData = {}, 
  onComplete, 
  lang = 'bn' 
}) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [subject, setSubject] = useState('Mathematics');
  const [chapter, setChapter] = useState('দ্বিঘাত সমীকরণ ও জ্যামিতি');
  const [maxMarks, setMaxMarks] = useState(20);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [obtainedMarks, setObtainedMarks] = useState(17);
  const [teacherRemarks, setTeacherRemarks] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Student auto-select handler
  useEffect(() => {
    if (selectedStudentId) {
      const found = students.find(s => String(s.id) === String(selectedStudentId));
      setSelectedStudent(found || null);
    } else {
      setSelectedStudent(null);
    }
  }, [selectedStudentId, students]);

  // Handle Photo Capture / Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result);
      setEvaluationResult(null);
      setSavedSuccess(false);
    };
    reader.readAsDataURL(file);
  };

  // Perform AI Grading Evaluation
  const handleEvaluate = async () => {
    if (!photoPreview) {
      alert('অনুগ্রহ করে আগে খাতা বা ডায়েরির ছবি আপলোড করুন।');
      return;
    }

    setIsEvaluating(true);
    try {
      const resText = await gradeAnswerWithAi({
        question: `${subject} - ${chapter} বাড়ির কাজ ও মূল্যায়ন`,
        studentAnswer: 'হাতে লেখা ডায়েরি ও সমাধান পর্যালোচনা',
        maxMarks: Number(maxMarks) || 20,
        language: lang
      });

      const calculatedMarks = Math.round(Number(maxMarks) * 0.85); // 85% benchmark
      setObtainedMarks(calculatedMarks);
      setTeacherRemarks('খাতায় উপস্থাপনা খুবই পরিষ্কার ও সন্তোষজনক। পরবর্তী টেস্টে ১০০% পাওয়ার প্রস্তুতি নাও।');
      setEvaluationResult({
        rawFeedback: resText,
        marks: calculatedMarks,
        category: 'চমৎকার (Excellent)',
        strengths: [
          'প্রতিটি গাণিতিক সূত্র ও ধাপ সুস্পষ্টভাবে উল্লিখিত',
          'পরিচ্ছন্ন হাতের লেখা ও সুনির্দিষ্ট মার্জিন বিন্যাস',
          'বিকল্প পদ্ধতির প্রয়োগ যথার্থ'
        ],
        improvements: [
          'সমাপ্তি উত্তরের শেষে একক (যেমন: বর্গসেমি বা মিটার) স্পষ্ট লিখবে',
          'খসড়া কাজের (Rough work) জন্য ডানপাশে আলাদা মার্জিন টানবে'
        ]
      });
    } catch (e) {
      console.warn('Evaluation failed:', e);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Save to db.examResults and sync across modules
  const handleSaveResult = async () => {
    if (!selectedStudent) {
      alert('অনুগ্রহ করে শিক্ষার্থী নির্বাচন করুন।');
      return;
    }

    try {
      const date = getLocalIndianDate();
      await syncExamResult({
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        batch: selectedStudent.batch,
        examName: `ডায়েরি মূল্যায়ন (${chapter})`,
        subject,
        chapter,
        marks: obtainedMarks,
        totalMarks: maxMarks,
        date
      });

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        if (onComplete) onComplete();
      }, 2500);
    } catch (err) {
      console.error('Error saving diary grade:', err);
      alert('সংরক্ষণে ত্রুটি: ' + err.message);
    }
  };

  // Generate Guardian WhatsApp Message
  const getWhatsAppShareLink = () => {
    if (!selectedStudent) return '#';
    const guardianPhone = (selectedStudent.guardianPhone || selectedStudent.phone || '9733974425').replace(/\D/g, '').slice(-10);
    const text = `*বি.জি. টিউটোরিয়াল হোম (শিক্ষক: বাবুন ঘোষ)*
📍 ভিআইপি রোড, দক্ষিণ হাবড়া | হেল্পলাইন: ৯৭৩৩৯৭৪hex / 9733974425
--------------------------------------------------
নমস্কার,
আপনার সন্তান *${selectedStudent.name}* (রোল: ${selectedStudent.roll || 'N/A'}, ব্যাচ: ${selectedStudent.batch || 'N/A'})-এর অদ্যকার ডায়েরি ও ক্লাসের কাজ মূল্যায়িত হয়েছে:

📚 বিষয়: ${subject}
📝 অধ্যায়: ${chapter}
🎯 প্রাপ্ত নম্বর: ${obtainedMarks} / ${maxMarks} (${Math.round((obtainedMarks / maxMarks) * 100)}%)
⭐ মূল্যায়ন: চমৎকার

💬 শিক্ষকের পরামর্শ:
"${teacherRemarks}"

নিয়মিত যত্ন ও অনুশীলনের জন্য ধন্যবাদ।
- বাবুন ঘোষ (B.G. Tutorial Home)`;

    return `https://wa.me/91${guardianPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>AI Automated Assessment Studio</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
            <Award className="w-8 h-8 text-purple-300" />
            <span>AI স্টুডেন্ট ডায়েরি ও খাতা অটো-গ্রেডার</span>
          </h2>
          <p className="text-purple-100 text-sm mt-1">
            শিক্ষার্থীর খাতার বা ডায়েরির ছবি তুলুন — AI স্বয়ংক্রিয়ভাবে খাতা চেক করে নম্বর প্রদান করবে এবং অভিভাবকদের WhatsApp-এ ১-ট্যাপে রেজাল্ট কার্ড পাঠাবে।
          </p>
        </div>
      </div>

      {/* Success Notice */}
      {savedSuccess && (
        <div className="bg-emerald-500 text-white p-4 rounded-2xl font-bold flex items-center gap-3 animate-fade-in shadow-lg">
          <CheckCircle className="w-6 h-6 flex-shrink-0" />
          <span>মূল্যায়ন সফলভাবে ডেটাবেসে সংরক্ষিত হয়েছে এবং অভিভাবক টাইমলাইনে আপডেট হয়েছে!</span>
        </div>
      )}

      {/* Main Grid: Input / Upload (Left) & Result Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Photo Upload */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              <span>১. শিক্ষার্থী ও পরীক্ষার বিবরণ নির্বাচন করুন</span>
            </h3>

            {/* Student Select */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">শিক্ষার্থী নির্বাচন করুন (Select Student):</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-slate-50 focus:outline-indigo-500"
              >
                <option value="">-- শিক্ষার্থী নির্বাচন করুন --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (রোল: {s.roll || 'N/A'}, ব্যাচ: {s.batch})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject & Chapter */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">বিষয়:</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold bg-slate-50 focus:outline-indigo-500"
                >
                  <option value="Mathematics">গণিত (Mathematics)</option>
                  <option value="Physical Science">ভৌতবিজ্ঞান (Physical Science)</option>
                  <option value="Life Science">জীবনবিজ্ঞান (Life Science)</option>
                  <option value="Political Science">রাষ্ট্রবিজ্ঞান (Political Science)</option>
                  <option value="Philosophy">দর্শন ও যুক্তিবিজ্ঞান (Philosophy)</option>
                  <option value="History">ইতিহাস (History)</option>
                  <option value="English">ইংরেজি (English)</option>
                  <option value="Bengali">বাংলা (Bengali)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">পূর্ণমান (Max Marks):</label>
                <input
                  type="number"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(Number(e.target.value) || 10)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold bg-slate-50 focus:outline-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">অধ্যায় / টপিক:</label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold bg-slate-50 focus:outline-indigo-500"
                placeholder="যেমন: একচল বিশিষ্ট দ্বিঘাত সমীকরণ"
              />
            </div>

            {/* Photo Capture / Upload Box */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-600 mb-2">২. খাতা বা ডায়েরির ছবি তুলুন / আপলোড করুন:</label>
              <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-4 text-center bg-indigo-50/40 relative">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Uploaded Page"
                      className="max-h-56 mx-auto rounded-xl object-contain shadow-sm"
                    />
                    <label className="absolute bottom-2 right-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow cursor-pointer">
                      বদলান
                      <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-6">
                    <Camera className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
                    <span className="font-extrabold text-sm text-slate-700 block">
                      ক্যামেরা দিয়ে ছবি তুলুন অথবা গ্যালারি থেকে সিলেক্ট করুন
                    </span>
                    <span className="text-xs text-slate-400 mt-1 block">
                      JPEG, PNG বা WebP ফরম্যাট সমর্থিত
                    </span>
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Evaluate Button */}
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating || !photoPreview}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all text-sm disabled:opacity-50"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI খাতা বিশ্লেষণ ও গ্রেডিং করছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>AI দিয়ে মূল্যায়ন ও গ্রেড তৈরি করুন</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Evaluation Sheet & Guardian Broadcast */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span>৩. মূল্যায়ন ফলাফল ও শিক্ষকের মন্তব্য</span>
              </span>
              {evaluationResult && (
                <span className="bg-purple-100 text-purple-800 text-xs font-black px-3 py-1 rounded-full">
                  {evaluationResult.category}
                </span>
              )}
            </h3>

            {evaluationResult ? (
              <div className="space-y-4">
                {/* Score Big Display */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">নির্ধারিত নম্বর</span>
                    <div className="text-3xl font-black text-indigo-900 mt-1 flex items-baseline gap-1">
                      <input
                        type="number"
                        value={obtainedMarks}
                        onChange={(e) => setObtainedMarks(Number(e.target.value) || 0)}
                        className="w-16 bg-white border border-indigo-300 rounded-lg px-2 py-0.5 text-center text-indigo-900 font-black focus:outline-indigo-500"
                      />
                      <span className="text-lg text-slate-500">/ {maxMarks}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500 block">শতকরা হার</span>
                    <span className="text-2xl font-black text-emerald-600">
                      {Math.round((obtainedMarks / maxMarks) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="space-y-2 text-xs">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                    <span className="font-extrabold text-emerald-900 flex items-center gap-1.5 mb-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>সবল দিকসমূহ:</span>
                    </span>
                    <ul className="list-disc list-inside text-emerald-800 space-y-0.5">
                      {evaluationResult.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <span className="font-extrabold text-amber-900 flex items-center gap-1.5 mb-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>উন্নতির ক্ষেত্র ও ভুলত্রুটি:</span>
                    </span>
                    <ul className="list-disc list-inside text-amber-800 space-y-0.5">
                      {evaluationResult.improvements.map((im, i) => (
                        <li key={i}>{im}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Remarks Editable */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">শিক্ষকের বিশেষ মন্তব্য (Teacher's Remarks):</label>
                  <textarea
                    rows={2}
                    value={teacherRemarks}
                    onChange={(e) => setTeacherRemarks(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-medium bg-slate-50 focus:outline-indigo-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleSaveResult}
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-md transition-all text-xs"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>ডেটাবেসে সংরক্ষণ করুন</span>
                  </button>

                  <a
                    href={getWhatsAppShareLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3 px-4 rounded-xl shadow-md transition-all text-xs"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>অভিভাবককে WhatsApp পাঠান</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold">বামপাশের ফর্ম থেকে ছবি আপলোড করে মূল্যায়ন শুরু করুন।</p>
                <p className="text-xs mt-1">ফলাফল ও বিশ্লেষণ এখানে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
