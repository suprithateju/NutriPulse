"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { ChevronLeft, CalendarDays, Plus, Download } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function Diary() {
  const { name, userId } = useStore();
  const [loading, setLoading] = useState(true);
  const [diary, setDiary] = useState<any[]>([]);

  useEffect(() => {
    const fetchDiary = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/diary/week?user_id=${userId || 1}`);
        setDiary(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDiary();
  }, [userId]);

  const generatePDF = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      import('jspdf-autotable').then(({ default: autoTable }) => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(`NutriPulse Weekly Report: ${name || 'User'}`, 14, 20);
        
        const tableData = diary.map(d => [d.date, d.day, d.items || 'None', d.calories, d.status]);
        
        autoTable(doc, {
          startY: 30,
          head: [['Date', 'Day', 'Meals Logged', 'Calories', 'Status']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129] }
        });
        
        doc.save(`${name || 'User'}_NutriPulse_Report.pdf`);
      });
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <Link href="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
        <ChevronLeft size={20} className="mr-1" /> Back to Dashboard
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <CalendarDays className="text-emerald-400" size={32} />
              7-Day Food Diary
            </h1>
            <p className="text-slate-400">Review your weekly intake, {name}.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={generatePDF} className="bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-500/30 transition-colors">
              <Download size={18} /> Export PDF
            </button>
            <Link href="/log-meal" className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-500/30 transition-colors">
              <Plus size={18} /> Log Meal
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 animate-pulse">Loading diary data...</div>
        ) : (
          <div className="space-y-4">
            {diary.map((day, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={day.day}
                className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-slate-400 text-xs font-semibold uppercase">{day.day}</span>
                </div>
                
                <div className="flex-grow w-full">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-slate-200">{day.calories} kcal consumed</span>
                    <span className="text-slate-500">Target: {day.target} kcal</span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${day.status === 'over' ? 'bg-rose-500' : day.status === 'under' ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${Math.min((day.calories / day.target) * 100, 100)}%` }} 
                    />
                  </div>
                  <div className="text-xs text-slate-400 italic">Logged: {day.items}</div>
                </div>

                <div className="flex-shrink-0 w-24 text-right">
                  {day.status === 'over' && <span className="text-xs bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full border border-rose-500/20">Over</span>}
                  {day.status === 'under' && <span className="text-xs bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">Under</span>}
                  {day.status === 'good' && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">On Target</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
