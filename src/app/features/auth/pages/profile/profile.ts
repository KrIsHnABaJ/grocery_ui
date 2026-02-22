import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserAccount } from '../../../../core/services/auth';
import { NotificationService } from '../../../../core/services/notifications';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfilePageComponent implements OnInit {
  user: UserAccount | null = null;

  email = '';
  address = '';
  contactNumber = '';

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  restorePassword = '';

  profileMessage = '';
  passwordMessage = '';

  constructor(
    private auth: AuthService,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    if (this.user) {
      this.email = this.user.email;
      this.address = this.user.address;
      this.contactNumber = this.user.contactNumber;
    }
  }

  updateProfile(): void {
    this.profileMessage = '';

    const emailValidation = this.auth.validateEmail(this.email);
    if (!emailValidation.valid) {
      this.profileMessage = emailValidation.message || 'Invalid email.';
      this.notifications.show(this.profileMessage, 'error');
      return;
    }

    const contactValidation = this.auth.validateContactNumber(this.contactNumber);
    if (!contactValidation.valid) {
      this.profileMessage = contactValidation.message || 'Invalid contact number.';
      this.notifications.show(this.profileMessage, 'error');
      return;
    }

    this.auth.updateProfile({
      email: this.email,
      address: this.address,
      contactNumber: this.contactNumber
    }).subscribe({
      next: user => {
        this.user = user;
        this.profileMessage = 'Profile updated successfully.';
        this.notifications.show(this.profileMessage, 'success');
      },
      error: err => {
        this.profileMessage = err.message || 'Unable to update profile.';
        this.notifications.show(this.profileMessage, 'error');
      }
    });
  }

  changePassword(): void {
    this.passwordMessage = '';

    if (this.newPassword.length < 8 || this.newPassword.length > 13) {
      this.passwordMessage = 'Password must be 8-13 characters long.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordMessage = 'Passwords do not match.';
      return;
    }

    this.auth.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.passwordMessage = 'Password changed successfully.';
        this.notifications.show(this.passwordMessage, 'success');
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: err => {
        this.passwordMessage = err.message || 'Unable to change password.';
        this.notifications.show(this.passwordMessage, 'error');
      }
    });
  }

  deactivate(): void {
    this.auth.deactivateAccount().subscribe(() => {
      this.user = this.auth.getCurrentUser();
      this.notifications.show('Account deactivated.', 'info');
    });
  }

  restore(): void {
    if (!this.restorePassword) {
      this.notifications.show('Please enter your password to restore account.', 'error');
      return;
    }

    this.auth.restoreAccount(this.restorePassword).subscribe({
      next: () => {
        this.user = this.auth.getCurrentUser();
        this.restorePassword = '';
        this.notifications.show('Account restored successfully.', 'success');
      },
      error: err => {
        this.notifications.show(err.message || 'Failed to restore account.', 'error');
      }
    });
  }
}
