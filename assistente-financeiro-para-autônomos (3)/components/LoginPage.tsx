

import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { EmailIcon } from './icons/EmailIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';

interface LoginPageProps {
    onBack: () => void;
    setView: (view: 'members') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBack, setView }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        setLoading(false);
        if (error) {
            setError('E-mail ou senha inválidos.');
        } else {
            setView('members');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-8 text-center backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white mb-2">Acessar Área de Membros</h2>
                <p className="text-slate-400 mb-6">Insira seu e-mail e senha para continuar.</p>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <EmailIcon />
                        </span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            className="w-full bg-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-transparent"
                        />
                    </div>
                     <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <LockClosedIcon />
                        </span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Sua senha"
                            className="w-full bg-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-transparent"
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full mt-4 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-all text-lg shadow-lg shadow-cyan-500/20 disabled:from-slate-600 disabled:to-slate-700">
                        {loading ? 'Acessando...' : 'Acessar'}
                    </button>
                </form>
                <div className="text-center mt-6">
                    <button onClick={onBack} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                        &larr; Voltar para o início
                    </button>
                </div>
            </div>
        </div>
    );
};
