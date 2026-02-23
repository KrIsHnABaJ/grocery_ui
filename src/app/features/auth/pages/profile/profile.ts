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

  deactivatePassword = '';
  restorePassword = '';

  profileMessage = '';
  passwordMessage = '';

  constructor(
    private auth: AuthService,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    console.log('Profile page initialized - User:', this.user);
    
    if (this.user) {
      this.email = this.user.email || '';
      this.address = this.user.address || '';
      this.contactNumber = this.user.contactNumber || '';
      console.log('Profile form initialized with:', { email: this.email, address: this.address, contactNumber: this.contactNumber });
    }
  }

  updateProfile(): void {
    this.profileMessage = '';
    console.log('Update profile called with:', { email: this.email, address: this.address, contactNumber: this.contactNumber });

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

    const updateData = {
      email: this.email,
      address: this.address,
      contactNumber: this.contactNumber
    };
    
    console.log('Sending update to backend:', updateData);
    
    this.auth.updateProfile(updateData).subscribe({
      next: (user) => {
        console.log('Profile update successful:', user);
        this.user = user;
        this.profileMessage = 'Profile updated successfully.';
        this.notifications.show(this.profileMessage, 'success');
      },
      error: (err) => {
        console.error('Profile update error:', err);
        this.profileMessage = err.message || 'Unable to update profile.';
        this.notifications.show(this.profileMessage, 'error');
      }
    });
  }

  changePassword(): void {
    this.passwordMessage = '';
    console.log('Change password called');

    if (!this.oldPassword) {
      this.passwordMessage = 'Please enter your old password.';
      this.notifications.show(this.passwordMessage, 'error');
      return;
    }

    const passwordValidation = this.auth.validatePassword(this.newPassword);
    if (!passwordValidation.valid) {
      this.passwordMessage = passwordValidation.message || 'Invalid password.';
      this.notifications.show(this.passwordMessage, 'error');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordMessage = 'New passwords do not match.';
      this.notifications.show(this.passwordMessage, 'error');
      return;
    }

    console.log('Sending password change request');
    
    this.auth.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: (user) => {
        console.log('Password changed successfully:', user);
        this.passwordMessage = 'Password changed successfully.';
        this.notifications.show(this.passwordMessage, 'success');
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        console.error('Password change error:', err);
        this.passwordMessage = err.message || 'Unable to change password.';
        this.notifications.show(this.passwordMessage, 'error');
      }
    });
  }

  deactivate(): void {
    if (!this.deactivatePassword) {
      this.notifications.show('Please enter your password to deactivate account.', 'error');
      return;
    }

    if (confirm('Are you sure you want to deactivate your account? You won\'t be able to place orders until you restore it.')) {
      this.auth.deactivateAccount(this.deactivatePassword).subscribe({
        next: () => {
          this.user = this.auth.getCurrentUser();
          this.deactivatePassword = '';
          this.notifications.show('Account deactivated.', 'info');
        },
        error: err => {
          console.error('Deactivation error:', err);
          this.notifications.show(err.message || 'Failed to deactivate account.', 'error');
        }
      });
    }
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
