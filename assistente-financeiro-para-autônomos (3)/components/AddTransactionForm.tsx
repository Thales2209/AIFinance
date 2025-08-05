
import React, { useState } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import type { TablesInsert } from '../services/database.types';
// A chamada para getCategoryFromAI foi removida para simplificar o deploy.
// import { getCategoryFromAI } from '../services/aiService';

interface AddTransactionFormProps {
    onTransactionAdded: (transaction: Omit<TablesInsert<'transactions'>, 'user_id'>) => void;
}

export const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ onTransactionAdded }) => {
    const [amount, setAmount] = useState('');
    const [day, setDay] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRevenue, setIsRevenue] = useState(false);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !day || !description) {
            setError("Por favor, preencha todos os campos.");
            return;
        }
        setError(null);
        setIsLoading(true);

        try {
            const transactionType = isRevenue ? 'Receita' : 'Despesa';
            
            // SIMPLIFICAÇÃO: A categoria é definida como 'Renda' ou 'Outros' diretamente.
            // A chamada à IA foi removida.
            const category = transactionType === 'Despesa' ? 'Outros' : 'Renda';
            
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth(); // 0-indexed
            const transactionDate = new Date(year, month, parseInt(day));

            const newTransaction = {
                date: transactionDate.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit'}),
                description,
                amount: parseFloat(amount.replace(',', '.')),
                type: transactionType,
                category,
            };
            
            onTransactionAdded(newTransaction);

            // Reset form
            setAmount('');
            setDay('');
            setDescription('');
            setIsRevenue(false);

        } catch (err) {
            console.error(err);
            setError("Ocorreu um erro ao adicionar a transação.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-1">Adicionar Transação</h3>
            <p className="text-slate-400 mb-4 text-sm">Adicione suas receitas e despesas.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="flex bg-slate-700/80 rounded-lg p-1 border border-slate-600">
                    <button type="button" onClick={() => setIsRevenue(false)} className={`w-1/2 rounded-md py-1.5 text-sm font-semibold transition-colors ${!isRevenue ? 'bg-red-600/80 text-white' : 'text-slate-300 hover:bg-slate-600/50'}`}>
                        Despesa
                    </button>
                    <button type="button" onClick={() => setIsRevenue(true)} className={`w-1/2 rounded-md py-1.5 text-sm font-semibold transition-colors ${isRevenue ? 'bg-green-600/80 text-white' : 'text-slate-300 hover:bg-slate-600/50'}`}>
                        Receita
                    </button>
                </div>
                <div className="flex gap-4">
                    <div className="w-1/3">
                        <label htmlFor="amount" className="block text-xs font-medium text-slate-400 mb-1">Valor</label>
                        <input
                            id="amount"
                            type="text"
                            inputMode="decimal"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="150,50"
                            className="w-full bg-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-transparent"
                        />
                    </div>
                     <div className="w-1/3">
                        <label htmlFor="day" className="block text-xs font-medium text-slate-400 mb-1">Dia</label>
                        <input
                            id="day"
                            type="number"
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            placeholder="22"
                            min="1"
                            max="31"
                            className="w-full bg-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-transparent"
                        />
                    </div>
                     <div className="w-1/3">
                        <label htmlFor="type" className="block text-xs font-medium text-slate-400 mb-1">Tipo</label>
                        <div className="bg-slate-700 rounded-lg py-2 px-3 text-white font-semibold">
                            {isRevenue ? 'Receita' : 'Despesa'}
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="description" className="block text-xs font-medium text-slate-400 mb-1">Descrição</label>
                    <input
                        id="description"
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={isRevenue ? 'Ex: Pagamento Cliente Y' : 'Ex: Jantar com amigos'}
                        className="w-full bg-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-transparent"
                    />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-4 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="typing-indicator flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 bg-white rounded-full inline-block animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-white rounded-full inline-block animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-white rounded-full inline-block animate-bounce"></span>
                        </div>
                    ) : (
                        <>
                            <PlusIcon />
                            Adicionar
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};
