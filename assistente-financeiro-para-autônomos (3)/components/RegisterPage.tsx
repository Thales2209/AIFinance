

import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';
import { EmailIcon } from './icons/EmailIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

interface RegisterPageProps {
  onBack: () => void;
  setView: (view: 'login' | 'members') => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onBack, setView }) => {
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');


    const formatPhoneNumber = (value: string) => {
        if (!value) return value;
        const phoneNumber = value.replace(/[^\d]/g, '');
        const phoneNumberLength = phoneNumber.length;
        if (phoneNumberLength < 3) return `(${phoneNumber}`;
        if (phoneNumberLength < 8) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
        return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !companyName) {
            setError('Todos os campos são obrigatórios.');
            return;
        }
        
        setError('');
        setMessage('');
        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    company_name: companyName,
                    phone: phone
                }
            }
        });

        setLoading(false);
        
        if (error) {
            setError(error.message);
        } else if (data.user?.identities?.length === 0) {
            setError("Usuário já existe. Tente fazer login.");
        } else if (data.user) {
            // Check if email confirmation is required from your Supabase settings
            if (data.user.aud === 'authenticated') {
                 setMessage('Conta criada com sucesso! Redirecionando...');
                 setTimeout(() => setView('members'), 1500);
            } else {
                setMessage('Conta criada! Por favor, verifique seu e-mail para confirmar sua conta.');
            }
        }
    };

    return (
        <main className="relative z-10 container mx-auto px-6 py-16 md:py-24 flex justify-center items-center min-h-[calc(100vh-150px)]">
            <div className="w-full max-w-lg mx-auto">
                <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-8 backdrop-blur-sm">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white">Crie sua Conta de Teste</h2>
                        <p className="text-slate-400 mt-2">Comece a organizar suas finanças agora mesmo.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <BuildingOfficeIcon />
                            </span>
                            <input type="text" placeholder="Nome da Empresa" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full bg-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-transparent"/>
                        </div>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <EmailIcon />
                            </span>
                            <input type="email" placeholder="Seu melhor e-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-transparent"/>
                        </div>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <WhatsAppIcon className="w-5 h-5 text-slate-400"/>
                            </span>
                            <input type="tel" placeholder="Seu Telefone" value={phone} onChange={(e) => setPhone(formatPhoneNumber(e.target.value))} className="w-full bg-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-transparent"/>
                        </div>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <LockClosedIcon />
                            </span>
                            <input type="password" placeholder="Crie uma senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-transparent"/>
                        </div>
                        
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        {message && <p className="text-green-400 text-sm text-center">{message}</p>}

                        <button type="submit" disabled={loading || !!message} className="w-full mt-6 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-all text-lg shadow-lg shadow-cyan-500/20 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed">
                            {loading ? 'Criando conta...' : 'Criar Conta e Acessar'}
                        </button>
                    </form>
                    <div className="text-center mt-6">
                        <button onClick={onBack} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                            &larr; Voltar para o início
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};
