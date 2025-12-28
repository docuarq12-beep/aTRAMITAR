
import React, { useRef, useState } from 'react';
import { FormState, Coordinate } from '../types';

interface Props {
  form: FormState;
  updateForm: (u: Partial<FormState>) => void;
}

const ImageUploader: React.FC<{
  label: string;
  value: string;
  icon: string;
  onUpload: (data: string) => void;
  height?: string;
}> = ({ label, value, icon, onUpload, height = "h-48" }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => onUpload(reader.result as string);
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("No se pudo acceder a la cámara.");
      setShowCamera(false);
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    onUpload(canvas.toDataURL('image/jpeg'));
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setShowCamera(false);
  };

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-slate-700 flex items-center gap-2 text-xs uppercase">
        <i className={`fas ${icon}`}></i> {label}
      </h3>
      <div 
        onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); setDragActive(false); if(e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
        className={`relative group border-2 border-dashed rounded-xl ${height} flex flex-col items-center justify-center transition-all overflow-hidden bg-slate-50 ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300'
        }`}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="absolute inset-0 w-full h-full object-contain p-2" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button onClick={() => onUpload('')} className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"><i className="fas fa-trash"></i></button>
              <button onClick={() => fileInputRef.current?.click()} className="bg-white text-slate-900 px-3 py-1 rounded font-bold text-xs shadow-lg">Cambiar</button>
            </div>
          </>
        ) : showCamera ? (
          <div className="absolute inset-0 bg-black flex flex-col">
            <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover" />
            <div className="p-2 flex justify-between bg-black/80">
              <button onClick={stopCamera} className="text-white text-xs">Cerrar</button>
              <button onClick={takePhoto} className="bg-white text-black px-4 py-1 rounded-full text-xs font-bold">Capturar</button>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <i className={`fas ${icon} text-slate-300 text-2xl mb-2`}></i>
            <p className="text-[10px] text-slate-400 mb-2">JPG, PNG o Cámara</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => fileInputRef.current?.click()} className="text-[10px] bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-md transition-colors font-semibold text-slate-600">Archivo</button>
              <button onClick={startCamera} className="text-[10px] bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-md transition-colors font-semibold text-slate-600">Cámara</button>
            </div>
          </div>
        )}
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>
    </div>
  );
};

const TechnicalSection: React.FC<Props> = ({ form, updateForm }) => {
  const updateCoord = (index: number, field: keyof Coordinate, value: string) => {
    const newCoords = [...form.coordenadasLote];
    newCoords[index] = { ...newCoords[index], [field]: value };
    updateForm({ coordenadasLote: newCoords });
  };

  const addCoord = () => {
    const newId = `P${String(form.coordenadasLote.length + 1).padStart(2, '0')}`;
    updateForm({ coordenadasLote: [...form.coordenadasLote, { id: newId, x: '', y: '' }] });
  };

  const removeCoord = (index: number) => {
    if (form.coordenadasLote.length <= 1) return;
    updateForm({ coordenadasLote: form.coordenadasLote.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold border-b pb-2 mb-4 text-slate-800 flex items-center gap-2">
        <i className="fas fa-map-marked-alt text-blue-600"></i> 3. Datos Técnicos y Gráficos
      </h2>
      
      {/* INITIAL GRAPHIC DATA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ImageUploader 
          label="Fotomosaico de la Manzana" 
          icon="fa-map" 
          value={form.fotomosaico} 
          onUpload={v => updateForm({ fotomosaico: v })} 
        />
        <ImageUploader 
          label="Levantamiento Estudio Morfológico" 
          icon="fa-draw-polygon" 
          value={form.estudioMorfologico} 
          onUpload={v => updateForm({ estudioMorfologico: v })} 
        />
        <ImageUploader 
          label="Tipologías de Implantaciones" 
          icon="fa-th" 
          value={form.tipoImplantaciones} 
          onUpload={v => updateForm({ tipoImplantaciones: v })} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {/* GEOREFERENCIA */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 uppercase text-xs tracking-wider">
             <i className="fas fa-location-crosshairs text-blue-500"></i> Georeferencia de la Manzana
          </h3>
          <div className="grid grid-cols-1 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Fecha de la Fotografía</label>
              <input type="date" value={form.georeferencia.fecha} onChange={e => updateForm({ georeferencia: { ...form.georeferencia, fecha: e.target.value }})} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Equipo o Fuente de la Fotografía</label>
              <input type="text" value={form.georeferencia.equipo} onChange={e => updateForm({ georeferencia: { ...form.georeferencia, equipo: e.target.value }})} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Drone DJI / IGM" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Sistema de Coordenadas</label>
              <input type="text" value={form.georeferencia.sistema} onChange={e => updateForm({ georeferencia: { ...form.georeferencia, sistema: e.target.value }})} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </div>

        {/* LOTE COORDINATES */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col shadow-sm">
           <div className="flex justify-between items-center mb-4 border-b pb-2">
             <h4 className="text-[11px] font-black uppercase text-slate-600">Cuadro de Coordenadas del Lote (UTM)</h4>
             <button onClick={addCoord} className="text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-bold transition-colors">
               <i className="fas fa-plus mr-1"></i> Agregar Punto
             </button>
           </div>
           <div className="max-h-64 overflow-y-auto custom-scrollbar">
             <table className="w-full text-sm">
               <thead className="bg-slate-100 sticky top-0">
                 <tr>
                   <th className="border p-2 w-14 text-center text-[10px] uppercase text-slate-500">Punto</th>
                   <th className="border p-2 text-left text-[10px] uppercase text-slate-500">X (Este)</th>
                   <th className="border p-2 text-left text-[10px] uppercase text-slate-500">Y (Norte)</th>
                   <th className="border p-2 w-10"></th>
                 </tr>
               </thead>
               <tbody>
                 {form.coordenadasLote.map((c, i) => (
                   <tr key={i} className="hover:bg-slate-50 transition-colors">
                     <td className="border p-1 text-center bg-slate-50"><input type="text" value={c.id} onChange={e => updateCoord(i, 'id', e.target.value)} className="w-full text-center outline-none bg-transparent font-bold text-xs" /></td>
                     <td className="border p-1"><input type="text" value={c.x} onChange={e => updateCoord(i, 'x', e.target.value)} className="w-full outline-none px-2 text-xs" placeholder="000000.00" /></td>
                     <td className="border p-1"><input type="text" value={c.y} onChange={e => updateCoord(i, 'y', e.target.value)} className="w-full outline-none px-2 text-xs" placeholder="0000000.00" /></td>
                     <td className="border p-1 text-center">
                       <button onClick={() => removeCoord(i)} className="text-red-400 hover:text-red-600 p-1"><i className="fas fa-trash-alt"></i></button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>

      {/* NEW REGISTRO FOTOGRÁFICO SECTION */}
      <div className="mt-12 space-y-6">
        <h2 className="text-xl font-bold border-b pb-2 mb-4 text-slate-800 flex items-center gap-2">
          <i className="fas fa-camera-retro text-emerald-600"></i> Registro Fotográfico Adicional
        </h2>

        <div className="space-y-4">
          <div className="bg-slate-900 text-white text-[11px] font-bold p-2 uppercase tracking-widest text-center rounded-t-lg">
            Registro Fotográfico de la Manzana
          </div>
          <ImageUploader 
            label="Subir Registro de Manzana" 
            icon="fa-images" 
            value={form.registroFotograficoManzana} 
            onUpload={v => updateForm({ registroFotograficoManzana: v })}
            height="h-64"
          />
          <div className="bg-slate-800 text-white text-[10px] p-1 px-3 flex items-center gap-4">
            <span className="font-bold">COMENTARIO:</span>
            <input 
              type="text" 
              value={form.comentarioRegistroManzana}
              onChange={e => updateForm({ comentarioRegistroManzana: e.target.value })}
              className="flex-1 bg-transparent border-none outline-none text-slate-200 text-xs py-1"
              placeholder="Describa la fotografía de la manzana..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          {/* Lote en estudio */}
          <div className="space-y-4">
            <div className="bg-slate-900 text-white text-[10px] font-bold p-2 uppercase text-center rounded-t-lg">
              Lote en Estudio con Retiros y Colindantes
            </div>
            <ImageUploader 
              label="Vista de Retiros y Colindantes" 
              icon="fa-ruler-combined" 
              value={form.loteRetirosColindantes} 
              onUpload={v => updateForm({ loteRetirosColindantes: v })}
            />
            <div className="bg-slate-800 text-white text-[10px] p-1 px-3 flex items-center gap-2">
              <span className="font-bold">COMENTARIO:</span>
              <input 
                type="text" 
                value={form.comentarioLoteRetiros}
                onChange={e => updateForm({ comentarioLoteRetiros: e.target.value })}
                className="flex-1 bg-transparent border-none outline-none text-slate-200 text-xs py-1"
                placeholder="..."
              />
            </div>
          </div>

          {/* Fotografía del predio */}
          <div className="space-y-4">
            <div className="bg-slate-900 text-white text-[10px] font-bold p-2 uppercase text-center rounded-t-lg">
              Fotografía del Predio y sus Colindantes
            </div>
            <ImageUploader 
              label="Fotografía de Fachada / Entorno" 
              icon="fa-home" 
              value={form.fotografiaPredioColindantes} 
              onUpload={v => updateForm({ fotografiaPredioColindantes: v })}
            />
            <div className="bg-slate-800 text-white text-[10px] p-1 px-3 flex items-center gap-2">
              <span className="font-bold">COMENTARIO:</span>
              <input 
                type="text" 
                value={form.comentarioFotografiaPredio}
                onChange={e => updateForm({ comentarioFotografiaPredio: e.target.value })}
                className="flex-1 bg-transparent border-none outline-none text-slate-200 text-xs py-1"
                placeholder="..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8">
        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase text-[10px] tracking-widest">Comentario Técnico de la Sección</label>
        <textarea 
          rows={3} 
          value={form.comentarioTecnico} 
          onChange={e => updateForm({ comentarioTecnico: e.target.value })}
          className="w-full border rounded-xl p-4 text-sm bg-slate-50 outline-none border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="Ingrese cualquier observación técnica adicional sobre el levantamiento o los registros fotográficos..."
        ></textarea>
      </div>
    </div>
  );
};

export default TechnicalSection;
