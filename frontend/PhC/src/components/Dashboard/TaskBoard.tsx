import React, { useState } from 'react';
import type { WorkerTask, WorkerProject, TaskStatus } from '@/types';
import TaskCard from './TaskCard';
import { taskAPI } from '@/services/api';
import { ListFilter } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TaskBoardProps {
    tasks: WorkerTask[];
    projects: WorkerProject[];
    onTaskUpdate: () => void;
    onEditTask: (task: WorkerTask) => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string; headerColor: string; badge: string }[] = [
    {
        id: 'TODO',
        label: 'À faire',
        color: 'glass-panel border-white/5',
        headerColor: 'text-gray-300',
        badge: 'bg-dark-800/50 text-gray-400 border border-white/10'
    },
    {
        id: 'IN_PROGRESS',
        label: 'En cours',
        color: 'glass-panel border-primary-500/20 bg-primary-500/5',
        headerColor: 'text-primary-400',
        badge: 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
    },
    {
        id: 'REVIEW',
        label: 'En revue',
        color: 'glass-panel border-accent-500/20 bg-accent-500/5',
        headerColor: 'text-accent-400',
        badge: 'bg-accent-500/10 text-accent-400 border border-accent-500/20'
    },
    {
        id: 'DONE',
        label: 'Terminé',
        color: 'glass-panel border-green-500/20 bg-green-500/5',
        headerColor: 'text-green-400',
        badge: 'bg-green-500/10 text-green-400 border border-green-500/20'
    }
];

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, projects, onTaskUpdate, onEditTask }) => {
    const [filterProject, setFilterProject] = useState<string>('all');

    // Derived state
    const filteredTasks = tasks.filter(t =>
        filterProject === 'all' ? true : t.project === filterProject
    );

    const getTasksByStatus = (status: TaskStatus) =>
        filteredTasks.filter(t => t.status === status);

    const getProjectName = (projectId: string) =>
        projects.find(p => p.id === projectId)?.title || 'Projet inconnu';

    // Handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Allow drop
    };

    const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');

        if (!taskId) return;

        // Optimistic check (prevent unnecessary API call if same status)
        const task = tasks.find(t => t.id === taskId);
        if (task && task.status === status) return;

        try {
            // Call API
            await taskAPI.update(taskId, { status });
            toast.success(`Tâche déplacée vers ${status}`);
            onTaskUpdate();
        } catch (error) {
            toast.error("Impossible de mettre à jour la tâche");
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Supprimer cette tâche ?")) return;
        try {
            await taskAPI.delete(id);
            toast.success("Tâche supprimée");
            onTaskUpdate();
        } catch (error) {
            toast.error("Erreur suppression");
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col pt-2">
            {/* Filters / Toolbar */}
            <div className="flex justify-between items-center glass-panel p-4 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[30px] pointer-events-none" />
                <div className="flex items-center gap-4 relative z-10">
                    <div className="flex items-center gap-2 text-gray-400">
                        <ListFilter className="w-5 h-5 text-primary-400" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-300 hidden md:inline">Filtrer :</span>
                    </div>
                    <select
                        className="p-2.5 border border-white/5 rounded-xl text-sm bg-dark-950 text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all cursor-pointer hover:border-white/10"
                        value={filterProject}
                        onChange={(e) => setFilterProject(e.target.value)}
                    >
                        <option value="all">Tous les projets</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                </div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-primary-400 bg-primary-500/10 px-3 py-1.5 rounded-md border border-primary-500/20 relative z-10">
                    {filteredTasks.length} <span className="hidden sm:inline">tâches trouvées</span>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto hide-scrollbar">
                <div className="flex gap-6 min-w-[1000px] h-full pb-4">
                    {COLUMNS.map(col => (
                        <div
                            key={col.id}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col.id)}
                            className={`flex-1 min-w-[280px] rounded-3xl p-5 flex flex-col gap-4 border transition-colors duration-300 relative overflow-hidden ${col.color}`}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-2 relative z-10">
                                <h3 className={`font-bold font-display tracking-wide ${col.headerColor}`}>{col.label}</h3>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md shadow-sm border ${col.badge} uppercase tracking-wider`}>
                                    {getTasksByStatus(col.id).length}
                                </span>
                            </div>

                            {/* Drop Zone / List */}
                            <div className="flex-1 flex flex-col gap-3 min-h-[200px] overflow-y-auto hide-scrollbar z-10 relative pr-1 -mr-1">
                                {getTasksByStatus(col.id).map(task => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        projectName={getProjectName(task.project)}
                                        onEdit={onEditTask}
                                        onDelete={handleDelete}
                                    />
                                ))}
                                {getTasksByStatus(col.id).length === 0 && (
                                    <div className="h-24 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center text-dark-600 dark:text-primary-300 text-sm font-medium italic hover:border-primary-500/20 hover:bg-white/5 transition-all">
                                        Glisser ici
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TaskBoard;
