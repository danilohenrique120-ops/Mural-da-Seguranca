/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Lock, Unlock, Calendar, Users, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  contributionsCount: number;
}

export default function Header({ isAdmin, setIsAdmin, contributionsCount }: HeaderProps) {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'cipa2026') {
      setIsAdmin(true);
      setShowAdminModal(false);
      setPassword('');
      setError('');
    } else {
      setError('Senha incorreta! Tente novamente.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
  };

  // Determine current day of the campaign (July 13 to 17, 2026)
  const startDate = new Date('2026-07-13T00:00:00');
  const today = new Date();
  
  // Calculate day difference
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const currentDay = Math.min(Math.max(diffDays, 1), 5); // Clamped between 1 and 5 for display

  const campaignDays = [
    { day: 1, label: 'Segunda', date: '13/07', active: currentDay >= 1 },
    { day: 2, label: 'Terça', date: '14/07', active: currentDay >= 2 },
    { day: 3, label: 'Quarta', date: '15/07', active: currentDay >= 3 },
    { day: 4, label: 'Quinta', date: '16/07', active: currentDay >= 4 },
    { day: 5, label: 'Sexta', date: '17/07', active: currentDay >= 5 },
  ];

  return (
    <header className="bg-white border-b border-slate-100 shadow-xs relative overflow-hidden" id="app-header">
      {/* Aesthetic upper accent bar */}
      <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 w-full" />
      
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          
          {/* Brand/Heading Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                CIPA Gestão 2026
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                <Calendar className="w-3.5 h-3.5" />
                Campanha de 5 Dias
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                <Users className="w-3.5 h-3.5" />
                {contributionsCount} {contributionsCount === 1 ? 'Membro Participou' : 'Membros Participaram'}
              </span>
            </div>

            <h1 className="text-xl md:text-3xl font-bold font-display text-slate-900 tracking-tight leading-tight max-w-4xl">
              "O motivo para trabalhar com segurança está nesta{' '}
              <span className="text-orange-600 underline decoration-amber-400 decoration-3 underline-offset-4">foto</span>
              /
              <span className="text-amber-600 underline decoration-orange-400 decoration-3 underline-offset-4">palavra</span>
              /
              <span className="text-emerald-600 underline decoration-teal-400 decoration-3 underline-offset-4">mensagem</span>"
            </h1>
            
            <p className="mt-2 text-sm text-slate-500 max-w-2xl font-sans">
              Participe do nosso mural! Compartilhe o que te inspira a voltar seguro para casa todos os dias. 
              Sua família, seus sonhos e sua saúde esperam por você.
            </p>
          </div>

          {/* Day Tracker & Moderation Controls */}
          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            {/* 5-Day Visual Timeline */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 w-full md:w-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  Progresso da Campanha
                </span>
                <span className="text-xs text-slate-500 font-mono">Dia {currentDay} de 5</span>
              </div>
              <div className="flex gap-1.5">
                {campaignDays.map((d) => (
                  <div key={d.day} className="flex flex-col items-center">
                    <div 
                      className={`h-2.5 w-12 rounded-full transition-all duration-300 ${
                        d.day === currentDay 
                          ? 'bg-orange-500 ring-2 ring-orange-100' 
                          : d.active 
                            ? 'bg-emerald-500' 
                            : 'bg-slate-200'
                      }`}
                    />
                    <span className="text-[10px] mt-1 font-medium text-slate-500">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin trigger button */}
            <div className="flex items-center gap-2 self-end">
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded border border-emerald-100 flex items-center gap-1 animate-pulse">
                    <Unlock className="w-3 h-3" />
                    Modo Moderação Ativo
                  </span>
                  <button
                    onClick={handleAdminLogout}
                    className="text-xs text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAdminModal(true)}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Acesso CIPA (Moderação)"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Área CIPA
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-full bg-orange-50 text-orange-600">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-display">Acesso CIPA / Organização</h3>
                    <p className="text-xs text-slate-500">Insira a senha do mural para habilitar a exclusão de conteúdos inadequados.</p>
                  </div>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Senha de Moderação</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Senha da CIPA"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden font-mono"
                      autoFocus
                    />
                    {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
                    <p className="text-[10px] text-slate-400 mt-1">Dica: Use <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">cipa2026</span> para testar.</p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdminModal(false);
                        setPassword('');
                        setError('');
                      }}
                      className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Desbloquear Moderação
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
