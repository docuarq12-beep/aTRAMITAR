
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { FormState } from '../types';

interface Props {
  onDataExtracted: (data: Partial<FormState>) => void;
}

const GeminiHelper: React.FC<Props> = ({ onDataExtracted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMagicFill = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Actúa como un experto urbanista de Riobamba. Genera un ejemplo realista y coherente de un estudio morfológico para una manzana urbana típica en el centro histórico o alrededores de Riobamba para completar el formulario. Devuelve solo un JSON válido.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              calle: { type: Type.STRING },
              interseccion: { type: Type.STRING },
              parroquia: { type: Type.STRING },
              claveCatastral: { type: Type.STRING },
              barrio: { type: Type.STRING },
              estudioMorfologico: { type: Type.STRING },
              tipoImplantaciones: { type: Type.STRING },
              numEdificaciones: { type: Type.INTEGER },
              numLotesManzana: { type: Type.INTEGER },
              propuesta1: {
                type: Type.OBJECT,
                properties: {
                  areaTerreno: { type: Type.STRING },
                  areaEdificable: { type: Type.STRING },
                  cos: { type: Type.STRING },
                  cosTotal: { type: Type.STRING },
                  numPisos: { type: Type.STRING },
                  implantacion: { type: Type.STRING },
                  observacion: { type: Type.STRING }
                },
                required: ["areaTerreno", "cos"]
              }
            }
          }
        }
      });

      const extractedData = JSON.parse(response.text);
      onDataExtracted(extractedData);
      alert("¡Sugerencias aplicadas con éxito!");
    } catch (err: any) {
      console.error(err);
      setError("Error al conectar con la IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-red-400 text-xs font-bold bg-red-900/20 px-2 py-1 rounded">{error}</span>}
      <button 
        onClick={handleMagicFill}
        disabled={loading}
        className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all font-bold text-sm shadow-md ${
          loading 
          ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
          : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400'
        }`}
      >
        <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
        {loading ? 'Generando...' : 'Llenado Rápido (IA)'}
      </button>
    </div>
  );
};

export default GeminiHelper;
