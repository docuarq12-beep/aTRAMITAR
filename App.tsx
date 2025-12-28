
import React, { useState, useEffect, useCallback } from 'react';
import { FormState } from './types';
import { INITIAL_STATE } from './constants';
import GeneralSection from './components/GeneralSection';
import TechnicalSection from './components/TechnicalSection';
import ProposalsSection from './components/ProposalsSection';
import ProfessionalSection from './components/ProfessionalSection';
import PreviewSection from './components/PreviewSection';
import GeminiHelper from './components/GeminiHelper';

const App: React.FC = () => {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<'general' | 'tecnico' | 'propuestas' | 'firmas' | 'previsualizar'>('general');

  // Automatic Consolidation Calculation
  useEffect(() => {
    const calc = (form.numEdificaciones * 100) / (form.numLotesManzana || 1);
    setForm(prev => ({
      ...prev,
      gradoConsolidacion: parseFloat(calc.toFixed(2)),
      cumpleConsolidacion: calc >= 70
    }));
  }, [form.numEdificaciones, form.numLotesManzana]);

  const updateForm = useCallback((updates: Partial<FormState>) => {
    setForm(prev => ({ ...prev, ...updates }));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - No Print */}
      <header className="bg-slate-900 text-white p-4 shadow-lg no-print flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="https://picsum.photos/id/191/50/50" alt="Logo" className="rounded-full bg-white p-1" />
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tight">Estudio Morfológico v1.0</h1>
            <p className="text-xs text-slate-400">GAD Municipal del Cantón Riobamba</p>
          </div>
        </div>
        <div className="flex gap-2">
          <GeminiHelper onDataExtracted={updateForm} />
          <button 
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded flex items-center gap-2 transition-all font-semibold"
          >
            <i className="fas fa-print"></i> Imprimir PDF
          </button>
        </div>
      </header>

      {/* Navigation - No Print */}
      <nav className="bg-white border-b border-slate-200 no-print sticky top-[72px] z-40">
        <div className="max-w-7xl mx-auto flex overflow-x-auto">
          {[
            { id: 'general', label: '1. Identificación', icon: 'fa-building' },
            { id: 'tecnico', label: '2. Datos Técnicos', icon: 'fa-map-location-dot' },
            { id: 'propuestas', label: '3. Resultados', icon: 'fa-chart-pie' },
            { id: 'firmas', label: '4. Firmas & Notas', icon: 'fa-signature' },
            { id: 'previsualizar', label: 'Vista Final', icon: 'fa-eye' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                ? 'border-blue-600 text-blue-600 bg-blue-50' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <i className={`fas ${tab.icon}`}></i>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 no-print">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          {activeTab === 'general' && <GeneralSection form={form} updateForm={updateForm} />}
          {activeTab === 'tecnico' && <TechnicalSection form={form} updateForm={updateForm} />}
          {activeTab === 'propuestas' && <ProposalsSection form={form} updateForm={updateForm} />}
          {activeTab === 'firmas' && <ProfessionalSection form={form} updateForm={updateForm} />}
          {activeTab === 'previsualizar' && (
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                        <i className="fas fa-circle-info mr-2"></i> Esta es la vista previa de cómo se verá el documento impreso.
                    </p>
                    <button onClick={handlePrint} className="text-blue-600 hover:underline font-bold">Imprimir ahora</button>
                </div>
                <PreviewSection form={form} />
             </div>
          )}
        </div>
      </main>

      {/* Hidden Print Content */}
      <div className="hidden print:block print-only">
        <PreviewSection form={form} />
      </div>

      <footer className="no-print bg-slate-100 p-4 text-center text-slate-500 text-sm border-t">
        &copy; {new Date().getFullYear()} - Gestión de Ordenamiento Territorial - Riobamba
      </footer>
    </div>
  );
};

export default App;
