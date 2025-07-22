import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { Task } from '@/types/database';
import { SortableTaskCard } from './SortableTaskCard';

interface Column {
  id: string;
  title: string;
  color: string;
  bgColor: string;
  textColor: string;
  count: number;
}

interface TaskColumnProps {
  column: Column;
  tasks: Task[];
}

export const TaskColumn: React.FC<TaskColumnProps> = ({ column, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        rounded-lg border-2 transition-all duration-200
        ${column.color}
        ${isOver ? 'border-blue-400 bg-blue-50' : column.bgColor}
      `}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-semibold text-sm ${column.textColor}`}>
            {column.title}
          </h2>
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${column.textColor} bg-white/50
          `}>
            {column.count}
          </span>
        </div>
        
        <div
          ref={setNodeRef}
          className={`
            min-h-[400px] space-y-3 transition-all duration-200
            ${isOver ? 'bg-blue-100/50 rounded-lg p-2' : ''}
          `}
        >
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <SortableTaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
          
          {tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-32 text-gray-400 text-sm"
            >
              {isOver ? 'Solte aqui' : 'Nenhuma tarefa'}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};