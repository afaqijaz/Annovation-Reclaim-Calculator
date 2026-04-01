/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Clock, 
  CircleDollarSign, 
  ArrowRight, 
  Info, 
  CheckCircle2, 
  Zap,
  TrendingDown,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Constants & Types ---

const STORAGE_KEY = 'innovation-reclaim-inputs-v2';

interface CalculatorInputs {
  engineers: number;
  hourlyRate: number;
  reviewHours: number;
}

const DEFAULT_INPUTS: CalculatorInputs = {
  engineers: 12,
  hourlyRate: 95,
  reviewHours: 6,
};

// --- Components ---

const Particle = ({ index }: any) => {
  const randomValues = useMemo(() => ({
    angle: (index / 20) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
    radius: 140 + Math.random() * 40,
    duration: 5 + Math.random() * 7,
    delay: Math.random() * 10,
    drift: (Math.random() - 0.5) * 50,
  }), [index]);

  const startX = Math.cos(randomValues.angle) * randomValues.radius;
  const startY = Math.sin(randomValues.angle) * randomValues.radius;
  
  return (
    <motion.div
      className="absolute w-1 h-1 bg-primary rounded-full blur-[1px] shadow-[0_0_10px_#E97318,0_0_20px_#E97318]"
      initial={{ x: startX, y: startY, opacity: 0, scale: 0 }}
      animate={{ 
        x: [startX, startX * 0.7 + randomValues.drift, startX * 0.3 - randomValues.drift, 0], 
        y: [startY, startY * 0.7 - randomValues.drift, startY * 0.3 + randomValues.drift, 0],
        opacity: [0, 0.8, 0.4, 0.8, 0],
        scale: [0, 1.5, 0.8, 1.2, 0]
      }}
      transition={{
        duration: randomValues.duration,
        repeat: Infinity,
        delay: randomValues.delay,
        ease: "easeInOut"
      }}
      style={{ left: '50%', top: '50%', marginLeft: '-2px', marginTop: '-2px' }}
    />
  );
};

const InnovationCircle = ({ percentage }: { percentage: number }) => {
  const clamped = Math.min(100, Math.max(0, percentage));
  
  return (
    <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full border border-white/10 overflow-hidden bg-black shadow-2xl">
      {/* Inner Glow & Depth */}
      <div className="absolute inset-0 rounded-full shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] z-20 pointer-events-none" />
      
      {/* Pulsing Orange Glow */}
      <motion.div 
        className="absolute inset-0 rounded-full z-21 pointer-events-none"
        animate={{ 
          boxShadow: [
            "inset 0 0 40px rgba(233, 115, 24, 0.15)",
            "inset 0 0 80px rgba(233, 115, 24, 0.3)",
            "inset 0 0 40px rgba(233, 115, 24, 0.15)"
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="absolute inset-0 rounded-full border-4 border-white/5 z-25 pointer-events-none" />
      
      {/* Firefly Particles */}
      <div className="absolute inset-0 z-22 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <Particle key={i} index={i} />
        ))}
      </div>

      {/* Background Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none">
        <motion.div 
          key={clamped}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <span className="text-6xl md:text-7xl font-display font-bold text-white tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            {clamped.toFixed(1)}<span className="text-3xl opacity-50">%</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold mt-2">
            Innovation Gap
          </span>
        </motion.div>
      </div>

      {/* Final Glass Reflection */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 via-transparent to-transparent z-40 pointer-events-none" />
    </div>
  );
};

const InputControl = ({ 
  label, 
  value, 
  min, 
  max, 
  step = 1, 
  onChange, 
  icon: Icon,
  prefix = "",
  suffix = ""
}: { 
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  step?: number;
  onChange: (val: number) => void;
  icon: any;
  prefix?: string;
  suffix?: string;
}) => {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    const num = parseFloat(val);
    if (!isNaN(num)) {
      // Update parent without clamping immediately to allow typing
      onChange(num);
    }
  };

  const handleBlur = () => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) {
      onChange(value);
      setInputValue(value.toString());
    } else {
      const clamped = Math.min(max, Math.max(min, num));
      onChange(clamped);
      setInputValue(clamped.toString());
    }
  };

  useEffect(() => {
    const currentNum = parseFloat(inputValue);
    if (currentNum !== value) {
      setInputValue(value.toString());
    }
  }, [value]);

  return (
    <div className="space-y-3 p-5 rounded-2xl glass-panel glass-panel-hover group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-base transition-all duration-300">
            <Icon size={14} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">{label}</span>
        </div>
      </div>

      <div className="flex items-baseline justify-center gap-2">
        {prefix && <span className="text-2xl font-display font-bold text-white/10">{prefix}</span>}
        <input 
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="input-number-large w-auto min-w-[3ch] max-w-full"
          style={{ width: `${inputValue.length + 1}ch` }}
        />
        {suffix && <span className="text-2xl font-display font-bold text-white/10">{suffix}</span>}
      </div>

      <div className="pt-1 flex items-center gap-3">
        <span className="text-[9px] font-bold text-white/20 w-8 text-right tabular-nums">{prefix}{min}{suffix}</span>
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step} 
          value={value} 
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-[9px] font-bold text-white/20 w-8 tabular-nums">{prefix}{max}{suffix}</span>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, subtext, icon: Icon, trend }: { 
  label: string; 
  value: string; 
  subtext: string;
  icon: any;
  trend?: string;
}) => (
  <div className="p-5 rounded-2xl glass-panel relative overflow-hidden group flex flex-col justify-center">
    <div className="absolute -right-6 -top-6 p-10 text-primary opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 group-hover:scale-110">
      <Icon size={80} />
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{label}</span>
        {trend && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full shadow-glow">
            <TrendingDown size={12} />
            {trend}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="text-4xl font-display font-bold text-white tracking-tight group-hover:text-primary transition-colors duration-300">
          {value}
        </div>
        <p className="text-[11px] text-white/40 leading-relaxed font-medium">{subtext}</p>
      </div>
    </div>
  </div>
);



// --- Main App ---

export default function App() {
  const [inputs, setInputs] = useState<CalculatorInputs>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_INPUTS;
  });

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs]);

  const results = useMemo(() => {
    const { engineers, hourlyRate, reviewHours } = inputs;
    const annualWaste = engineers * hourlyRate * reviewHours * 52;
    const innovationHoursLost = engineers * reviewHours * 52;
    
    // Calculate a "Waste Intensity" percentage using a logarithmic scale.
    // This ensures the visualizer is responsive to every slider movement
    // and doesn't hit 100% too easily for large teams, while remaining 
    // meaningful for small ones.
    // Max theoretical waste is ~£125M (200 engineers * £300/hr * 40hrs * 52wks)
    const maxWaste = 200 * 300 * 40 * 52;
    const misallocatedPercentage = annualWaste > 0 
      ? (Math.log10(annualWaste) / Math.log10(maxWaste)) * 100 
      : 0;

    const reclaimablePercentage = annualWaste > 0 
      ? Math.min(98, 70 + (misallocatedPercentage / 4)) 
      : 0;

    return {
      annualWaste,
      innovationHoursLost,
      misallocatedPercentage,
      reclaimablePercentage
    };
  }, [inputs]);

  const handleInputChange = (key: keyof CalculatorInputs, val: number) => {
    setInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      await generatePDF();
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // --- Configuration & Constants ---
    const colors = {
      bg: [255, 255, 255], // White
      primary: [233, 115, 24], // #E97318
      text: [14, 14, 14], // Black
      muted: [100, 100, 100], // Gray
      border: [230, 230, 230] // Light Gray
    };

    const margin = 20;
    const pageWidth = 210;
    const contentWidth = pageWidth - (margin * 2);

    // --- Dynamic Calculations ---
    const N = inputs.engineers;
    const R = inputs.hourlyRate;
    const H = inputs.reviewHours;
    const checkingPercent = (H / 40) * 100;
    const baselineHours = 1920;
    const reviewHoursYear = H * 48;
    const recoverableHoursYear = reviewHoursYear * 0.35;
    const recoverableValueYear = recoverableHoursYear * R;
    const totalRecoverableValue = recoverableValueYear * N;
    const issues = Math.max(1, Math.round(N / 20));
    const errorValue = issues * 12500;
    const standardisationValue = N * 400;
    const totalValue = totalRecoverableValue + errorValue + standardisationValue;

    const formatCurrency = (val: number) => `£${Math.round(val).toLocaleString()}`;

    // --- Prepare Logo ---
    const logoSvg = `<svg id="dot" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1078.62 346.7">
  <rect fill="#020202" width="1078.62" height="346.7" rx="30.17" ry="30.17"/>
  <g>
    <polygon id="N" fill="#fff" points="92.1 249.71 92.1 85.07 118.56 85.07 194.18 205.49 194.18 85.07 218.64 85.07 218.64 249.71 192.18 249.71 116.56 129.29 116.56 249.71 92.1 249.71"/>
    <path id="e" fill="#fff" d="M352.91,172.45c-2.51-8.55-6.43-16.07-11.76-22.58-5.33-6.59-11.76-11.72-19.29-15.41-7.53-3.76-15.8-5.65-24.82-5.65-8.07,0-15.68,1.61-22.82,4.82-7.13,3.21-13.41,7.68-18.82,13.41-5.33,5.65-9.53,12.23-12.58,19.76-3.06,7.45-4.59,15.48-4.59,24.11,0,11.37,2.63,21.76,7.88,31.16,5.33,9.33,12.43,16.78,21.29,22.35,8.94,5.57,18.82,8.35,29.64,8.35,11.76,0,22.38-3.29,31.87-9.88,9.49-6.66,16.58-15.21,21.29-25.64l-24.81-5.76c-3.14,5.25-7.17,9.37-12.11,12.35-4.86,2.98-10.27,4.47-16.23,4.47-5.64-.08-10.78-1.37-15.41-3.88-4.55-2.51-8.31-5.92-11.29-10.23-2.9-4.39-4.86-9.29-5.88-14.7h90.67c1.02-9.57,.27-18.58-2.23-27.05Zm-89.26,8.35c1.02-5.72,3.06-10.86,6.11-15.41,3.14-4.63,7.06-8.27,11.76-10.94,4.78-2.67,9.96-4,15.52-4s10.82,1.37,15.52,4.12c4.78,2.67,8.74,6.31,11.88,10.94,3.21,4.55,5.21,9.64,6,15.29h-66.8Z"/>
    <path fill="#fff0d9" d="M461.27,36.72c-2.85,3.72-5.51,7.22-8.19,10.69l-38.61,50.44c-1.91,2.5-2.99,2.5-4.86-.02-14.77-19.93-29.55-39.87-44.32-59.81-.27-.36-.65-.68-.75-1.3h96.72Z"/>
    <path fill="#e97318" d="M673.89,309.92c-.78,.32-1.37,.19-1.94,.19-35.02,0-70.04,.01-105.06,.04-1.3,0-2.11-.32-2.92-1.44-32.4-44.82-64.82-89.62-97.27-134.41q-2.11-2.92,.06-5.71c33.96-43.44,67.91-86.88,101.85-130.34,.97-1.24,1.94-1.7,3.52-1.7,34.08,.04,68.16,.05,102.24,.04,.61,0,1.25-.09,1.89,.12-.09,.68-.53,1.02-.84,1.42-34.25,44.03-68.51,88.05-102.77,132.07q-1.34,1.72-.05,3.46l99.74,134.13c.49,.65,.96,1.32,1.54,2.11h0Z"/>
    <g id="a">
      <path fill="#fff" d="M775.59,132.11l1.06,17.41c-4.31-6.04-9.76-10.98-16.35-14.82-6.51-3.92-14.03-5.88-22.58-5.88s-16.27,1.61-23.64,4.82c-7.29,3.14-13.72,7.49-19.29,13.05-5.57,5.57-9.92,12.07-13.05,19.52-3.14,7.37-4.7,15.25-4.7,23.64s1.61,16.86,4.82,24.46c3.21,7.53,7.68,14.19,13.41,19.99,5.8,5.8,12.51,10.35,20.11,13.64,7.6,3.22,15.72,4.82,24.34,4.82,8,0,14.94-1.84,20.82-5.53,5.88-3.68,10.54-8.54,13.99-14.58l.94,17.05h24.58v-117.6h-24.46Zm-6.35,78.09c-2.82,5.8-6.82,10.43-12,13.88-5.17,3.37-11.21,5.06-18.11,5.06s-12.82-1.68-18.46-5.06c-5.57-3.45-10.07-8.04-13.52-13.76-3.37-5.8-5.06-12.27-5.06-19.4s1.65-13.48,4.94-19.29c3.29-5.8,7.76-10.43,13.41-13.88,5.64-3.45,11.88-5.17,18.7-5.17s12.9,1.72,17.99,5.17c5.17,3.37,9.21,7.96,12.11,13.76,2.9,5.8,4.35,12.27,4.35,19.41s-1.45,13.48-4.35,19.29Z"/>
    </g>
    <path id="d" fill="#fff" d="M912.84,73.31v75.85c-3.84-6.04-8.86-10.9-15.05-14.58-6.19-3.76-13.45-5.65-21.76-5.65s-16.54,1.61-23.99,4.82c-7.38,3.17-14.09,7.72-19.76,13.41-5.65,5.65-10.07,12.23-13.29,19.76-3.21,7.45-4.82,15.45-4.82,23.99s1.61,16.54,4.82,23.99c3.22,7.45,7.64,14.03,13.29,19.76,5.72,5.65,12.31,10.08,19.76,13.29,7.45,3.22,15.45,4.82,23.99,4.82s15.56-1.84,21.76-5.53c6.19-3.76,11.21-8.7,15.05-14.82v17.29h24.46V73.31h-24.46Zm-6.47,136.89c-2.82,5.8-6.82,10.43-12,13.88-5.17,3.37-11.21,5.06-18.11,5.06h0c-6.66,0-12.82-1.68-18.46-5.06-5.57-3.45-10.08-8.04-13.53-13.76-3.37-5.8-5.06-12.27-5.06-19.4s1.65-13.48,4.94-19.29c3.37-5.8,7.84-10.43,13.41-13.88,5.64-3.45,11.88-5.17,18.7-5.17s12.9,1.72,17.99,5.17c5.17,3.37,9.21,7.96,12.11,13.76,2.9,5.8,4.35,12.27,4.35,19.41s-1.45,13.48-4.35,19.29Z"/>
    <path id="dot-2" fill="#fff" d="M973.59,252.77c-3.61,0-6.66-1.26-9.17-3.76-2.43-2.51-3.65-5.57-3.65-9.17s1.22-6.55,3.65-9.06c2.51-2.51,5.57-3.76,9.17-3.76s6.66,1.25,9.17,3.76,3.76,5.53,3.76,9.05-1.26,6.66-3.76,9.17c-2.51,2.51-5.57,3.76-9.17,3.76h0Z"/>
    <path fill="#fff0d9" d="M458.76,310.05h-98.07c-.1-.55,.29-.8,.52-1.1,16.19-20.95,32.38-41.9,48.57-62.84,1.16-1.5,1.94-1.47,3.12,.18,5.62,7.78,11.22,15.55,16.81,23.33l27.94,38.81c.33,.47,.65,.94,1.11,1.62h0Z"/>
  </g>
</svg>`;

    const logoDataUrl = await new Promise<string>((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const svgBlob = new Blob([logoSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        canvas.width = 1078;
        canvas.height = 346;
        ctx?.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = url;
    });

    // Helper for decorations
    const addDecoration = (pageIndex: number, totalPages: number) => {
      // Background
      doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
      doc.rect(0, 0, 210, 297, 'F');

      // Logo
      try {
        doc.addImage(logoDataUrl, 'PNG', 160, 15, 30, 9.64);
      } catch (e) {
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.setFontSize(10);
        doc.text('NexCAD.', 175, 20, { align: 'center' });
      }

      // Footer
      const footerY = 275;
      doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
      
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('nexcad.ai', margin, footerY);

      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Registered in England & Wales', margin, footerY + 5);
      doc.text('Companies Registration No: 16407873', margin, footerY + 9);
      doc.text('© 2026 NexCAD Ltd. All rights reserved.', margin, footerY + 13);
      
      doc.text(`PAGE ${pageIndex} OF ${totalPages}`, pageWidth - margin, footerY + 13, { align: 'right' });
    };

    // --- Page 1: Title & Context ---
    addDecoration(1, 5);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('NexCAD Drawing Checker\nROI Justification', margin, 60);

    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFontSize(14);
    doc.text('For Engineering Team Review | Based on Your Inputs', margin, 85);

    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.setFontSize(11);
    const contextText = "This document outlines a conservative ROI framework to help assess the value of NexCAD deployment within your engineering team. Figures are illustrative and based on your provided inputs. Final values should be validated in a pilot phase.";
    doc.text(contextText, margin, 105, { maxWidth: contentWidth, lineHeightFactor: 1.5 });

    // Team Profile Box
    doc.setFillColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.rect(margin, 140, contentWidth, 65, 'F');
    
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(10);
    doc.text('ASSUMED TEAM PROFILE', margin + 10, 152);
    
    doc.setFontSize(14);
    doc.text(`Total engineers in scope: ${N}`, margin + 10, 165);
    doc.text(`Fully loaded avg engineering cost: ${formatCurrency(R)}/hour`, margin + 10, 175);
    doc.text(`Weekly time spent on drawing review: ${H} hrs/week`, margin + 10, 185);
    
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFontSize(12);
    doc.text(`${checkingPercent.toFixed(1)}% of total capacity`, margin + 10, 195);

    // --- Page 2: Engineering Review Efficiency ---
    doc.addPage();
    addDecoration(2, 5);
    
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Engineering Review Efficiency', margin, 55);

    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.setFontSize(11);
    doc.text("Manual drawing review consumes a significant portion of engineering capacity.", margin, 70);

    let yPos = 90;
    const drawRow = (label: string, value: string, isHighlight = false, isValueOrange = false) => {
      doc.setTextColor(isHighlight ? colors.primary[0] : colors.text[0], isHighlight ? colors.primary[1] : colors.text[1], isHighlight ? colors.primary[2] : colors.text[2]);
      doc.setFontSize(isHighlight ? 14 : 11);
      doc.setFont('helvetica', isHighlight ? 'bold' : 'normal');
      doc.text(label, margin, yPos);
      
      if (isValueOrange && !isHighlight) {
        doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.setFont('helvetica', 'bold');
      }
      doc.text(value, pageWidth - margin, yPos, { align: 'right' });
      yPos += 12;
    };

    drawRow('Baseline engineering time per year:', '1,920 hrs / engineer');
    drawRow('Time spent on drawing checking:', `${reviewHoursYear} hrs / year`);
    drawRow('Recoverable time (35% automation target):', `${Math.round(recoverableHoursYear)} hrs / year`);
    yPos += 5;
    drawRow('Value reclaimed per engineer:', formatCurrency(recoverableValueYear), true);
    yPos += 10;
    
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(margin, yPos, contentWidth, 30, 'F');
    doc.setTextColor(colors.bg[0], colors.bg[1], colors.bg[2]);
    doc.setFontSize(10);
    doc.text('TOTAL TEAM RECLAIMABLE VALUE (ANNUAL)', margin + 10, yPos + 10);
    doc.setFontSize(24);
    doc.text(formatCurrency(totalRecoverableValue), margin + 10, yPos + 22);

    // --- Page 3: Error & Rework Avoidance ---
    doc.addPage();
    addDecoration(3, 5);
    
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Error & Rework Avoidance', margin, 55);

    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.setFontSize(11);
    doc.text("Manual checking is prone to fatigue. Missing a single critical dimension or tolerance can lead to expensive scrap, rework, or site delays.", margin, 70, { maxWidth: contentWidth });

    yPos = 100;
    drawRow('Assumed critical errors avoided p.a:', issues.toString());
    drawRow('Average cost per critical issue:', '£12,500');
    yPos += 5;
    drawRow('Total Avoided Rework Cost:', formatCurrency(errorValue), true);

    doc.setFontSize(10);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.text("*Based on industry averages for mechanical rework and procurement delays.", margin, 140);

    // --- Page 4: Standardisation & Risk ---
    doc.addPage();
    addDecoration(4, 5);
    
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Standardisation & Knowledge Capture', margin, 55);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text("NexCAD codifies your internal checking standards, ensuring consistency across all engineers regardless of experience level.", margin, 65, { maxWidth: contentWidth });
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`Estimated Intangible Value: ${formatCurrency(standardisationValue)} / year`, margin, 85);

    // Section 4
    yPos = 110;
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Programme & Schedule Risk', margin, yPos + 10);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text("Manual checking is the primary bottleneck in engineering release cycles. By accelerating the 'check-fix-recheck' loop, NexCAD reduces overall programme risk and protects delivery milestones.", margin, yPos + 20, { maxWidth: contentWidth });

    // --- Page 5: Final ROI Summary ---
    doc.addPage();
    addDecoration(5, 5);
    
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Final ROI Summary', margin, 55);

    yPos = 80;
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
    drawRow('Engineering Efficiency Gains:', formatCurrency(totalRecoverableValue), false, true);
    drawRow('Error & Rework Avoidance:', formatCurrency(errorValue), false, true);
    drawRow('Standardisation & Quality Value:', formatCurrency(standardisationValue), false, true);
    yPos += 5;
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;
    
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(18);
    doc.text('TOTAL ESTIMATED ANNUAL VALUE', margin, yPos);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFontSize(32);
    doc.text(formatCurrency(totalValue), margin, yPos + 15);

    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.setFontSize(11);
    doc.text("This represents a conservative estimate of the value NexCAD brings to your engineering workflow. The actual impact often exceeds these figures when accounting for accelerated project delivery and improved client trust.", margin, yPos + 40, { maxWidth: contentWidth });

    // Book Demo Button
    const btnWidth = 50;
    const btnHeight = 12;
    const btnX = margin;
    const btnY = yPos + 75;

    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.roundedRect(btnX, btnY, btnWidth, btnHeight, 2, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BOOK DEMO', btnX + (btnWidth / 2), btnY + (btnHeight / 2) + 1.5, { align: 'center' });
    
    doc.link(btnX, btnY, btnWidth, btnHeight, { url: 'https://nexcad.ai/' });

    // Output
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    doc.save(`NexCAD_ROI_Justification_${email.split('@')[0]}.pdf`);
  };


  return (
    <div className="min-h-screen w-full flex flex-col bg-base selection:bg-primary/30">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full">
        
        {/* Left Section: Inputs & Narrative */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.3em]">
              <Sparkles size={14} />
              Efficiency Analysis
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[0.9] tracking-tighter max-w-2xl">
              Reclaim <span className="text-primary">£{results.annualWaste.toLocaleString()}</span> of engineering capacity.
            </h1>
            <p className="text-lg text-white/40 max-w-lg leading-relaxed font-medium">
              Manual CAD drawing reviews are the silent killer of engineering velocity for mechanical teams. See how much your team is leaving on the table.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            <div className="md:col-span-2">
              <InputControl 
                label="Engineering Headcount"
                value={inputs.engineers}
                min={1}
                max={200}
                onChange={(v) => handleInputChange('engineers', v)}
                icon={Users}
                suffix="FTEs"
              />
            </div>
            <InputControl 
              label="Avg Hourly Rate"
              value={inputs.hourlyRate}
              min={40}
              max={300}
              onChange={(v) => handleInputChange('hourlyRate', v)}
              icon={CircleDollarSign}
              prefix="£"
              suffix="/hr"
            />
            <InputControl 
              label="Weekly CAD Review Overhead"
              value={inputs.reviewHours}
              min={5}
              max={30}
              onChange={(v) => handleInputChange('reviewHours', v)}
              icon={Clock}
              suffix="hrs"
            />
          </div>
        </div>

        {/* Right Section: Visualization & Stats */}
        <div className="w-full lg:w-[480px] xl:w-[580px] p-8 lg:p-10 flex flex-col justify-center gap-6 bg-white/[0.01] border-l border-white/5">
          
          {/* Visualizer */}
          <div className="flex flex-col items-center gap-6">
            <InnovationCircle percentage={results.misallocatedPercentage} />
            
            <div className="grid grid-cols-2 gap-4 w-full">
              <StatCard 
                label="Annual Waste"
                value={results.annualWaste >= 1000000 
                  ? `£${(results.annualWaste / 1000000).toFixed(1)}M` 
                  : `£${(results.annualWaste / 1000).toFixed(0)}k`}
                subtext="Direct capital loss due to manual CAD review overhead."
                icon={TrendingDown}
                trend={`${results.reclaimablePercentage.toFixed(1)}% Reclaimable`}
              />
              <StatCard 
                label="Innovation Gap"
                value={`${results.innovationHoursLost.toLocaleString()}h`}
                subtext="Total engineering capacity lost to non-productive tasks."
                icon={Clock}
              />
            </div>
          </div>

          {/* CTA Glass Panel */}
          <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 space-y-4 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-12 bg-primary/10 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none" />
            
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold tracking-tight">Get the Full ROI Audit</h4>
                <ArrowUpRight size={18} className="text-primary opacity-50" />
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed max-w-[90%]">
                Receive a detailed breakdown of how NexCAD can automate your CAD review pipeline and reclaim your team's velocity.
              </p>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                      <Zap size={16} />
                    </div>
                    <input 
                      type="email" 
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-primary text-base font-bold py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    Send ROI Report
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 text-primary font-bold text-sm py-2"
                >
                  <CheckCircle2 size={20} />
                  Audit report is on its way.
                </motion.div>
              )}
            </div>
          </div>
        </div>

      </main>



    </div>
  );
}

