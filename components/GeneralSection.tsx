
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
        <h2 className="text-xl font-bold border-b pb-2 mb-4 text-slate-800">1. Identificación del Predio</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre del Proyecto</label>
            <input 
              type="text" 
              value={form.projectName} 
              onChange={e => updateForm({ projectName: e.target.value })}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej. Edificio Las Gardenias"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha</label>
            <input 
              type="date" 
              value={form.date} 
              onChange={e => updateForm({ date: e.target.value })}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h3 className="font-bold text-sm text-slate-500 uppercase tracking-widest mb-4">Ubicación</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1">Calle</label>
            <input type="text" value={form.calle} onChange={e => updateForm({ calle: e.target.value })} className="w-full border rounded p-2 text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1">Intersección</label>
            <input type="text" value={form.interseccion} onChange={e => updateForm({ interseccion: e.target.value })} className="w-full border rounded p-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Parroquia</label>
            <input type="text" value={form.parroquia} onChange={e => updateForm({ parroquia: e.target.value })} className="w-full border rounded p-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Clave Catastral N°</label>
            <input type="text" value={form.claveCatastral} onChange={e => updateForm({ claveCatastral: e.target.value })} className="w-full border rounded p-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Barrio o Parcelación</label>
            <input type="text" value={form.barrio} onChange={e => updateForm({ barrio: e.target.value })} className="w-full border rounded p-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Manzana N°</label>
              <input type="text" value={form.manzanaN} onChange={e => updateForm({ manzanaN: e.target.value })} className="w-full border rounded p-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Lote N°</label>
              <input type="text" value={form.loteN} onChange={e => updateForm({ loteN: e.target.value })} className="w-full border rounded p-2 text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Áreas Históricas Section */}
      <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
        <h3 className="font-bold text-sm text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
          <i className="fas fa-monument"></i> Áreas Históricas
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <ToggleField 
              label="Área Histórica" 
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
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Número de Registro de Inventario</label>
            <textarea 
              value={form.numRegistroInventario} 
              onChange={e => updateForm({ numRegistroInventario: e.target.value })}
              className="flex-1 border rounded p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ingrese el número de registro si aplica..."
              rows={4}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold border-b pb-2 mb-4 text-slate-800">2. Grado de Consolidación</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
               <div>
                 <p className="text-xs font-bold text-blue-600 uppercase">Fórmula</p>
                 <p className="text-lg font-mono">C = (#E * 100) / #LMz</p>
               </div>
               <div className="text-right">
                 <p className="text-2xl font-black text-blue-700">{form.gradoConsolidacion}%</p>
                 <p className={`text-xs font-bold ${form.cumpleConsolidacion ? 'text-green-600' : 'text-red-600'}`}>
                   {form.cumpleConsolidacion ? 'CUMPLE (>= 70%)' : 'NO CUMPLE (< 70%)'}
                 </p>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1"># Edificaciones (#E)</label>
                <input 
                  type="number" 
                  value={form.numEdificaciones} 
                  onChange={e => updateForm({ numEdificaciones: parseInt(e.target.value) || 0 })} 
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1"># Lotes Manzana (#LMz)</label>
                <input 
                  type="number" 
                  value={form.numLotesManzana} 
                  onChange={e => updateForm({ numLotesManzana: parseInt(e.target.value) || 1 })} 
                  className="w-full border rounded p-2"
                />
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-lg border text-sm text-slate-600 space-y-2">
            <p><strong>Nota:</strong> El presente instructivo aplica para manzanas que estén en una consolidación mínima del 70%.</p>
            <p><strong>#E:</strong> Número de edificaciones (se tomará en cuenta una sola edificación por lote >= a 40m2).</p>
            <p><strong>#LMz:</strong> Número de lotes por manzana.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSection;
