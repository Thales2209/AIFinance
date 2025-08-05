
import React, { useState, useMemo } from 'react';
import type { Task } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import type { TablesInsert } from '../services/database.types';

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const monthsOfYear = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

interface CalendarViewProps {
    tasks: Task[];
    onAddTask: (task: Omit<TablesInsert<'tasks'>, 'user_id'>) => void;
    onUpdateTask: (task: Task) => void;
    onRemoveTask: (taskId: string) => void;
}


export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onAddTask, onUpdateTask, onRemoveTask }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [newTaskDescription, setNewTaskDescription] = useState('');

    const tasksByDate = useMemo(() => {
        const map = new Map<string, Task[]>();
        tasks.forEach(task => {
            const [day, month, year] = task.date.split('/');
            const dateKey = `${year}-${parseInt(month, 10)}-${parseInt(day, 10)}`;
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)?.push(task);
        });
        return map;
    }, [tasks]);

    const changeMonth = (offset: number) => {
        setSelectedDay(null);
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };
    
    const handleDayClick = (day: number) => {
        if (selectedDay === day) {
            setSelectedDay(null);
        } else {
            setSelectedDay(day);
        }
    };
    
     const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskDescription.trim() || !selectedDay) return;
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const taskDate = new Date(year, month, selectedDay);
        
        const newTask: Omit<TablesInsert<'tasks'>, 'user_id'> = {
            date: taskDate.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit'}),
            description: newTaskDescription,
            status: 'A Fazer'
        };
        
        onAddTask(newTask);
        setNewTaskDescription('');
    };

    const handleStatusChange = (task: Task, newStatus: Task['status']) => {
        onUpdateTask({ ...task, status: newStatus });
    };

    
    const selectedDayTasks = useMemo(() => {
        if (!selectedDay) return [];
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const dateKey = `${year}-${month}-${selectedDay}`;
        // Sort tasks: In Progress, To Do, Done
        const statusOrder = { 'Em Andamento': 1, 'A Fazer': 2, 'Finalizada': 3 };
        return (tasksByDate.get(dateKey) || []).sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    }, [selectedDay, currentDate, tasksByDate]);

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const calendarDays = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="p-2"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${month + 1}-${day}`;
            const hasTasks = tasksByDate.has(dateKey);
            const isSelected = selectedDay === day;

            calendarDays.push(
                <button 
                    key={day} 
                    onClick={() => handleDayClick(day)}
                    className={`p-2 border rounded-md text-center transition-colors ${
                        isSelected ? 'bg-cyan-500/30 border-cyan-400' : 'border-slate-700/50 bg-slate-800/50 hover:bg-slate-700'
                    } cursor-pointer`}
                >
                    <span className="font-semibold text-white">{day}</span>
                    {hasTasks && (
                        <div className="flex justify-center mt-1.5">
                           <span className={`w-2 h-2 ${isSelected ? 'bg-white' : 'bg-cyan-400'} rounded-full`}></span>
                        </div>
                    )}
                </button>
            );
        }
        return calendarDays;
    };

    const getStatusColorClasses = (status: Task['status']) => {
        switch (status) {
            case 'A Fazer': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
            case 'Em Andamento': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case 'Finalizada': return 'bg-green-500/20 text-green-300 border-green-500/30';
            default: return '';
        }
    };


    return (
        <div className="w-full">
            <h2 className="text-3xl font-bold text-white mb-6">Calendário de Tarefas</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-700 transition-colors">&larr;</button>
                        <h3 className="text-xl font-bold text-white">{monthsOfYear[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-700 transition-colors">&rarr;</button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {daysOfWeek.map(day => (
                            <div key={day} className="text-center font-bold text-cyan-400 p-2">{day}</div>
                        ))}
                        {renderCalendar()}
                    </div>
                    <div className="flex items-center gap-2 mt-6 text-sm text-slate-400">
                        <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full inline-block"></span>
                        <span>Dia com tarefas registradas</span>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    {selectedDay ? (
                        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm h-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white">
                                    Tarefas de {selectedDay}/{currentDate.getMonth()+1}
                                </h3>
                                <button onClick={() => setSelectedDay(null)} className="p-1.5 rounded-full hover:bg-slate-700 transition-colors">
                                    <CloseIcon />
                                </button>
                            </div>

                             <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newTaskDescription}
                                    onChange={(e) => setNewTaskDescription(e.target.value)}
                                    placeholder="Adicionar nova tarefa..."
                                    className="flex-grow bg-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-transparent"
                                />
                                <button type="submit" aria-label="Adicionar tarefa" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold p-2 rounded-lg transition-colors flex-shrink-0 disabled:bg-slate-600" disabled={!newTaskDescription.trim()}>
                                    <PlusIcon />
                                </button>
                            </form>

                            <div className="space-y-3 overflow-y-auto max-h-[420px] pr-2">
                                {selectedDayTasks.length > 0 ? selectedDayTasks.map(task => (
                                    <div key={task.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700/70 flex items-center justify-between gap-2">
                                        <p className={`font-semibold text-white text-sm flex-grow ${task.status === 'Finalizada' ? 'line-through text-slate-400' : ''}`}>
                                            {task.description}
                                        </p>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <select
                                                value={task.status}
                                                onChange={(e) => handleStatusChange(task, e.target.value as Task['status'])}
                                                className={`text-xs font-bold rounded-lg py-1 pl-2 pr-2 appearance-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 border-2 ${getStatusColorClasses(task.status)}`}
                                            >
                                                <option value="A Fazer">A Fazer</option>
                                                <option value="Em Andamento">Em Andamento</option>
                                                <option value="Finalizada">Finalizada</option>
                                            </select>
                                            <button onClick={() => onRemoveTask(task.id)} className="text-slate-500 hover:text-red-400 p-1.5 rounded-full hover:bg-red-500/10" aria-label="Remover tarefa">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-slate-400 text-center py-8">Nenhuma tarefa para este dia.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm h-full flex items-center justify-center min-h-[200px]">
                            <p className="text-slate-400 text-center">Selecione um dia no calendário para ver ou adicionar tarefas.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
