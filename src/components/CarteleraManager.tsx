import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  Upload, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

interface Slide {
  id: string;
  url: string;
  alt: string;
  order: number;
  active: boolean;
}

const convertToWebP = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen válida.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo crear el contexto del lienzo (canvas)'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('No se pudo convertir la imagen a WebP'));
            }
          },
          'image/webp',
          0.85
        );
      };
      img.onerror = () => reject(new Error('Error al procesar la imagen'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
};

export default function CarteleraManager() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch existing slides on mount
  useEffect(() => {
    async function fetchSlides() {
      try {
        const res = await fetch('/api/cartelera');
        if (!res.ok) throw new Error('Error al cargar la cartelera');
        const data = await res.json();
        // Sort explicitly by order
        const sorted = data.sort((a: Slide, b: Slide) => a.order - b.order);
        setSlides(sorted);
      } catch (err: any) {
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSlides();
  }, []);

  // Show status timer alerts
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const newSlidesAdded: Slide[] = [];
      
      for (const file of Array.from(files)) {
        // Convertir la imagen a WebP antes de subirla
        const webpBlob = await convertToWebP(file);
        const webpFilename = file.name.substring(0, file.name.lastIndexOf('.')) + '.webp';
        const webpFile = new File([webpBlob], webpFilename, { type: 'image/webp' });

        const formData = new FormData();
        formData.append('file', webpFile);

        const res = await fetch('/api/cartelera/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Error al subir la imagen');
        }

        const data = await res.json();
        
        // El alt inicial será el nombre del archivo sin extensión
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || 'Imagen';

        newSlidesAdded.push({
          id: crypto.randomUUID(),
          url: data.url,
          alt: cleanName,
          order: slides.length + newSlidesAdded.length + 1,
          active: true,
        });
      }

      setSlides((prev) => [...prev, ...newSlidesAdded]);
      setHasUnsavedChanges(true);
      setSuccessMessage('Imagen(es) subida(s) exitosamente.');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsUploading(false);
      // Reset upload input
      e.target.value = '';
    }
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Reasignar el campo de orden secuencialmente
    const recalculated = updated.map((slide, idx) => ({
      ...slide,
      order: idx + 1,
    }));

    setSlides(recalculated);
    setHasUnsavedChanges(true);
  };

  const updateAlt = (id: string, alt: string) => {
    setSlides(
      slides.map((s) => (s.id === id ? { ...s, alt } : s))
    );
    setHasUnsavedChanges(true);
  };

  const toggleActive = (id: string) => {
    setSlides(
      slides.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
    setHasUnsavedChanges(true);
  };

  const deleteSlide = (id: string) => {
    const filtered = slides.filter((s) => s.id !== id);
    // Re-ordenar
    const recalculated = filtered.map((s, idx) => ({
      ...s,
      order: idx + 1,
    }));
    setSlides(recalculated);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/cartelera', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slides),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al guardar cambios');
      }

      const data = await res.json();
      setSlides(data.slides);
      setHasUnsavedChanges(false);
      setSuccessMessage('¡Cambios guardados con éxito y aplicados en la web!');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
        <p className="font-semibold text-lg animate-pulse">Cargando cartelera...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Alert Notices */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-red-950/40 border border-red-500/30 text-red-200 rounded-2xl animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 rounded-2xl animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {/* Control Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900/60 border border-slate-800/80 rounded-[2rem] shadow-xl backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Galería de Cartelera</h2>
          <p className="text-xs text-slate-400">
            {slides.length} {slides.length === 1 ? 'imagen' : 'imágenes'} en total. Arrastra archivos al área de carga para añadir más.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-full font-semibold animate-pulse">
              Cambios sin guardar
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold tracking-wide uppercase transition-all duration-300 shadow-lg ${
              hasUnsavedChanges && !isSaving
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-indigo-500/20 hover:scale-[1.03] cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* File Upload Zone */}
      <div className="relative group">
        <label className="flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed border-slate-700/80 hover:border-indigo-500/70 bg-slate-900/30 hover:bg-indigo-950/10 rounded-[2rem] cursor-pointer transition-all duration-300 overflow-hidden p-6 text-center group">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3 bg-slate-800/80 group-hover:bg-indigo-950 group-hover:text-indigo-400 text-slate-400 rounded-full transition-colors duration-300">
              {isUploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              ) : (
                <Upload className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-200">
                {isUploading ? 'Subiendo imágenes...' : 'Haz clic o arrastra imágenes aquí'}
              </p>
              <p className="text-xs text-slate-400">Soporta PNG, JPEG, WebP y GIF</p>
            </div>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading || isSaving}
            className="hidden"
          />
        </label>
      </div>

      {/* Slide Items Grid */}
      {slides.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900/30 border border-slate-800/80 border-dashed rounded-[2rem] text-slate-500">
          <ImageIcon className="w-12 h-12 mb-4 text-slate-600" />
          <p className="font-medium text-slate-400">No hay imágenes en la cartelera</p>
          <p className="text-xs text-slate-500 mt-1">Sube una imagen para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`flex flex-col bg-slate-900/40 border rounded-[2rem] overflow-hidden shadow-md transition-all duration-300 ${
                slide.active 
                  ? 'border-slate-800/80 focus-within:border-indigo-500/50' 
                  : 'border-slate-800/40 opacity-70 bg-slate-950/20'
              }`}
            >
              {/* Image Preview Container */}
              <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden border-b border-slate-800/60 group">
                <img
                  src={slide.url}
                  alt={slide.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Active/Inactive Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className={`px-3 py-1 rounded-full text-2xs font-bold uppercase tracking-wider shadow-md ${
                    slide.active
                      ? 'bg-emerald-500/90 text-emerald-950'
                      : 'bg-slate-700/90 text-slate-200'
                  }`}>
                    {slide.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Quick Action Overlay (Delete & Active Toggle) */}
                <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => toggleActive(slide.id)}
                    className="p-3 bg-slate-800/90 hover:bg-slate-700 text-white rounded-full transition-transform hover:scale-110 cursor-pointer"
                    title={slide.active ? 'Desactivar' : 'Activar'}
                  >
                    {slide.active ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => deleteSlide(slide.id)}
                    className="p-3 bg-red-950/90 hover:bg-red-900 text-red-300 rounded-full transition-transform hover:scale-110 cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Display Position Indicator */}
                <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-indigo-400 border border-slate-700/50 shadow-md">
                  Orden: {slide.order}
                </div>
              </div>

              {/* Slide Edit & Control Area */}
              <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Texto Alternativo (Alt SEO)
                    </label>
                    <input
                      type="text"
                      value={slide.alt}
                      onChange={(e) => updateAlt(slide.id, e.target.value)}
                      placeholder="Ej. Campaña evangelística 2026"
                      className="w-full bg-slate-950/50 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-colors duration-300"
                    />
                  </div>
                </div>

                {/* Order & Card controls */}
                <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 mt-auto">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => moveSlide(index, 'up')}
                      disabled={index === 0}
                      className={`p-2 rounded-lg border transition-all duration-200 ${
                        index === 0
                          ? 'border-slate-800/20 text-slate-700 cursor-not-allowed'
                          : 'border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white cursor-pointer'
                      }`}
                      title="Mover arriba / Izquierda"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveSlide(index, 'down')}
                      disabled={index === slides.length - 1}
                      className={`p-2 rounded-lg border transition-all duration-200 ${
                        index === slides.length - 1
                          ? 'border-slate-800/20 text-slate-700 cursor-not-allowed'
                          : 'border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white cursor-pointer'
                      }`}
                      title="Mover abajo / Derecha"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => deleteSlide(slide.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-400 hover:text-red-300 border border-transparent hover:border-red-500/20 hover:bg-red-500/5 rounded-xl transition-all duration-200 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
