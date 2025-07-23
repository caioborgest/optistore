
import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { Task } from '@/types/database';
import { TaskColumn } from './TaskColumn';
import { SortableTaskCard } from './SortableTaskCard';

interface DraggableKanbanProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

export const DraggableKanban: React.FC<DraggableKanbanProps> = ({ tasks, onTaskUpdate }) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const columns = [
    {
      id: 'pending',
      title: 'Pendente',
      color: 'border-blue-200',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      count: tasks.filter(t => t.status === 'pending').length
    },
    {
      id: 'in_progress',
      title: 'Em Andamento',
      color: 'border-yellow-200',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      count: tasks.filter(t => t.status === 'in_progress').length
    },
    {
      id: 'completed',
      title: 'Concluída',
      color: 'border-green-200',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      count: tasks.filter(t => t.status === 'completed').length
    },
    {
      id: 'overdue',
      title: 'Atrasada',
      color: 'border-red-200',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      count: tasks.filter(t => t.status === 'overdue').length
    }
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    
    const { active, over } = event;
    
    if (!over) return;
    
    const taskId = active.id as string;
    const newStatus = over.id as Task['status'];
    
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      onTaskUpdate(taskId, { status: newStatus });
    }
  };

  const getTasksForColumn = (columnId: string) => {
    return tasks.filter(task => task.status === columnId);
  };

  return (
    <div className="h-full">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
          {columns.map((column) => (
            <TaskColumn
              key={column.id}
              column={column}
              tasks={getTasksForColumn(column.id)}
            />
          ))}
        </div>
        
        <DragOverlay>
          {activeTask && (
            <div className="rotate-3 opacity-90">
              <SortableTaskCard task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
