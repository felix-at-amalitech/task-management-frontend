export interface User {
  userId?: string | number | readonly string[] | undefined;
  email: string;
  role: 'admin' | 'member';
  name?: string; // Optional display name
}

export interface Task {
  id: string; // This will be taskId from DynamoDB
  title: string;
  description: string;
  assignedTo: string; // User ID
  assignedToName: string; // User display name
  createdBy: string; // Admin User ID
  createdByName: string; // Admin display name
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  deadline: number; // Unix timestamp
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}
