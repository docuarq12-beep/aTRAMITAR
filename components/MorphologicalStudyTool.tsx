
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { FormState } from '../types';

interface Props {
  updateForm: (updates: Partial<FormState>) => void;
}

const MorphologicalStudyTool: React.FC<Props> = ({ updateForm }) => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [analyzedImage, setAnalyzedImage] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(50);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay'>('side-by-side');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string);
      setAnalyzedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async () => {
    if (!originalImage) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = originalImage.split(',')[1];
      
      const prompt = `Rol: Arquitecto Urbanista y Técnico Catastral.
      Tarea: Identificar estructura parcelaria.
      
      IMPORTANTE: Mantener exacto encuadre y escala.
      
      🎯 REGLAS GRÁFICAS (Enfoque Loteamiento):
      1. 🔴 LÍMITE MANZANA: Línea ROJA MUY GRUESA (6px).
      2. 🟨 DIVISIÓN DE LOTES: Líneas AMARILLAS MUY GRUESAS (4px a 5px) y brillantes. Deben ser claramente visibles sobre cualquier fondo.
      3. 🚫 SIN CONSTRUCCIONES: No dibujes edificios ni rellenos. Solo perímetros de lotes.
      4. 🚧 ÁREA VACÍA: El interior de lotes debe ser transparente.
      
      ⚠️ CRITERIO: Sé preciso con las divisiones de muros y cercas visibles. No inventes si no es claro.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: prompt }
          ]
        },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setAnalyzedImage(`data:image/png;base64,${part.inlineData.data}`);
          setViewMode('overlay'); 
          break;
        }
      }
    } catch (error) {
      console.error(error);
      alert("Error en el análisis IA.");
    } finally { setLoading(false); }
  };

  const exportToDXF = async () => {
    if (!originalImage) return;
    setExporting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = originalImage.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: "Extrae los vértices de los lotes identificados en esta manzana. Devuelve un JSON con un array de polígonos, donde cada polígono es un array de puntos [x, y] en coordenadas relativas (0-1000). Solo las líneas de división de lotes y el perímetro de la manzana." }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              lotes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    puntos: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.ARRAY,
                        items: { type: Type.NUMBER }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      const data = JSON.parse(response.text || '{"lotes":[]}');
      
      // Generar contenido DXF simple
      let dxfContent = "0\nSECTION\n2\nENTITIES\n";
      data.lotes.forEach((lote: any) => {
        dxfContent += "0\nLWPOLYLINE\n5\n100\n100\nAcDbEntity\n8\nLOTES_IA\n100\nAcDbPolyline\n90\n" + lote.puntos.length + "\n70\n1\n";
        lote.puntos.forEach((p: number[]) => {
          dxfContent += `10\n${p[0]}\n20\n${p[1]}\n`;
        });
      });
      dxfContent += "0\nENDSEC\n0\nEOF";

      const blob = new Blob([dxfContent], { type: 'application/dxf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Manzana_Loteamiento_${new Date().getTime()}.dxf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Error al exportar a CAD.");
    } finally { setExporting(false); }
  };

  const applyToForm = () => {
    if (analyzedImage) {
      updateForm({ estudioMorfologico: analyzedImage });
      alert("¡Loteamiento vinculado al formulario!");
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-500">
      {/* Header Informativo */}
      <div className="bg-slate-900 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <h2 className="text-xl font-black flex items-center gap-3 uppercase tracking-tight">
            <i className="fas fa-draw-polygon text-yellow-400"></i>
            Loteamiento IA con Exportación CAD
          </h2>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-1">Líneas reforzadas y vectorización para AutoCAD</p>
        </div>
        
        {analyzedImage && (
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button 
              onClick={() => setViewMode('side-by-side')}
              className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${viewMode === 'side-by-side' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Paralelo
            </button>
            <button 
              onClick={() => setViewMode('overlay')}
              className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${viewMode === 'overlay' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Superpuesto
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="flex flex-col gap-6">
          {!analyzedImage || viewMode === 'side-by-side' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Foto Original */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Captura Original</span>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center min-h-[400px] cursor-pointer transition-all ${
                    originalImage ? 'border-yellow-500 bg-white shadow-md' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {originalImage ? (
                    <img src={originalImage} alt="Original" className="w-full h-full object-contain p-4 max-h-[400px]" />
                  ) : (
                    <div className="text-center p-8 group">
                      <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-100 transition-colors">
                        <i className="fas fa-map text-slate-400 text-2xl group-hover:text-yellow-600 transition-colors"></i>
                      </div>
                      <p className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Subir Imagen de Manzana</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>

              {/* Resultado IA */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Plano de Loteamiento (Líneas Gruesas)</span>
                <div className="border-2 border-slate-900 rounded-2xl min-h-[400px] bg-slate-800 flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
                  {analyzedImage ? (
                    <img src={analyzedImage} alt="Analizado" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center p-8 opacity-30 text-white">
                      {loading ? (
                        <div className="space-y-4">
                          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Delineando Lotes...</p>
                        </div>
                      ) : (
                        <>
                          <i className="fas fa-layer-group text-5xl mb-4"></i>
                          <p className="text-[10px] font-black uppercase tracking-widest">Esperando Procesamiento</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* MODO SUPERPOSICIÓN */
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-6 shadow-inner">
                <div className="flex-1 w-full space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                      <i className="fas fa-adjust text-yellow-500"></i>
                      Transparencia del Loteamiento: <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">{opacity}%</span>
                    </label>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={opacity} 
                    onChange={(e) => setOpacity(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                </div>
              </div>

              <div className="relative w-full aspect-square md:aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900">
                <img 
                  src={originalImage!} 
                  alt="Original" 
                  className="absolute inset-0 w-full h-full object-contain z-0" 
                />
                <img 
                  src={analyzedImage!} 
                  alt="Análisis" 
                  style={{ opacity: opacity / 100 }}
                  className="absolute inset-0 w-full h-full object-contain z-10 transition-opacity duration-150" 
                />
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-slate-100">
            {!analyzedImage ? (
              <button 
                disabled={!originalImage || loading}
                onClick={runAnalysis}
                className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg transition-all ${
                  !originalImage || loading 
                  ? 'bg-slate-200 text-slate-400' 
                  : 'bg-yellow-500 text-slate-900 hover:bg-yellow-400 active:scale-95 border-b-4 border-yellow-700'
                }`}
              >
                {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
                {loading ? 'Delineando...' : 'Generar Plano de Lotes'}
              </button>
            ) : (
              <>
                <button 
                  onClick={() => { setOriginalImage(null); setAnalyzedImage(null); }}
                  className="px-6 py-4 bg-slate-100 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all border border-slate-200"
                >
                  <i className="fas fa-redo mr-2"></i> Nuevo
                </button>
                <button 
                  onClick={exportToDXF}
                  disabled={exporting}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg hover:bg-slate-800 active:scale-95 border-b-4 border-slate-600 transition-all text-xs"
                >
                  {exporting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-file-export text-blue-400"></i>}
                  {exporting ? 'Extrayendo...' : 'Exportar a AutoCAD (.DXF)'}
                </button>
                <button 
                  onClick={applyToForm}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg hover:bg-emerald-700 active:scale-95 border-b-4 border-emerald-900 transition-all text-xs"
                >
                  <i className="fas fa-check-double"></i> Vincular a Informe
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Simbología Reforzada */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
        <h4 className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Leyenda Técnica de Loteamiento</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-white p-2 rounded border border-slate-100">
             <div className="w-8 h-2 rounded bg-red-600 shadow-sm"></div>
             <div className="flex flex-col">
               <span className="text-[9px] font-black text-slate-800 uppercase leading-none">Límite de Manzana</span>
               <span className="text-[8px] text-slate-400 uppercase font-bold">Línea Roja Reforzada</span>
             </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded border border-slate-100">
             <div className="w-8 h-2 rounded bg-yellow-400 shadow-sm"></div>
             <div className="flex flex-col">
               <span className="text-[9px] font-black text-slate-800 uppercase leading-none">División de Lotes</span>
               <span className="text-[8px] text-slate-400 uppercase font-bold">Línea Amarilla Gruesa</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MorphologicalStudyTool;
