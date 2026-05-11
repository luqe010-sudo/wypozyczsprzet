"use client";

import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Download, 
  ArrowRight, 
  Truck, 
  Construction, 
  ArrowUpCircle, 
  Layers, 
  Wrench, 
  Leaf, 
  Zap,
  ClipboardList
} from 'lucide-react';

const iconMap = {
  heavy: Truck,
  construction: Construction,
  lifts: ArrowUpCircle,
  scaffolding: Layers,
  tools: Wrench,
  garden: Leaf,
  power: Zap,
  universal: ClipboardList
};

export default function DocumentCard({ doc }) {
  const Icon = iconMap[doc.categoryId] || FileText;

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
          <Icon size={24} />
        </div>
        <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-full uppercase tracking-wider">
          {doc.category}
        </span>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {doc.title}
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
        {doc.description}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Link 
          href={`/umowy/${doc.slug}`}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
        >
          Zobacz szczegóły
          <ArrowRight size={16} />
        </Link>
        <a 
          href={doc.pdfUrl}
          download
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl transition-colors border border-gray-100 dark:border-slate-600"
          onClick={(e) => !doc.pdfUrl && alert('Pobieranie PDF będzie dostępne wkrótce.')}
        >
          <Download size={16} />
          PDF
        </a>
      </div>
    </div>
  );
}
