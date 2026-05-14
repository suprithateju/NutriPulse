"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, Loader2, CheckCircle2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useStore } from '@/store/useStore';

export default function LogMeal() {
  const { userId } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [saved, setSaved] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyse = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/analyse/plate', {
        image_base64: imageBase64 || "dummy_base64_string"
      });
      setResult(res.data);
      setSaved(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!result || !userId) return;
    try {
      await axios.post('http://127.0.0.1:8000/api/diary/log', {
        user_id: userId,
        meal_type: "Meal",
        food_items: result.food_items.map((i: any) => i.name).join(', '),
        calories: result.total_calories
      });
      setSaved(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <Link href="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
        <ChevronLeft size={20} className="mr-1" /> Back to Dashboard
      </Link>
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Plate Analyser</h1>
          <p className="text-slate-400 mb-8">Upload a photo of your meal. Our CV model will detect the items and estimate portion size.</p>
          
          <div className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
            {preview ? (
              <img src={preview} alt="Meal preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
            ) : (
              <>
                <div className="h-20 w-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <Camera size={32} className="text-slate-400 group-hover:text-cyan-400" />
                </div>
                <p className="text-lg font-medium text-slate-300">Tap to snap or upload</p>
                <p className="text-sm text-slate-500 mt-2">JPEG, PNG, HEIC</p>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
          </div>

          <button
            onClick={handleAnalyse}
            disabled={!file || loading}
            className="w-full mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Analyse Plate'}
          </button>
        </div>

        <div>
          {result ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl h-full">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
                <div>
                  <h3 className="text-slate-400 text-sm">Total Estimated</h3>
                  <div className="text-4xl font-bold text-emerald-400">{result.total_calories} <span className="text-xl text-slate-500">kcal</span></div>
                </div>
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              
              <h3 className="text-lg font-semibold mb-4">Detected Items</h3>
              <ul className="space-y-4 mb-8">
                {result.food_items.map((item: any, i: number) => (
                  <li key={i} className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl">
                    <div>
                      <span className="font-medium block">{item.name}</span>
                      <span className="text-sm text-slate-400">{item.portion}</span>
                    </div>
                    <span className="font-semibold text-cyan-400">{item.calories} kcal</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-lg font-semibold mb-4">Macros Estimate</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl text-center">
                  <div className="text-sm text-slate-400 mb-1">Protein</div>
                  <div className="font-bold text-indigo-400">{result.macros.protein}g</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl text-center">
                  <div className="text-sm text-slate-400 mb-1">Carbs</div>
                  <div className="font-bold text-amber-400">{result.macros.carbs}g</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl text-center">
                  <div className="text-sm text-slate-400 mb-1">Fat</div>
                  <div className="font-bold text-rose-400">{result.macros.fat}g</div>
                </div>
              </div>

              <button 
                onClick={handleSaveMeal}
                disabled={saved}
                className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all ${saved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'}`}
              >
                {saved ? 'Saved to Diary!' : 'Save Meal to Diary'}
              </button>
            </motion.div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl h-full flex items-center justify-center text-slate-500 p-8 text-center">
              Upload an image to see the AI analysis results here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
