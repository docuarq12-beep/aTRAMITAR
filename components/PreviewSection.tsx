
import React from 'react';
import { FormState } from '../types';

interface Props {
  form: FormState;
}

const PreviewSection: React.FC<Props> = ({ form }) => {
  const LabelValue = ({ l, v, colSpan = "col-span-1" }: { l: string, v: string | number | boolean, colSpan?: string }) => (
    <div className={`flex flex-col border border-slate-300 p-1.5 ${colSpan}`}>
      <span className="text-[8px] font-bold text-slate-500 uppercase leading-tight">{l}</span>
      <span className="text-[10px] font-medium text-slate-900 min-h-[14px]">
        {typeof v === 'boolean' ? (v ? 'SÍ' : 'NO') : (v || '—')}
      </span>
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-slate-800 text-white text-[10px] font-bold p-1 uppercase tracking-wider text-center my-1 print:my-0.5">
      {title}
    </div>
  );

  const CheckCell = ({ checked }: { checked: boolean }) => (
    <div className="w-4 h-4 border border-slate-900 flex items-center justify-center font-bold text-[9px]">
      {checked ? 'X' : ''}
    </div>
  );

  const ImageBox = ({ src, label, h = "min-h-[120px]" }: { src: string, label: string, h?: string }) => (
    <div className={`flex flex-col border border-slate-900 ${h}`}>
       <div className="bg-slate-100 text-[8px] font-bold p-0.5 text-center border-b border-slate-900 uppercase">
         {label}
       </div>
       <div className="flex-1 flex items-center justify-center p-1 bg-white overflow-hidden">
         {src ? <img src={src} alt={label} className="max-w-full max-h-full object-contain" /> : <div className="text-slate-300 text-[7px] italic">No cargada</div>}
       </div>
    </div>
  );

  return (
    <div className="max-w-[21cm] mx-auto bg-white p-6 sm:p-10 border shadow-md print:shadow-none print:p-0 text-slate-900" style={{ minHeight: '29.7cm' }}>
      
      {/* HEADER SECTION */}
      <div className="flex border-2 border-slate-900 mb-2">
        <div className="w-1/4 border-r-2 border-slate-900 p-2 flex items-center justify-center">
          <img src="https://picsum.photos/id/191/120/120" alt="GAD Riobamba" className="max-h-16" />
        </div>
        <div className="w-3/4 p-2 text-center flex flex-col justify-center">
          <h1 className="font-bold text-[12px] leading-tight uppercase">Gobierno Autónomo Descentralizado Municipal Riobamba</h1>
          <h2 className="font-bold text-[11px] uppercase underline mt-1">Formulario de Modificación de Adosamientos y Retiros Urbanos</h2>
          <div className="flex justify-between mt-2 text-[9px] font-bold px-4">
            <span>HOJA 1 DE 2</span>
            <span>GESTIÓN DE ORDENAMIENTO TERRITORIAL</span>
            <span>{form.formNumber}</span>
          </div>
        </div>
      </div>

      {/* GENERAL INFO */}
      <div className="grid grid-cols-4 border-t border-l border-slate-900">
        <LabelValue l="Nombre del Proyecto" v={form.projectName} colSpan="col-span-2" />
        <LabelValue l="Fecha de Emisión" v={form.date} />
        <LabelValue l="Código de Formulario" v={form.formNumber} />
      </div>

      {/* SECTION 1: IDENTIFICACIÓN */}
      <SectionHeader title="1. Identificación del Predio y Ubicación" />
      <div className="grid grid-cols-4 border-t border-l border-slate-900">
        <LabelValue l="Calle Principal" v={form.calle} colSpan="col-span-2" />
        <LabelValue l="Intersección" v={form.interseccion} colSpan="col-span-2" />
        <LabelValue l="Parroquia" v={form.parroquia} />
        <LabelValue l="Barrio / Urbanización" v={form.barrio} />
        <LabelValue l="Clave Catastral" v={form.claveCatastral} />
        <LabelValue l="IFU N°" v={form.ifuN} />
        <LabelValue l="Manzana N°" v={form.manzanaN} />
        <LabelValue l="Lote N°" v={form.loteN} />
      </div>

      {/* HISTORIC AREAS TABLE */}
      <div className="border-x border-slate-900 bg-slate-900 text-white text-[9px] font-bold uppercase py-0.5 px-2 text-center">
        Áreas Históricas
      </div>
      <div className="border border-slate-900 text-[8px]">
        <div className="grid grid-cols-12 border-b border-slate-900 items-stretch">
          <div className="col-span-3 p-1 flex items-center border-r border-slate-900">Área Histórica</div>
          <div className="col-span-1 border-r border-slate-900 flex flex-col items-center justify-center">
            <span className="text-[7px] font-bold">Si</span>
            <CheckCell checked={form.areaHistorica} />
          </div>
          <div className="col-span-1 border-r border-slate-900 flex flex-col items-center justify-center">
            <span className="text-[7px] font-bold">No</span>
            <CheckCell checked={!form.areaHistorica} />
          </div>
          <div className="col-span-4 p-1 flex items-center border-r border-slate-900 leading-tight">
            Bien establecido en el Régimen Transitorio de Protección
          </div>
          <div className="col-span-1 border-r border-slate-900 flex flex-col items-center justify-center">
            <span className="text-[7px] font-bold">Si</span>
            <CheckCell checked={form.regimenTransitorio} />
          </div>
          <div className="col-span-1 border-r border-slate-900 flex flex-col items-center justify-center">
            <span className="text-[7px] font-bold">No</span>
            <CheckCell checked={!form.regimenTransitorio} />
          </div>
          <div className="col-span-1 flex items-center justify-center bg-slate-50 text-center font-bold px-1">
            N° Registro
          </div>
        </div>
        <div className="grid grid-cols-12 items-stretch min-h-[20px]">
          <div className="col-span-3 p-1 flex items-center border-r border-slate-900 leading-tight">
            Bien del Patrimonio Nacional Cultural
          </div>
          <div className="col-span-1 border-r border-slate-900 flex flex-col items-center justify-center"><CheckCell checked={form.bienPatrimonio} /></div>
          <div className="col-span-1 border-r border-slate-900 flex flex-col items-center justify-center"><CheckCell checked={!form.bienPatrimonio} /></div>
          <div className="col-span-4 p-1 flex items-center border-r border-slate-900"></div>
          <div className="col-span-1 border-r border-slate-900"></div>
          <div className="col-span-1 border-r border-slate-900"></div>
          <div className="col-span-1 p-1 text-[8px] flex items-center justify-center font-bold">
            {form.numRegistroInventario}
          </div>
        </div>
      </div>

      {/* SECTION 2: CONSOLIDACIÓN */}
      <SectionHeader title="2. Determinación del Grado de Consolidación" />
      <div className="grid grid-cols-6 border-t border-l border-slate-900">
        <div className="col-span-3 border border-slate-300 p-2 flex flex-col justify-center bg-slate-50">
           <div className="flex items-center gap-4">
             <span className="text-[9px] font-mono">C = ({form.numEdificaciones} * 100) / {form.numLotesManzana}</span>
             <span className="text-xs font-black text-slate-800">C = {form.gradoConsolidacion}%</span>
           </div>
        </div>
        <div className="col-span-1 border border-slate-300 p-1 text-center">
          <span className="text-[7px] font-bold text-slate-500 block uppercase"># Edif</span>
          <span className="text-[9px] font-bold">{form.numEdificaciones}</span>
        </div>
        <div className="col-span-1 border border-slate-300 p-1 text-center">
          <span className="text-[7px] font-bold text-slate-500 block uppercase"># Lotes</span>
          <span className="text-[9px] font-bold">{form.numLotesManzana}</span>
        </div>
        <div className={`col-span-1 border border-slate-300 p-1 flex items-center justify-center font-bold text-[9px] ${form.cumpleConsolidacion ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {form.cumpleConsolidacion ? 'APLICA' : 'NO APLICA'}
        </div>
      </div>

      {/* SECTION 3: DATOS TÉCNICOS */}
      <SectionHeader title="3. DATOS TÉCNICOS Y ESTUDIO MORFOLÓGICO" />
      <div className="border border-slate-900 grid grid-cols-2">
        <ImageBox label="Fotomosaico de la Manzana" src={form.fotomosaico} h="min-h-[140px]" />
        <div className="flex flex-col border-l border-slate-900">
          <div className="bg-slate-100 text-[8px] font-bold p-1 text-center border-b border-slate-900 uppercase">
            Georeferencia y Coordenadas Lote
          </div>
          <div className="p-2 space-y-1 text-[8px]">
             <div className="grid grid-cols-2 gap-x-2 border-b border-slate-300 pb-0.5">
               <span><strong>FECHA:</strong> {form.georeferencia.fecha}</span>
               <span><strong>EQUIPO:</strong> {form.georeferencia.equipo}</span>
             </div>
             <div className="pt-0.5 overflow-hidden">
               <table className="w-full text-[7px] border-collapse border border-slate-900">
                 <thead><tr className="bg-slate-50 border-b border-slate-900"><th>P</th><th className="border-l border-slate-900">X</th><th className="border-l border-slate-900">Y</th></tr></thead>
                 <tbody>
                   {form.coordenadasLote.slice(0, 8).map((c, i) => (
                     <tr key={i} className="border-b border-slate-400 text-center">
                       <td className="font-bold border-r border-slate-900 bg-slate-50">{c.id}</td>
                       <td className="border-r border-slate-900">{c.x || '—'}</td>
                       <td>{c.y || '—'}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>

      <div className="border-x border-b border-slate-900 grid grid-cols-2">
         <ImageBox label="Estudio Morfológico" src={form.estudioMorfologico} h="min-h-[120px]" />
         <ImageBox label="Tipología de Implantaciones" src={form.tipoImplantaciones} h="min-h-[120px]" />
      </div>

      {/* NEW SECTION 3b: REGISTRO FOTOGRÁFICO DE LA MANZANA */}
      <div className="mt-2 border border-slate-900 flex flex-col">
        <div className="bg-slate-800 text-white text-[9px] font-bold p-1 uppercase text-center">
          Registro Fotográfico de la Manzana
        </div>
        <div className="h-[140px] flex items-center justify-center bg-white p-1">
          {form.registroFotograficoManzana ? (
            <img src={form.registroFotograficoManzana} alt="Manzana" className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="text-slate-300 text-[8px] italic">No cargada</div>
          )}
        </div>
        <div className="bg-slate-900 text-white text-[8px] p-0.5 px-2 flex">
          <span className="font-bold mr-2 uppercase">COMENTARIO:</span>
          <span className="italic truncate">{form.comentarioRegistroManzana || "Sin comentario."}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 border-x border-b border-slate-900">
        <div className="flex flex-col border-r border-slate-900">
           <div className="bg-slate-800 text-white text-[8px] font-bold p-1 uppercase text-center">
             Lote con Retiros y Colindantes
           </div>
           <div className="h-[100px] flex items-center justify-center p-1">
             {form.loteRetirosColindantes ? <img src={form.loteRetirosColindantes} className="max-w-full max-h-full object-contain" /> : <div className="text-slate-300 text-[7px] italic">—</div>}
           </div>
           <div className="bg-slate-900 text-white text-[7px] p-0.5 px-2 flex">
             <span className="font-bold mr-2">COMENTARIO:</span>
             <span className="italic truncate">{form.comentarioLoteRetiros}</span>
           </div>
        </div>
        <div className="flex flex-col">
           <div className="bg-slate-800 text-white text-[8px] font-bold p-1 uppercase text-center">
             Fotografía del Predio y Entorno
           </div>
           <div className="h-[100px] flex items-center justify-center p-1">
             {form.fotografiaPredioColindantes ? <img src={form.fotografiaPredioColindantes} className="max-w-full max-h-full object-contain" /> : <div className="text-slate-300 text-[7px] italic">—</div>}
           </div>
           <div className="bg-slate-900 text-white text-[7px] p-0.5 px-2 flex">
             <span className="font-bold mr-2">COMENTARIO:</span>
             <span className="italic truncate">{form.comentarioFotografiaPredio}</span>
           </div>
        </div>
      </div>

      <div className="page-break"></div>

      {/* SECTION 4: RESULTADOS */}
      <SectionHeader title="4. Resultados y Propuestas del Estudio" />
      <div className="border border-slate-900">
        <table className="w-full text-[9px] border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-900">
              <th className="border-r border-slate-900 p-1 w-[30%]">PARÁMETRO</th>
              <th className="border-r border-slate-900 p-1 w-[35%]">PROPUESTA N° 1</th>
              <th className="p-1 w-[35%]">PROPUESTA N° 2</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-400">
              <td className="p-1 font-bold bg-slate-50 border-r border-slate-900">Área Terreno / Edificable</td>
              <td className="p-1 text-center border-r border-slate-900">{form.propuesta1.areaTerreno} / {form.propuesta1.areaEdificable}</td>
              <td className="p-1 text-center">{form.propuesta2.areaTerreno} / {form.propuesta2.areaEdificable}</td>
            </tr>
            <tr className="border-b border-slate-400">
              <td className="p-1 font-bold bg-slate-50 border-r border-slate-900">COS PB / TOTAL</td>
              <td className="p-1 text-center border-r border-slate-900">{form.propuesta1.cos} / {form.propuesta1.cosTotal}</td>
              <td className="p-1 text-center">{form.propuesta2.cos} / {form.propuesta2.cosTotal}</td>
            </tr>
            <tr className="border-b border-slate-400">
              <td className="p-1 font-bold bg-slate-50 border-r border-slate-900">Retiros (F-L-P)</td>
              <td className="p-1 text-center border-r border-slate-900 font-bold">{form.propuesta1.retiros.f} - {form.propuesta1.retiros.l} - {form.propuesta1.retiros.p}</td>
              <td className="p-1 text-center font-bold">{form.propuesta2.retiros.f} - {form.propuesta2.retiros.l} - {form.propuesta2.retiros.p}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FOOTER INFO */}
      <div className="mt-2 border border-slate-900 p-2 min-h-[40px]">
         <p className="text-[8px] font-bold uppercase mb-0.5">Comentario Técnico General:</p>
         <p className="text-[9px] leading-tight text-slate-700 italic">{form.comentarioTecnico || "Sin comentarios."}</p>
      </div>

      {/* SIGNATURE SECTION */}
      <div className="mt-8 grid grid-cols-2 gap-10">
        <div className="border-t border-slate-900 pt-2 text-center flex flex-col">
           <p className="text-[10px] font-bold uppercase">{form.propietario.nombre || "Firma Propietario"}</p>
           <p className="text-[8px]">C.I. {form.propietario.cedula}</p>
           <p className="text-[8px] uppercase mt-1">PROPIETARIO / REP. LEGAL</p>
        </div>
        <div className="border-t border-slate-900 pt-2 text-center flex flex-col">
           <p className="text-[10px] font-bold uppercase">{form.profesional.nombre || "Firma Profesional"}</p>
           <p className="text-[8px]">Reg. SENESCYT: {form.profesional.senescyt}</p>
           <p className="text-[8px] uppercase mt-1">PROFESIONAL RESPONSABLE</p>
        </div>
      </div>

      <div className="mt-12 pt-2 border-t border-slate-200 text-center flex justify-between items-end text-[7px] text-slate-400 uppercase">
        <div>GAD Municipal Riobamba - Gestión Territorial</div>
        <div className="italic">Generado el {new Date().toLocaleString()}</div>
      </div>
    </div>
  );
};

export default PreviewSection;
