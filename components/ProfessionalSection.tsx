
import React, { useRef } from 'react';
import { FormState } from '../types';

interface Props {
  form: FormState;
  updateForm: (u: Partial<FormState>) => void;
}

const SignatureUploader: React.FC<{
  value: string;
  onUpload: (data: string) => void;
  label: string;
}> = ({ value, onUpload, label }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => onUpload(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div 
        onClick={() => !value && fileInputRef.current?.click()}
        className={`h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all overflow-hidden relative group cursor-pointer ${
          value ? 'border-blue-600 bg-white' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
        }`}
      >
        {value ? (
          <>
            <img src={value} alt="Firma" className="max-w-full max-h-full object-contain p-2" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={(e) => { e.stopPropagation(); onUpload(''); }} 
                className="bg-red-500 text-white p-2 rounded-full shadow-lg"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <i className="fas fa-signature text-slate-300 text-2xl mb-1"></i>
            <p className="text-[10px] text-slate-500 font-bold uppercase">{label}</p>
            <p className="text-[9px] text-slate-400">Clic para subir escaneado o firma digital</p>
          </div>
        )}
      </div>
      <input 
        ref={fileInputRef} 
        type="file" 
        className="hidden" 
        accept="image/*" 
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} 
      />
    </div>
  );
};

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
          
          <SignatureUploader 
            label="Firma Propietario" 
            value={form.propietario.firma} 
            onUpload={v => updateOwner('firma', v)} 
          />
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
          
          <SignatureUploader 
            label="Firma Profesional" 
            value={form.profesional.firma} 
            onUpload={v => updateProf('firma', v)} 
          />
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
