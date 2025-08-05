
import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import type { Transaction } from '../types';
import { AddTransactionForm } from './AddTransactionForm';
import { TrashIcon } from './icons/TrashIcon';
import { UploadIcon } from './icons/UploadIcon';
import { PencilIcon } from './icons/PencilIcon';
import { EditTransactionModal } from './EditTransactionModal';
import type { TablesInsert } from '../services/database.types';

interface TransactionsViewProps {
    transactions: Transaction[];
    onTransactionAdded: (transaction: Omit<TablesInsert<'transactions'>, 'user_id'>) => void;
    onTransactionRemoved: (transactionId: string) => void;
    onTransactionEdited: (transaction: Transaction) => void;
    onTransactionsImported: (transactions: Omit<TablesInsert<'transactions'>, 'user_id'>[]) => void;
    isProUser: boolean;
    openUpgradeModal: (message: string) => void;
}

const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, onTransactionAdded, onTransactionRemoved, onTransactionEdited, onTransactionsImported, isProUser, openUpgradeModal }) => {
    const [selectedMonth, setSelectedMonth] = useState<string>('all');
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const availableYears = useMemo(() => {
        const years = new Set(transactions.map(tx => tx.date.split('/')[2]));
        return ['all', ...Array.from(years).sort((a, b) => parseInt(b, 10) - parseInt(a, 10))];
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const [_, month, year] = tx.date.split('/');
            const monthMatch = selectedMonth === 'all' || parseInt(month, 10) === parseInt(selectedMonth, 10);
            const yearMatch = selectedYear === 'all' || year === selectedYear;
            return monthMatch && yearMatch;
        });
    }, [transactions, selectedMonth, selectedYear]);
    
    const handleImportClick = () => {
        if (isProUser) {
            fileInputRef.current?.click();
        } else {
            openUpgradeModal('A importação de planilhas é uma funcionalidade exclusiva do plano Pro.');
        }
    };


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setImportError(null);
        setImportSuccess(null);

        try {
            const data = new Uint8Array(await file.arrayBuffer());
            const workbook = XLSX.read(data, { type: 'array', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet);

            if (json.length === 0) {
                throw new Error("A planilha está vazia.");
            }

            const firstRow = json[0];
            if (!('Data' in firstRow && 'Descrição' in firstRow && 'Valor' in firstRow && 'Tipo' in firstRow)) {
                throw new Error("A planilha deve conter as colunas: Data, Descrição, Valor, Tipo.");
            }
            
            const newTransactions = json.map((row: any): Omit<TablesInsert<'transactions'>, 'user_id'> => {
                const type = String(row.Tipo).trim() === 'Receita' ? 'Receita' : 'Despesa';
                const description = String(row.Descrição);
                const category = type === 'Receita' ? 'Renda' : "Outros";
                
                return {
                    date: new Date(row.Data).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit'}),
                    description,
                    amount: parseFloat(row.Valor),
                    type,
                    category,
                };
            });
            
            onTransactionsImported(newTransactions);
            setImportSuccess(`${newTransactions.length} transações importadas com sucesso!`);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erro ao processar a planilha.";
            setImportError(errorMessage);
            console.error(err);
        } finally {
                setIsImporting(false);
                if(e.target) e.target.value = '';
        }
    };

    const summary = useMemo(() => {
        let totalReceitas = 0;
        let totalDespesas = 0;
        
        filteredTransactions.forEach(tx => {
            if (tx.type === 'Receita') {
                totalReceitas += tx.amount;
            } else {
                totalDespesas += tx.amount;
            }
        });

        const saldo = totalReceitas - totalDespesas;
        return { totalReceitas, totalDespesas, saldo };

    }, [filteredTransactions]);

    const SummaryCard = ({ title, value, colorClass }: { title: string, value: number, colorClass: string }) => (
         <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50">
            <p className="text-sm text-slate-400 mb-1">{title}</p>
            <p className={`text-3xl font-bold ${colorClass}`}>
                R$ {value.toFixed(2).replace('.', ',')}
            </p>
        </div>
    );

    return (
        <div className="w-full">
            <h2 className="text-3xl font-bold text-white mb-6">Lançamentos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Total de Receitas" value={summary.totalReceitas} colorClass="text-green-400" />
                <SummaryCard title="Total de Despesas" value={summary.totalDespesas} colorClass="text-red-400" />
                <SummaryCard title="Saldo do Período" value={summary.saldo} colorClass={summary.saldo >= 0 ? 'text-cyan-400' : 'text-red-400'} />
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                    <AddTransactionForm onTransactionAdded={onTransactionAdded} />
                </div>
                <div className="lg:col-span-3">
                    <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm h-full flex flex-col">
                         <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4 md:gap-2">
                            <h3 className="text-xl font-bold text-white">Atividade Recente</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleImportClick}
                                    disabled={isImporting}
                                    className="bg-cyan-600/80 hover:bg-cyan-500 text-white font-bold py-1 px-3 rounded-lg text-sm flex items-center gap-2 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                                >
                                    <UploadIcon />
                                    {isImporting ? 'Processando...' : 'Importar Planilha'}
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx, .xls" className="hidden" />
                            </div>
                         </div>
                         {importError && <p className="text-red-400 text-sm mb-2">{importError}</p>}
                         {importSuccess && <p className="text-green-400 text-sm mb-2">{importSuccess}</p>}
                         <div className="flex gap-2 mb-4">
                            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-slate-700 rounded-lg py-1 px-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-transparent w-full">
                                <option value="all">Todos os Meses</option>
                                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                            </select>
                            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="bg-slate-700 rounded-lg py-1 px-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-transparent w-full">
                                {availableYears.map(y => <option key={y} value={y}>{y === 'all' ? 'Todos os Anos' : y}</option>)}
                            </select>
                        </div>
                         <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                            {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
                                <div key={tx.id} className="flex justify-between items-center bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
                                    <div className="flex-1 overflow-hidden mr-2">
                                        <p className="font-semibold text-white truncate">{tx.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-slate-400">{tx.date}</p>
                                            <span className="text-slate-500">&bull;</span>
                                            <span className="text-xs bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-700/50">{tx.category}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <p className={`font-bold text-lg ${tx.type === 'Receita' ? 'text-green-400' : 'text-red-400'}`}>
                                            {tx.type === 'Receita' ? '+' : '-'} R$ {tx.amount.toFixed(2).replace('.', ',')}
                                        </p>
                                        <button onClick={() => setEditingTransaction(tx)} className="text-slate-500 hover:text-cyan-400 transition-colors p-2 rounded-full hover:bg-cyan-500/10" aria-label="Editar transação">
                                            <PencilIcon />
                                        </button>
                                        <button onClick={() => onTransactionRemoved(tx.id)} className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-500/10" aria-label="Remover transação">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                 <div className="text-center py-16">
                                     <p className="text-slate-400">Nenhuma transação encontrada.</p>
                                     <p className="text-sm text-slate-500">Tente ajustar os filtros ou adicionar um novo lançamento.</p>
                                 </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {editingTransaction && (
                <EditTransactionModal
                    transaction={editingTransaction}
                    onClose={() => setEditingTransaction(null)}
                    onSave={(updatedTransaction) => {
                        onTransactionEdited(updatedTransaction);
                        setEditingTransaction(null);
                    }}
                />
            )}
        </div>
    );
};
