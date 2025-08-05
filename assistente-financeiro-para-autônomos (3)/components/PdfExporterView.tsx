

import React, { useState } from 'react';
import type { Transaction } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PdfIcon } from './icons/PdfIcon';
import { PencilIcon } from './icons/PencilIcon';
import { EditTransactionModal } from './EditTransactionModal';

// Add declarations for jsPDF and jsPDF-AutoTable.
// This augments the 'jspdf' module to add the 'autoTable' plugin properties.
declare module 'jspdf' {
  interface jsPDF {
    // The jspdf-autotable plugin adds this property to the doc instance.
    lastAutoTable: { finalY: number };
  }
}

interface PdfExporterViewProps {
    userEmail: string;
    transactions: Transaction[];
    onTransactionEdited: (transaction: Transaction) => void;
    isProUser: boolean;
    openUpgradeModal: (message: string) => void;
}

export const PdfExporterView: React.FC<PdfExporterViewProps> = ({ userEmail, transactions, onTransactionEdited, isProUser, openUpgradeModal }) => {
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const generatePDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text("Relatório Financeiro Mensal", 14, 22);
        doc.setFontSize(12);
        doc.text(`Usuário: ${userEmail}`, 14, 30);
        doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 36);

        const tableColumn = ["Data", "Descrição", "Categoria", "Tipo", "Valor (R$)"];
        const tableRows: any[] = [];

        let totalReceitas = 0;
        let totalDespesas = 0;

        transactions.forEach(tx => {
            const txData = [
                tx.date,
                tx.description,
                tx.category,
                tx.type,
                tx.amount.toFixed(2).replace('.', ',')
            ];
            tableRows.push(txData);
            if (tx.type === 'Receita') {
                totalReceitas += tx.amount;
            } else {
                totalDespesas += tx.amount;
            }
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 50,
            theme: 'grid',
            headStyles: { fillColor: [38, 166, 154] }
        });

        const finalY = doc.lastAutoTable.finalY || 50;
        const saldo = totalReceitas - totalDespesas;

        doc.setFontSize(14);
        doc.text("Resumo do Mês", 14, finalY + 15);
        doc.setFontSize(12);
        doc.text(`Total de Receitas: R$ ${totalReceitas.toFixed(2).replace('.', ',')}`, 14, finalY + 22);
        doc.text(`Total de Despesas: R$ ${totalDespesas.toFixed(2).replace('.', ',')}`, 14, finalY + 28);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Saldo Final: R$ ${saldo.toFixed(2).replace('.', ',')}`, 14, finalY + 34);


        doc.save(`relatorio-financeiro-${new Date().getFullYear()}-${new Date().getMonth() + 1}.pdf`);
    };
    
    const handleGenerateClick = () => {
        if (isProUser) {
            generatePDF();
        } else {
            openUpgradeModal('A exportação de PDF é uma funcionalidade exclusiva do plano Pro.');
        }
    };


    return (
        <div className="w-full">
            <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-white">Exportar Relatório PDF</h3>
                     <button onClick={handleGenerateClick} className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2 text-sm shadow-lg shadow-cyan-500/20">
                        <PdfIcon />
                        Gerar PDF
                    </button>
                </div>
                 <p className="text-slate-400 mb-6">Visualize suas transações e gere um relatório completo em PDF.</p>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {transactions.length > 0 ? transactions.map(tx => (
                        <div key={tx.id} className="flex justify-between items-center bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                            <div>
                                <p className="font-semibold text-white">{tx.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-slate-400">{tx.date}</p>
                                    <span className="text-slate-500">&bull;</span>
                                    <span className="text-xs bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-700/50">{tx.category}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <p className={`font-bold text-lg flex-shrink-0 ml-4 ${tx.type === 'Receita' ? 'text-green-400' : 'text-red-400'}`}>
                                    {tx.type === 'Receita' ? '+' : '-'} R$ {tx.amount.toFixed(2).replace('.', ',')}
                                </p>
                                <button onClick={() => setEditingTransaction(tx)} className="text-slate-500 hover:text-cyan-400 transition-colors p-2 rounded-full hover:bg-cyan-500/10" aria-label="Editar transação">
                                    <PencilIcon />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <p className="text-slate-400 text-center py-8">Nenhuma transação registrada ainda.</p>
                    )}
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