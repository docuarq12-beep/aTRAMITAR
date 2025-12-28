
import React, { useRef, useState } from 'react';
import { FormState, Coordinate } from '../types';

interface Props {
  form: FormState;
  updateForm: (u: Partial<FormState>) => void;
}

const ImageUploader: React.FC<{
  label: string;
  value: string | string[];
  icon: string;
  onUpload: (data: any) => void;
  height?: string;
  isMultiple?: boolean;
}> = ({ label, value, icon, onUpload, height = "h-48", isMultiple = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const images = Array.isArray(value) ? value : (value ? [value] : []);

  const handleFiles = (files: FileList) => {
    const fileList = Array.from(files);
    const readers = fileList.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(results => {
      if (isMultiple) {
        onUpload([...images, ...results]);
      } else {
        onUpload(results[0]);
      }
    });
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
    const dataUrl = canvas.toDataURL('image/jpeg');
    
    if (isMultiple) {
      onUpload([...images, dataUrl]);
    } else {
      onUpload(dataUrl);
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setShowCamera(false);
  };

  const removeImage = (index: number) => {
    if (isMultiple) {
      onUpload(images.filter((_, i) => i !== index));
    } else {
      onUpload('');
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-slate-700 flex items-center gap-2 text-xs uppercase tracking-tight">
        <i className={`fas ${icon} text-blue-500`}></i> {label}
      </h3>
      
      <div 
        onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); setDragActive(false); if(e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files); }}
        className={`relative group border-2 border-dashed rounded-xl ${height} flex flex-col transition-all overflow-hidden bg-slate-50 ${
          dragActive ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-slate-300'
        } ${images.length > 0 && isMultiple ? 'p-4' : 'justify-center items-center'}`}
      >
        {/* Camera overlay */}
        {showCamera && (
          <div className="absolute inset-0 bg-black flex flex-col z-50">
            <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover" />
            <div className="p-4 flex justify-between bg-black/80">
              <button onClick={stopCamera} className="text-white text-xs font-bold uppercase tracking-widest">Cancelar</button>
              <button onClick={takePhoto} className="bg-white text-black px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-400 hover:text-white transition-colors">Capturar</button>
            </div>
          </div>
        )}

        {images.length > 0 ? (
          <div className={`w-full h-full ${isMultiple ? 'overflow-y-auto custom-scrollbar' : ''}`}>
            {isMultiple ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square border rounded-lg overflow-hidden bg-white shadow-sm group/item">
                    <img src={img} alt={`Img ${idx}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(idx)} 
                      className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity shadow-md"
                    >
                      <i className="fas fa-times text-[10px]"></i>
                    </button>
                  </div>
                ))}
                {/* Plus button to add more */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all bg-white/50"
                >
                  <i className="fas fa-plus mb-1"></i>
                  <span className="text-[9px] font-bold uppercase">Añadir</span>
                </button>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <img src={images[0]} alt={label} className="max-w-full max-h-full object-contain p-2" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => removeImage(0)} className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"><i className="fas fa-trash"></i></button>
                  <button onClick={() => fileInputRef.current?.click()} className="bg-white text-slate-900 px-3 py-1 rounded font-bold text-xs shadow-lg">Cambiar</button>
                </div>
              </div>
            )}
            
            {/* Action buttons at bottom for multiple mode */}
            {isMultiple && (
               <div className="absolute bottom-4 left-0 right-0 px-4 flex justify-center gap-2">
                  <button onClick={() => fileInputRef.current?.click()} className="bg-white/90 backdrop-blur text-slate-700 border border-slate-200 px-4 py-1.5 rounded-full text-[10px] font-bold shadow-sm hover:bg-white flex items-center gap-2">
                    <i className="fas fa-folder-open text-blue-500"></i> Archivo
                  </button>
                  <button onClick={startCamera} className="bg-white/90 backdrop-blur text-slate-700 border border-slate-200 px-4 py-1.5 rounded-full text-[10px] font-bold shadow-sm hover:bg-white flex items-center gap-2">
                    <i className="fas fa-camera text-blue-500"></i> Cámara
                  </button>
               </div>
            )}
          </div>
        ) : (
          <div className="text-center p-4">
            <i className={`fas ${icon} text-slate-300 text-3xl mb-3`}></i>
            <p className="text-[10px] text-slate-400 mb-3 font-medium uppercase tracking-wider">JPG, PNG o Cámara</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="text-[10px] bg-slate-200 hover:bg-blue-600 hover:text-white px-5 py-2 rounded-lg transition-all font-bold text-slate-600 shadow-sm uppercase"
              >
                Archivo
              </button>
              <button 
                onClick={startCamera} 
                className="text-[10px] bg-slate-200 hover:bg-blue-600 hover:text-white px-5 py-2 rounded-lg transition-all font-bold text-slate-600 shadow-sm uppercase"
              >
                Cámara
              </button>
            </div>
          </div>
        )}
        <input 
          ref={fileInputRef} 
          type="file" 
          multiple={isMultiple} 
          className="hidden" 
          accept="image/*" 
          onChange={e => e.target.files && handleFiles(e.target.files)} 
        />
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
    <div className="space-y-12 animate-in fade-in duration-500">
      <h2 className="text-xl font-black border-b-4 border-blue-600 pb-2 mb-4 text-slate-800 flex items-center gap-2 uppercase tracking-tight">
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
        <h2 className="text-xl font-black border-b-4 border-emerald-600 pb-2 mb-4 text-slate-800 flex items-center gap-2 uppercase tracking-tight">
          <i className="fas fa-camera-retro text-emerald-600"></i> Registro Fotográfico de la Manzana
        </h2>

        <div className="space-y-4">
          <div className="bg-slate-900 text-white text-[11px] font-bold p-3 uppercase tracking-widest text-center rounded-t-xl shadow-lg">
             Subir Registro de Manzana
          </div>
          <ImageUploader 
            label="Galería de Fotos de la Manzana" 
            icon="fa-images" 
            value={form.registroFotograficoManzana} 
            onUpload={v => updateForm({ registroFotograficoManzana: v })}
            height="min-h-[300px]"
            isMultiple={true}
          />
          <div className="bg-slate-800 text-white p-4 rounded-b-xl flex flex-col gap-2 shadow-inner">
            <span className="font-bold text-[10px] uppercase tracking-wider px-1 text-emerald-400">
               <i className="fas fa-comment-alt mr-2"></i> Descripción del Registro de Manzana:
            </span>
            <textarea 
              value={form.comentarioRegistroManzana}
              onChange={e => updateForm({ comentarioRegistroManzana: e.target.value })}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 outline-none text-slate-100 text-sm focus:ring-2 focus:ring-emerald-400 transition-all"
              placeholder="Describa los elementos relevantes observados en las fotografías de la manzana..."
              rows={3}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-8">
          {/* Lote en estudio */}
          <div className="space-y-4 group">
            <div className="bg-slate-900 text-white text-[10px] font-black p-2.5 uppercase text-center rounded-t-lg tracking-widest shadow-md">
              Lote en Estudio: Retiros y Colindantes
            </div>
            <ImageUploader 
              label="Retiros y Colindancias" 
              icon="fa-ruler-combined" 
              value={form.loteRetirosColindantes} 
              onUpload={v => updateForm({ loteRetirosColindantes: v })}
              height="h-64"
              isMultiple={true}
            />
            <div className="bg-slate-800 text-white p-3 rounded-b-lg flex flex-col gap-1.5 shadow-sm">
              <span className="font-bold text-[9px] uppercase tracking-wider px-1 text-emerald-400">Comentario Técnico:</span>
              <textarea 
                value={form.comentarioLoteRetiros}
                onChange={e => updateForm({ comentarioLoteRetiros: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded p-2 outline-none text-slate-100 text-xs focus:ring-1 focus:ring-emerald-400"
                placeholder="Observaciones del lote, retiros frontales, laterales y posteriores..."
                rows={2}
              />
            </div>
          </div>

          {/* Fotografía del predio */}
          <div className="space-y-4 group">
            <div className="bg-slate-900 text-white text-[10px] font-black p-2.5 uppercase text-center rounded-t-lg tracking-widest shadow-md">
              Fotografía del Predio y Fachada
            </div>
            <ImageUploader 
              label="Vistas del Predio" 
              icon="fa-home" 
              value={form.fotografiaPredioColindantes} 
              onUpload={v => updateForm({ fotografiaPredioColindantes: v })}
              height="h-64"
              isMultiple={true}
            />
            <div className="bg-slate-800 text-white p-3 rounded-b-lg flex flex-col gap-1.5 shadow-sm">
              <span className="font-bold text-[9px] uppercase tracking-wider px-1 text-emerald-400">Observaciones de Entorno:</span>
              <textarea 
                value={form.comentarioFotografiaPredio}
                onChange={e => updateForm({ comentarioFotografiaPredio: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded p-2 outline-none text-slate-100 text-xs focus:ring-1 focus:ring-emerald-400"
                placeholder="Análisis de fachada y relación con los predios colindantes inmediatos..."
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8">
        <label className="block text-sm font-black text-slate-700 mb-2 uppercase text-[10px] tracking-widest">Comentario Técnico General de la Sección</label>
        <textarea 
          rows={3} 
          value={form.comentarioTecnico} 
          onChange={e => updateForm({ comentarioTecnico: e.target.value })}
          className="w-full border-2 rounded-xl p-4 text-sm bg-slate-50 outline-none border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
          placeholder="Ingrese cualquier observación técnica adicional sobre el levantamiento o los registros fotográficos consolidados..."
        ></textarea>
      </div>
    </div>
  );
};

export default TechnicalSection;
