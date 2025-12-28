
import React, { useRef, useState } from 'react';
import { FormState, Proposal } from '../types';

interface Props {
  form: FormState;
  updateForm: (u: Partial<FormState>) => void;
}

const ProposalsSection: React.FC<Props> = ({ form, updateForm }) => {
  const updateProp = (id: 'propuesta1' | 'propuesta2', field: string, value: any) => {
    const keys = field.split('.');
    const newProp = JSON.parse(JSON.stringify(form[id]));
    
    let current = newProp;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    updateForm({ [id]: newProp });
  };

  const TableInput = ({ 
    proposalId, 
    path, 
    placeholder = "" 
  }: { 
    proposalId: 'propuesta1' | 'propuesta2', 
    path: string, 
    placeholder?: string 
  }) => {
    const keys = path.split('.');
    let val: any = form[proposalId];
    keys.forEach(k => val = val?.[k]);

    return (
      <input 
        type="text" 
        value={val || ''} 
        onChange={e => updateProp(proposalId, path, e.target.value)}
        className="w-full h-full bg-transparent border-none text-center text-xs p-1 focus:ring-1 focus:ring-blue-400 outline-none"
        placeholder={placeholder}
      />
    );
  };

  const RenderProposal = ({ id, label }: { id: 'propuesta1' | 'propuesta2', label: string }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFile = (file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProp(id, 'graficoPropuesta', reader.result as string);
      };
      reader.readAsDataURL(file);
    };

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    };

    return (
      <div className="bg-white border-2 border-slate-900 overflow-hidden rounded-lg shadow-md mb-8">
        <div className="bg-slate-900 text-white text-center py-1.5 font-bold uppercase text-sm tracking-widest">
          {label}
        </div>
        
        <div className="flex flex-col">
          {/* Main Table Layout */}
          <div className="grid grid-cols-12 border-b border-slate-900">
            {/* Left Graphic Area with Upload/Drag-and-Drop */}
            <div 
              className={`col-span-8 border-r border-slate-900 relative group flex items-center justify-center p-4 min-h-[300px] transition-all duration-300 ${
                dragActive ? 'bg-blue-50' : 'bg-slate-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {form[id].graficoPropuesta ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img 
                    src={form[id].graficoPropuesta} 
                    alt="Gráfico Propuesta" 
                    className="max-w-full max-h-[280px] object-contain shadow-sm" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      onClick={() => updateProp(id, 'graficoPropuesta', '')}
                      className="bg-red-500 text-white p-3 rounded-full hover:scale-110 transition-transform shadow-xl"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold shadow-xl hover:bg-slate-100"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer text-slate-300 text-xs text-center border-2 border-dashed p-12 rounded-xl flex flex-col items-center transition-all ${
                    dragActive ? 'border-blue-400 text-blue-400 bg-white scale-105' : 'border-slate-200 hover:border-blue-300 hover:text-blue-300'
                  }`}
                >
                  <i className={`fas ${dragActive ? 'fa-cloud-arrow-up' : 'fa-image'} text-5xl mb-4 transition-transform ${dragActive ? 'scale-110' : ''}`}></i>
                  <p className="font-bold uppercase tracking-wider mb-2">Espacio para Gráfico / Plano Propuesta</p>
                  <p className="text-[10px] opacity-70">Suelte la imagen aquí o haga clic para subir archivo</p>
                </div>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>

            {/* Right Comparison Table */}
            <div className="col-span-4 flex flex-col text-[10px]">
              {/* Header Area */}
              <div className="grid grid-cols-2 border-b border-slate-900">
                <div className="col-span-2 bg-slate-100 text-center font-bold border-b border-slate-900 py-1">Área</div>
                <div className="border-r border-slate-900 text-center py-1 font-semibold uppercase">Terreno</div>
                <div className="text-center py-1 font-semibold uppercase">Edificable</div>
                <div className="border-r border-slate-900 h-6">
                  <TableInput proposalId={id} path="areaTerreno" />
                </div>
                <div className="h-6">
                  <TableInput proposalId={id} path="areaEdificable" />
                </div>
              </div>

              {/* Sub Headers */}
              <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-900 font-bold">
                <div className="border-r border-slate-900 text-center py-1">Propuesta</div>
                <div className="text-center py-1 bg-green-50 text-green-900">Zonificación</div>
              </div>

              {/* COS Rows */}
              <div className="grid grid-cols-2 bg-slate-800 text-white font-bold text-center border-b border-slate-900">
                <div className="border-r border-slate-400 py-0.5">COS</div>
                <div className="py-0.5">COS</div>
              </div>
              <div className="grid grid-cols-2 border-b border-slate-900 h-6">
                <div className="border-r border-slate-900"><TableInput proposalId={id} path="proyecto.cos" /></div>
                <div><TableInput proposalId={id} path="zonificacion.cos" /></div>
              </div>

              <div className="grid grid-cols-2 bg-slate-800 text-white font-bold text-center border-b border-slate-900">
                <div className="border-r border-slate-400 py-0.5">COS TOTAL</div>
                <div className="py-0.5">COS TOTAL</div>
              </div>
              <div className="grid grid-cols-2 border-b border-slate-900 h-6">
                <div className="border-r border-slate-900"><TableInput proposalId={id} path="proyecto.cosTotal" /></div>
                <div><TableInput proposalId={id} path="zonificacion.cosTotal" /></div>
              </div>

              <div className="grid grid-cols-2 bg-slate-800 text-white font-bold text-center border-b border-slate-900">
                <div className="border-r border-slate-400 py-0.5"># PISOS</div>
                <div className="py-0.5"># PISOS</div>
              </div>
              <div className="grid grid-cols-2 border-b border-slate-900 h-6">
                <div className="border-r border-slate-900"><TableInput proposalId={id} path="proyecto.numPisos" /></div>
                <div><TableInput proposalId={id} path="zonificacion.numPisos" /></div>
              </div>

              <div className="grid grid-cols-2 bg-slate-800 text-white font-bold text-center border-b border-slate-900">
                <div className="border-r border-slate-400 py-0.5">IMPLANTACIÓN</div>
                <div className="py-0.5">IMPLANTACIÓN</div>
              </div>
              <div className="grid grid-cols-2 border-b border-slate-900 h-6">
                <div className="border-r border-slate-900"><TableInput proposalId={id} path="proyecto.implantacion" /></div>
                <div><TableInput proposalId={id} path="zonificacion.implantacion" /></div>
              </div>

              {/* Retiros Sub Header */}
              <div className="grid grid-cols-2 bg-slate-800 text-white font-bold text-center border-b border-slate-900">
                <div className="border-r border-slate-400 py-0.5">RETIROS</div>
                <div className="py-0.5">RETIROS</div>
              </div>
              <div className="grid grid-cols-6 border-b border-slate-900 text-center font-bold bg-slate-100">
                <div className="border-r border-slate-900 bg-red-50">F</div>
                <div className="border-r border-slate-900 bg-blue-50">L</div>
                <div className="border-r border-slate-900 bg-yellow-50">P</div>
                <div className="border-r border-slate-900 bg-red-50">F</div>
                <div className="border-r border-slate-900 bg-blue-50">L</div>
                <div className="bg-yellow-50">P</div>
              </div>
              <div className="grid grid-cols-6 h-6">
                <div className="border-r border-slate-900"><TableInput proposalId={id} path="proyecto.retiros.f" /></div>
                <div className="border-r border-slate-900"><TableInput proposalId={id} path="proyecto.retiros.l" /></div>
                <div className="border-r border-slate-900"><TableInput proposalId={id} path="proyecto.retiros.p" /></div>
                <div className="border-r border-slate-900"><TableInput proposalId={id} path="zonificacion.retiros.f" /></div>
                <div className="border-r border-slate-900"><TableInput proposalId={id} path="zonificacion.retiros.l" /></div>
                <div><TableInput proposalId={id} path="zonificacion.retiros.p" /></div>
              </div>
            </div>
          </div>

          {/* Observations and Validations */}
          <div className="grid grid-cols-12 border-b border-slate-900">
            <div className="col-span-8 p-0">
               <div className="bg-slate-100 p-1 border-b border-slate-900 text-[10px] font-bold">OBSERVACIÓN:</div>
               <textarea 
                 value={form[id].observacion} 
                 onChange={e => updateProp(id, 'observacion', e.target.value)}
                 className="w-full h-32 p-2 text-xs border-none outline-none resize-none"
                 placeholder="Escriba aquí la observación..."
               />
            </div>
            <div className="col-span-4 border-l border-slate-900 p-0 flex flex-col">
               <div className="bg-slate-100 p-1 border-b border-slate-900 text-[10px] font-bold">VALIDACIÓN:</div>
               <textarea 
                 value={form[id].validacion} 
                 onChange={e => updateProp(id, 'validacion', e.target.value)}
                 className="w-full flex-1 p-2 text-xs border-none outline-none resize-none"
                 placeholder="Resultado de validación técnica..."
               />
            </div>
          </div>

          {/* Bottom Comment Bar */}
          <div className="flex bg-slate-900 text-white items-center p-1.5 px-4 gap-4">
             <span className="text-[10px] font-bold whitespace-nowrap uppercase">Comentario:</span>
             <input 
               type="text" 
               value={form[id].comentario}
               onChange={e => updateProp(id, 'comentario', e.target.value)}
               className="flex-1 bg-transparent border-none outline-none text-xs text-slate-300"
               placeholder="Comentarios adicionales para esta propuesta..."
             />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-black text-slate-800 border-b-4 border-blue-600 pb-2 mb-8 uppercase flex items-center gap-3">
        <i className="fas fa-clipboard-check text-blue-600"></i>
        Análisis de Propuestas Morfológicas
      </h2>
      
      <RenderProposal id="propuesta1" label="Propuesta N°1" />
      <RenderProposal id="propuesta2" label="Propuesta N°2" />

      <div className="bg-blue-900 text-white p-6 rounded-xl shadow-lg mt-12">
        <label className="block text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
          <i className="fas fa-comment-dots"></i> Observaciones Generales del Estudio
        </label>
        <textarea 
          rows={4} 
          value={form.observacionesGenerales} 
          onChange={e => updateForm({ observacionesGenerales: e.target.value })}
          className="w-full bg-blue-800/50 border border-blue-400 rounded-lg p-4 text-sm placeholder:text-blue-300 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
          placeholder="Resuma las conclusiones técnicas finales del estudio morfológico completo..."
        ></textarea>
      </div>
    </div>
  );
};

export default ProposalsSection;
