import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Transaction, MonthlySummary } from '../types';

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const ChartView: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    
    const monthlyData = useMemo(() => {
        const data: MonthlySummary[] = months.map(month => ({ name: month, Receita: 0, Despesa: 0 }));

        transactions.forEach(tx => {
            const [_, monthStr] = tx.date.split('/');
            const monthIndex = parseInt(monthStr, 10) - 1;

            if (monthIndex >= 0 && monthIndex < 12) {
                if (tx.type === 'Receita') {
                    data[monthIndex].Receita += tx.amount;
                } else {
                    data[monthIndex].Despesa += tx.amount;
                }
            }
        });
        
        return data;
    }, [transactions]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800/80 border border-slate-600 backdrop-blur-sm p-3 rounded-lg shadow-lg">
                    <p className="font-bold text-white mb-2">{`${label}`}</p>
                    <p className="text-sm text-green-400">{`Receita: R$ ${payload[0].value.toFixed(2).replace('.', ',')}`}</p>
                    <p className="text-sm text-red-400">{`Despesa: R$ ${payload[1].value.toFixed(2).replace('.', ',')}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full">
            <h2 className="text-3xl font-bold text-white mb-6">Resumo Financeiro Anual</h2>
            <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={monthlyData}
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                        barGap={8}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `R$${value/1000}k`} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}/>
                        <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                        <Bar dataKey="Receita" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};