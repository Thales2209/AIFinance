import React from 'react';
import { ChartIcon } from './icons/ChartIcon';

export const DashboardPreview: React.FC = () => {
    return (
        <div className="max-w-md mx-auto bg-slate-900/80 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 flex flex-col h-[600px] backdrop-blur-sm p-6">
            <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600">
                    <ChartIcon className="w-7 h-7 text-cyan-400" />
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg">Dashboard Intuitivo</h3>
                    <p className="text-sm text-slate-400">Visão geral das suas finanças.</p>
                </div>
            </div>
            
            {/* Fake Chart */}
            <div className="flex-1 border border-slate-700 rounded-lg p-4 flex flex-col justify-end gap-2 bg-slate-800/50">
                <div className="flex items-end justify-around h-full gap-2">
                    <div className="w-full bg-red-500/50 rounded-t-sm" style={{ height: '40%' }}></div>
                    <div className="w-full bg-green-500/50 rounded-t-sm" style={{ height: '70%' }}></div>
                    <div className="w-full bg-red-500/50 rounded-t-sm" style={{ height: '30%' }}></div>
                    <div className="w-full bg-green-500/50 rounded-t-sm" style={{ height: '85%' }}></div>
                    <div className="w-full bg-red-500/50 rounded-t-sm" style={{ height: '55%' }}></div>
                    <div className="w-full bg-green-500/50 rounded-t-sm" style={{ height: '60%' }}></div>
                </div>
                 <div className="border-t border-slate-700 mt-2 flex justify-around text-xs text-slate-500 pt-1">
                    <span>Jan</span>
                    <span>Fev</span>
                    <span>Mar</span>
                    <span>Abr</span>
                    <span>Mai</span>
                    <span>Jun</span>
                </div>
            </div>

            {/* Fake Transactions */}
            <div className="mt-6">
                <h4 className="font-semibold text-slate-300 mb-2">Lançamentos Recentes</h4>
                <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-lg">
                        <p className="text-sm text-white">Pagamento Cliente Y</p>
                        <p className="text-sm font-bold text-green-400">+ R$ 2.500,00</p>
                    </div>
                    <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-lg">
                        <p className="text-sm text-white">Aluguel do Escritório</p>
                        <p className="text-sm font-bold text-red-400">- R$ 800,00</p>
                    </div>
                     <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-lg opacity-70">
                        <p className="text-sm text-white">Gasolina</p>
                        <p className="text-sm font-bold text-red-400">- R$ 150,50</p>
                    </div>
                </div>
            </div>
        </div>
    );
};