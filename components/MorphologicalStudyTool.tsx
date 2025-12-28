
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FormState } from '../types';

interface Point {
  x: number;
  y: number;
}

interface Element {
  id: string;
  type: 'lote' | 'casa' | 'manzana' | 'calle' | 'texto';
  points: Point[];
  number?: number;
  textValue?: string;
  rotation?: number;
  labelOffset?: Point; // Added to allow manual placement of numbers
}

interface SnapResult {
  point: Point;
  type: 'vertex' | 'edge' | null;
}

interface Props {
  updateForm: (updates: Partial<FormState>) => void;
}

const MorphologicalStudyTool: React.FC<Props> = ({ updateForm }) => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [showBackground, setShowBackground] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mode, setMode] = useState<'view' | 'draw_lote' | 'draw_casa' | 'draw_manzana' | 'draw_calle' | 'draw_texto' | 'delete' | 'edit'>('view');
  const [elements, setElements] = useState<Element[]>([]);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [draggingPointIdx, setDraggingPointIdx] = useState<number | null>(null);
  const [draggingLabelId, setDraggingLabelId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  const [snapType, setSnapType] = useState<'vertex' | 'edge' | null>(null);
  
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const dragElementStart = useRef<{x: number, y: number, initialPoints: Point[], initialOffset: Point}>({
    x: 0, 
    y: 0, 
    initialPoints: [],
    initialOffset: { x: 0, y: 0 }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const lotesCount = useMemo(() => elements.filter(p => p.type === 'lote').length, [elements]);
  const casasCount = useMemo(() => elements.filter(p => p.type === 'casa').length, [elements]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key.toLowerCase() === 'c' || e.key === 'Enter') {
        if (currentPoints.length >= 2) finishShape();
      } else if (e.key === 'Escape') {
        if (currentPoints.length > 0) {
          setCurrentPoints([]);
        } else {
          setEditingElementId(null);
          setDraggingLabelId(null);
          setScale(1);
          setOffset({ x: 0, y: 0 });
        }
      } else if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (currentPoints.length > 0) {
          setCurrentPoints(prev => prev.slice(0, -1));
        } else if (elements.length > 0) {
          setElements(prev => prev.slice(0, -1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPoints, elements, mode]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    
    let clientX, clientY;
    if (e instanceof MouseEvent || 'clientX' in e) {
      clientX = (e as any).clientX;
      clientY = (e as any).clientY;
    } else {
      clientX = (e as any).touches[0].clientX;
      clientY = (e as any).touches[0].clientY;
    }

    const relX = (clientX - rect.left - offset.x) / scale;
    const relY = (clientY - rect.top - offset.y) / scale;
    return { x: (relX / (rect.width / scale)) * 1000, y: (relY / (rect.height / scale)) * 1000 };
  };

  const getClosestPointOnSegment = (p: Point, a: Point, b: Point): Point => {
    const atob = { x: b.x - a.x, y: b.y - a.y };
    const atop = { x: p.x - a.x, y: p.y - a.y };
    const lenSq = atob.x * atob.x + atob.y * atob.y;
    let dot = (atop.x * atob.x + atop.y * atob.y) / lenSq;
    dot = Math.max(0, Math.min(1, dot));
    return { x: a.x + atob.x * dot, y: a.y + atob.y * dot };
  };

  const findSnapResult = (point: Point): SnapResult => {
    const vertexSnapDist = 18 / scale;
    const edgeSnapDist = 12 / scale;

    for (const el of elements) {
      for (const p of el.points) {
        const dist = Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2));
        if (dist < vertexSnapDist) return { point: p, type: 'vertex' };
      }
    }
    for (const p of currentPoints) {
      const dist = Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2));
      if (dist < vertexSnapDist) return { point: p, type: 'vertex' };
    }

    for (const el of elements) {
      if (el.points.length < 2) continue;
      for (let i = 0; i < el.points.length; i++) {
        const a = el.points[i];
        const b = el.points[(i + 1) % el.points.length];
        if (el.type === 'calle' && i === el.points.length - 1) continue;

        const closest = getClosestPointOnSegment(point, a, b);
        const dist = Math.sqrt(Math.pow(closest.x - point.x, 2) + Math.pow(closest.y - point.y, 2));
        if (dist < edgeSnapDist) return { point: closest, type: 'edge' };
      }
    }

    return { point, type: null };
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string);
      setScale(1);
      setOffset({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!originalImage) return;
    e.preventDefault();
    const zoomFactor = 1.25;
    const direction = e.deltaY > 0 ? 1 / zoomFactor : zoomFactor;
    const newScale = Math.max(0.1, Math.min(scale * direction, 50));

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const newOffsetX = mouseX - (mouseX - offset.x) * (newScale / scale);
      const newOffsetY = mouseY - (mouseY - offset.y) * (newScale / scale);
      setScale(newScale);
      setOffset({ x: newOffsetX, y: newOffsetY });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && mode === 'view')) {
      setIsPanning(true);
      panStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
      return;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
      return;
    }

    const rawPoint = getCoordinates(e);
    const snap = findSnapResult(rawPoint);
    
    setMousePos(snap.point);
    setSnapType(snap.type);

    if (mode === 'edit') {
      if (editingElementId && draggingPointIdx !== null) {
        const point = snap.point;
        if (draggingPointIdx === -1) {
          const dx = point.x - dragElementStart.current.x;
          const dy = point.y - dragElementStart.current.y;
          setElements(prev => prev.map(p => (p.id === editingElementId ? {
            ...p,
            points: dragElementStart.current.initialPoints.map(pt => ({ x: pt.x + dx, y: pt.y + dy }))
          } : p)));
        } else {
          setElements(prev => prev.map(p => (p.id === editingElementId ? {
            ...p,
            points: p.points.map((pt, i) => i === draggingPointIdx ? point : pt)
          } : p)));
        }
      } else if (draggingLabelId) {
        const dx = rawPoint.x - dragElementStart.current.x;
        const dy = rawPoint.y - dragElementStart.current.y;
        setElements(prev => prev.map(p => (p.id === draggingLabelId ? {
          ...p,
          labelOffset: { 
            x: dragElementStart.current.initialOffset.x + dx, 
            y: dragElementStart.current.initialOffset.y + dy 
          }
        } : p)));
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingPointIdx(null);
    setDraggingLabelId(null);
  };

  const handleSvgClick = (e: React.MouseEvent) => {
    if (isPanning) return;
    const point = mousePos;

    if (mode === 'view' || mode === 'delete' || mode === 'edit') return;

    if (mode === 'draw_texto') {
      const text = prompt("Ingrese nombre de Calle / Nomenclatura:");
      if (text) {
        setElements([...elements, {
          id: Math.random().toString(36).substr(2, 9),
          type: 'texto',
          points: [point],
          textValue: text
        }]);
      }
      return;
    }
    setCurrentPoints(prev => [...prev, point]);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPoints.length >= 2) finishShape();
  };

  const finishShape = () => {
    if (currentPoints.length < 2) return;
    const type = mode.replace('draw_', '') as Element['type'];
    const nextNumber = elements.filter(p => p.type === type).length + 1;
    setElements([...elements, {
      id: Math.random().toString(36).substr(2, 9),
      type,
      points: currentPoints,
      number: (type === 'lote' || type === 'casa') ? nextNumber : undefined,
      labelOffset: { x: 0, y: 0 }
    }]);
    setCurrentPoints([]);
  };

  const deleteElement = (id: string) => {
    if (mode === 'delete') setElements(prev => prev.filter(p => p.id !== id));
  };

  const selectElementToEdit = (id: string, e: React.MouseEvent) => {
    if (mode !== 'edit' || isPanning) return;
    setEditingElementId(id);
    const el = elements.find(e => e.id === id);
    if (el) {
      dragElementStart.current = { 
        x: mousePos.x, 
        y: mousePos.y, 
        initialPoints: [...el.points],
        initialOffset: { ...(el.labelOffset || { x: 0, y: 0 }) }
      };
      setDraggingPointIdx(-1);
    }
    if (e.detail === 2 && el && (el.type === 'lote' || el.type === 'casa' || el.type === 'texto')) {
      const val = el.type === 'texto' ? el.textValue : el.number?.toString();
      const newNum = prompt("Editar valor:", val);
      if (newNum !== null) {
        setElements(prev => prev.map(p => p.id === id ? (p.type === 'texto' ? { ...p, textValue: newNum } : { ...p, number: parseInt(newNum) || p.number }) : p));
      }
    }
  };

  const startDraggingLabel = (id: string, e: React.MouseEvent) => {
    if (mode !== 'edit' || isPanning) return;
    e.stopPropagation();
    setDraggingLabelId(id);
    setEditingElementId(id);
    const el = elements.find(e => e.id === id);
    const rawPoint = getCoordinates(e);
    if (el) {
      dragElementStart.current = { 
        x: rawPoint.x, 
        y: rawPoint.y, 
        initialPoints: [...el.points],
        initialOffset: { ...(el.labelOffset || { x: 0, y: 0 }) }
      };
    }
  };

  const calculateCentroid = (points: Point[]): Point => {
    if (points.length === 0) return { x: 0, y: 0 };
    return {
      x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
      y: points.reduce((sum, p) => sum + p.y, 0) / points.length
    };
  };

  const saveToForm = async () => {
    if (!svgRef.current) return;
    setLoading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 2000; canvas.height = 2000;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      if (showBackground && originalImage) {
        const img = new Image(); img.crossOrigin = "anonymous";
        await new Promise(r => { img.onload = r; img.src = originalImage; });
        ctx.drawImage(img, 0, 0, 2000, 2000);
      } else { ctx.fillStyle = "white"; ctx.fillRect(0, 0, 2000, 2000); }
      const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;
      const g = svgClone.querySelector('g#viewport');
      if (g) g.setAttribute('transform', 'translate(0,0) scale(1)');
      const svgData = new XMLSerializer().serializeToString(svgClone);
      const url = URL.createObjectURL(new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' }));
      const svgImg = new Image();
      await new Promise(r => { svgImg.onload = r; svgImg.src = url; });
      ctx.drawImage(svgImg, 0, 0, 2000, 2000); URL.revokeObjectURL(url);
      updateForm({ estudioMorfologico: canvas.toDataURL('image/png') });
      alert("Estudio guardado correctamente.");
      if (isFullscreen) setIsFullscreen(false);
    } catch (err) { alert("Error al exportar."); } finally { setLoading(false); }
  };

  return (
    <div className={`flex flex-col gap-6 bg-slate-100 p-4 rounded-3xl border border-slate-300 shadow-2xl overflow-hidden transition-all duration-300 select-none ${isFullscreen ? 'fixed inset-0 z-[100] rounded-none h-screen w-screen' : 'min-h-[95vh]'}`}>
      
      <div className="bg-slate-900 rounded-2xl p-4 text-white flex flex-wrap items-center justify-between gap-4 shadow-2xl no-print">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-inner"><i className="fas fa-pencil-ruler text-xl"></i></div>
          <div className="hidden sm:block">
            <h2 className="text-lg font-black uppercase tracking-tighter leading-none">Dibujo Morfológico</h2>
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">GAD RIOBAMBA • SNAPPING PRO</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
          <button onClick={() => {setMode('draw_manzana'); setCurrentPoints([]);}} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 ${mode === 'draw_manzana' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><i className="fas fa-square-full"></i> Manzana</button>
          <button onClick={() => {setMode('draw_calle'); setCurrentPoints([]);}} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 ${mode === 'draw_calle' ? 'bg-black text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><i className="fas fa-minus"></i> Ejes</button>
          <button onClick={() => {setMode('draw_lote'); setCurrentPoints([]);}} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 ${mode === 'draw_lote' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><i className="fas fa-vector-square"></i> Lote</button>
          <button onClick={() => {setMode('draw_casa'); setCurrentPoints([]);}} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 ${mode === 'draw_casa' ? 'bg-amber-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><i className="fas fa-house-chimney"></i> Casa</button>
          <button onClick={() => {setMode('draw_texto'); setCurrentPoints([]);}} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 ${mode === 'draw_texto' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><i className="fas fa-font"></i> Nombre</button>
          <div className="w-px h-6 bg-slate-700 mx-1"></div>
          <button onClick={() => setMode('edit')} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 ${mode === 'edit' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><i className="fas fa-mouse-pointer"></i> Editar</button>
          <button onClick={() => setMode('delete')} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 ${mode === 'delete' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><i className="fas fa-trash-alt"></i> Borrar</button>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-all"><i className={isFullscreen ? 'fas fa-compress' : 'fas fa-expand'}></i></button>
          <button onClick={() => setShowBackground(!showBackground)} className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${showBackground ? 'bg-slate-700 text-white' : 'bg-blue-600 text-white shadow-xl'}`}>{showBackground ? 'Fondo On' : 'Fondo Off'}</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        <div 
          className={`flex-1 relative bg-white rounded-[2rem] border-4 border-slate-300 shadow-2xl overflow-hidden min-h-[500px] touch-none ${mode !== 'view' && !isPanning ? 'cursor-none' : 'cursor-default'}`} 
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={() => currentPoints.length >= 2 && finishShape()}
          onContextMenu={handleContextMenu}
        >
          {!originalImage ? (
            <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group bg-slate-50">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform mb-4"><i className="fas fa-upload text-3xl text-blue-500"></i></div>
              <p className="font-black uppercase tracking-widest text-slate-400 text-xs">Cargar Mapa Base</p>
            </div>
          ) : (
            <div 
              className="absolute inset-0 w-full h-full origin-top-left"
              style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
            >
              {showBackground && <img src={originalImage} className="w-full h-full object-contain opacity-90 pointer-events-none" alt="Base" />}
              <svg ref={svgRef} viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full overflow-visible" onClick={handleSvgClick}>
                <defs>
                  <pattern id="hatch-casa-fine" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#78350f" strokeWidth="1.2" /></pattern>
                  <filter id="halo-num" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="0" stdDeviation="1.5" floodOpacity="0.8" floodColor="white"/></filter>
                </defs>

                <g id="viewport">
                  {elements.map((el) => {
                    const centroid = calculateCentroid(el.points);
                    const labelPos = { 
                      x: centroid.x + (el.labelOffset?.x || 0), 
                      y: centroid.y + (el.labelOffset?.y || 0) 
                    };
                    const isSelected = editingElementId === el.id;

                    if (el.type === 'texto') return (
                      <g key={el.id} onClick={(e) => { e.stopPropagation(); deleteElement(el.id); selectElementToEdit(el.id, e); }}>
                        <text x={el.points[0].x} y={el.points[0].y} fill="#000" fontSize="26" fontWeight="1000" textAnchor="middle" paintOrder="stroke" stroke="white" strokeWidth="4" className={`select-none uppercase transition-all ${isSelected ? 'fill-indigo-600 scale-110' : ''}`} style={{ cursor: mode === 'delete' ? 'pointer' : 'move' }}>{el.textValue}</text>
                        {isSelected && <circle cx={el.points[0].x} cy={el.points[0].y} r="8" fill="#10b981" />}
                      </g>
                    );
                    if (el.type === 'calle') return (
                      <polyline key={el.id} points={el.points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" strokeDasharray="12,10" onClick={(e) => { e.stopPropagation(); deleteElement(el.id); selectElementToEdit(el.id, e); }} className="hover:stroke-red-500 cursor-pointer" />
                    );
                    return (
                      <g key={el.id}>
                        <polygon 
                          points={el.points.map(p => `${p.x},${p.y}`).join(' ')} 
                          fill={el.type === 'casa' ? 'url(#hatch-casa-fine)' : 'none'} 
                          stroke={el.type === 'lote' ? '#2563eb' : el.type === 'casa' ? '#78350f' : '#ef4444'} 
                          strokeWidth={el.type === 'manzana' ? '8' : el.type === 'casa' ? '6' : '3'} 
                          onClick={(e) => { e.stopPropagation(); deleteElement(el.id); selectElementToEdit(el.id, e); }}
                          className={`transition-all cursor-pointer ${isSelected ? 'stroke-emerald-500 shadow-xl' : ''}`} 
                        />
                        {(el.type === 'lote' || el.type === 'casa') && (
                          <g 
                            onMouseDown={(e) => startDraggingLabel(el.id, e)}
                            className={mode === 'edit' ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}
                          >
                            <circle cx={labelPos.x} cy={labelPos.y} r="20" fill="white" stroke={el.type === 'lote' ? '#2563eb' : '#78350f'} strokeWidth="4" filter="url(#halo-num)" />
                            <text x={labelPos.x} y={labelPos.y} fill={el.type === 'lote' ? '#2563eb' : '#78350f'} fontSize="24" fontWeight="1000" textAnchor="middle" dominantBaseline="central">{el.number}</text>
                          </g>
                        )}
                        {mode === 'edit' && isSelected && el.points.map((p, idx) => <circle key={idx} cx={p.x} cy={p.y} r={12 / Math.sqrt(scale)} fill="white" stroke="#10b981" strokeWidth={4 / Math.sqrt(scale)} onMouseDown={(e) => { e.stopPropagation(); setDraggingPointIdx(idx); }} className="cursor-crosshair" />)}
                      </g>
                    );
                  })}

                  {currentPoints.length > 0 && <polyline points={currentPoints.map(p => `${p.x},${p.y}`).join(' ') + ` ${mousePos.x},${mousePos.y}`} fill="none" stroke="#3b82f6" strokeWidth={6 / Math.sqrt(scale)} strokeDasharray={`${14/scale},${8/scale}`} pointerEvents="none" />}

                  {mode !== 'view' && !isPanning && (
                    <g pointerEvents="none" className={snapType ? 'animate-pulse' : ''}>
                      <line x1={mousePos.x - 120/scale} y1={mousePos.y} x2={mousePos.x + 120/scale} y2={mousePos.y} stroke={snapType ? "#00ffff" : "#ef4444"} strokeWidth={1/scale} />
                      <line x1={mousePos.x} y1={mousePos.y - 120/scale} x2={mousePos.x} y2={mousePos.y + 120/scale} stroke={snapType ? "#00ffff" : "#ef4444"} strokeWidth={1/scale} />
                      {snapType === 'edge' && (
                        <text x={mousePos.x + 8/scale} y={mousePos.y - 8/scale} fill="#00ffff" fontSize={14/scale} fontWeight="900" paintOrder="stroke" stroke="#000" strokeWidth={2/scale}>ee</text>
                      )}
                    </g>
                  )}
                </g>
              </svg>
            </div>
          )}
        </div>

        <div className={`w-full lg:w-72 space-y-4 flex flex-col ${isFullscreen ? 'bg-slate-50 p-6 shadow-2xl' : ''}`}>
          <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-xl space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-2 text-center">Panel de Precisión</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-600 text-white p-3 rounded-2xl text-center"><p className="text-[7px] font-black uppercase opacity-80">Lotes</p><p className="text-xl font-black">{lotesCount}</p></div>
              <div className="bg-amber-800 text-white p-3 rounded-2xl text-center"><p className="text-[7px] font-black uppercase opacity-80">Casas</p><p className="text-xl font-black">{casasCount}</p></div>
            </div>
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <div className="flex items-center gap-3"><kbd className="bg-white px-1.5 py-0.5 rounded border text-[8px] font-black shadow-sm min-w-[50px] text-center">CTRL+Z</kbd><span className="text-[8px] font-bold text-slate-500 uppercase">Deshacer</span></div>
               <div className="flex items-center gap-3"><div className={`w-4 h-4 rounded-full border-2 ${snapType ? 'bg-cyan-400 border-white animate-ping' : 'bg-slate-200 border-slate-300'}`}></div><span className="text-[8px] font-bold text-slate-500 uppercase">{snapType ? `IMÁN: ${snapType === 'vertex' ? 'VÉRTICE' : 'LÍNEA'}` : 'BUSCANDO SNAP...'}</span></div>
               <div className="p-2 bg-blue-50 rounded-lg text-[7px] font-bold text-blue-700 uppercase leading-tight">
                 <i className="fas fa-info-circle mr-1"></i> En modo Editar, puedes arrastrar los números de los lotes/casas.
               </div>
            </div>
            <button onClick={saveToForm} disabled={loading || elements.length === 0} className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all flex items-center justify-center gap-2 ${loading || elements.length === 0 ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 border-b-4 border-indigo-900'}`}>{loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}{loading ? 'Exportando...' : 'Guardar Estudio'}</button>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />

      <div className={`bg-white px-8 py-5 rounded-[2rem] border border-slate-200 flex flex-wrap gap-8 justify-center shadow-xl no-print ${isFullscreen ? 'hidden' : ''}`}>
        <div className="flex items-center gap-3"><div className="w-8 h-3 border-2 border-red-600 bg-white rounded-sm"></div><span className="text-[9px] font-black uppercase text-slate-600 tracking-wider">Manzana</span></div>
        <div className="flex items-center gap-3"><div className="w-8 h-1 border-b-2 border-black border-dashed"></div><span className="text-[9px] font-black uppercase text-slate-600 tracking-wider">Ejes</span></div>
        <div className="flex items-center gap-3"><div className="w-8 h-3 border-2 border-blue-600 bg-white rounded-sm"></div><span className="text-[9px] font-black uppercase text-slate-600 tracking-wider">Lote</span></div>
        <div className="flex items-center gap-3"><div className="w-8 h-3 border-2 border-amber-900 overflow-hidden relative"><div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #78350f, #78350f 1px, transparent 1px, transparent 2.5px)' }}></div></div><span className="text-[9px] font-black uppercase text-slate-600 tracking-wider">Edificado</span></div>
        <div className="flex items-center gap-3"><span className="font-black text-xs text-indigo-500">ee</span><span className="text-[9px] font-black uppercase text-slate-600 tracking-wider">Snap a Línea</span></div>
      </div>
    </div>
  );
};

export default MorphologicalStudyTool;
