import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ChoreService } from '../../services/chore.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ChoreDTO, ChoreStatus, CHORE_TYPE_LABELS, CHORE_PRIORITY_LABELS, CHORE_STATUS_LABELS } from '../../models/chore.model';
import { UserDTO } from '../../models/user.model';

@Component({
  selector: 'app-chore-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chore-list.html',
  styleUrl: './chore-list.css'
})
export class ChoreListComponent implements OnInit {
  currentUser: UserDTO | null = null;
  chores: ChoreDTO[] = [];
  users: UserDTO[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  choreTypeLabels = CHORE_TYPE_LABELS;
  chorePriorityLabels = CHORE_PRIORITY_LABELS;
  choreStatusLabels = CHORE_STATUS_LABELS;

  // Filter options
  filterStatus = '';
  filterAssignedTo = '';

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

  updateChoreStatus(chore: ChoreDTO, newStatus: string): void {
    this.choreService.updateChoreStatus(chore.id, newStatus).subscribe({
      next: (updatedChore) => {
        this.successMessage = 'Chore status updated successfully';
        this.loadChores(); // Reload to get updated completion info
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error updating chore status:', error);
        this.errorMessage = 'Error updating chore status';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  filteredChores(): ChoreDTO[] {
    return this.chores.filter(chore => {
      // Always hide completed chores
      if (chore.status === ChoreStatus.COMPLETED) {
        return false;
      }
      
      if (this.filterStatus && chore.status !== this.filterStatus) {
        return false;
      }
      
      if (this.filterAssignedTo) {
        // Get the actual user ID from assignedTo
        let assignedUserId = '';
        if (typeof chore.assignedTo === 'string') {
          assignedUserId = chore.assignedTo;
        } else if (typeof chore.assignedTo === 'object' && chore.assignedTo?.id) {
          assignedUserId = chore.assignedTo.id;
        }
        
        if (assignedUserId !== this.filterAssignedTo) {
          return false;
        }
      }
      
      return true;
    });
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

  getCompletedByUserName(completedBy: any): string {
    if (!completedBy) return '';
    
    if (typeof completedBy === 'string') {
      const user = this.users.find(u => u.id === completedBy);
      return user ? user.name : 'Unknown User';
    }
    
    if (typeof completedBy === 'object' && completedBy.name) {
      return completedBy.name;
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

  formatDate(dateString: string): string {
    if (!dateString) return 'Not set';
    
    // Parse date components directly to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    return date.toLocaleDateString();
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  isOverdue(chore: ChoreDTO): boolean {
    if (!chore.dueDate || chore.status === 'COMPLETED' || chore.status === 'CANCELLED') {
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse date components directly to avoid timezone issues
    const [year, month, day] = chore.dueDate.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day); // month is 0-indexed
    
    return dueDate < today;
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
    return this.choreTypeLabels[choreType as keyof typeof this.choreTypeLabels] || choreType;
  }

  getChorePriorityLabel(priority: string | undefined): string {
    if (!priority) return 'Unknown';
    return this.chorePriorityLabels[priority as keyof typeof this.chorePriorityLabels] || priority;
  }

  getChoreStatusLabel(status: string | undefined): string {
    if (!status) return 'Unknown';
    return this.choreStatusLabels[status as keyof typeof this.choreStatusLabels] || status;
  }

  canCompleteChore(chore: ChoreDTO): boolean {
    // Any user can complete any chore
    return chore.status !== 'COMPLETED' && chore.status !== 'CANCELLED';
  }

  quickCompleteChore(chore: ChoreDTO): void {
    this.updateChoreStatus(chore, 'COMPLETED');
  }
}