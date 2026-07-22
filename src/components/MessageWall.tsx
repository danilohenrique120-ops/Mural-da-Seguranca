/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, Heart, Trash2, SlidersHorizontal, Calendar, HelpCircle, Eye, CornerRightDown, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Contribution, ContributionType } from '../types';
import { likeContribution } from '../lib/firebase';
import { isPostLiked, markPostAsLiked, getLikedPosts } from '../lib/likes';

interface MessageWallProps {
  contributions: Contribution[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  selectedWord: string | null;
  onClearWordFilter: () => void;
}

export default function MessageWall({ 
  contributions, 
  isAdmin, 
  onDelete, 
  selectedWord, 
  onClearWordFilter 
}: MessageWallProps) {
  const [filterType, setFilterType] = useState<ContributionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedIds, setLikedIds] = useState<string[]>(getLikedPosts());
  const [activePhoto, setActivePhoto] = useState<Contribution | null>(null);

  // Handle like action
  const handleLike = async (id: string) => {
    if (isPostLiked(id) || likedIds.includes(id)) {
      return; // Already liked
    }
    try {
      markPostAsLiked(id);
      setLikedIds(prev => [...prev, id]);
      await likeContribution(id);
    } catch (err) {
      console.error('Erro ao curtir:', err);
    }
  };

  // Format date relative or simplified
  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays === 1) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // Filter and search logic
  const filteredContributions = useMemo(() => {
    return contributions.filter((c) => {
      // 1. Filter by tab category (all, message, word, photo)
      if (filterType !== 'all' && c.type !== filterType) {
        return false;
      }

      // 2. Filter by word cloud clicked word (if active)
      if (selectedWord) {
        const textToSearch = `${c.content} ${c.author} ${c.sector || ''}`.toLowerCase();
        if (!textToSearch.includes(selectedWord.toLowerCase())) {
          return false;
        }
      }

      // 3. Filter by search query input
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesContent = c.content.toLowerCase().includes(query);
        const matchesAuthor = c.author.toLowerCase().includes(query);
        const matchesSector = c.sector?.toLowerCase().includes(query) || false;
        return matchesContent || matchesAuthor || matchesSector;
      }

      return true;
    });
  }, [contributions, filterType, selectedWord, searchQuery]);

  return (
    <div className="space-y-5" id="message-wall-section">
      {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'all' 
                ? 'bg-slate-900 text-white' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos ({contributions.length})
          </button>
          <button
            onClick={() => setFilterType('word')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'word' 
                ? 'bg-slate-900 text-white' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Palavras ({contributions.filter(c => c.type === 'word').length})
          </button>
          <button
            onClick={() => setFilterType('message')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'message' 
                ? 'bg-slate-900 text-white' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Mensagens ({contributions.filter(c => c.type === 'message').length})
          </button>
          <button
            onClick={() => setFilterType('photo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'photo' 
                ? 'bg-slate-900 text-white' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Fotos ({contributions.filter(c => c.type === 'photo').length})
          </button>
        </div>

        {/* Search input field */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por palavra, nome ou setor..."
            className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden font-sans"
          />
        </div>
      </div>

      {/* Active Word Cloud Filter Banner */}
      {selectedWord && (
        <div className="bg-orange-50 border border-orange-100 text-orange-800 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>Filtrando mural pela palavra: <strong className="underline">{selectedWord}</strong></span>
          </div>
          <button
            onClick={onClearWordFilter}
            className="text-xs font-bold text-orange-600 hover:text-orange-900 cursor-pointer"
          >
            Ver Tudo
          </button>
        </div>
      )}

      {/* Grid Canvas Board of Sticky Notes & Cards */}
      <div className="mural-pattern border border-slate-200/50 rounded-3xl p-6 min-h-[350px]">
        {filteredContributions.length === 0 ? (
          <div className="text-center text-slate-400 py-16 space-y-2 flex flex-col items-center justify-center">
            <HelpCircle className="w-12 h-12 stroke-1 opacity-60" />
            <h4 className="text-sm font-bold text-slate-700">Nenhuma postagem encontrada</h4>
            <p className="text-xs max-w-xs leading-relaxed">
              {searchQuery || selectedWord 
                ? 'Nenhuma contribuição corresponde aos seus termos de busca ou filtros selecionados. Tente ajustar os filtros!' 
                : 'Seja o primeiro a deixar sua marca! Use o formulário acima para enviar uma palavra, mensagem ou foto.'}
            </p>
            {(searchQuery || selectedWord) && (
              <button
                onClick={() => { setSearchQuery(''); onClearWordFilter(); setFilterType('all'); }}
                className="mt-2 text-xs bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg font-semibold cursor-pointer shadow-2xs"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredContributions.map((c, index) => {
                
                // Define individual style rendering per type
                if (c.type === 'message') {
                  return (
                    <motion.div
                      key={c.id}
                      layout
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className={`relative p-5 rounded-lg shadow-md border flex flex-col justify-between min-h-[160px] transform hover:shadow-lg transition-all hover:scale-[1.01] ${c.bgColor}`}
                    >
                      {/* Pushpin / Tape Ornament */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-yellow-200/60 border border-yellow-300/30 rotate-3 backdrop-blur-3xs" />

                      {/* Content block */}
                      <div className="space-y-3">
                        <p className="text-sm font-medium font-sans leading-relaxed text-slate-800 italic">
                          "{c.content}"
                        </p>
                      </div>

                      {/* Footer info & interactive likes */}
                      <div className="mt-4 pt-3 border-t border-slate-900/10 flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-800 truncate">{c.author}</p>
                          {c.sector && (
                            <p className="text-[9px] uppercase tracking-wider font-bold text-slate-500 truncate">{c.sector}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {(() => {
                            const isLiked = likedIds.includes(c.id);
                            return (
                              <button
                                onClick={() => handleLike(c.id)}
                                className={`p-1 rounded-full transition-colors flex items-center gap-1 ${
                                  isLiked 
                                    ? 'bg-rose-100 text-rose-600 cursor-default' 
                                    : 'bg-slate-900/5 hover:bg-rose-50 hover:text-rose-600 cursor-pointer'
                                }`}
                                title={isLiked ? "Você já curtiu esta mensagem" : "Apoiar mensagem"}
                                disabled={isLiked}
                              >
                                <Heart className={`w-3.5 h-3.5 ${c.likes > 0 || isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
                                {c.likes > 0 && <span className="text-[10px] font-bold text-slate-800">{c.likes}</span>}
                              </button>
                            );
                          })()}
                          
                          {isAdmin && (
                            <button
                              onClick={() => onDelete(c.id)}
                              className="p-1 rounded-full bg-slate-900/5 hover:bg-red-50 hover:text-red-600 text-slate-400 transition-colors cursor-pointer"
                              title="Excluir post"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Timestamp relative tag */}
                      <span className="absolute bottom-1 right-2 text-[8px] text-slate-400 font-mono">
                        {formatTimeAgo(c.timestamp)}
                      </span>
                    </motion.div>
                  );
                }

                if (c.type === 'word') {
                  return (
                    <motion.div
                      key={c.id}
                      layout
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="relative p-4 rounded-xl shadow-xs border border-slate-100 bg-white flex flex-col justify-between min-h-[110px] hover:shadow-sm transition-all"
                    >
                      {/* Visual Tape decoration */}
                      <div className="absolute -top-1 right-4 w-4 h-3 bg-teal-100/40 border border-teal-200/20 rotate-12" />

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase">Palavra da Segurança</span>
                        <h4 className="text-xl font-bold font-display text-slate-800">{c.content}</h4>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <p className="text-[10px] font-bold text-slate-700 truncate">{c.author}</p>
                          {c.sector && (
                            <p className="text-[8px] uppercase font-semibold text-slate-400 truncate">{c.sector}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {(() => {
                            const isLiked = likedIds.includes(c.id);
                            return (
                              <button
                                onClick={() => handleLike(c.id)}
                                className={`p-1 rounded-full transition-colors flex items-center gap-1 ${
                                  isLiked 
                                    ? 'bg-rose-100 text-rose-600 cursor-default' 
                                    : 'hover:bg-rose-50 hover:text-rose-600 text-slate-400 cursor-pointer'
                                }`}
                                title={isLiked ? "Você já curtiu esta palavra" : "Curtir palavra"}
                                disabled={isLiked}
                              >
                                <Heart className={`w-3 h-3 ${c.likes > 0 || isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                                {c.likes > 0 && <span className="text-[10px] font-bold text-slate-700">{c.likes}</span>}
                              </button>
                            );
                          })()}

                          {isAdmin && (
                            <button
                              onClick={() => onDelete(c.id)}
                              className="p-1 rounded-full hover:bg-red-50 hover:text-red-600 text-slate-400 transition-colors cursor-pointer"
                              title="Excluir palavra"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Timestamp */}
                      <span className="absolute bottom-1 right-2 text-[8px] text-slate-400 font-mono">
                        {formatTimeAgo(c.timestamp)}
                      </span>
                    </motion.div>
                  );
                }

                if (c.type === 'photo') {
                  return (
                    <motion.div
                      key={c.id}
                      layout
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="relative p-2.5 rounded-lg shadow-sm border border-slate-200/60 bg-white flex flex-col justify-between min-h-[170px] hover:shadow-md transition-all group"
                    >
                      {/* Visual Tape decoration */}
                      <div className="absolute -top-2 left-6 w-8 h-4 bg-amber-100/40 border border-amber-200/20 -rotate-6 z-10" />

                      {/* Photo preview frame - object-contain so photos are displayed completely */}
                      <div 
                        onClick={() => setActivePhoto(c)}
                        className="aspect-square w-full rounded-md overflow-hidden bg-slate-100/80 border border-slate-100 relative flex items-center justify-center p-1 cursor-pointer group/img"
                        title="Clique para ampliar a foto"
                      >
                        <img 
                          src={c.content} 
                          alt={`Foto enviada por ${c.author}`} 
                          className="w-full h-full object-contain" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                          <span className="p-1.5 bg-white/90 rounded-full text-slate-800 shadow-xs flex items-center gap-1 text-[10px] font-bold">
                            <Maximize2 className="w-3 h-3" />
                            Ampliar
                          </span>
                        </div>
                      </div>

                      {/* Footer detail row */}
                      <div className="pt-2 mt-2 flex items-center justify-between border-t border-slate-100">
                        <div className="min-w-0 pr-2">
                          <p className="text-[10px] font-bold text-slate-700 truncate">{c.author}</p>
                          {c.sector && (
                            <p className="text-[8px] uppercase font-semibold text-slate-400 truncate">{c.sector}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {(() => {
                            const isLiked = likedIds.includes(c.id);
                            return (
                              <button
                                onClick={() => handleLike(c.id)}
                                className={`p-1 rounded-full transition-colors flex items-center gap-1 ${
                                  isLiked 
                                    ? 'bg-rose-100 text-rose-600 cursor-default' 
                                    : 'hover:bg-rose-50 hover:text-rose-600 text-slate-400 cursor-pointer'
                                }`}
                                title={isLiked ? "Você já curtiu esta foto" : "Curtir foto"}
                                disabled={isLiked}
                              >
                                <Heart className={`w-3 h-3 ${c.likes > 0 || isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                                {c.likes > 0 && <span className="text-[9px] font-bold text-slate-700">{c.likes}</span>}
                              </button>
                            );
                          })()}

                          {isAdmin && (
                            <button
                              onClick={() => onDelete(c.id)}
                              className="p-1 rounded-full hover:bg-red-50 hover:text-red-600 text-slate-400 transition-colors cursor-pointer"
                              title="Excluir foto"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Date */}
                      <span className="absolute bottom-1 right-2 text-[8px] text-slate-300 font-mono">
                        {formatTimeAgo(c.timestamp)}
                      </span>
                    </motion.div>
                  );
                }

                return null;
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* PHOTO EXPANSION LIGHTBOX MODAL */}
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
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full border border-slate-800 shadow-2xl flex flex-col md:flex-row"
            >
              {/* Photo viewport */}
              <div className="flex-1 bg-slate-900 flex items-center justify-center p-3 min-h-[300px] md:max-h-[500px]">
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
                      "Meu motivo de segurança está nesta foto."
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  {(() => {
                    const isLiked = likedIds.includes(activePhoto.id);
                    return (
                      <button
                        onClick={() => handleLike(activePhoto.id)}
                        className={`flex-1 py-2 px-4 border border-rose-100 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors ${
                          isLiked
                            ? 'bg-rose-100 text-rose-700 cursor-default'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer'
                        }`}
                        disabled={isLiked}
                      >
                        <Heart className={`w-4 h-4 ${activePhoto.likes > 0 || isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        {isLiked ? 'Curtido!' : 'Apoiar'} ({activePhoto.likes})
                      </button>
                    );
                  })()}

                  {isAdmin && (
                    <button
                      onClick={() => {
                        onDelete(activePhoto.id);
                        setActivePhoto(null);
                      }}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors cursor-pointer"
                      title="Excluir foto"
                    >
                      <Trash2 className="w-4 h-4" />
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
