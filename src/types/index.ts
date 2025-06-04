export interface User {
  userId: string;
  email: string;
  name?: string;
  role: string;
}

export interface Task {
  taskId: string;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  createdBy: string;
  createdByName: string;
  assignedTo: string;
  assignedToName: string;
  createdAt: number;
  deadline: number;
  updatedAt?: number;
}