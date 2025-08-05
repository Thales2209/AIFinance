import React from 'react';
import { EmailIcon } from './icons/EmailIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';

interface SettingsViewProps {
    userEmail: string;
}

const InfoField = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div>
        <label className="block text-sm font-medium text-slate-400">{label}</label>
        <div className="mt-1 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                {icon}
            </span>
            <div className="w-full bg-slate-700/80 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 border border-slate-600">
                {value}
            </div>
        </div>
    </div>
);


export const SettingsView: React.FC<SettingsViewProps> = ({ userEmail }) => {
    return (
        <div className="w-full">
            <h2 className="text-3xl font-bold text-white mb-6">Configurações de Perfil</h2>
            <div className="max-w-2xl">
                 <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-8 backdrop-blur-sm">
                    <div className="space-y-6">
                        <InfoField icon={<EmailIcon />} label="Seu E-mail" value={userEmail} />
                        <InfoField icon={<BuildingOfficeIcon />} label="Nome da Empresa (Em breve)" value="Minha Empresa Fantástica" />
                        
                        <div>
                             <label className="block text-sm font-medium text-slate-400">Senha</label>
                             <button className="mt-2 w-full md:w-auto bg-transparent hover:bg-cyan-400/10 text-cyan-400 font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2 text-sm border border-cyan-400/50">
                                <LockClosedIcon />
                                Alterar Senha (Em breve)
                            </button>
                        </div>

                    </div>
                 </div>
            </div>
        </div>
    );
};
