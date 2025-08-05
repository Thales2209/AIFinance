
import React, { useState, useEffect } from 'react';
import { LoginIcon } from './components/icons/LoginIcon';
import { MembersArea } from './components/MembersArea';
import { RegisterPage } from './components/RegisterPage';
import { LoginPage } from './components/LoginPage';
import { DashboardPreview } from './components/DashboardPreview';
import { DashboardIcon } from './components/icons/DashboardIcon';
import { ChartIcon } from './components/icons/ChartIcon';
import { BotIcon } from './components/icons/BotIcon';
import { PdfIcon } from './components/icons/PdfIcon';
import { CheckIcon } from './components/icons/CheckIcon';
import { supabase } from './services/supabaseClient';
import type { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
    const [view, setView] = useState<'landing' | 'register' | 'login' | 'members'>('landing');
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if (session) {
                setView('members');
            }
            setLoading(false);
        };
        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session && (view === 'login' || view === 'register')) {
                setView('members');
            } else if (!session) {
                setView('landing');
            }
        });

        return () => subscription.unsubscribe();
    }, [view]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setView('landing');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex justify-center items-center">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
            </div>
        );
    }
    
    const renderView = () => {
        switch (view) {
            case 'members':
                return session ? <MembersArea session={session} onLogout={handleLogout} /> : <LoginPage onBack={() => setView('landing')} setView={setView} />;
            case 'login':
                return <LoginPage onBack={() => setView('landing')} setView={setView} />;
            case 'register':
                return <RegisterPage onBack={() => setView('landing')} setView={setView} />;
            case 'landing':
            default:
                return (
                    <>
                        <main className="relative z-10 container mx-auto px-6 py-16 md:py-24">
                            {/* Hero Section */}
                            <section className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
                                <div className="text-center lg:text-left">
                                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-tight mb-4 animated-gradient-text bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-400">
                                        Seu Assistente Financeiro com Inteligência Artificial
                                    </h2>
                                    <p className="text-lg md:text-xl text-slate-300 mb-8">
                                       Sua nova plataforma de gestão financeira. Controle total das suas finanças, sem planilhas e sem dor de cabeça.
                                    </p>
                                    <button onClick={() => setView('register')} className="inline-block bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-bold py-4 px-8 rounded-lg transition-all text-lg shadow-xl shadow-cyan-500/20">
                                        Teste Grátis
                                    </button>
                                </div>
                                <div>
                                    <DashboardPreview />
                                </div>
                            </section>

                            {/* Features Section */}
                            <section id="features" className="mt-20 md:mt-32">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {[
                                        { icon: <ChartIcon />, title: "Controle Diário Simplificado", description: "Acompanhe suas receitas e despesas com lançamentos simples, a qualquer hora." },
                                        { icon: <DashboardIcon className="w-8 h-8 text-cyan-400" />, title: "Dashboard Intuitivo", description: "Visualize suas receitas, despesas e saldo em uma interface clara e moderna." },
                                        { icon: <BotIcon className="w-8 h-8 text-cyan-400" />, title: "Inteligência Artificial Avançada", description: "Nossa IA entende seus textos e registra tudo automaticamente no seu histórico." },
                                        { icon: <PdfIcon />, title: "Relatórios Inteligentes", description: "Receba um resumo em PDF completo e profissional para download no final do mês." }
                                    ].map((feature, index) => (
                                        <div key={index} className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/80 flex flex-col items-start gap-4 transition-all hover:border-cyan-400/50 hover:bg-slate-800/80 backdrop-blur-sm">
                                            <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-700">{feature.icon}</div>
                                            <h4 className="text-xl font-bold text-white">{feature.title}</h4>
                                            <p className="text-slate-400 text-sm">{feature.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Pricing Section */}
                            <section id="pricing" className="mt-20 md:mt-32 max-w-2xl mx-auto">
                                <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-8 text-center backdrop-blur-sm">
                                    <h3 className="text-2xl font-bold text-white mb-2">Acesso Total à Plataforma IA</h3>
                                    <p className="text-5xl font-extrabold text-white mb-4">
                                        R$ 29<span className="text-3xl font-bold">,90</span><span className="text-lg font-medium text-slate-400">/mês</span>
                                    </p>
                                    <ul className="space-y-3 text-slate-300 my-8 text-left max-w-sm mx-auto">
                                        <li className="flex items-center gap-3"><CheckIcon /> Controle diário de receitas e despesas</li>
                                        <li className="flex items-center gap-3"><CheckIcon /> Dashboard completo e intuitivo</li>
                                        <li className="flex items-center gap-3"><CheckIcon /> Inteligência Artificial para análise</li>
                                        <li className="flex items-center gap-3"><CheckIcon /> Relatório em PDF no fim do mês</li>
                                        <li className="flex items-center gap-3"><CheckIcon /> Suporte prioritário</li>
                                    </ul>
                                    <button onClick={() => setView('register')} className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-all text-lg shadow-lg shadow-cyan-500/20">
                                        Teste Grátis
                                    </button>
                                    <p className="text-xs text-slate-500 mt-4">Cancele quando quiser. Sem burocracia.</p>
                                </div>
                            </section>

                        </main>

                        <footer className="relative z-10 text-center py-8 mt-16 border-t border-slate-800">
                            <p className="text-slate-500">&copy; {new Date().getFullYear()} AIFinance. Todos os direitos reservados.</p>
                        </footer>
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg')] bg-cover bg-center opacity-10 z-0"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-950/30 via-slate-950/80 to-slate-950 z-0"></div>

            <header className="sticky top-0 z-20 py-4 px-6 md:px-12 flex justify-between items-center bg-slate-900/50 backdrop-blur-lg border-b border-slate-700/50">
                <h1 className="text-xl font-bold text-white tracking-tight cursor-pointer" onClick={() => setView('landing')}>
                    <span className="text-cyan-400">AI</span>Finance
                </h1>
                <div className="flex items-center gap-4">
                    {!session && view === 'landing' && (
                         <button onClick={() => setView('login')} className="bg-transparent hover:bg-cyan-400/10 text-cyan-400 font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base border border-cyan-400/50">
                            <LoginIcon />
                            Login
                        </button>
                    )}
                </div>
            </header>
            
            <div className="relative z-10">
                {renderView()}
            </div>

        </div>
    );
};

export default App;
