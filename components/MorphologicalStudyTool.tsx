
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
  const [draggingPointIdx, setDraggingPointIdx] = useState<number | null>(null); // -1 if dragging whole element
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  
  // Zoom and Pan state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const dragElementStart = useRef<{x: number, y: number, initialPoints: Point[]}>({x: 0, y: 0, initialPoints: []});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const lotesCount = useMemo(() => elements.filter(p => p.type === 'lote').length, [elements]);
  const casasCount = useMemo(() => elements.filter(p => p.type === 'casa').length, [elements]);

  // Keyboard shortcuts
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
          setScale(1);
          setOffset({ x: 0, y: 0 });
        }
      } else if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey)) {
        setCurrentPoints(prev => prev.slice(0, -1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPoints, mode]);

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

    const x = (relX / (rect.width / scale)) * 1000;
    const y = (relY / (rect.height / scale)) * 1000;
    
    return { x, y };
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
    const zoomFactor = 1.15;
    const direction = e.deltaY > 0 ? 1 / zoomFactor : zoomFactor;
    const newScale = Math.max(0.5, Math.min(scale * direction, 15));

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
      setOffset({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y
      });
      return;
    }

    const point = getCoordinates(e);
    setMousePos(point);

    // Auto-pan logic when drawing near edges
    if (currentPoints.length > 0 && scale > 1) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const threshold = 50;
        const panSpeed = 10;
        let newOffsetX = offset.x;
        let newOffsetY = offset.y;
        
        if (e.clientX < rect.left + threshold) newOffsetX += panSpeed;
        if (e.clientX > rect.right - threshold) newOffsetX -= panSpeed;
        if (e.clientY < rect.top + threshold) newOffsetY += panSpeed;
        if (e.clientY > rect.bottom - threshold) newOffsetY -= panSpeed;
        
        if (newOffsetX !== offset.x || newOffsetY !== offset.y) {
           setOffset({ x: newOffsetX, y: newOffsetY });
        }
      }
    }

    if (mode === 'edit' && editingElementId && draggingPointIdx !== null) {
      if (draggingPointIdx === -1) {
        // Dragging entire element
        const dx = point.x - dragElementStart.current.x;
        const dy = point.y - dragElementStart.current.y;
        setElements(prev => prev.map(p => {
          if (p.id === editingElementId) {
            return {
              ...p,
              points: dragElementStart.current.initialPoints.map(pt => ({
                x: pt.x + dx,
                y: pt.y + dy
              }))
            };
          }
          return p;
        }));
      } else {
        // Dragging specific vertex
        setElements(prev => prev.map(p => {
          if (p.id === editingElementId) {
            const newPoints = [...p.points];
            newPoints[draggingPointIdx] = point;
            return { ...p, points: newPoints };
          }
          return p;
        }));
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingPointIdx(null);
  };

  const handleSvgClick = (e: React.MouseEvent) => {
    if (isPanning) return;
    const point = getCoordinates(e);

    if (mode === 'view' || mode === 'delete' || mode === 'edit') return;

    if (mode === 'draw_texto') {
      const text = prompt("Ingrese nomenclatura (Calle / N°):");
      if (text) {
        const newText: Element = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'texto',
          points: [point],
          textValue: text,
          rotation: 0
        };
        setElements([...elements, newText]);
      }
      return;
    }

    setCurrentPoints(prev => [...prev, point]);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPoints.length >= 2) finishShape();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPoints.length >= 2) finishShape();
  };

  const finishShape = () => {
    if (currentPoints.length < 2) return;

    let type: Element['type'] = 'lote';
    if (mode === 'draw_casa') type = 'casa';
    if (mode === 'draw_manzana') type = 'manzana';
    if (mode === 'draw_calle') type = 'calle';

    const nextNumber = (elements.filter(p => p.type === type).length) + 1;

    const newElement: Element = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      points: currentPoints,
      number: (type === 'lote' || type === 'casa') ? nextNumber : undefined
    };

    setElements(prev => [...prev, newElement]);
    setCurrentPoints([]);
  };

  const deleteElement = (id: string) => {
    if (mode !== 'delete') return;
    setElements(prev => prev.filter(p => p.id !== id));
  };

  const selectElementToEdit = (id: string, e: React.MouseEvent) => {
    if (mode !== 'edit' || isPanning) return;
    setEditingElementId(id);
    
    const el = elements.find(e => e.id === id);
    if (!el) return;

    // If clicking for the first time on an element in edit mode, allow moving it
    const point = getCoordinates(e);
    dragElementStart.current = {
      x: point.x,
      y: point.y,
      initialPoints: [...el.points]
    };
    setDraggingPointIdx(-1); // -1 marks moving the whole element

    // Double click to change number
    if (e.detail === 2) {
       if (el.type === 'lote' || el.type === 'casa' || el.type === 'texto') {
        const newNum = prompt("Editar número o texto:", el.type === 'texto' ? el.textValue : el.number?.toString());
        if (newNum !== null) {
          setElements(prev => prev.map(p => {
            if (p.id === id) {
              return p.type === 'texto' 
                ? { ...p, textValue: newNum } 
                : { ...p, number: parseInt(newNum) || p.number };
            }
            return p;
          }));
        }
      }
    }
  };

  const calculateCentroid = (points: Point[]): Point => {
    if (points.length === 0) return { x: 0, y: 0 };
    const x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    return { x, y };
  };

  const saveToForm = async () => {
    if (!svgRef.current) return;
    setLoading(true);
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 2000;
      canvas.height = 2000;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (showBackground && originalImage) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = originalImage;
        });
        ctx.drawImage(img, 0, 0, 2000, 2000);
      } else {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 2000, 2000);
      }

      const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;
      const g = svgClone.querySelector('g#viewport');
      if (g) g.setAttribute('transform', 'translate(0,0) scale(1)');

      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const svgImg = new Image();
      await new Promise((resolve) => {
        svgImg.onload = resolve;
        svgImg.src = url;
      });
      ctx.drawImage(svgImg, 0, 0, 2000, 2000);
      URL.revokeObjectURL(url);

      const finalBase64 = canvas.toDataURL('image/png');
      updateForm({ estudioMorfologico: finalBase64 });
      alert("Dibujo técnico exportado con éxito.");
      if (isFullscreen) setIsFullscreen(false);
    } catch (err) {
      console.error(err);
      alert("Error al exportar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-6 bg-slate-100 p-4 rounded-3xl border border-slate-300 shadow-2xl overflow-hidden transition-all duration-300 select-none ${isFullscreen ? 'fixed inset-0 z-[100] rounded-none h-screen w-screen' : 'min-h-[95vh]'}`}>
      
      {/* TOOLBAR */}
      <div className="bg-slate-900 rounded-2xl p-4 text-white flex flex-wrap items-center justify-between gap-4 shadow-2xl no-print">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-inner">
            <i className="fas fa-pencil-ruler text-xl"></i>
          </div>
          <div className="hidden sm:block">
            <h2 className="text-lg font-black uppercase tracking-tighter leading-none">Dibujo Técnico Morfológico</h2>
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">GAD MUNICIPAL RIOBAMBA</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-800 p-1.5 rounded-2xl border border-slate-700 shadow-inner">
          <button onClick={() => {setMode('draw_manzana'); setCurrentPoints([]); setEditingElementId(null);}} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 ${mode === 'draw_manzana' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            <i className="fas fa-square-full"></i> Manzana
          </button>
          <button onClick={() => {setMode('draw_calle'); setCurrentPoints([]); setEditingElementId(null);}} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 ${mode === 'draw_calle' ? 'bg-slate-400 text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            <i className="fas fa-minus"></i> Calle
          </button>
          <button onClick={() => {setMode('draw_lote'); setCurrentPoints([]); setEditingElementId(null);}} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 ${mode === 'draw_lote' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            <i className="fas fa-vector-square"></i> Lote
          </button>
          <button onClick={() => {setMode('draw_casa'); setCurrentPoints([]); setEditingElementId(null);}} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 ${mode === 'draw_casa' ? 'bg-amber-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            <i className="fas fa-house-chimney"></i> Casa
          </button>
          <button onClick={() => {setMode('draw_texto'); setCurrentPoints([]); setEditingElementId(null);}} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 ${mode === 'draw_texto' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            <i className="fas fa-font"></i> Nomenclatura
          </button>
          <div className="w-px h-6 bg-slate-700 mx-1"></div>
          <button onClick={() => {setMode('edit'); setEditingElementId(null);}} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 ${mode === 'edit' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            <i className="fas fa-mouse-pointer"></i> Editar
          </button>
          <button onClick={() => {setMode('delete'); setEditingElementId(null);}} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 ${mode === 'delete' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            <i className="fas fa-trash-alt"></i> Borrar
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-all shadow-lg" title="Pantalla Completa">
            <i className={isFullscreen ? 'fas fa-compress' : 'fas fa-expand'}></i>
          </button>
          <button onClick={() => setShowBackground(!showBackground)} className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all flex items-center gap-2 ${showBackground ? 'bg-slate-700 text-white' : 'bg-blue-600 text-white shadow-xl'}`}>
            <i className={showBackground ? 'fas fa-image' : 'fas fa-eye'}></i> {showBackground ? 'Fondo On' : 'Fondo Off'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* CANVAS DE DIBUJO CON ZOOM Y PAN SINCRONIZADO */}
        <div 
          className="flex-1 relative bg-white rounded-[2rem] border-4 border-slate-300 shadow-2xl overflow-hidden min-h-[500px] select-none touch-none" 
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
        >
          {!originalImage ? (
            <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group bg-slate-50">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform mb-4 border border-slate-200">
                <i className="fas fa-upload text-3xl text-blue-500"></i>
              </div>
              <p className="font-black uppercase tracking-widest text-slate-400 text-xs">Cargar Captura Satelital</p>
            </div>
          ) : (
            <>
              {/* Contenedor Transformable: Fondo y SVG enlazados */}
              <div 
                className="absolute inset-0 w-full h-full origin-top-left"
                style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
              >
                {showBackground && (
                  <img src={originalImage} className="w-full h-full object-contain opacity-90 pointer-events-none" alt="Plano Base" />
                )}
                
                <svg 
                  ref={svgRef}
                  viewBox="0 0 1000 1000" 
                  className={`absolute inset-0 w-full h-full overflow-visible ${isPanning ? 'cursor-grabbing' : mode !== 'view' ? (mode === 'edit' ? 'cursor-default' : 'cursor-none') : ''}`}
                  onClick={handleSvgClick}
                >
                  <defs>
                    <pattern id="hatch-casa-fine" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                      <line x1="0" y1="0" x2="0" y2="6" stroke="#78350f" strokeWidth="1.2" />
                    </pattern>
                  </defs>

                  <g id="viewport">
                    {/* Elementos dibujados */}
                    {elements.map((el) => {
                      const centroid = calculateCentroid(el.points);
                      const pointsStr = el.points.map(p => `${p.x},${p.y}`).join(' ');
                      const isSelected = editingElementId === el.id;

                      if (el.type === 'texto') {
                        return (
                          <g key={el.id} onClick={(e) => { e.stopPropagation(); deleteElement(el.id); selectElementToEdit(el.id, e); }}>
                            <text 
                              x={el.points[0].x} y={el.points[0].y} 
                              fill="#000000" fontSize="22" fontWeight="900" textAnchor="middle" 
                              className={`select-none uppercase transition-all ${isSelected ? 'fill-emerald-600 drop-shadow-sm' : ''}`}
                              style={{ cursor: mode === 'delete' ? 'pointer' : (mode === 'edit' ? 'move' : 'default') }}
                            >
                              {el.textValue}
                            </text>
                            {isSelected && <circle cx={el.points[0].x} cy={el.points[0].y} r="6" fill="#10b981" />}
                          </g>
                        );
                      }

                      if (el.type === 'calle') {
                        return (
                          <g key={el.id} onClick={(e) => { e.stopPropagation(); deleteElement(el.id); selectElementToEdit(el.id, e); }}>
                            <polyline 
                              points={pointsStr} fill="none" stroke="#64748b" strokeWidth="6" strokeLinecap="round" strokeDasharray="10,5"
                              className={`transition-opacity ${mode === 'delete' ? 'hover:stroke-red-500 cursor-pointer' : (mode === 'edit' ? 'cursor-move' : '')}`}
                            />
                          </g>
                        );
                      }

                      return (
                        <g key={el.id} onClick={(e) => { e.stopPropagation(); deleteElement(el.id); selectElementToEdit(el.id, e); }}>
                          <polygon 
                            points={pointsStr}
                            fill={el.type === 'casa' ? 'url(#hatch-casa-fine)' : 'none'}
                            stroke={
                              el.type === 'lote' ? '#2563eb' : 
                              el.type === 'casa' ? '#78350f' : 
                              el.type === 'manzana' ? '#ef4444' : '#94a3b8'
                            }
                            strokeWidth={
                              el.type === 'manzana' ? '8' : 
                              el.type === 'casa' ? '6' : 
                              el.type === 'lote' ? '7' : '3'
                            }
                            className={`transition-all ${isSelected ? 'stroke-emerald-500' : ''} ${mode === 'delete' ? 'hover:fill-red-500/20 cursor-pointer' : (mode === 'edit' ? 'cursor-move' : '')}`}
                          />
                          
                          {(el.type === 'lote' || el.type === 'casa') && (
                            <g pointerEvents="none">
                              <circle cx={centroid.x} cy={centroid.y} r="14" fill={el.type === 'lote' ? '#2563eb' : '#78350f'} />
                              <text x={centroid.x} y={centroid.y} fill="white" fontSize="12" fontWeight="900" textAnchor="middle" dominantBaseline="central">{el.number}</text>
                            </g>
                          )}

                          {/* Nodos de edición */}
                          {mode === 'edit' && isSelected && el.points.map((p, idx) => (
                            <circle 
                              key={idx} cx={p.x} cy={p.y} r={8 / Math.sqrt(scale)} 
                              fill="white" stroke="#10b981" strokeWidth={3 / Math.sqrt(scale)}
                              onMouseDown={(e) => { e.stopPropagation(); setDraggingPointIdx(idx); }}
                              className="cursor-crosshair hover:scale-150 transition-transform"
                            />
                          ))}
                        </g>
                      );
                    })}

                    {/* Línea guía (Mas gruesa para mejor visibilidad) */}
                    {currentPoints.length > 0 && (
                      <g pointerEvents="none">
                        <polyline 
                          points={currentPoints.map(p => `${p.x},${p.y}`).join(' ') + ` ${mousePos.x},${mousePos.y}`}
                          fill="none" stroke="#3b82f6" strokeWidth={5 / Math.sqrt(scale)} strokeDasharray={`${12/scale},${6/scale}`}
                        />
                        {currentPoints.map((p, i) => (
                          <circle key={i} cx={p.x} cy={p.y} r={6 / Math.sqrt(scale)} fill="#3b82f6" />
                        ))}
                      </g>
                    )}

                    {/* Cursor de Precisión Roja */}
                    {mode !== 'view' && !isPanning && (
                       <g pointerEvents="none">
                          <line x1={mousePos.x - 50/scale} y1={mousePos.y} x2={mousePos.x + 50/scale} y2={mousePos.y} stroke="#ef4444" strokeWidth={2.5/scale} />
                          <line x1={mousePos.x} y1={mousePos.y - 50/scale} x2={mousePos.x} y2={mousePos.y + 50/scale} stroke="#ef4444" strokeWidth={2.5/scale} />
                          <circle cx={mousePos.x} cy={mousePos.y} r={7/scale} fill="none" stroke="#ef4444" strokeWidth={3/scale} />
                       </g>
                    )}
                  </g>
                </svg>
              </div>
            </>
          )}
        </div>

        {/* CONTROLES DERECHOS */}
        <div className={`w-full lg:w-72 space-y-4 flex flex-col ${isFullscreen ? 'bg-slate-50 p-6 shadow-2xl' : ''}`}>
          
          <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-xl space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-2">Panel de Control</h3>
            
            <div className="space-y-3">
              <div className="bg-slate-900 text-white p-4 rounded-2xl">
                <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Lotes Totales</p>
                <p className="text-3xl font-black">{lotesCount}</p>
              </div>
              <div className="bg-amber-800 text-white p-4 rounded-2xl">
                <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Casas Totales</p>
                <p className="text-3xl font-black">{casasCount}</p>
              </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-[9px] font-black uppercase text-slate-500">Ayuda de Navegación</h4>
               <div className="grid grid-cols-1 gap-2">
                 <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                   <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded flex items-center justify-center border border-blue-200 shadow-sm"><i className="fas fa-mouse text-[10px]"></i></div>
                   <span className="text-[8px] font-bold text-slate-600 uppercase leading-none">Rueda: Zoom + / -</span>
                 </div>
                 <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                   <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded flex items-center justify-center border border-blue-200 shadow-sm"><i className="fas fa-arrows-alt text-[10px]"></i></div>
                   <span className="text-[8px] font-bold text-slate-600 uppercase leading-none">Mover: Clic Central</span>
                 </div>
                 <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                   <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded flex items-center justify-center border border-blue-200 shadow-sm"><i className="fas fa-check text-[10px]"></i></div>
                   <span className="text-[8px] font-bold text-slate-600 uppercase leading-none">Cerrar: Doble Clic / Enter</span>
                 </div>
                 <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                   <kbd className="bg-white px-1.5 py-0.5 rounded border text-[8px] font-black shadow-sm">ESC</kbd>
                   <span className="text-[8px] font-bold text-slate-500 uppercase leading-none">Reset Vista / Trazo</span>
                 </div>
               </div>
            </div>

            <button 
              onClick={saveToForm}
              disabled={loading || elements.length === 0}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all flex items-center justify-center gap-2 ${
                loading || elements.length === 0 
                ? 'bg-slate-200 text-slate-400' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 border-b-4 border-indigo-900'
              }`}
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-double"></i>}
              {loading ? 'Exportando...' : 'Finalizar Estudio'}
            </button>
          </div>

          {!isFullscreen && (
            <div className="p-4 text-center mt-auto">
              <p className="text-[8px] text-slate-400 uppercase tracking-[0.4em] font-black">Riobamba • Urbano</p>
            </div>
          )}
        </div>
      </div>

      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />

      {/* LEYENDA TÉCNICA */}
      <div className={`bg-white px-8 py-5 rounded-[2rem] border border-slate-200 flex flex-wrap gap-8 justify-center shadow-xl no-print ${isFullscreen ? 'hidden' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-4 border-2 border-red-600 bg-white rounded-sm"></div>
          <span className="text-[9px] font-black uppercase text-slate-600 tracking-wider">Manzana</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-4 border-b-2 border-slate-400 border-dashed"></div>
          <span className="text-[9px] font-black uppercase text-slate-600 tracking-wider">Calles</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-4 border-2 border-blue-600 bg-white rounded-sm"></div>
          <span className="text-[9px] font-black uppercase text-slate-600 tracking-wider">Lote (Azul)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-4 border-2 border-amber-900 overflow-hidden relative"><div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #78350f, #78350f 1px, transparent 1px, transparent 2.5px)' }}></div></div>
          <span className="text-[9px] font-black uppercase text-slate-600 tracking-wider">Construcción</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-black text-xs text-blue-500">T</span>
          <span className="text-[9px] font-black uppercase text-slate-600 tracking-wider">Nomenclatura</span>
        </div>
      </div>
    </div>
  );
};

export default MorphologicalStudyTool;
