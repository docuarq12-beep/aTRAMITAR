
import { GoogleGenAI, Type } from '@google/genai';
import React, { useRef, useState } from 'react';
import { FormState } from '../types';

interface Props {
  onDataExtracted: (data: Partial<FormState>) => void;
  onOpenIAStudy: () => void;
}

const GeminiHelper: React.FC<Props> = ({ onDataExtracted, onOpenIAStudy }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const proposalSchema = {
    type: Type.OBJECT,
    properties: {
      areaTerreno: { type: Type.STRING },
      areaEdificable: { type: Type.STRING },
      proyecto: {
        type: Type.OBJECT,
        properties: {
          cos: { type: Type.STRING },
          cosTotal: { type: Type.STRING },
          numPisos: { type: Type.STRING },
          implantacion: { type: Type.STRING },
          retiros: {
            type: Type.OBJECT,
            properties: {
              f: { type: Type.STRING },
              l: { type: Type.STRING },
              p: { type: Type.STRING },
            }
          }
        }
      },
      zonificacion: {
        type: Type.OBJECT,
        properties: {
          cos: { type: Type.STRING },
          cosTotal: { type: Type.STRING },
          numPisos: { type: Type.STRING },
          implantacion: { type: Type.STRING },
          retiros: {
            type: Type.OBJECT,
            properties: {
              f: { type: Type.STRING },
              l: { type: Type.STRING },
              p: { type: Type.STRING },
            }
          }
        }
      },
      observacion: { type: Type.STRING },
      validacion: { type: Type.STRING },
      comentario: { type: Type.STRING }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const base64Data = await fileToBase64(file);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { inlineData: { mimeType: file.type, data: base64Data } },
              { text: `Analiza este IPRUS de Riobamba. REGLAS: 1. No inventar. 2. Sin imágenes. 3. Extraer Clave Catastral, Dirección, Parroquia, Barrio, Manzana, Lote y IFU. Asigna datos técnicos a Zonificación de Propuesta 1.` }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              projectName: { type: Type.STRING },
              calle: { type: Type.STRING },
              interseccion: { type: Type.STRING },
              parroquia: { type: Type.STRING },
              claveCatastral: { type: Type.STRING },
              barrio: { type: Type.STRING },
              manzanaN: { type: Type.STRING },
              loteN: { type: Type.STRING },
              ifuN: { type: Type.STRING },
              fechaExpedicionIFU: { type: Type.STRING },
              areaHistorica: { type: Type.BOOLEAN },
              bienPatrimonio: { type: Type.BOOLEAN },
              propuesta1: proposalSchema
            }
          }
        }
      });
      onDataExtracted(JSON.parse(response.text || '{}'));
      alert("¡IPRUS procesado con éxito!");
    } catch (err) { setError("Error al procesar IPRUS."); }
    finally { setLoading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleMagicFill = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Genera un ejemplo realista de estudio morfológico en Riobamba.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              projectName: { type: Type.STRING },
              calle: { type: Type.STRING },
              interseccion: { type: Type.STRING },
              parroquia: { type: Type.STRING },
              claveCatastral: { type: Type.STRING },
              barrio: { type: Type.STRING },
              manzanaN: { type: Type.STRING },
              loteN: { type: Type.STRING },
              numEdificaciones: { type: Type.INTEGER },
              numLotesManzana: { type: Type.INTEGER },
              propuesta1: proposalSchema,
              propuesta2: proposalSchema
            }
          }
        }
      });
      onDataExtracted(JSON.parse(response.text || '{}'));
    } catch (err) { alert("Error al autocompletar."); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-[10px] text-red-400 font-bold bg-red-900/40 px-3 py-1.5 rounded-full animate-pulse">{error}</span>}
      
      <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf,image/*" onChange={handleFileChange} />
      
      {/* Botón Estudio IA - Destacado */}
      <button 
        onClick={onOpenIAStudy}
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all font-bold text-xs shadow-md border border-indigo-400 active:scale-95 group"
      >
        <i className="fas fa-brain group-hover:rotate-12 transition-transform"></i>
        Estudio IA
      </button>

      {/* Botón Cargar IPRUS */}
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all font-bold text-xs shadow-md border border-emerald-400 active:scale-95"
      >
        <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i>
        {loading ? '...' : 'Cargar IPRUS'}
      </button>

      {/* Botón Autocompletar */}
      <button 
        onClick={handleMagicFill}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all font-bold text-xs shadow-md border border-blue-400 active:scale-95"
      >
        <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
        {loading ? '...' : 'Autocompletar'}
      </button>
    </div>
  );
};

export default GeminiHelper;
