
import React, { useState, useEffect, useCallback } from 'react';
import { FormState } from './types';
import { INITIAL_STATE } from './constants';
import GeneralSection from './components/GeneralSection';
import TechnicalSection from './components/TechnicalSection';
import ProposalsSection from './components/ProposalsSection';
import ProfessionalSection from './components/ProfessionalSection';
import PreviewSection from './components/PreviewSection';
import GeminiHelper from './components/GeminiHelper';
import MorphologicalStudyTool from './components/MorphologicalStudyTool';

const App: React.FC = () => {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<'general' | 'tecnico' | 'propuestas' | 'firmas' | 'previsualizar'>('general');
  const [showIAStudy, setShowIAStudy] = useState(false);

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
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header - No Print */}
      <header className="bg-slate-900 text-white p-4 shadow-lg no-print flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="https://picsum.photos/id/191/50/50" alt="Logo" className="rounded-full bg-white p-1 h-10 w-10 object-cover" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold uppercase tracking-tight leading-none">Estudio Morfológico</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">GAD Municipal Riobamba</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <GeminiHelper 
            onDataExtracted={updateForm} 
            onOpenIAStudy={() => setShowIAStudy(true)} 
          />
          <div className="h-8 w-px bg-slate-700 mx-2"></div>
          <button 
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-full flex items-center gap-2 transition-all font-bold text-sm shadow-md border border-emerald-400"
          >
            <i className="fas fa-print"></i> PDF
          </button>
        </div>
      </header>

      {/* Main UI Logic: IA Study View or Form View */}
      {showIAStudy ? (
        <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
           <div className="mb-4">
             <button 
               onClick={() => setShowIAStudy(false)}
               className="text-slate-500 hover:text-slate-900 font-bold text-sm flex items-center gap-2 transition-colors"
             >
               <i className="fas fa-arrow-left"></i> Volver al Informe
             </button>
           </div>
           <MorphologicalStudyTool updateForm={(u) => { updateForm(u); setShowIAStudy(false); }} />
        </div>
      ) : (
        <>
          {/* Navigation - No Print */}
          <nav className="bg-white border-b border-slate-200 no-print sticky top-[72px] z-40">
            <div className="max-w-7xl mx-auto flex overflow-x-auto scrollbar-hide">
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
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <i className={`fas ${tab.icon} ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`}></i>
                  <span className={`text-xs font-bold uppercase tracking-wide ${activeTab === tab.id ? 'opacity-100' : 'opacity-70'}`}>{tab.label}</span>
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
                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-lg">
                        <p className="text-xs font-medium text-blue-800">
                            <i className="fas fa-circle-info mr-2"></i> Esta es la previsualización oficial. Use el botón "Imprimir PDF" para generar el documento físico.
                        </p>
                    </div>
                    <PreviewSection form={form} />
                 </div>
              )}
            </div>
          </main>
        </>
      )}

      {/* Hidden Print Content */}
      <div className="hidden print:block">
        <PreviewSection form={form} />
      </div>

      <footer className="no-print bg-slate-100 p-6 text-center text-slate-400 text-[10px] border-t uppercase tracking-[0.2em]">
        Gobierno Autónomo Descentralizado Municipal Riobamba &bull; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
