
export interface Coordinate {
  id: string;
  x: string;
  y: string;
}

export interface Proposal {
  areaTerreno: string;
  areaEdificable: string;
  cos: string;
  cosTotal: string;
  numPisos: string;
  implantacion: string;
  retiros: {
    f: string; // frontal
    l: string; // lateral
    p: string; // posterior
  };
  observacion: string;
  validacion: string;
}

export interface FormState {
  projectName: string;
  date: string;
  formNumber: string;
  // Ubicación
  calle: string;
  interseccion: string;
  parroquia: string;
  claveCatastral: string;
  barrio: string;
  manzanaN: string;
  loteN: string;
  fechaExpedicionIFU: string;
  ifuN: string;
  // Áreas Históricas
  areaHistorica: boolean;
  bienPatrimonio: boolean;
  regimenTransitorio: boolean;
  numRegistroInventario: string;
  // Consolidación
  numEdificaciones: number;
  numLotesManzana: number;
  gradoConsolidacion: number;
  cumpleConsolidacion: boolean;
  // Datos Técnicos
  fotomosaico: string; // Base64 image
  georeferencia: {
    fecha: string;
    equipo: string;
    sistema: string;
  };
  coordenadasLote: Coordinate[];
  estudioMorfologico: string; // Base64 image
  tipoImplantaciones: string; // Base64 image
  // Registro Fotográfico
  registroFotograficoManzana: string; // Base64
  comentarioRegistroManzana: string;
  loteRetirosColindantes: string; // Base64
  comentarioLoteRetiros: string;
  fotografiaPredioColindantes: string; // Base64
  comentarioFotografiaPredio: string;
  
  comentarioTecnico: string;
  // Propietario y Profesional
  propietario: {
    nombre: string;
    cedula: string;
    direccion: string;
    telefono: string;
    celular: string;
    email: string;
  };
  profesional: {
    nombre: string;
    cedula: string;
    senescyt: string;
    fechaRegistro: string;
    registroMunicipal: string;
    direccion: string;
    telefono: string;
    celular: string;
    email: string;
  };
  propuesta1: Proposal;
  propuesta2: Proposal;
  observacionesGenerales: string;
}
