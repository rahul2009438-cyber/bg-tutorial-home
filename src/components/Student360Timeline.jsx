import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, Award, CreditCard, BookOpen, 
  Search, CheckCircle2, Clock, MessageSquare, ChevronRight, Sparkles, Filter
} from 'lucide-react';
import { db } from '../utils/db';

export default function Student360Timeline({ students = [], customData = {} }) {
  const [selectedStudentId, setSelectedStudentId] = useState(
    students[0]?.studentId || students[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const student = students.find(s => 
    String(s.studentId || s.id) === String(selectedStudentId) ||
    (s.name && s.name.toLowerCase() === searchQuery.toLowerCase())
  ) || students[0];

  useEffect(() => {
    if (!student) return;
    loadStudentTimeline(student);
  }, [student]);

  const loadStudentTimeline = async (st) => {
    setLoading(true);
    const events = [];
    const stId = String(st.studentId || st.id);

    try {
      // 1. Admission Event
      events.push({
        type: 'ADMISSION',
        date: st.createdAt ? st.createdAt.split('T')[0] : '2026-01-01',
        title: 'অফিসিয়াল ভর্তি ও নথিভুক্তিকরণ',
        description: `B.G. TUTORIAL HOME-এ ${st.batch} ব্যাচে আনুষ্ঠানিকভাবে ভর্তি হয়েছে। নির্ধারিত রোল: ${st.roll || 'N/A'}।`,
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
      });

      // 2. Attendance & Leaves
      if (db.attendanceLeaves) {
        const leaves = await db.attendanceLeaves.where('studentId').equals(stId).toArray();
        leaves.forEach(l => {
          events.push({
            type: 'ATTENDANCE',
            date: l.date,
            title: l.type === 'Late' ? 'দেরিতে ক্লাসে আগমন' : l.type === 'Leave' ? 'অনুমোদিত ছুটি' : 'অনুপস্থিতি',
            description: `${l.reason || 'বিশেষ কারণ'} ${l.arrivalTime ? `(আসার সময়: ${l.arrivalTime})` : ''}`,
            badgeColor: l.type === 'Late' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
          });
        });
      }

      // 3. Test Marks & Exam Results
      if (db.examResults) {
        const exams = await db.examResults.where('studentId').equals(stId).toArray();
        exams.forEach(ex => {
          const pct = Math.round((Number(ex.marks) / Number(ex.totalMarks || 50)) * 100);
          events.push({
            type: 'EXAM',
            date: ex.date || new Date().toISOString().split('T')[0],
            title: `পরীক্ষা: ${ex.examName || 'শ্রেণি মূল্যায়ন'}`,
            description: `প্রাপ্ত নম্বর: ${ex.marks}/${ex.totalMarks || 50} (${pct}%) — গ্রেড: ${pct >= 80 ? 'A+' : pct >= 60 ? 'B' : 'উন্নতি প্রয়োজন'}`,
            badgeColor: pct >= 60 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          });
        });
      }

      // 4. Fee Receipts
      if (db.feePayments) {
        const fees = await db.feePayments.where('studentId').equals(stId).toArray();
        fees.forEach(fee => {
          events.push({
            type: 'FEE',
            date: fee.date || new Date().toISOString().split('T')[0],
            title: `টিউশন ফি পরিশোধ (${fee.month || 'মাসিক'})`,
            description: `পরিমাণ: ₹${fee.amount} (রসিদ নং: ${fee.receiptNo || 'REC-' + fee.id}) • মাধ্যম: ${fee.paymentMode || 'Cash'}`,
            badgeColor: 'bg-teal-100 text-teal-800'
          });
        });
      }

      // 5. Teacher Remarks
      if (st.notes || st.weakRemarks) {
        events.push({
          type: 'REMARK',
          date: new Date().toISOString().split('T')[0],
          title: 'শিক্ষক বাপুন স্যারের পর্যবেক্ষণ ও স্পেশাল নোট',
          description: st.weakRemarks || st.notes,
          badgeColor: 'bg-purple-100 text-purple-800'
        });
      }

      // Sort chronological descending (latest first)
      events.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTimelineEvents(events);
    } catch (e) {
      console.warn('Student 360 load err:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-purple-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>শিক্ষার্থী ৩৬০° স্মার্ট টাইমলাইন • 360 ACADEMIC TIMELINE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">ভর্তি থেকে বর্তমান: একটি একক কালানুক্রমিক টাইমলাইনে</h2>
          <p className="text-xs text-purple-100 mt-1 max-w-xl">
            ভর্তির তারিখ ➔ ক্লাসের উপস্থিতি ও ছুটি ➔ পরীক্ষার নম্বর ➔ ফি পেমেন্ট রসিদ ➔ শিক্ষকের স্পেশাল রিমার্কস।
          </p>
        </div>

        {/* Quick Search and Select */}
        <div className="w-full sm:w-72 space-y-2">
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white shadow"
          >
            {students.map(s => (
              <option key={s.id} value={s.studentId || s.id}>
                {s.name} ({s.batch} • রোল {s.roll || 'N/A'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {student && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {/* Header Card for Selected Student */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-black text-lg">
                {student.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900">{student.name}</h3>
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <span className="font-mono text-purple-700 font-bold">{student.studentId}</span>
                  <span>•</span>
                  <span>{student.batch} (রোল {student.roll || 'N/A'})</span>
                  <span>•</span>
                  <span>📞 {student.phone}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full font-bold border border-emerald-200">
                ফি স্ট্যাটাস: {student.feesStatus || 'পরিশোধিত (Paid)'}
              </span>
              <span className="px-3 py-1 bg-purple-50 text-purple-800 rounded-full font-bold border border-purple-200">
                রেটিং: {student.healthStars || 5} ★
              </span>
            </div>
          </div>

          {/* Chronological Timeline */}
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs font-bold">
              টাইমলাইন লোড হচ্ছে...
            </div>
          ) : timelineEvents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl">
              এই শিক্ষার্থীর কোনো অ্যাক্টিভিটি ইভেন্ট এখনও নথিভুক্ত নেই।
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timelineEvents.map((evt, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-white border-2 border-purple-600 flex items-center justify-center shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 transition space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${evt.badgeColor}`}>
                          {evt.type}
                        </span>
                        <span className="font-extrabold text-sm text-slate-900">{evt.title}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                        <Calendar className="w-3 h-3 inline" />
                        <span>{evt.date}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                      {evt.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
