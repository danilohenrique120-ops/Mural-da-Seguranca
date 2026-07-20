/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Camera, ChevronLeft, ChevronRight, Heart, X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Contribution } from '../types';
import { likeContribution } from '../lib/firebase';

interface PhotoCarouselProps {
  contributions: Contribution[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

export default function PhotoCarousel({ contributions, isAdmin, onDelete }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activePhoto, setActivePhoto] = useState<Contribution | null>(null);

  const photos = contributions.filter(c => c.type === 'photo');

  // Handle slide transitions
  const nextSlide = () => {
    if (photos.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevSlide = () => {
    if (photos.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // Autoplay carousel every 6 seconds, paused when lightbox is open or hover
  useEffect(() => {
    if (photos.length <= 1 || activePhoto) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(interval);
  }, [photos.length, activePhoto]);

  // Adjust index if photos are deleted and index is out of bounds
  useEffect(() => {
    if (currentIndex >= photos.length && photos.length > 0) {
      setCurrentIndex(photos.length - 1);
    }
  }, [photos.length, currentIndex]);

  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening lightbox
    try {
      await likeContribution(id);
      // If lightbox is open for this photo, update the likes there too
      if (activePhoto && activePhoto.id === id) {
        setActivePhoto(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to format date cleanly
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  // Generate a mock polaroid pin rotation class based on index
  const getRotation = (index: number) => {
    const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', '-rotate-3', 'rotate-3'];
    return rotations[index % rotations.length];
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 flex flex-col h-full" id="photo-carousel-container">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-800 font-display flex items-center gap-2">
          <Camera className="w-5 h-5 text-orange-500 fill-orange-100" />
          Mural de Fotos da Família
        </h2>
        <p className="text-xs text-slate-500">Nosso maior combustível de segurança são as pessoas que amamos.</p>
      </div>

      <div className="flex-1 flex items-center justify-center relative min-h-[260px] bg-slate-50 border border-dashed border-slate-100 rounded-xl p-4 overflow-hidden">
        {photos.length === 0 ? (
          <div className="text-center text-slate-400 space-y-1">
            <HelpCircle className="w-8 h-8 mx-auto stroke-1.5 opacity-60" />
            <p className="text-xs font-medium">Nenhuma foto adicionada ainda.</p>
            <p className="text-[10px] max-w-[200px]">Arraste, tire ou cole uma foto à esquerda para compartilhar sua inspiração!</p>
          </div>
        ) : (
          <div className="relative w-full max-w-sm flex flex-col items-center">
            
            {/* Slide Navigation - Left Arrow */}
            {photos.length > 1 && (
              <button
                onClick={prevSlide}
                className="absolute left-0 md:-left-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-slate-100"
                title="Foto anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Polaroid Photo Container */}
            <AnimatePresence mode="wait">
              <motion.div
                key={photos[currentIndex].id}
                initial={{ opacity: 0, x: 20, rotate: 0 }}
                animate={{ opacity: 1, x: 0, rotate: getRotation(currentIndex) === 'rotate-1' ? 1 : getRotation(currentIndex) === '-rotate-2' ? -2 : 2 }}
                exit={{ opacity: 0, x: -20, rotate: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setActivePhoto(photos[currentIndex])}
                className="bg-white border border-slate-200/60 p-4 pb-6 shadow-md rounded-sm cursor-pointer select-none relative hover:shadow-lg hover:scale-[1.02] transition-all max-w-[240px] w-full"
              >
                {/* Visual pin ornament */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500/80 shadow-xs border-2 border-white z-20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>

                {/* Actual image */}
                <div className="aspect-square bg-slate-100 rounded-xs overflow-hidden border border-slate-100 flex items-center justify-center">
                  <img
                    src={photos[currentIndex].content}
                    alt={`Foto de ${photos[currentIndex].author}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Hand-written Polaroid Caption */}
                <div className="mt-4 text-center">
                  <p className="font-hand text-lg text-slate-800 leading-tight">
                    {photos[currentIndex].author}
                  </p>
                  {photos[currentIndex].sector && (
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mt-0.5">
                      {photos[currentIndex].sector}
                    </p>
                  )}
                </div>

                {/* Polaroid Interaction overlay footer */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  <button
                    onClick={(e) => handleLike(photos[currentIndex].id, e)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-full transition-colors flex items-center gap-1 cursor-pointer border border-rose-100"
                    title="Dar um coração"
                  >
                    <Heart className={`w-3 h-3 ${photos[currentIndex].likes > 0 ? 'fill-rose-500' : ''}`} />
                    {photos[currentIndex].likes > 0 && (
                      <span className="text-[9px] font-bold">{photos[currentIndex].likes}</span>
                    )}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slide Navigation - Right Arrow */}
            {photos.length > 1 && (
              <button
                onClick={nextSlide}
                className="absolute right-0 md:-right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-slate-100"
                title="Próxima foto"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Carousel dots indicators */}
            {photos.length > 1 && (
              <div className="flex gap-1.5 mt-5">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      i === currentIndex ? 'w-4 bg-orange-500' : 'w-1.5 bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            )}

          </div>
        )}
      </div>

      {/* PHOTO LIGHTBOX (FULLSCREEN EXPANSION MODAL) */}
      <AnimatePresence>
        {activePhoto && (
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
            onClick={() => setActivePhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} // Stop closing
              className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full border border-slate-800 shadow-2xl flex flex-col md:flex-row"
            >
              {/* Photo viewport */}
              <div className="flex-1 bg-slate-900 flex items-center justify-center p-2 min-h-[300px] md:max-h-[500px]">
                <img
                  src={activePhoto.content}
                  alt={`Foto ampliada de ${activePhoto.author}`}
                  className="max-h-[280px] md:max-h-[480px] w-auto object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Side panel information */}
              <div className="w-full md:w-64 p-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 bg-white">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-display font-bold text-slate-900 text-lg">{activePhoto.author}</h3>
                      {activePhoto.sector && (
                        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">{activePhoto.sector}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setActivePhoto(null)}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">Motivo de Segurança:</p>
                    <p className="text-sm text-slate-800 font-sans font-semibold mt-1">
                      "Meu motivo de segurança está nesta foto com as pessoas mais importantes da minha vida."
                    </p>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 font-mono">
                    Enviado em: {formatDate(activePhoto.timestamp)}
                  </p>
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={(e) => handleLike(activePhoto.id, e)}
                    className="flex-1 py-2 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${activePhoto.likes > 0 ? 'fill-rose-500' : ''}`} />
                    Apoiar ({activePhoto.likes})
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        onDelete(activePhoto.id);
                        setActivePhoto(null);
                      }}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-100 transition-colors cursor-pointer"
                      title="Excluir do mural"
                    >
                      X
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
