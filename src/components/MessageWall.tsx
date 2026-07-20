/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, Heart, Trash2, SlidersHorizontal, Calendar, HelpCircle, Eye, CornerRightDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Contribution, ContributionType } from '../types';
import { likeContribution } from '../lib/firebase';

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

  // Handle like action
  const handleLike = async (id: string) => {
    try {
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
                          <button
                            onClick={() => handleLike(c.id)}
                            className="p-1 rounded-full bg-slate-900/5 hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Apoiar mensagem"
                          >
                            <Heart className={`w-3.5 h-3.5 ${c.likes > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
                            {c.likes > 0 && <span className="text-[10px] font-bold text-slate-800">{c.likes}</span>}
                          </button>
                          
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
                          <button
                            onClick={() => handleLike(c.id)}
                            className="p-1 rounded-full hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Curtir palavra"
                          >
                            <Heart className={`w-3 h-3 ${c.likes > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                            {c.likes > 0 && <span className="text-[10px] font-bold text-slate-700">{c.likes}</span>}
                          </button>

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
                      <div className="absolute -top-2 left-6 w-8 h-4 bg-amber-100/40 border border-amber-200/20 -rotate-6" />

                      {/* Photo preview frame */}
                      <div className="aspect-video w-full rounded-md overflow-hidden bg-slate-50 border border-slate-100 relative">
                        <img 
                          src={c.content} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
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
                          <button
                            onClick={() => handleLike(c.id)}
                            className="p-1 rounded-full hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Curtir foto"
                          >
                            <Heart className={`w-3 h-3 ${c.likes > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                            {c.likes > 0 && <span className="text-[9px] font-bold text-slate-700">{c.likes}</span>}
                          </button>

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
    </div>
  );
}
