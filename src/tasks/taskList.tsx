import React from 'react';
import { Task } from '../types';
import TaskCard from './taskCard';
import DashboardStyles from '../components/Dashboard.module.css';

interface TaskListProps {
  tasks: Task[];
  isAdmin: boolean;
  onTaskUpdated: () => void; // Callback for when a task is updated/deleted
}

const TaskList: React.FC<TaskListProps> = ({ tasks, isAdmin, onTaskUpdated }) => {
  if (tasks.length === 0) {
    return <p className={DashboardStyles.noTasks}>No tasks found.</p>;
  }

  return (
    <div className={DashboardStyles.grid}>
      {tasks.map(task => (
        <TaskCard 
          key={task.taskId} 
          task={task} 
          isAdmin={isAdmin} 
          onUpdate={onTaskUpdated} 
        />
      ))}
    </div>
  );
};

export default TaskList;