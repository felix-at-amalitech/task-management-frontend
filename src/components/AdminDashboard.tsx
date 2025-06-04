import React, { useState, useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useUser } from '../context/UserContext';
import { Task } from '../types';
import TaskForm from '../tasks/taskForm';
import TaskList from '../tasks/taskList';
import Dashboard from './Dashboard';
import DashboardStyles from './Dashboard.module.css';

const AdminDashboard: React.FC = () => {
  const { user, error: contextError, refreshUsers } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    // Refresh the user list when the admin dashboard loads
    refreshUsers();
  }, []);

  const fetchTasks = async () => {
    if (!user || !user.userId) {
      setError('User not authenticated');
      setTasks([]);
      setLoadingTasks(false);
      return;
    }

    setLoadingTasks(true);
    setError(null);

    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) {
        throw new Error('Authentication token not available');
      }

      console.log('Fetching tasks with token:', token.substring(0, 20) + '...');
      
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }

      const fetchedTasks: Task[] = await response.json();
      fetchedTasks.sort((a, b) => b.createdAt - a.createdAt);
      setTasks(fetchedTasks);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching tasks';
      console.error('Error fetching tasks for admin:', err);
      setError(errorMessage);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleTaskCreated = () => {
    fetchTasks();
    // Also refresh the user list in case new users were added
    refreshUsers();
  };

  return (
    <Dashboard
      title="Admin Dashboard"
      userInfo={`Welcome, ${user?.name || user?.email || 'Admin'} | User ID: ${user?.userId || 'N/A'}`}
    >
      <TaskForm onTaskCreated={handleTaskCreated} />
      
      <h3 className={DashboardStyles.sectionTitle}>All Tasks</h3>
      {(error || contextError) && (
        <p className={DashboardStyles.error}>{error || contextError}</p>
      )}
      {loadingTasks ? (
        <p className={DashboardStyles.noTasks}>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className={DashboardStyles.noTasks}>No tasks found</p>
      ) : (
        <TaskList tasks={tasks} isAdmin={true} onTaskUpdated={fetchTasks} />
      )}
    </Dashboard>
  );
};

export default AdminDashboard;