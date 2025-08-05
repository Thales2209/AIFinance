import React from 'react';
import { ChartIcon } from './icons/ChartIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { PdfIcon } from './icons/PdfIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';

type ActiveView = 'chart' | 'transactions' | 'calendar' | 'pdf_exporter' | 'settings';

interface SidebarProps {
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
    onLogout: () => void;
}

const NavItem = ({ icon, label, isActive, onClick }: { icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; }) => (
    <li>
        <button
            onClick={onClick}
            className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors text-base font-semibold ${
                isActive 
                ? 'bg-cyan-500/20 text-cyan-300' 
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    </li>
);

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onLogout }) => {
    return (
        <aside className="w-64 flex-shrink-0 bg-slate-800/40 border border-slate-700 rounded-2xl p-4 backdrop-blur-sm flex flex-col justify-between self-start">
            <div>
                <nav>
                    <ul className="space-y-2">
                         <NavItem
                            icon={<ChartIcon />}
                            label="Gráfico Anual"
                            isActive={activeView === 'chart'}
                            onClick={() => setActiveView('chart')}
                        />
                        <NavItem
                            icon={<ClipboardListIcon />}
                            label="Lançamentos"
                            isActive={activeView === 'transactions'}
                            onClick={() => setActiveView('transactions')}
                        />
                        <NavItem
                            icon={<CalendarIcon />}
                            label="Calendário"
                            isActive={activeView === 'calendar'}
                            onClick={() => setActiveView('calendar')}
                        />
                        <NavItem
                            icon={<PdfIcon />}
                            label="Exportar PDF"
                            isActive={activeView === 'pdf_exporter'}
                            onClick={() => setActiveView('pdf_exporter')}
                        />
                         <NavItem
                            icon={<SettingsIcon />}
                            label="Configurações"
                            isActive={activeView === 'settings'}
                            onClick={() => setActiveView('settings')}
                        />
                    </ul>
                </nav>
            </div>
            <div>
                <button
                    onClick={onLogout}
                    className="flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors text-base font-semibold text-red-400 hover:bg-red-500/10"
                >
                    <LogoutIcon />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
};