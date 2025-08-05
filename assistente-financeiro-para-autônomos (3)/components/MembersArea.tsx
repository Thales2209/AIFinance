
import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './Sidebar';
import { ChartView } from './ChartView';
import { TransactionsView } from './TransactionsView';
import { CalendarView } from './CalendarView';
import { PdfExporterView } from './PdfExporterView';
import { SettingsView } from './SettingsView';
import type { Transaction, Task } from '../types';
import { UpgradeModal } from './UpgradeModal';
import { supabase } from '../services/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import type { Tables, TablesInsert } from '../services/database.types';


type ActiveView = 'chart' | 'transactions' | 'calendar' | 'pdf_exporter' | 'settings';

interface MembersAreaProps {
    session: Session;
    onLogout: () => void;
}

export const MembersArea: React.FC<MembersAreaProps> = ({ session, onLogout }) => {
    const [activeView, setActiveView] = useState<ActiveView>('chart');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isProUser, setIsProUser] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [upgradeModalMessage, setUpgradeModalMessage] = useState('');
    const user = session.user;

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);

            // Fetch profile to check pro status
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('is_pro')
                .eq('id', user.id)
                .single();

            if (profileError) console.error('Error fetching profile:', profileError);
            setIsProUser(profile?.is_pro || false);
            
            // Fetch transactions
            const { data: transactionsData, error: transactionsError } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });
            
            if (transactionsError) console.error('Error fetching transactions:', transactionsError);
            else setTransactions(transactionsData || []);

             // Fetch tasks
            const { data: tasksData, error: tasksError } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (tasksError) console.error('Error fetching tasks:', tasksError);
            else setTasks(tasksData || []);

            setLoading(false);
        };
        fetchData();

        // Set up real-time subscription for profile changes (e.g., after upgrading)
        const profileSubscription = supabase
            .channel(`public:profiles:id=eq.${user.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
                const newProfile = payload.new as Tables<'profiles'>;
                if (newProfile.is_pro) {
                    setIsProUser(newProfile.is_pro);
                }
                setUpgradeModalOpen(false); // Close modal on successful upgrade
            })
            .subscribe();

        return () => {
            supabase.removeChannel(profileSubscription);
        };

    }, [user]);

    const openUpgradeModal = (message: string) => {
        setUpgradeModalMessage(message);
        setUpgradeModalOpen(true);
    };
    
    const handleAddTransaction = async (newTransaction: Omit<TablesInsert<'transactions'>, 'user_id'>) => {
        if (!user) return;

        if (!isProUser) {
            const { count: expenseCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('type', 'Despesa');
            const { count: revenueCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('type', 'Receita');

            if (newTransaction.type === 'Despesa' && (expenseCount ?? 0) >= 5) {
                openUpgradeModal('Você atingiu o limite de 5 despesas do plano de teste.');
                return;
            }
            if (newTransaction.type === 'Receita' && (revenueCount ?? 0) >= 5) {
                openUpgradeModal('Você atingiu o limite de 5 receitas do plano de teste.');
                return;
            }
        }
        
        const { data, error } = await supabase
            .from('transactions')
            .insert({ ...newTransaction, user_id: user.id })
            .select()
            .single();

        if (error) console.error('Error adding transaction:', error);
        else if(data) setTransactions(prev => [data, ...prev]);
    };

    const handleRemoveTransaction = async (transactionId: string) => {
        const { error } = await supabase.from('transactions').delete().eq('id', transactionId);
        if (error) console.error('Error removing transaction:', error);
        else setTransactions(prev => prev.filter(tx => tx.id !== transactionId));
    };

    const handleEditTransaction = async (updatedTransaction: Transaction) => {
        const { data, error } = await supabase
            .from('transactions')
            .update(updatedTransaction)
            .eq('id', updatedTransaction.id)
            .select()
            .single();
        
        if (error) console.error('Error editing transaction:', error);
        else if (data) {
            setTransactions(prev =>
                prev.map(tx => (tx.id === data.id ? data : tx))
            );
        }
    };

    const handleImportTransactions = async (importedTransactions: Omit<TablesInsert<'transactions'>, 'user_id'>[]) => {
        if (!user) return;
        if (!isProUser) {
            openUpgradeModal('A importação de planilhas é uma funcionalidade exclusiva do plano Pro.');
            return;
        }
        const transactionsWithUser = importedTransactions.map(tx => ({ ...tx, user_id: user.id }));
        const { data, error } = await supabase.from('transactions').insert(transactionsWithUser).select();
        
        if (error) console.error('Error importing transactions:', error);
        else if (data) setTransactions(prev => [...data, ...prev]);
    };

    const handleAddTask = async (newTask: Omit<TablesInsert<'tasks'>, 'user_id'>) => {
        if (!user) return;
        const { data, error } = await supabase.from('tasks').insert({ ...newTask, user_id: user.id }).select().single();
        if (error) console.error('Error adding task:', error);
        else if(data) setTasks(prev => [data, ...prev]);
    };

    const handleUpdateTask = async (updatedTask: Omit<Task, 'user_id'>) => {
        const { data, error } = await supabase.from('tasks').update({ status: updatedTask.status }).eq('id', updatedTask.id).select().single();
        if (error) console.error('Error updating task:', error);
        else if(data) setTasks(prev => prev.map(task => task.id === data.id ? data : task));
    };

    const handleRemoveTask = async (taskId: string) => {
        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        if (error) console.error('Error removing task:', error);
        else setTasks(prev => prev.filter(task => task.id !== taskId));
    };

    const renderActiveView = () => {
        if (loading) {
            return (
                 <div className="flex-1 flex justify-center items-center">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
                </div>
            );
        }

        switch (activeView) {
            case 'chart':
                return <ChartView transactions={transactions} />;
            case 'transactions':
                return <TransactionsView 
                            transactions={transactions} 
                            onTransactionAdded={handleAddTransaction}
                            onTransactionRemoved={handleRemoveTransaction}
                            onTransactionEdited={handleEditTransaction}
                            onTransactionsImported={handleImportTransactions}
                            isProUser={isProUser}
                            openUpgradeModal={openUpgradeModal}
                        />;
            case 'calendar':
                return <CalendarView 
                            tasks={tasks}
                            onAddTask={handleAddTask}
                            onUpdateTask={handleUpdateTask}
                            onRemoveTask={handleRemoveTask}
                        />;
            case 'pdf_exporter':
                return <PdfExporterView 
                            userEmail={user.email || ''} 
                            transactions={transactions} 
                            onTransactionEdited={handleEditTransaction}
                            isProUser={isProUser}
                            openUpgradeModal={openUpgradeModal}
                        />;
            case 'settings':
                return <SettingsView userEmail={user.email || ''} />;
            default:
                return <ChartView transactions={transactions} />;
        }
    }
    
    return (
        <main className="relative z-10 container mx-auto px-6 py-8 md:py-12 flex justify-center items-start min-h-[calc(100vh-80px)] w-full">
            <div className="flex w-full max-w-7xl gap-8">
                <Sidebar 
                    activeView={activeView} 
                    setActiveView={setActiveView} 
                    onLogout={onLogout} 
                />
                <div className="flex-1">
                    {renderActiveView()}
                </div>
            </div>
             {isUpgradeModalOpen && (
                <UpgradeModal 
                    message={upgradeModalMessage} 
                    onClose={() => setUpgradeModalOpen(false)} 
                    userEmail={user.email}
                />
            )}
        </main>
    );
};
