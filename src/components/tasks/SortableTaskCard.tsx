import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Task } from '@/types/database';
import { Calendar, Clock, User, AlertCircle } from 'lucide-react';

interface SortableTaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export const SortableTaskCard: React.FC<SortableTaskCardProps> = ({ task, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Calendar className="h-4 w-4 text-green-500" />;
      default: return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing
        ${getPriorityColor(task.priority)}
        ${isDragging || isSortableDragging ? 'opacity-50 rotate-2 scale-105' : ''}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
            {task.title}
          </h3>
          {getPriorityIcon(task.priority)}
        </div>
        
        {task.description && (
          <p className="text-gray-600 text-xs mb-3 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(task.due_date)}</span>
          </div>
          
          {task.assigned_to && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-16">
                {task.assigned_to}
              </span>
            </div>
          )}
        </div>
        
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};