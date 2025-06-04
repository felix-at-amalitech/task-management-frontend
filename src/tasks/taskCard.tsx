import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Task } from '../types';
import TaskCardStyles from './TaskCard.module.css';
import { fetchAuthSession } from 'aws-amplify/auth';

interface TaskCardProps {
  task: Task;
  isAdmin: boolean;
  onUpdate: () => void; // Callback to trigger task list refresh
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isAdmin, onUpdate }) => {
  const { user } = useUser();
  const [currentStatus, setCurrentStatus] = useState(task.status);
  const [isUpdating, setIsUpdating] = useState(false);

  // Read API_BASE_URL from environment variable
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  const statusClass = (status: Task['status']) => {
    switch (status) {
      case 'Pending': return TaskCardStyles.statusPending;
      case 'In Progress': return TaskCardStyles.statusInProgress;
      case 'Completed': return TaskCardStyles.statusCompleted;
      case 'Overdue': return TaskCardStyles.statusOverdue;
      default: return {};
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Task['status'];
    setCurrentStatus(newStatus);
    setIsUpdating(true);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) throw new Error("Authentication token not available.");

      console.log(`Updating task ${task.taskId} status to ${newStatus}`);
      
      const response = await fetch(`${API_BASE_URL}/api/tasks/${task.taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          createdAt: task.createdAt, // Include createdAt for the composite key
          // Don't include updatedAt here, let the backend handle it
        })
      });
      
      if (!response.ok) {
        let errorMessage = `Failed to update task status: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('Error details:', errorData);
        } catch (e) {
          // If response is not JSON, use the status text
          const errorText = await response.text();
          console.error('Error response text:', errorText);
        }
        throw new Error(errorMessage);
      }
      
      console.log('Task status updated successfully');
      onUpdate(); // Trigger parent to re-fetch tasks
    } catch (error: any) {
      console.error("Error updating task status:", error);
      alert("Failed to update task status: " + error.message);
      setCurrentStatus(task.status); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      return;
    }
    setIsUpdating(true);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) throw new Error("Authentication token not available.");

      const response = await fetch(`${API_BASE_URL}/api/tasks/${task.taskId}?createdAt=${task.createdAt}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        let errorMessage = `Failed to delete task: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use the status text
          const errorText = await response.text();
          console.error('Error response text:', errorText);
        }
        throw new Error(errorMessage);
      }
      
      onUpdate(); // Trigger parent to re-fetch tasks
    } catch (error: any) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const deadlineDate = new Date(task.deadline);
  const isOverdue = task.status !== 'Completed' && deadlineDate.getTime() < Date.now();

  return (
    <div className={`${TaskCardStyles.card} ${statusClass(task.status)}`}>
      <div>
        <h3 className={TaskCardStyles.title}>{task.title}</h3>
        <p className={TaskCardStyles.description}>{task.description}</p>
        <p className={TaskCardStyles.meta}>Assigned to: {task.assignedToName}</p>
        <p className={`${TaskCardStyles.meta} ${isOverdue ? TaskCardStyles.deadlineOverdue : ''}`}>
          Deadline: {deadlineDate.toLocaleDateString()}
          {isOverdue && ' (Overdue!)'}
        </p>
        <p className={TaskCardStyles.meta}>Status: {task.status}</p>
      </div>

      <div className={TaskCardStyles.actions}>
        {!isAdmin ? (
          <select
            className={TaskCardStyles.selectStatus}
            value={currentStatus}
            onChange={handleStatusChange}
            disabled={isUpdating}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        ) : (
          <>
            <select
              className={TaskCardStyles.selectStatus}
              value={currentStatus}
              onChange={handleStatusChange}
              disabled={isUpdating}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <button
              className={`${TaskCardStyles.actionButton} ${TaskCardStyles.deleteButton}`}
              onClick={handleDeleteTask}
              disabled={isUpdating}
            >
              {isUpdating ? '...' : 'Delete'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskCard;