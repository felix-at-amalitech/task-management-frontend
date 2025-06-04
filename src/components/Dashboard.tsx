import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import styles from './Dashboard.module.css';

interface Props {
  title: string;
  userInfo: string;
  children: React.ReactNode;
}

const Dashboard: React.FC<Props> = ({ title, userInfo, children }) => {
  const { signOut } = useUser();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.userInfo}>{userInfo}</p>
        </div>
        <div className={styles.userActions}>
          <button 
            className={styles.signOutButton} 
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default Dashboard;