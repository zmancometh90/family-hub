import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserDTO } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  currentUser: UserDTO | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  navigateToHome(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToAddEvent(): void {
    this.router.navigate(['/events/new']);
  }

  navigateToChoreList(): void {
    this.router.navigate(['/chore-list']);
  }

  navigateToAdmin(): void {
    if (this.isAdmin()) {
      this.router.navigate(['/admin']);
    }
  }

  navigateToChores(): void {
    if (this.isAdmin()) {
      this.router.navigate(['/chores']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}