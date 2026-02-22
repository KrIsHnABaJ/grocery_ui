import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { NotificationService } from '../../../../core/services/notifications';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginPageComponent {
  identifier = '';
  password = '';
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private notifications: NotificationService
  ) {}

  login(): void {
    this.errorMessage = '';

    if (!this.identifier || !this.password) {
      this.errorMessage = 'Please enter your email/username and password.';
      return;
    }

    const passwordValidation = this.auth.validatePassword(this.password);
    if (!passwordValidation.valid) {
      this.errorMessage = 'Invalid password format.';
      return;
    }

    this.auth.login(this.identifier, this.password).subscribe({
      next: user => {
        this.notifications.show('Welcome back!', 'success');
        if (user.role === 'admin') {
          this.router.navigate(['/admin/products']);
        } else {
          this.router.navigate(['/products']);
        }
      },
      error: err => {
        this.errorMessage = err.message || 'Unable to login.';
        this.notifications.show(this.errorMessage, 'error');
      }
    });
  }
}
