import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserDTO, PasswordChangeRequest } from '../../models/user.model';

interface LocalPasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent implements OnInit {
  currentUser: UserDTO | null = null;
  
  passwordData: LocalPasswordChangeRequest = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  // Avatar functionality
  avatarText = '';
  showAvatarForm = false;
  
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
    }
    // Initialize avatar text with current value
    this.avatarText = this.currentUser?.avatar || '';
  }

  showPasswordTemporarily(field: 'current' | 'new' | 'confirm'): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword = true;
        break;
      case 'new':
        this.showNewPassword = true;
        break;
      case 'confirm':
        this.showConfirmPassword = true;
        break;
    }
  }

  hidePassword(field: 'current' | 'new' | 'confirm'): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword = false;
        break;
      case 'new':
        this.showNewPassword = false;
        break;
      case 'confirm':
        this.showConfirmPassword = false;
        break;
    }
  }

  onPasswordSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Validation
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword || !this.passwordData.confirmPassword) {
      this.errorMessage = 'All password fields are required';
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage = 'New password and confirmation do not match';
      return;
    }

    if (this.passwordData.newPassword.length < 6) {
      this.errorMessage = 'New password must be at least 6 characters long';
      return;
    }

    if (this.passwordData.currentPassword === this.passwordData.newPassword) {
      this.errorMessage = 'New password must be different from current password';
      return;
    }

    this.isLoading = true;

    const request: PasswordChangeRequest = {
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword
    };

    this.userService.changePassword(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Password changed successfully!';
        
        // Clear the form
        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        
        // Hide all passwords
        this.showCurrentPassword = false;
        this.showNewPassword = false;
        this.showConfirmPassword = false;
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Password change error:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Current password is incorrect';
        } else if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Invalid password change request';
        } else if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else {
          this.errorMessage = `Password change failed: ${error.error?.message || 'Unknown error'}`;
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  // Avatar functionality
  toggleAvatarForm(): void {
    this.showAvatarForm = !this.showAvatarForm;
    if (!this.showAvatarForm) {
      this.avatarText = this.currentUser?.avatar || '';
    }
  }

  saveAvatar(): void {
    if (!this.currentUser) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    // For now, we'll just update the current user in memory and local storage
    // In a real app, you'd call an API to update the avatar
    const updatedUser: UserDTO = {
      ...this.currentUser,
      avatar: this.avatarText.trim() || undefined
    };

    // Update auth service
    this.authService.updateCurrentUser(updatedUser);
    this.currentUser = updatedUser;
    
    this.isLoading = false;
    this.successMessage = 'Avatar updated successfully!';
    this.showAvatarForm = false;

    // Clear success message after 3 seconds
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  getUserInitial(): string {
    if (!this.currentUser) return 'U';
    return this.currentUser.name.charAt(0).toUpperCase();
  }

  getUserAvatar(): string {
    return this.currentUser?.avatar || this.getUserInitial();
  }
}