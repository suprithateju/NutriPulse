"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { ChevronLeft, PieChart as PieChartIcon } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function Nutrients() {
  const { ageGroup } = useStore();
  const [loading, setLoading] = useState(true);
  const [nutrients, setNutrients] = useState<any[]>([]);

  useEffect(() => {
    const fetchNutrients = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/nutrients/weekly?age_group=${ageGroup || 'adult'}`);
        setNutrients(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchNutrients();
  }, [ageGroup]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <Link href="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
        <ChevronLeft size={20} className="mr-1" /> Back to Dashboard
      </Link>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <PieChartIcon className="text-cyan-400" size={32} />
          Nutrient Gap Dashboard
        </h1>
        <p className="text-slate-400 mb-12">Visualizing your micro and macro nutrient intake vs recommended targets.</p>

        {loading ? (
          <div className="text-center py-20 text-slate-500 animate-pulse">Loading nutrient data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {nutrients.map((n, i) => {
              const percentage = Math.min((n.actual / n.target) * 100, 100);
              const color = percentage >= 100 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#f43f5e';
              
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  key={n.nutrient}
                  className="bg-slate-900 border border-slate-800 p-8 rounded-3xl"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-200">{n.nutrient}</h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color }}>{n.actual} <span className="text-sm text-slate-500 font-normal">{n.unit}</span></div>
                      <div className="text-sm text-slate-500">Target: {n.target} {n.unit}</div>
                    </div>
                  </div>

                  <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs font-semibold text-slate-500 mt-2 uppercase tracking-wider">
                    <span>Deficient</span>
                    <span>Optimal</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
