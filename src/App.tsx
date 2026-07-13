/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SubmissionForm from './components/SubmissionForm';
import WordCloud from './components/WordCloud';
import PhotoCarousel from './components/PhotoCarousel';
import MessageWall from './components/MessageWall';
import { subscribeToContributions, deleteContribution } from './lib/firebase';
import { Contribution } from './types';
import { ShieldCheck, AlertTriangle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Real-time synchronization with Firestore
  useEffect(() => {
    setIsLoading(true);
    setDbError(null);

    const unsubscribe = subscribeToContributions(
      (data) => {
        setContributions(data);
        setIsLoading(false);
      },
      (error) => {
        console.error("Firestore sync error:", error);
        setDbError(
          "Não foi possível conectar ao banco de dados em tempo real. Verifique sua conexão ou tente novamente mais tarde."
        );
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle deletion of inappropriate posts (Admin only)
  const handleDelete = (id: string) => {
    if (!isAdmin) return;
    setDeleteId(id);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await deleteContribution(deleteId);
      setDeleteId(null);
      setDeleteError(null);
    } catch (err) {
      console.error("Erro ao excluir documento:", err);
      setDeleteError("Ocorreu um erro ao excluir a postagem. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col selection:bg-orange-500 selection:text-white" id="main-app">
      {/* Real-time sync Error banner */}
      {dbError && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs py-2.5 px-4 text-center font-semibold flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 animate-bounce" />
          <span>{dbError}</span>
        </div>
      )}

      {/* Header section with titles and campaign countdown */}
      <Header 
        isAdmin={isAdmin} 
        setIsAdmin={setIsAdmin} 
        contributionsCount={contributions.length} 
      />

      {/* Main application container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        
        {/* Loading Spinner */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-500 font-sans">Carregando o mural CIPA...</p>
          </div>
        ) : (
          <>
            {/* Top Interactive Bento-Grid Dashboard (3 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Submission panel */}
              <div className="lg:col-span-1">
                <SubmissionForm />
              </div>

              {/* Photo carousel showcase */}
              <div className="lg:col-span-1">
                <PhotoCarousel 
                  contributions={contributions} 
                  isAdmin={isAdmin} 
                  onDelete={handleDelete} 
                />
              </div>

              {/* Real-time word cloud highlights */}
              <div className="lg:col-span-1">
                <WordCloud 
                  contributions={contributions} 
                  onSelectWord={setSelectedWord} 
                  selectedWord={selectedWord} 
                />
              </div>

            </div>

            {/* Bottom Dynamic Message Wall */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 font-display">Mural de Postagens Recentes</h3>
                  <p className="text-xs text-slate-500">Acompanhe as palavras de carinho e motivação enviadas pela equipe.</p>
                </div>
              </div>

              <MessageWall 
                contributions={contributions} 
                isAdmin={isAdmin} 
                onDelete={handleDelete} 
                selectedWord={selectedWord} 
                onClearWordFilter={() => setSelectedWord(null)} 
              />
            </div>
          </>
        )}
      </main>

      {/* Humble Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-[11px] text-slate-400 font-sans mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Comissão Interna de Prevenção de Acidentes (CIPA) • Fábrica Segura</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <p>Mural Ativo em Tempo Real</p>
          </div>
        </div>
      </footer>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-full bg-red-50 text-red-600">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-display">Confirmar Exclusão</h3>
                    <p className="text-xs text-slate-500 font-sans">Esta ação não pode ser desfeita.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-slate-600 font-sans">
                    Deseja realmente remover esta publicação do mural de segurança da CIPA?
                  </p>

                  {deleteError && (
                    <p className="text-red-500 text-xs font-semibold bg-red-50 p-2.5 rounded-lg border border-red-100">
                      {deleteError}
                    </p>
                  )}

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setDeleteId(null)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      disabled={isDeleting}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Excluindo...
                        </>
                      ) : (
                        'Confirmar Exclusão'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
