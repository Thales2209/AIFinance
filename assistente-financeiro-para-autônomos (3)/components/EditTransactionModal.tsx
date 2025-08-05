
import React, { useState, useEffect } from 'react';
import type { Transaction } from '../types';

interface EditTransactionModalProps {
    transaction: Transaction;
    onClose: () => void;
    onSave: (transaction: Transaction) => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ transaction, onClose, onSave }) => {
    const [formData, setFormData] = useState<Transaction>({ ...transaction });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData({ ...transaction });
    }, [transaction]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value.replace(',', '.')) || 0 : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        onSave(formData);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-white mb-6">Editar Transação</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-slate-400 mb-1">Data</label>
                        <input
                            id="date"
                            name="date"
                            type="text"
                            value={formData.date}
                            onChange={handleChange}
                            placeholder="DD/MM/AAAA"
                            className="w-full bg-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-transparent"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
                        <input
                            id="description"
                            name="description"
                            type="text"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full bg-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-transparent"
                        />
                    </div>
                     <div className="flex gap-4">
                        <div className="w-1/2">
                             <label htmlFor="amount" className="block text-sm font-medium text-slate-400 mb-1">Valor</label>
                            <input
                                id="amount"
                                name="amount"
                                type="text"
                                inputMode="decimal"
                                value={String(formData.amount).replace('.', ',')}
                                onChange={handleChange}
                                className="w-full bg-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-transparent"
                            />
                        </div>
                        <div className="w-1/2">
                            <label htmlFor="type" className="block text-sm font-medium text-slate-400 mb-1">Tipo</label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full bg-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-transparent"
                            >
                                <option value="Despesa">Despesa</option>
                                <option value="Receita">Receita</option>
                            </select>
                        </div>
                    </div>
                    <div>
                         <label htmlFor="category" className="block text-sm font-medium text-slate-400 mb-1">Categoria</label>
                        <input
                            id="category"
                            name="category"
                            type="text"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full bg-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-transparent"
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSaving} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:from-slate-600 disabled:to-slate-700">
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};