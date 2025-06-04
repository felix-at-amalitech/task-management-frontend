import React, { useState, useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useUser } from '../context/UserContext';
import { Task } from '../types';
import TaskList from '../tasks/taskList';
import Dashboard from './Dashboard';
import DashboardStyles from './Dashboard.module.css';

const MemberDashboard: React.FC = () => {
  const { user, error: contextError } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
          'Authorization': `Bearer ${token}`,
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
      console.error('Error fetching tasks for member:', err);
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

  return (
    <Dashboard
      title="My Tasks"
      userInfo={`Welcome, ${user?.name || user?.email || 'User'} | User ID: ${user?.userId || 'N/A'}`}
    >
      <h3 className={DashboardStyles.sectionTitle}>My Assigned Tasks</h3>
      {(error || contextError) && (
        <p className={DashboardStyles.error}>{error || contextError}</p>
      )}
      {loadingTasks ? (
        <p className={DashboardStyles.noTasks}>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className={DashboardStyles.noTasks}>No tasks assigned</p>
      ) : (
        <TaskList tasks={tasks} isAdmin={false} onTaskUpdated={fetchTasks} />
      )}
    </Dashboard>
  );
};

export default MemberDashboard;