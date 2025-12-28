
import { FormState, Coordinate, Proposal, ProposalValues } from './types';

export const INITIAL_COORDINATE: (id: string) => Coordinate = (id) => ({
  id, x: '', y: ''
});

const EMPTY_VALUES: ProposalValues = {
  cos: '',
  cosTotal: '',
  numPisos: '',
  implantacion: '',
  retiros: { f: '', l: '', p: '' }
};

export const INITIAL_PROPOSAL: Proposal = {
  areaTerreno: '',
  areaEdificable: '',
  proyecto: { ...EMPTY_VALUES },
  zonificacion: { ...EMPTY_VALUES },
  observacion: '',
  validacion: '',
  comentario: '',
  graficoPropuesta: ''
};

export const INITIAL_STATE: FormState = {
  projectName: '',
  date: new Date().toISOString().split('T')[0],
  formNumber: 'FRM-IPRUS-002-01',
  calle: '',
  interseccion: '',
  parroquia: 'Riobamba',
  claveCatastral: '',
  barrio: '',
  manzanaN: '',
  loteN: '',
  fechaExpedicionIFU: '',
  ifuN: '',
  areaHistorica: false,
  bienPatrimonio: false,
  regimenTransitorio: false,
  numRegistroInventario: '',
  numEdificaciones: 0,
  numLotesManzana: 1,
  gradoConsolidacion: 0,
  cumpleConsolidacion: false,
  fotomosaico: '',
  georeferencia: {
    fecha: '',
    equipo: '',
    sistema: 'WGS 84 / UTM Zona 17S'
  },
  coordenadasLote: Array.from({ length: 4 }, (_, i) => INITIAL_COORDINATE(`P0${i+1}`)),
  estudioMorfologico: '',
  tipoImplantaciones: '',
  registroFotograficoManzana: '',
  comentarioRegistroManzana: '',
  loteRetirosColindantes: '',
  comentarioLoteRetiros: '',
  fotografiaPredioColindantes: '',
  comentarioFotografiaPredio: '',
  comentarioTecnico: '',
  propietario: {
    nombre: '',
    cedula: '',
    direccion: '',
    telefono: '',
    celular: '',
    email: ''
  },
  profesional: {
    nombre: '',
    cedula: '',
    senescyt: '',
    fechaRegistro: '',
    registroMunicipal: '',
    direccion: '',
    telefono: '',
    celular: '',
    email: ''
  },
  propuesta1: JSON.parse(JSON.stringify(INITIAL_PROPOSAL)),
  propuesta2: JSON.parse(JSON.stringify(INITIAL_PROPOSAL)),
  observacionesGenerales: ''
};
