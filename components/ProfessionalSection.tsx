
import React from 'react';
import { FormState } from '../types';

interface Props {
  form: FormState;
  updateForm: (u: Partial<FormState>) => void;
}

const ProfessionalSection: React.FC<Props> = ({ form, updateForm }) => {
  const updateOwner = (f: keyof FormState['propietario'], v: string) => {
    updateForm({ propietario: { ...form.propietario, [f]: v } });
  };
  const updateProf = (f: keyof FormState['profesional'], v: string) => {
    updateForm({ profesional: { ...form.profesional, [f]: v } });
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Propietario */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold border-b pb-2 text-slate-800 uppercase tracking-wide">3. Datos del Propietario</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nombre / Rep. Legal</label>
              <input type="text" value={form.propietario.nombre} onChange={e => updateOwner('nombre', e.target.value)} className="w-full border rounded p-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">C.I. / Pasaporte</label>
                 <input type="text" value={form.propietario.cedula} onChange={e => updateOwner('cedula', e.target.value)} className="w-full border rounded p-2" />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Teléfono / Celular</label>
                 <input type="text" value={form.propietario.celular} onChange={e => updateOwner('celular', e.target.value)} className="w-full border rounded p-2" />
               </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Correo Electrónico</label>
              <input type="email" value={form.propietario.email} onChange={e => updateOwner('email', e.target.value)} className="w-full border rounded p-2" />
            </div>
          </div>
          <div className="h-24 border-2 border-dashed border-slate-300 flex items-end justify-center pb-2 text-slate-400 text-xs italic">
            Firma del Propietario / Representante Legal
          </div>
        </div>

        {/* Profesional */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold border-b pb-2 text-slate-800 uppercase tracking-wide">Profesional Responsable</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nombre del Profesional</label>
              <input type="text" value={form.profesional.nombre} onChange={e => updateProf('nombre', e.target.value)} className="w-full border rounded p-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Registro SENESCYT</label>
                 <input type="text" value={form.profesional.senescyt} onChange={e => updateProf('senescyt', e.target.value)} className="w-full border rounded p-2" />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Registro Municipal N°</label>
                 <input type="text" value={form.profesional.registroMunicipal} onChange={e => updateProf('registroMunicipal', e.target.value)} className="w-full border rounded p-2" />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Teléfono</label>
                 <input type="text" value={form.profesional.celular} onChange={e => updateProf('celular', e.target.value)} className="w-full border rounded p-2" />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Correo</label>
                 <input type="text" value={form.profesional.email} onChange={e => updateProf('email', e.target.value)} className="w-full border rounded p-2" />
               </div>
            </div>
          </div>
          <div className="h-24 border-2 border-dashed border-slate-300 flex items-end justify-center pb-2 text-slate-400 text-xs italic">
            Firma del Profesional
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-6 rounded-lg space-y-4">
         <h4 className="font-bold flex items-center gap-2">
           <i className="fas fa-circle-exclamation text-yellow-500"></i> Notas Importantes
         </h4>
         <ul className="text-sm space-y-2 opacity-80 list-disc pl-5">
           <li>La propuesta será evaluada por el técnico encargado de la Dirección de Ordenamiento Territorial.</li>
           <li>Se debe considerar que esto aplica para manzanas con una consolidación mínima del 70%.</li>
           <li>Si es menor al 70%, se deberá respetar la zonificación original sin excepción.</li>
         </ul>
      </div>
    </div>
  );
};

export default ProfessionalSection;
