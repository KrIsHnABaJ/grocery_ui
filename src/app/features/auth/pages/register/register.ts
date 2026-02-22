import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { NotificationService } from '../../../../core/services/notifications';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterPageComponent {
  name = '';
  email = '';
  contactNumber = '';
  address = '';
  password = '';
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private notifications: NotificationService
  ) {}

  register(): void {
    this.errorMessage = '';

    if (!this.name || !this.email || !this.contactNumber || !this.address || !this.password) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    const emailValidation = this.auth.validateEmail(this.email);
    if (!emailValidation.valid) {
      this.errorMessage = emailValidation.message || 'Invalid email.';
      return;
    }

    const contactValidation = this.auth.validateContactNumber(this.contactNumber);
    if (!contactValidation.valid) {
      this.errorMessage = contactValidation.message || 'Invalid contact number.';
      return;
    }

    const passwordValidation = this.auth.validatePassword(this.password);
    if (!passwordValidation.valid) {
      this.errorMessage = passwordValidation.message || 'Password does not meet requirements.';
      return;
    }

    this.auth.register({
      name: this.name,
      email: this.email,
      contactNumber: this.contactNumber,
      address: this.address,
      password: this.password
    }).subscribe({
      next: () => {
        this.notifications.show('Account created successfully!', 'success');
        this.router.navigate(['/login']);
      },
      error: err => {
        this.errorMessage = err.message || 'Unable to register.';
        this.notifications.show(this.errorMessage, 'error');
      }
    });
  }
}
