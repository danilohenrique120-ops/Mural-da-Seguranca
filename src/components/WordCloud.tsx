/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Cloud, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Contribution } from '../types';

interface WordCloudProps {
  contributions: Contribution[];
  onSelectWord: (word: string | null) => void;
  selectedWord: string | null;
}

// Portuguese stop words to exclude from word extraction
const STOP_WORDS = new Set([
  'para', 'com', 'esta', 'está', 'nesta', 'como', 'mais', 'pelos', 'pelas', 'uma', 'este', 'esse', 'isso', 
  'tudo', 'todo', 'toda', 'de', 'do', 'da', 'em', 'um', 'não', 'os', 'no', 'se', 'na', 'por', 'as', 'dos', 
  'das', 'ele', 'pelo', 'pela', 'até', 'suas', 'seus', 'meu', 'minha', 'nos', 'nas', 'num', 'numa', 'você',
  'voces', 'vocês', 'ela', 'eles', 'elas', 'sobre', 'então', 'também', 'quando', 'onde', 'quem', 'qual', 
  'quais', 'muito', 'muita', 'muitos', 'muitas', 'entre', 'sobre', 'sempre', 'nunca', 'tudo', 'nada', 'cada'
]);

export default function WordCloud({ contributions, onSelectWord, selectedWord }: WordCloudProps) {
  
  // Calculate frequencies of words
  const wordCloudData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    
    contributions.forEach((c) => {
      if (c.type === 'word') {
        // Clean and lowercase
        const cleanWord = c.content.trim().toLowerCase()
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
        if (cleanWord && cleanWord.length > 2) {
          counts[cleanWord] = (counts[cleanWord] || 0) + 5; // Give extra weight to words explicitly sent as 'word'
        }
      } else if (c.type === 'message') {
        // Tokenize words from messages
        const words = c.content.toLowerCase()
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
          .split(/\s+/);
        
        words.forEach((w) => {
          // Remove small words, prepositions, numbers, and stop words
          if (w.length > 3 && !STOP_WORDS.has(w) && isNaN(Number(w))) {
            counts[w] = (counts[w] || 0) + 1; // standard weight for message words
          }
        });
      }
    });

    // Convert to array
    const list = Object.entries(counts).map(([text, value]) => ({
      text: text.charAt(0).toUpperCase() + text.slice(1), // Capitalize first letter
      value
    }));

    // Sort by frequency and take top 25
    return list.sort((a, b) => b.value - a.value).slice(0, 25);
  }, [contributions]);

  // Max value for scaling font size
  const maxValue = useMemo(() => {
    return Math.max(...wordCloudData.map((w) => w.value), 1);
  }, [wordCloudData]);

  // Color options for random distribution
  const colors = [
    'text-orange-600 hover:text-orange-700',
    'text-amber-600 hover:text-amber-700',
    'text-emerald-600 hover:text-emerald-700',
    'text-sky-600 hover:text-sky-700',
    'text-indigo-600 hover:text-indigo-700',
    'text-rose-600 hover:text-rose-700',
    'text-teal-600 hover:text-teal-700'
  ];

  // Map word count value to a font size (11px to 32px)
  const getFontSize = (value: number) => {
    const minSize = 11;
    const maxSize = 32;
    if (maxValue === 1) return `${minSize}px`;
    const size = minSize + ((value - 1) / (maxValue - 1)) * (maxSize - minSize);
    return `${Math.round(size)}px`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 flex flex-col h-full" id="word-cloud-container">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 font-display flex items-center gap-2">
            <Cloud className="w-5 h-5 text-sky-500 fill-sky-100" />
            Nuvem de Palavras-Chave
          </h2>
          <p className="text-xs text-slate-500">As palavras mais frequentes sobre nossa segurança.</p>
        </div>
        {selectedWord && (
          <button
            onClick={() => onSelectWord(null)}
            className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Limpar Filtro
          </button>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center border border-dashed border-slate-100 rounded-xl bg-slate-50/50 p-4 min-h-[180px] select-none relative overflow-hidden">
        {wordCloudData.length === 0 ? (
          <div className="text-center text-slate-400 space-y-1">
            <HelpCircle className="w-8 h-8 mx-auto stroke-1.5 opacity-60" />
            <p className="text-xs font-medium">Nenhuma palavra enviada ainda.</p>
            <p className="text-[10px] max-w-[200px]">Envie uma palavra ou mensagem à esquerda para começar a encher o mural!</p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 max-w-md">
            {wordCloudData.map((item, index) => {
              const fontSize = getFontSize(item.value);
              const colorClass = colors[index % colors.length];
              const isSelected = selectedWord?.toLowerCase() === item.text.toLowerCase();

              return (
                <motion.button
                  key={item.text}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  onClick={() => onSelectWord(isSelected ? null : item.text)}
                  className={`font-display font-semibold transition-all duration-150 cursor-pointer text-center ${colorClass} ${
                    isSelected 
                      ? 'bg-orange-50 border-orange-200 border px-2 py-0.5 rounded-lg ring-2 ring-orange-200 text-orange-700 font-extrabold z-10 scale-110 shadow-xs' 
                      : selectedWord 
                        ? 'opacity-30 hover:opacity-80' 
                        : ''
                  }`}
                  style={{ fontSize }}
                >
                  {item.text}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
      
      {wordCloudData.length > 0 && (
        <div className="mt-3 text-[10px] text-slate-400 text-center font-sans">
          💡 Clique em uma palavra da nuvem para filtrar os posts do mural abaixo!
        </div>
      )}
    </div>
  );
}
