import React from 'react';
import type { WorkerTask } from '@/types';
import { Calendar, Trash2, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskCardProps {
    task: WorkerTask;
    projectName?: string;
    onEdit: (task: WorkerTask) => void;
    onDelete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, projectName, onEdit, onDelete }) => {
    // Handle drag start
    const handleDragStart = (e: any) => {
        // Cast to any to avoid conflict with Framer Motion's onDragStart type
        if (e.dataTransfer) {
            e.dataTransfer.setData('taskId', task.id);
            e.dataTransfer.effectAllowed = 'move';
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            draggable
            onDragStart={handleDragStart}
            className="p-4 rounded-xl shadow-sm cursor-move hover-lift group relative overflow-hidden bg-dark-950/50 border border-white/5 hover:border-white/10"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-[20px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Project Badge */}
            {projectName && (
                <div className="mb-2 relative z-10">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                        {projectName}
                    </span>
                </div>
            )}

            {/* Title & Actions */}
            <div className="flex justify-between items-start mb-2 relative z-10">
                <h4 className="font-bold font-display text-gray-200 text-sm leading-tight group-hover:text-primary-400 transition-colors">{task.title}</h4>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                        onClick={() => onEdit(task)}
                        className="p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                        title="Modifier"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onDelete(task.id)}
                        className="p-1 hover:bg-red-500/10 rounded-md text-gray-400 hover:text-red-500 transition-colors"
                        title="Supprimer"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Description Preview */}
            {task.description && (
                <p className="text-xs text-dark-600 dark:text-primary-300 mb-3 line-clamp-2 relative z-10">
                    {task.description}
                </p>
            )}

            {/* Footer Infos */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 relative z-10">
                <div className="flex items-center gap-2">
                    {task.assigned_to_name ? (
                        <div className="flex items-center gap-1" title={`Assigné à: ${task.assigned_to_name}`}>
                            <div className="w-5 h-5 rounded-md bg-accent-500/10 flex items-center justify-center text-[10px] font-bold text-accent-400 border border-accent-500/20">
                                {task.assigned_to_name.charAt(0)}
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-600 text-[10px] font-bold uppercase tracking-widest italic">Non assigné</div>
                    )}
                </div>

                <div className="text-[10px] font-bold uppercase tracking-widest text-dark-600 dark:text-primary-300 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-primary-400" />
                    {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
            </div>
        </motion.div>
    );
};

export default TaskCard;
