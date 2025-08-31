export interface ChoreDTO {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // LocalDate as string (YYYY-MM-DD)
  estimatedDurationMinutes?: number;
  choreType?: string;
  status?: string;
  priority?: string;
  assignedTo?: any; // Can be UserDTO or just ID string
  createdBy?: any; // Can be UserDTO or just ID string
  completedBy?: any; // Can be UserDTO or just ID string
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

export interface ChoreRequest {
  title: string;
  description?: string;
  dueDate?: string; // LocalDate as string (YYYY-MM-DD)
  estimatedDurationMinutes?: number;
  choreType?: string;
  priority?: string;
  assignedToId?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

export enum ChoreType {
  CLEANING = 'CLEANING',
  COOKING = 'COOKING',
  LAUNDRY = 'LAUNDRY',
  YARD_WORK = 'YARD_WORK',
  MAINTENANCE = 'MAINTENANCE',
  SHOPPING = 'SHOPPING',
  ORGANIZATION = 'ORGANIZATION',
  PET_CARE = 'PET_CARE',
  OTHER = 'OTHER'
}

export enum ChoreStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum ChorePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export const CHORE_TYPE_LABELS: { [key in ChoreType]: string } = {
  [ChoreType.CLEANING]: 'Cleaning',
  [ChoreType.COOKING]: 'Cooking',
  [ChoreType.LAUNDRY]: 'Laundry',
  [ChoreType.YARD_WORK]: 'Yard Work',
  [ChoreType.MAINTENANCE]: 'Maintenance',
  [ChoreType.SHOPPING]: 'Shopping',
  [ChoreType.ORGANIZATION]: 'Organization',
  [ChoreType.PET_CARE]: 'Pet Care',
  [ChoreType.OTHER]: 'Other'
};

export const CHORE_STATUS_LABELS: { [key in ChoreStatus]: string } = {
  [ChoreStatus.PENDING]: 'Pending',
  [ChoreStatus.IN_PROGRESS]: 'In Progress',
  [ChoreStatus.COMPLETED]: 'Completed',
  [ChoreStatus.OVERDUE]: 'Overdue',
  [ChoreStatus.CANCELLED]: 'Cancelled'
};

export const CHORE_PRIORITY_LABELS: { [key in ChorePriority]: string } = {
  [ChorePriority.LOW]: 'Low',
  [ChorePriority.MEDIUM]: 'Medium',
  [ChorePriority.HIGH]: 'High',
  [ChorePriority.URGENT]: 'Urgent'
};