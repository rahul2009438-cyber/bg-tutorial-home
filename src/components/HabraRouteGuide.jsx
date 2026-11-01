import React from 'react';
import { MapPin, Navigation, Bus, Clock, Compass, ExternalLink, Phone } from 'lucide-react';

export default function HabraRouteGuide({ customData }) {
  const cleanPhone = customData.phone.replace(/[^0-9]/g, '');

  const openGoogleMaps = () => {
    // Exact GPS coordinates for B.G. Tutorial Home, South Habra: 22.8436, 88.6322
    window.open('https://www.google.com/maps/dir/?api=1&destination=22.8436,88.6322', '_blank');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            লোকেশন ও যাতায়াত নির্দেশিকা
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1">
            বি.জি. টিউটোরিয়াল হোমে কীভাবে পৌঁছাবেন?
          </h3>
          <p className="text-xs text-slate-500">
            দক্ষিণ হাবড়া, (এস. এন দে রোড), হাবড়া, উত্তর ২৪ পরগণা
          </p>
        </div>

        <button 
          onClick={openGoogleMaps}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition flex items-center space-x-1.5 shrink-0"
        >
          <Navigation className="w-4 h-4" />
          <span>Google Maps-এ দেখুন</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            🚆
          </div>
          <h4 className="font-bold text-slate-900 text-sm">হাবড়া রেল স্টেশন থেকে</h4>
          <p className="text-slate-600 leading-relaxed">
            হাবড়া ১ নং প্ল্যাটফর্ম বা স্টেশন চত্বর থেকে দক্ষিণ হাবড়াগামী টোটো বা অটোতে মাত্র ৭-১০ মিনিটের পথ।
          </p>
          <span className="text-[11px] font-semibold text-emerald-700 block">টোটো ভাড়া: প্রায় ₹১০ - ₹১৫</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            🏫
          </div>
          <h4 className="font-bold text-slate-900 text-sm">দক্ষিণ হাবড়া হাই স্কুল মোড়</h4>
          <p className="text-slate-600 leading-relaxed">
            দক্ষিণ হাবড়া হাই স্কুলের কাছাকাছি এস. এন দে রোডে প্রবেশ করলেই বাবুন স্যারের টিউটোরিয়াল হোমের সাইনবোর্ড দেখতে পাবেন।
          </p>
          <span className="text-[11px] font-semibold text-emerald-700 block">ল্যান্ডমার্ক: এস. এন দে রোড মোড়</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            🏠
          </div>
          <h4 className="font-bold text-slate-900 text-sm">হোম টিউশন এরিয়া কভারেজ</h4>
          <p className="text-slate-600 leading-relaxed">
            দক্ষিণ হাবড়া, বানীপুর, অশোকনগর ও হাবড়া স্টেশন সংলগ্ন এলাকার শিক্ষার্থীদের জন্য বাড়ি গিয়ে পড়ানোর ব্যবস্থা রয়েছে।
          </p>
          <span className="text-[11px] font-semibold text-purple-700 block">বুকিংয়ের জন্য সরাসরি স্যারের সাথে কথা বলুন</span>
        </div>

      </div>

      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center space-x-2 text-xs text-emerald-950 font-medium">
          <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>রাস্তা চিনতে অসুবিধা হলে সরাসরি বাবুন স্যারকে কল করুন: <strong>+91 {customData.phone}</strong></span>
        </div>
        <a 
          href={`tel:${cleanPhone}`}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0 transition"
        >
          সরাসরি কল করুন
        </a>
      </div>

    </div>
  );
}
