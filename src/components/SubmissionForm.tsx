/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Type, MessageSquare, Camera, Upload, Trash2, Heart, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { addContribution } from '../lib/firebase';
import { ContributionType } from '../types';

// Palette of colors for the sticky notes
const POST_IT_COLORS = [
  { id: 'bg-yellow-50 text-yellow-900 border-yellow-200', dot: 'bg-yellow-300', label: 'Amarelo' },
  { id: 'bg-orange-50 text-orange-900 border-orange-200', dot: 'bg-orange-300', label: 'Laranja' },
  { id: 'bg-emerald-50 text-emerald-900 border-emerald-200', dot: 'bg-emerald-300', label: 'Menta' },
  { id: 'bg-sky-50 text-sky-900 border-sky-200', dot: 'bg-sky-300', label: 'Céu' },
  { id: 'bg-purple-50 text-purple-900 border-purple-200', dot: 'bg-purple-300', label: 'Lavanda' },
];

export default function SubmissionForm() {
  const [activeTab, setActiveTab] = useState<ContributionType>('word');
  
  // Form fields
  const [word, setWord] = useState('');
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [author, setAuthor] = useState('');
  const [sector, setSector] = useState('');
  const [selectedColor, setSelectedColor] = useState(POST_IT_COLORS[0].id);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress image to Base64 (max 480px width/height, JPEG)
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor, envie apenas arquivos de imagem.');
      return;
    }

    try {
      setErrorMessage('');
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = objectUrl;
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const MAX_SIZE = 480;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setErrorMessage('Erro de processamento de canvas.');
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        // Compress more aggressively (0.55 quality) to ensure tiny file size (~15-25KB)
        // This is perfectly sharp for our polaroid cards and will never exceed database/network limits!
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.55);
        setPhoto(compressedBase64);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setErrorMessage('Falha ao carregar o arquivo de imagem.');
      };
    } catch (err) {
      console.error(err);
      setErrorMessage('Falha ao processar imagem.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Paste image handler (supports screenshots, copy-pasting from folders/apps)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (activeTab !== 'photo') return;
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              processImageFile(blob);
              e.preventDefault();
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeTab]);

  const removePhoto = () => {
    setPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    let finalContent = '';
    if (activeTab === 'word') {
      const trimmedWord = word.trim();
      if (!trimmedWord) {
        setErrorMessage('Por favor, digite uma palavra.');
        return;
      }
      if (trimmedWord.includes(' ')) {
        // Warn and split or use the first word, but let's let them submit if it's small,
        // though we recommend just 1 word. Let's force a clean-up.
        const cleaned = trimmedWord.split(' ')[0].replace(/[^a-zA-ZáàâãéèêíïóôõöúçÁÀÂÃÉÈÍÏÓÔÕÖÚÇ-]/g, '');
        if (!cleaned) {
          setErrorMessage('Digite uma palavra válida, sem espaços ou símbolos.');
          return;
        }
        finalContent = cleaned;
      } else {
        finalContent = trimmedWord.replace(/[^a-zA-ZáàâãéèêíïóôõöúçÁÀÂÃÉÈÍÏÓÔÕÖÚÇ-]/g, '');
      }
    } else if (activeTab === 'message') {
      if (!message.trim()) {
        setErrorMessage('Por favor, digite sua mensagem.');
        return;
      }
      finalContent = message.trim();
    } else if (activeTab === 'photo') {
      if (!photo) {
        setErrorMessage('Por favor, anexe ou cole uma foto.');
        return;
      }
      finalContent = photo;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      await addContribution({
        type: activeTab,
        content: finalContent,
        author: author.trim() || 'Anônimo',
        sector: sector.trim() || '',
        likes: 0,
        bgColor: activeTab === 'message' ? selectedColor : undefined,
      });

      setIsSuccess(true);
      
      // Reset fields
      setWord('');
      setMessage('');
      setPhoto(null);
      // We keep author & sector in state so they don't have to retype if submitting multiple things!
      
      // Clear success screen after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);

    } catch (err: any) {
      console.error("Erro ao enviar contribuição:", err);
      const detailedMessage = err?.message || String(err);
      
      if (detailedMessage.toLowerCase().includes('quota') || detailedMessage.toLowerCase().includes('exceeded')) {
        setErrorMessage('Limite diário de cota do banco de dados atingido para hoje. Tente novamente amanhã.');
      } else if (detailedMessage.toLowerCase().includes('size') || detailedMessage.toLowerCase().includes('too large') || detailedMessage.toLowerCase().includes('limit')) {
        setErrorMessage('A imagem ficou muito grande para o mural, tente enviar outra foto ou reduza o tamanho.');
      } else {
        setErrorMessage(`Ocorreu um erro ao enviar: ${detailedMessage}. Tente novamente mais tarde.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6" id="submission-card">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-800 font-display flex items-center gap-2">
          <Heart className="w-5 h-5 text-orange-500 fill-orange-100" />
          Envie sua Participação
        </h2>
        <p className="text-xs text-slate-500">Sem burocracia: escolha o formato, digite ou anexe, e envie direto para o mural.</p>
      </div>

      {/* Tabs list */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
        <button
          type="button"
          onClick={() => { setActiveTab('word'); setErrorMessage(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'word' 
              ? 'bg-white text-slate-900 shadow-xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          Palavra
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('message'); setErrorMessage(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'message' 
              ? 'bg-white text-slate-900 shadow-xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Mensagem
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('photo'); setErrorMessage(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'photo' 
              ? 'bg-white text-slate-900 shadow-xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          Foto
        </button>
      </div>

      {/* Main submission form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {/* SUCCESS SCREEN OVERLAY */}
          {isSuccess ? (
            <motion.div
              key="success-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-8 text-center flex flex-col items-center justify-center bg-emerald-50/50 rounded-xl border border-emerald-100"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
              <h3 className="text-sm font-bold text-slate-800">Enviado com sucesso!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs px-4">
                Sua contribuição já está brilhando no nosso mural de segurança da fábrica. Obrigado por participar!
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* TAB 1: WORD */}
              {activeTab === 'word' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Qual palavra resume seu motivo para trabalhar seguro?
                  </label>
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => setWord(e.target.value.slice(0, 20))}
                    placeholder="Ex: Família, Filhos, Vida, Saúde..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden font-sans"
                  />
                  <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                    <span>Apenas uma palavra marcante</span>
                    <span>{word.length}/20 caracteres</span>
                  </div>
                </div>
              )}

              {/* TAB 2: MESSAGE */}
              {activeTab === 'message' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Deixe sua mensagem de segurança
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                      placeholder="Escreva algo sobre quem te espera em casa, ou um conselho de segurança para os colegas da fábrica..."
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden font-sans resize-none"
                    />
                    <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                      <span>Inspirador e acolhedor</span>
                      <span>{message.length}/200 caracteres</span>
                    </div>
                  </div>

                  {/* Sticky note color picker */}
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-600 mb-1.5">Cor do seu Bilhete:</span>
                    <div className="flex gap-2.5">
                      {POST_IT_COLORS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedColor(c.id)}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                            selectedColor === c.id 
                              ? 'ring-2 ring-slate-400 ring-offset-2 scale-105' 
                              : 'border-slate-200'
                          }`}
                          style={{ contentVisibility: 'auto' }}
                          title={c.label}
                        >
                          <span className={`w-3 h-3 rounded-full ${c.dot}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PHOTO */}
              {activeTab === 'photo' && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-700">
                    Selecione, arraste ou cole uma foto de família/motivação
                  </label>
                  
                  {!photo ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 ${
                        dragActive 
                          ? 'border-orange-500 bg-orange-50/40' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <Upload className="w-8 h-8 text-slate-400" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-slate-700">Arraste ou clique para enviar</p>
                        <p className="text-[10px] text-slate-400">Aceita copiar e colar direto (Ctrl+V ou Cmd+V)</p>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center max-h-56">
                      <img 
                        src={photo} 
                        alt="Preview" 
                        className="max-h-52 object-contain" 
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full shadow-xs hover:scale-105 transition-all cursor-pointer"
                        title="Remover foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400">As fotos são redimensionadas automaticamente para carregar super rápido no mural.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* AUTHOR FIELDS */}
        {!isSuccess && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Seu Nome (opcional)</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value.slice(0, 30))}
                placeholder="Ex: João Silva"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-hidden font-sans"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Seu Setor (opcional)</label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value.slice(0, 30))}
                placeholder="Ex: Produção, Almox..."
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-hidden font-sans"
              />
            </div>
          </div>
        )}

        {/* ERROR BOX */}
        {errorMessage && (
          <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-xs flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        {!isSuccess && (
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
              isSubmitting 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-orange-600 hover:bg-orange-700 hover:shadow-sm'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processando...
              </>
            ) : (
              'Pendurar no Mural'
            )}
          </button>
        )}
      </form>
    </div>
  );
}
