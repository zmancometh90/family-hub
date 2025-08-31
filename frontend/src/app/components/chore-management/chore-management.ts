import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChoreService } from '../../services/chore.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ChoreDTO, ChoreRequest, ChoreType, ChorePriority, ChoreStatus, CHORE_TYPE_LABELS, CHORE_PRIORITY_LABELS, CHORE_STATUS_LABELS } from '../../models/chore.model';
import { UserDTO } from '../../models/user.model';

@Component({
  selector: 'app-chore-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chore-management.html',
  styleUrl: './chore-management.css'
})
export class ChoreManagementComponent implements OnInit {
  currentUser: UserDTO | null = null;
  chores: ChoreDTO[] = [];
  users: UserDTO[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  showCreateForm = false;
  editingChore: ChoreDTO | null = null;
  
  choreForm: ChoreRequest = {
    title: '',
    description: '',
    dueDate: '',
    estimatedDurationMinutes: undefined,
    choreType: ChoreType.OTHER,
    priority: ChorePriority.MEDIUM,
    assignedToId: '',
    isRecurring: false,
    recurrencePattern: ''
  };

  choreTypes = Object.values(ChoreType);
  choreTypeLabels = CHORE_TYPE_LABELS;
  chorePriorities = Object.values(ChorePriority);
  chorePriorityLabels = CHORE_PRIORITY_LABELS;
  choreStatuses = Object.values(ChoreStatus);
  choreStatusLabels = CHORE_STATUS_LABELS;

  constructor(
    private choreService: ChoreService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadChores();
    this.loadUsers();
  }

  loadChores(): void {
    this.isLoading = true;
    this.choreService.getAllChores().subscribe({
      next: (chores) => {
        this.chores = chores;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading chores:', error);
        this.errorMessage = 'Error loading chores';
        this.isLoading = false;
      }
    });
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  showCreateChoreForm(): void {
    this.showCreateForm = true;
    this.editingChore = null;
    this.resetForm();
  }

  editChore(chore: ChoreDTO): void {
    this.editingChore = chore;
    this.showCreateForm = true;
    
    this.choreForm = {
      title: chore.title,
      description: chore.description || '',
      dueDate: chore.dueDate || '',
      estimatedDurationMinutes: chore.estimatedDurationMinutes,
      choreType: chore.choreType as ChoreType || ChoreType.OTHER,
      priority: chore.priority as ChorePriority || ChorePriority.MEDIUM,
      assignedToId: typeof chore.assignedTo === 'string' ? chore.assignedTo : '',
      isRecurring: chore.isRecurring || false,
      recurrencePattern: chore.recurrencePattern || ''
    };
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.editingChore = null;
    this.resetForm();
  }

  resetForm(): void {
    this.choreForm = {
      title: '',
      description: '',
      dueDate: '',
      estimatedDurationMinutes: undefined,
      choreType: ChoreType.OTHER,
      priority: ChorePriority.MEDIUM,
      assignedToId: '',
      isRecurring: false,
      recurrencePattern: ''
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  saveChore(): void {
    if (!this.choreForm.title.trim()) {
      this.errorMessage = 'Title is required';
      return;
    }

    const choreRequest: ChoreRequest = {
      ...this.choreForm
    };

    this.isLoading = true;
    
    if (this.editingChore) {
      this.choreService.updateChore(this.editingChore.id, choreRequest).subscribe({
        next: (updatedChore) => {
          this.successMessage = 'Chore updated successfully';
          this.loadChores();
          this.cancelForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating chore:', error);
          this.errorMessage = 'Error updating chore';
          this.isLoading = false;
        }
      });
    } else {
      this.choreService.createChore(choreRequest).subscribe({
        next: (newChore) => {
          this.successMessage = 'Chore created successfully';
          this.loadChores();
          this.cancelForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating chore:', error);
          this.errorMessage = 'Error creating chore';
          this.isLoading = false;
        }
      });
    }
  }

  deleteChore(chore: ChoreDTO): void {
    if (confirm(`Are you sure you want to delete "${chore.title}"?`)) {
      this.choreService.deleteChore(chore.id).subscribe({
        next: () => {
          this.successMessage = 'Chore deleted successfully';
          this.loadChores();
        },
        error: (error) => {
          console.error('Error deleting chore:', error);
          this.errorMessage = 'Error deleting chore';
        }
      });
    }
  }

  updateChoreStatus(chore: ChoreDTO, newStatus: string): void {
    this.choreService.updateChoreStatus(chore.id, newStatus).subscribe({
      next: (updatedChore) => {
        this.successMessage = 'Chore status updated successfully';
        this.loadChores();
      },
      error: (error) => {
        console.error('Error updating chore status:', error);
        this.errorMessage = 'Error updating chore status';
      }
    });
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  getAssignedUserName(assignedTo: any): string {
    if (!assignedTo) return 'Unassigned';
    
    if (typeof assignedTo === 'string') {
      const user = this.users.find(u => u.id === assignedTo);
      return user ? user.name : 'Unknown User';
    }
    
    if (typeof assignedTo === 'object' && assignedTo.name) {
      return assignedTo.name;
    }
    
    return 'Unknown User';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'status-completed';
      case 'IN_PROGRESS': return 'status-in-progress';
      case 'OVERDUE': return 'status-overdue';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'URGENT': return 'priority-urgent';
      case 'HIGH': return 'priority-high';
      case 'LOW': return 'priority-low';
      default: return 'priority-medium';
    }
  }

  backToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  trackByChoreId(index: number, chore: ChoreDTO): string {
    return chore.id;
  }

  getChoreTypeLabel(choreType: string | undefined): string {
    if (!choreType) return 'Unknown';
    return this.choreTypeLabels[choreType as ChoreType] || choreType;
  }

  getChorePriorityLabel(priority: string | undefined): string {
    if (!priority) return 'Unknown';
    return this.chorePriorityLabels[priority as ChorePriority] || priority;
  }

  getChoreStatusLabel(status: string | undefined): string {
    if (!status) return 'Unknown';
    return this.choreStatusLabels[status as ChoreStatus] || status;
  }
}