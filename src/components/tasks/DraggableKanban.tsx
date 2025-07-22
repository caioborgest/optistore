import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core';
import { 
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { Task } from '@/types/database';
import { SortableTaskCard } from './SortableTaskCard';
import { TaskColumn } from './TaskColumn';

interface DraggableKanbanProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: string) => Promise<void>;
}

export const DraggableKanban: React.FC<DraggableKanbanProps> = ({ tasks, onTaskMove }) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = [
    { 
      id: 'pending', 
      title: 'Pendentes', 
      color: 'border-gray-300', 
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      count: tasks.filter(t => t.status === 'pending').length
    },
    { 
      id: 'in_progress', 
      title: 'Em Progresso', 
      color: 'border-blue-300', 
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      count: tasks.filter(t => t.status === 'in_progress').length
    },
    { 
      id: 'completed', 
      title: 'Concluídas', 
      color: 'border-green-300', 
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      count: tasks.filter(t => t.status === 'completed').length
    },
    { 
      id: 'overdue', 
      title: 'Atrasadas', 
      color: 'border-red-300', 
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      count: tasks.filter(t => t.status === 'overdue').length
    }
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;
    
    // Se foi solto em uma coluna
    if (columns.some(col => col.id === overId)) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== overId) {
        await onTaskMove(taskId, overId);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            column={column}
            tasks={getTasksByStatus(column.id)}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeTask ? (
          <motion.div
            initial={{ scale: 1.05, rotate: 5 }}
            animate={{ scale: 1.1, rotate: 8 }}
            className="opacity-90"
          >
            <SortableTaskCard task={activeTask} isDragging />
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};