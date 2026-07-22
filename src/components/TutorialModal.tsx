import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, MessageSquare, Heart, ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Bem-vindo ao Mural de Segurança CIPA! 🌟',
      description: 'Este é um espaço interativo criado para que todos os funcionários possam compartilhar mensagens de motivação, afeto e conscientização sobre segurança no trabalho.',
      icon: <Heart className="w-12 h-12 text-orange-500" />,
      color: 'bg-orange-50 text-orange-600',
      illustration: (
        <div className="relative h-36 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
          <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-xs px-2 py-1 rounded text-[10px] text-slate-500 font-mono font-bold shadow-xs">
            CIPA 2026
          </div>
          <div className="flex flex-col items-center gap-1.5 p-4 text-center">
            <span className="text-sm font-semibold text-slate-700">Por que estamos aqui?</span>
            <p className="text-xs text-slate-500 max-w-xs">
              Quem te espera em casa? Mostre o que te motiva a trabalhar com segurança todos os dias!
            </p>
          </div>
        </div>
      )
    },
    {
      title: '1. Compartilhe sua Foto de Motivação 📸',
      description: 'Na aba "Foto", você pode enviar uma foto de quem você ama, de sua família ou algo que te motiva. O sistema redimensiona a foto para carregar super rápido.',
      icon: <Camera className="w-12 h-12 text-blue-500" />,
      color: 'bg-blue-50 text-blue-600',
      illustration: (
        <div className="h-36 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center p-3">
          <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 rotate-[-2deg] max-w-[130px] flex flex-col items-center">
            <div className="w-20 h-16 bg-slate-100 rounded flex items-center justify-center">
              <Camera className="w-6 h-6 text-slate-400" />
            </div>
            <span className="text-[9px] text-slate-400 mt-2 text-center leading-tight">Minha Família ❤️</span>
          </div>
          <div className="ml-4 max-w-[150px] space-y-1">
            <div className="text-[11px] font-bold text-slate-700">Abas de Envio:</div>
            <div className="text-[10px] text-slate-500 leading-tight">Escolha entre enviar uma Palavra Rápida, Frase ou uma Foto especial.</div>
          </div>
        </div>
      )
    },
    {
      title: '2. Envie Mensagens e Palavras-chave ✍️',
      description: 'Tem uma frase de impacto ou uma palavra que resume a segurança para você? Envie pelo formulário para que ela faça parte da nossa nuvem de palavras em tempo real.',
      icon: <MessageSquare className="w-12 h-12 text-emerald-500" />,
      color: 'bg-emerald-50 text-emerald-600',
      illustration: (
        <div className="h-36 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center p-4">
          <div className="space-y-2 w-full max-w-xs">
            <div className="flex gap-1.5 flex-wrap justify-center">
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-[10px] font-bold rounded-md">Família</span>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">Atenção</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md">Vida</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-md">Cuidado</span>
            </div>
            <p className="text-[11px] text-slate-500 text-center leading-snug">
              Clique nas palavras do gráfico para filtrar o mural e ver apenas publicações daquele tema!
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Pronto! Vamos construir essa corrente? 🚀',
      description: 'Com cerca de 400 funcionários enviando, nosso mural ficará colorido, vibrante e cheio de motivos reais para trabalharmos com 100% de atenção e segurança!',
      icon: <HelpCircle className="w-12 h-12 text-purple-500" />,
      color: 'bg-purple-50 text-purple-600',
      illustration: (
        <div className="h-36 bg-orange-500 rounded-xl flex flex-col items-center justify-center p-4 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 -translate-y-8" />
          <h4 className="text-sm font-bold mb-1 z-10">Mural de Segurança CIPA</h4>
          <p className="text-[11px] text-orange-100 max-w-xs z-10 leading-snug">
            Sua participação inspira seus colegas de trabalho a voltarem seguros para casa hoje.
          </p>
          <button
            onClick={onClose}
            className="mt-3 px-4 py-1.5 bg-white text-orange-600 font-bold rounded-lg text-xs hover:bg-slate-50 transition-colors shadow-sm z-10"
          >
            Começar Agora!
          </button>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="tutorial-modal">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
                Guia de Primeiro Acesso
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Fechar guia"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-8 flex-1 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-4 rounded-full ${steps[currentStep].color} shadow-xs`}>
                  {steps[currentStep].icon}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 font-display">
                    {steps[currentStep].title}
                  </h3>
                  <p className="text-sm text-slate-600 font-sans leading-relaxed max-w-sm mx-auto">
                    {steps[currentStep].description}
                  </p>
                </div>
              </div>

              {/* Steps Illustration/Feature Mockup */}
              {steps[currentStep].illustration}
            </div>

            {/* Footer / Controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {/* Pagination indicators */}
              <div className="flex gap-1.5">
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentStep ? 'w-6 bg-orange-500' : 'w-1.5 bg-slate-300'
                    }`}
                    aria-label={`Ir para passo ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Anterior
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  {currentStep === steps.length - 1 ? 'Começar!' : 'Próximo'}
                  {currentStep < steps.length - 1 && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
