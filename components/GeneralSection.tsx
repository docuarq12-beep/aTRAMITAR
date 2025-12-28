
import React from 'react';
import { FormState } from '../types';

interface Props {
  form: FormState;
  updateForm: (u: Partial<FormState>) => void;
}

const GeneralSection: React.FC<Props> = ({ form, updateForm }) => {
  const ToggleField = ({ label, value, onChange }: { label: string, value: boolean, onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between p-2 border rounded bg-white">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="flex gap-2">
        <button 
          onClick={() => onChange(true)}
          className={`px-3 py-1 text-xs font-bold rounded ${value ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}
        >
          SÍ
        </button>
        <button 
          onClick={() => onChange(false)}
          className={`px-3 py-1 text-xs font-bold rounded ${!value ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}
        >
          NO
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold border-b pb-2 mb-4 text-slate-800 uppercase flex items-center gap-2">
           <i className="fas fa-id-card text-blue-600"></i> 1. Identificación del Predio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">Nombre del Proyecto</label>
            <input 
              type="text" 
              value={form.projectName} 
              onChange={e => updateForm({ projectName: e.target.value })}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              placeholder="Ej. Urbanización Los Álamos"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">Fecha de Emisión</label>
            <input 
              type="date" 
              value={form.date} 
              onChange={e => updateForm({ date: e.target.value })}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner">
        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <i className="fas fa-location-dot"></i> Ubicación y Catastro
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Calle Principal</label>
            <input type="text" value={form.calle} onChange={e => updateForm({ calle: e.target.value })} className="w-full border rounded-lg p-2 text-sm bg-white" placeholder="Av. Daniel León Borja" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Intersección</label>
            <input type="text" value={form.interseccion} onChange={e => updateForm({ interseccion: e.target.value })} className="w-full border rounded-lg p-2 text-sm bg-white" placeholder="Calle Brasil" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Parroquia</label>
            <input type="text" value={form.parroquia} onChange={e => updateForm({ parroquia: e.target.value })} className="w-full border rounded-lg p-2 text-sm bg-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Barrio / Urbanización</label>
            <input type="text" value={form.barrio} onChange={e => updateForm({ barrio: e.target.value })} className="w-full border rounded-lg p-2 text-sm bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Manzana N°</label>
              <input type="text" value={form.manzanaN} onChange={e => updateForm({ manzanaN: e.target.value })} className="w-full border rounded-lg p-2 text-sm bg-white text-center" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Lote N°</label>
              <input type="text" value={form.loteN} onChange={e => updateForm({ loteN: e.target.value })} className="w-full border rounded-lg p-2 text-sm bg-white text-center" />
            </div>
          </div>

          {/* CLAVE CATASTRAL & IFU GROUPING */}
          <div className="md:col-span-1 space-y-3">
             <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="bg-slate-800 text-white text-[10px] font-bold p-1 text-center uppercase tracking-wider">Clave Catastral N°</div>
                <input 
                  type="text" 
                  value={form.claveCatastral} 
                  onChange={e => updateForm({ claveCatastral: e.target.value })} 
                  className="w-full p-2 text-sm outline-none text-center font-bold"
                  placeholder="0000-00-00..."
                />
                <div className="grid grid-cols-2 border-t border-slate-300">
                   <div className="flex flex-col border-r border-slate-300">
                      <div className="bg-slate-100 text-[9px] font-bold p-1 text-center leading-tight uppercase">Fecha Expedición IFU</div>
                      <input 
                        type="date" 
                        value={form.fechaExpedicionIFU} 
                        onChange={e => updateForm({ fechaExpedicionIFU: e.target.value })} 
                        className="p-1.5 text-[10px] outline-none text-center" 
                      />
                   </div>
                   <div className="flex flex-col">
                      <div className="bg-slate-100 text-[9px] font-bold p-1 text-center leading-tight uppercase">IFU N°</div>
                      <input 
                        type="text" 
                        value={form.ifuN} 
                        onChange={e => updateForm({ ifuN: e.target.value })} 
                        className="p-1.5 text-[10px] outline-none text-center font-bold" 
                        placeholder="N°"
                      />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Áreas Históricas Section */}
      <div className="bg-slate-100 p-6 rounded-xl border border-slate-300 shadow-sm">
        <h3 className="font-bold text-sm text-slate-600 uppercase tracking-widest mb-6 flex items-center gap-2">
          <i className="fas fa-monument text-amber-600"></i> Protección de Patrimonio y Áreas Históricas
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <ToggleField 
              label="Ubicado en Área Histórica" 
              value={form.areaHistorica} 
              onChange={v => updateForm({ areaHistorica: v })} 
            />
            <ToggleField 
              label="Bien del Patrimonio Nacional Cultural" 
              value={form.bienPatrimonio} 
              onChange={v => updateForm({ bienPatrimonio: v })} 
            />
            <ToggleField 
              label="Bien en Régimen Transitorio de Protección" 
              value={form.regimenTransitorio} 
              onChange={v => updateForm({ regimenTransitorio: v })} 
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-tighter">Número de Registro de Inventario (Si aplica)</label>
            <textarea 
              value={form.numRegistroInventario} 
              onChange={e => updateForm({ numRegistroInventario: e.target.value })}
              className="flex-1 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white min-h-[120px] shadow-inner"
              placeholder="Describa el número de registro o código de inventario patrimonial..."
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <h2 className="text-xl font-bold border-b pb-2 mb-6 text-slate-800 uppercase flex items-center gap-2">
           <i className="fas fa-chart-line text-blue-600"></i> 2. Grado de Consolidación de la Manzana
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-blue-600 text-white p-6 rounded-2xl shadow-lg transform transition-transform hover:scale-[1.02]">
               <div>
                 <p className="text-[10px] font-black uppercase opacity-80 tracking-widest mb-1">Fórmula de Cálculo</p>
                 <p className="text-xl font-mono font-bold">C = (#E * 100) / #LMz</p>
               </div>
               <div className="text-right">
                 <p className="text-3xl font-black">{form.gradoConsolidacion}%</p>
                 <p className={`text-[10px] font-black px-2 py-0.5 rounded-full mt-1 ${form.cumpleConsolidacion ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'}`}>
                   {form.cumpleConsolidacion ? 'APLICA (>= 70%)' : 'NO APLICA (< 70%)'}
                 </p>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-6 p-4 bg-white rounded-xl border">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase"># Edificaciones (#E)</label>
                <input 
                  type="number" 
                  value={form.numEdificaciones} 
                  onChange={e => updateForm({ numEdificaciones: parseInt(e.target.value) || 0 })} 
                  className="w-full border rounded-lg p-3 text-center text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase"># Lotes Manzana (#LMz)</label>
                <input 
                  type="number" 
                  value={form.numLotesManzana} 
                  onChange={e => updateForm({ numLotesManzana: parseInt(e.target.value) || 1 })} 
                  className="w-full border rounded-lg p-3 text-center text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
          <div className="bg-slate-100 p-6 rounded-2xl border-l-8 border-blue-500 text-[11px] text-slate-600 space-y-4 shadow-sm">
            <p className="font-bold text-slate-800 text-xs uppercase mb-2">Instrucciones de cálculo:</p>
            <p><i className="fas fa-info-circle mr-1 text-blue-500"></i> El presente instructivo aplica exclusivamente para manzanas que estén en una consolidación mínima del <strong>70%</strong>.</p>
            <p><strong>#E:</strong> Corresponde al número de edificaciones existentes. Se tomará en cuenta una sola edificación por cada lote que sea mayor o igual a <strong>40 m²</strong>.</p>
            <p><strong>#LMz:</strong> Representa el número total de lotes que conforman la manzana bajo estudio.</p>
            <div className="p-3 bg-white rounded-lg border italic">
              Si la consolidación es inferior al 70%, se deberá respetar estrictamente la zonificación vigente del PDOT.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSection;
