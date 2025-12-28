
export interface Coordinate {
  id: string;
  x: string;
  y: string;
}

export interface ProposalValues {
  cos: string;
  cosTotal: string;
  numPisos: string;
  implantacion: string;
  retiros: {
    f: string;
    l: string;
    p: string;
  };
}

export interface Proposal {
  areaTerreno: string;
  areaEdificable: string;
  proyecto: ProposalValues;
  zonificacion: ProposalValues;
  observacion: string;
  validacion: string;
  comentario: string;
  graficoPropuesta: string; // Base64 image
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
  registroFotograficoManzana: string[]; // Changed to Array
  comentarioRegistroManzana: string;
  loteRetirosColindantes: string[]; // Changed to Array
  comentarioLoteRetiros: string;
  fotografiaPredioColindantes: string[]; // Changed to Array
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
    firma: string; // New field for signature
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
    firma: string; // New field for signature
  };
  propuesta1: Proposal;
  propuesta2: Proposal;
  observacionesGenerales: string;
}
