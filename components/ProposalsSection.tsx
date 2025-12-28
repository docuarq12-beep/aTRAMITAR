
import React from 'react';
import { FormState, Proposal } from '../types';

interface Props {
  form: FormState;
  updateForm: (u: Partial<FormState>) => void;
}

const ProposalsSection: React.FC<Props> = ({ form, updateForm }) => {
  const updateProp = (id: 'propuesta1' | 'propuesta2', field: keyof Proposal, value: any) => {
    updateForm({ [id]: { ...form[id], [field]: value } });
  };

  const updateRetiro = (id: 'propuesta1' | 'propuesta2', field: 'f' | 'l' | 'p', value: string) => {
    updateForm({ [id]: { ...form[id], retiros: { ...form[id].retiros, [field]: value } } });
  };

  const RenderProposal = ({ id, label }: { id: 'propuesta1' | 'propuesta2', label: string }) => {
    const p = form[id];
    return (
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fas fa-file-contract text-blue-600"></i> {label}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
           <div>
             <label className="block text-xs font-bold text-slate-500 mb-1">Área Terreno</label>
             <input type="text" value={p.areaTerreno} onChange={e => updateProp(id, 'areaTerreno', e.target.value)} className="w-full border rounded p-2 text-sm" />
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-500 mb-1">Área Edificable</label>
             <input type="text" value={p.areaEdificable} onChange={e => updateProp(id, 'areaEdificable', e.target.value)} className="w-full border rounded p-2 text-sm" />
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-500 mb-1">COS (Planta Baja)</label>
             <input type="text" value={p.cos} onChange={e => updateProp(id, 'cos', e.target.value)} className="w-full border rounded p-2 text-sm" />
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-500 mb-1">COS Total</label>
             <input type="text" value={p.cosTotal} onChange={e => updateProp(id, 'cosTotal', e.target.value)} className="w-full border rounded p-2 text-sm" />
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
           <div>
             <label className="block text-xs font-bold text-slate-500 mb-1">Implantación Predominante</label>
             <select value={p.implantacion} onChange={e => updateProp(id, 'implantacion', e.target.value)} className="w-full border rounded p-2 text-sm">
                <option>Aislada</option>
                <option>Pareada</option>
                <option>Continua</option>
             </select>
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-500 mb-1"># Pisos</label>
             <input type="text" value={p.numPisos} onChange={e => updateProp(id, 'numPisos', e.target.value)} className="w-full border rounded p-2 text-sm" />
           </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4 bg-white p-3 rounded border border-dashed border-blue-300">
           <div>
             <label className="block text-xs font-bold text-blue-600 mb-1">Retiro Frontal (F)</label>
             <input type="text" value={p.retiros.f} onChange={e => updateRetiro(id, 'f', e.target.value)} className="w-full border rounded p-2 text-sm" />
           </div>
           <div>
             <label className="block text-xs font-bold text-blue-600 mb-1">Retiro Lateral (L)</label>
             <input type="text" value={p.retiros.l} onChange={e => updateRetiro(id, 'l', e.target.value)} className="w-full border rounded p-2 text-sm" />
           </div>
           <div>
             <label className="block text-xs font-bold text-blue-600 mb-1">Retiro Posterior (P)</label>
             <input type="text" value={p.retiros.p} onChange={e => updateRetiro(id, 'p', e.target.value)} className="w-full border rounded p-2 text-sm" />
           </div>
        </div>
        <div className="space-y-3">
           <div>
             <label className="block text-xs font-bold text-slate-500 mb-1">Observación</label>
             <textarea value={p.observacion} onChange={e => updateProp(id, 'observacion', e.target.value)} className="w-full border rounded p-2 text-sm" rows={2}></textarea>
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-500 mb-1">Validación Técnica</label>
             <textarea value={p.validacion} onChange={e => updateProp(id, 'validacion', e.target.value)} className="w-full border rounded p-2 text-sm" rows={2} placeholder="Respuesta de la Dirección..."></textarea>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold border-b pb-2 mb-4 text-slate-800 uppercase">4. Resultados del Estudio</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RenderProposal id="propuesta1" label="Propuesta N°1" />
        <RenderProposal id="propuesta2" label="Propuesta N°2" />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Comentario Final del Proyecto</label>
        <textarea 
          rows={3} 
          value={form.observacionesGenerales} 
          onChange={e => updateForm({ observacionesGenerales: e.target.value })}
          className="w-full border rounded p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Resumen y observaciones finales del estudio morfológico..."
        ></textarea>
      </div>
    </div>
  );
};

export default ProposalsSection;
