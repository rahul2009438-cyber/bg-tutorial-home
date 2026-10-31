import React from 'react';
import { Lock, ShieldCheck, UserCheck, Award, Inbox, ArrowRight, Phone, MessageCircle, Sparkles } from 'lucide-react';

export default function ProtectedAccessScreen({ 
  tabName = 'এই সেকশনটি',
  tabIcon: TabIcon = Lock,
  onGoToLogin,
  onGoToRegister,
  onGoToAdmission,
  lang = 'bn',
  phone = '9733974425'
}) {
  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 animate-fadeIn">
      {/* Main Glassmorphic Lock Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 text-white p-6 sm:p-10 lg:p-12 border border-slate-800 shadow-2xl space-y-8">
        
        {/* Subtle Ambient Decorative Glow */}
        <div className="absolute top-0 right-1/4 -mt-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 -mb-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header with Lock Icon */}
        <div className="text-center space-y-4 relative z-10">
          <div className="inline-flex relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-amber-500/20 mx-auto">
              <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center text-amber-300">
              <TabIcon className="w-4 h-4" />
            </div>
          </div>

          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>নিরাপত্তা ও প্রাইভেসি প্রটেকশন • স্টুডেন্ট-অনলি এক্সেস</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            {tabName} — শুধুমাত্র নথিভুক্ত শিক্ষার্থীদের জন্য সংরক্ষিত 🔒
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {lang === 'bn' 
              ? 'বি.জি. টিউটোরিয়াল হোমের অভ্যন্তরীণ স্টাডি মেটেরিয়ালস, ব্যক্তিগত নোটিস, ট্রিবিউট ওয়াল ও ফি লেজারের তথ্য সুরক্ষা বজায় রাখতে সাধারণ দর্শনার্থীদের জন্য এই অংশটি লক করা আছে। বাবুন স্যারের অনুমোদিত ইউনিক স্টুডেন্ট আইডি দিয়ে লগইন করে সম্পূর্ণ এক্সেস আনলক করুন।'
              : 'This section is strictly reserved for verified students of B.G. TUTORIAL HOME. Please log in with your unique Student ID to access locked study materials, notices, tributes, and fee records.'}
          </p>
        </div>

        {/* Three Action Paths */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
          
          {/* Card 1: Existing Student Login */}
          <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/60 shadow-lg flex flex-col justify-between space-y-4 group transition">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition">
                <UserCheck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 block">
                ধাপ ১ • বর্তমান শিক্ষার্থী
              </span>
              <h3 className="font-extrabold text-base text-white">
                স্টুডেন্ট পোর্টালে লগইন
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                আপনার কাছে কি ইতিমধ্যে <strong>ইউনিক স্টুডেন্ট আইডি</strong> (যেমন BG-2026-C10-01) রয়েছে? সরাসরি লগইন করে আনলক করুন।
              </p>
            </div>

            <button
              type="button"
              onClick={onGoToLogin}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-500/20 transition active:scale-95"
            >
              <span>🎓 স্টুডেন্ট পোর্টালে লগইন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Student Registration */}
          <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/60 shadow-lg flex flex-col justify-between space-y-4 group transition">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 group-hover:scale-105 transition">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400 block">
                ধাপ ২ • আইডি নেই?
              </span>
              <h3 className="font-extrabold text-base text-white">
                শিক্ষার্থী রেজিস্ট্রেশন
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                আপনি কি বাবুন স্যারের ক্লাসের ছাত্র কিন্তু এখনও ইউনিক আইডি পাননি? অনলাইন ফর্ম পূরণ করুন, স্যার যাচাই করে আইডি অনুমোদন করবেন।
              </p>
            </div>

            <button
              type="button"
              onClick={onGoToRegister}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 transition active:scale-95"
            >
              <span>📝 শিক্ষার্থী রেজিস্ট্রেশন ফর্ম</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Apply for New Admission */}
          <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/60 shadow-lg flex flex-col justify-between space-y-4 group transition">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition">
                <Inbox className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block">
                ধাপ ৩ • নতুন ভর্তি
              </span>
              <h3 className="font-extrabold text-base text-white">
                নতুন ভর্তির আবেদন
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                আপনি কি নতুন সেশনে বাবুন স্যারের ব্যাচ বা হোম টিউশনে ভর্তি হতে আগ্রহী? অ্যাডমিশন ইনকোয়ারি জমা দিন।
              </p>
            </div>

            <button
              type="button"
              onClick={onGoToAdmission}
              className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 shadow-md shadow-amber-500/20 transition active:scale-95"
            >
              <span>📥 নতুন ভর্তি আবেদন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Bottom Direct Contact with Babun Sir */}
        <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs relative z-10">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 hidden sm:block" />
            <span className="text-slate-300">
              জরুরি সহযোগিতা বা আইডি রিকভারির প্রয়োজন হলে সরাসরি শিক্ষক বাবুন ঘোষ স্যারের সাথে যোগাযোগ করুন।
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <a
              href={`tel:${phone}`}
              className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center space-x-1.5 transition"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>কল করুন</span>
            </a>
            <a
              href={`https://wa.me/91${phone}?text=${encodeURIComponent('নমস্কার স্যার, আমি বি.জি. টিউটোরিয়াল হোম ওয়েবসাইটের স্টুডেন্ট পোর্টাল অ্যাক্সেস ও রেজিস্ট্রেশন সংক্রান্ত বিষয়ে জানতে চাই।')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1.5 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp চ্যাট</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
