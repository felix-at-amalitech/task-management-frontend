import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import styles from './TaskForm.module.css';
import { fetchAuthSession } from 'aws-amplify/auth';

interface TaskFormProps {
  onTaskCreated: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated }) => {
  const { user, allUsers } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Read API_BASE_URL from environment variable
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!user || !user.userId || !user.name) {
      setFormError("User not logged in or profile incomplete.");
      return;
    }
    if (!title) {
      setFormError("Please enter a task title.");
      return;
    }
    if (!description) {
      setFormError("Please enter a task description.");
      return;
    }
    if (!assignedTo) {
      setFormError("Please select a team member to assign the task.");
      return;
    }
    if (!deadline) {
      setFormError("Please set a deadline for the task.");
      return;
    }

    setLoading(true);
    try {
      const assignedUser = allUsers.find(u => u.userId === assignedTo);
      
      if (!assignedUser) {
        setFormError(`User with ID ${assignedTo} not found. Please refresh and try again.`);
        setLoading(false);
        return;
      }

      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) throw new Error("Authentication token not available.");

      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          assignedTo: assignedUser.userId,
          assignedToName: assignedUser.name,
          status: 'Pending',
          deadline: new Date(deadline).getTime(),
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task on backend');
      }

      // Success - clear form
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setDeadline('');
      onTaskCreated(); // Trigger a refetch in the parent dashboard
      
      // Show success message
      setFormError('✅ Task created successfully!');
      setTimeout(() => setFormError(null), 3000);
    } catch (error: any) {
      console.error("Error creating task:", error);
      setFormError("Failed to create task: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const teamMembers = allUsers.filter(u => u.role === 'member');
  
  // Calculate minimum date for deadline (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.formTitle}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        Create New Task
      </h3>
      
      {formError && (
        <div className={formError.includes('✅') ? styles.formSuccess : styles.formError}>
          {formError}
        </div>
      )}
      
      <form onSubmit={handleCreateTask}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.formInput}
              placeholder="Enter a descriptive title"
              disabled={loading}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Deadline</label>
            <input
              type="date"
              value={deadline}
              min={today}
              onChange={(e) => setDeadline(e.target.value)}
              className={styles.formInput}
              disabled={loading}
            />
            <div className={styles.formHint}>Set a realistic completion date</div>
          </div>
          
          <div className={`${styles.formGroup} ${styles.formFullWidth}`}>
            <label className={styles.formLabel}>Task Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${styles.formInput} ${styles.formTextarea}`}
              placeholder="Provide detailed instructions and requirements"
              disabled={loading}
            ></textarea>
          </div>
          
          <div className={`${styles.formGroup} ${styles.formFullWidth}`}>
            <label className={styles.formLabel}>Assign To</label>
            <div className={styles.formSelectWrapper}>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className={styles.formSelect}
                disabled={loading}
              >
                <option value="">Select Team Member</option>
                {teamMembers.length === 0 && (
                  <option value="" disabled>No team members available</option>
                )}
                {teamMembers.map((member) => (
                  <option key={String(member.userId)} value={member.userId}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
              <svg className={styles.formSelectArrow} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
          
          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.formButton}
              disabled={loading}
            >
              {loading ? (
                <svg className={styles.formSpinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;