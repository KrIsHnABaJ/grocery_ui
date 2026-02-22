import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

/**
 * 🟡 BACKEND MAPPING FOR AUTHSERVICE
 * This service handles user authentication and profile management.
 * Replace all localStorage operations with Spring Boot REST API calls.
 * 
 * SPRING BOOT ENDPOINTS TO CREATE:
 * 
 * 1. POST /api/auth/login
 *    Request: { identifier: string, password: string }
 *    Response: { id, name, email, contactNumber, address, role, status }
 *    Error: 401 Invalid credentials / Account deactivated
 * 
 * 2. POST /api/auth/register
 *    Request: { name, email, contactNumber, address, password }
 *    Response: { id, name, email, contactNumber, address, role: 'customer', status: 'active' }
 *    Error: 400 Email already registered
 * 
 * 3. POST /api/auth/logout
 *    Request: (empty)
 *    Response: { success: true }
 * 
 * 4. PUT /api/auth/profile
 *    Request: { email, address, contactNumber }
 *    Response: { id, name, email, contactNumber, address, role, status }
 *    Error: 401 Not authenticated
 * 
 * 5. PUT /api/auth/change-password
 *    Request: { oldPassword: string, newPassword: string }
 *    Response: { id, name, email, contactNumber, address, role, status }
 *    Error: 401 Not authenticated / 400 Old password incorrect
 * 
 * 6. PUT /api/auth/deactivate
 *    Request: (empty)
 *    Response: { id, name, email, contactNumber, address, role, status: 'deactivated' }
 *    Error: 401 Not authenticated
 * 
 * 7. PUT /api/auth/restore
 *    Request: { password: string }
 *    Response: { id, name, email, contactNumber, address, role, status: 'active' }
 *    Error: 401 Not authenticated / 400 Incorrect password
 * 
 * 8. GET /api/auth/current-user
 *    Request: (empty)
 *    Response: { id, name, email, contactNumber, address, role, status } or null
 */

export type UserRole = 'customer' | 'admin';
export type AccountStatus = 'active' | 'deactivated';

export interface UserAccount {
  id: number;
  name: string;
  email: string;
  contactNumber: string;
  address: string;
  password: string;
  role: UserRole;
  status: AccountStatus;
}

const USERS_KEY = 'grocery.users';
const CURRENT_USER_KEY = 'grocery.currentUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private users: UserAccount[] = [];
  private currentUserSubject = new BehaviorSubject<UserAccount | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const storedUsers = localStorage.getItem(USERS_KEY);
    const storedCurrent = localStorage.getItem(CURRENT_USER_KEY);

    this.users = storedUsers ? JSON.parse(storedUsers) : this.seedUsers();
    this.persistUsers();

    if (storedCurrent) {
      this.currentUserSubject.next(JSON.parse(storedCurrent));
    }
  }

  login(identifier: string, password: string): Observable<UserAccount> {
    const match = this.users.find(user =>
      (user.email === identifier || user.name === identifier) &&
      user.password === password
    );

    if (!match) {
      return throwError(() => new Error('Invalid credentials'));
    }

    this.currentUserSubject.next(match);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(match));

    // 🟡 REPLACE WITH SPRING BOOT:
    // return this.http.post<UserAccount>('/api/auth/login', {
    //   identifier,
    //   password
    // }).pipe(
    //   tap(user => {
    //     this.currentUserSubject.next(user);
    //     localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    //   })
    // );
    return of(match);
  }

  register(account: Omit<UserAccount, 'id' | 'role' | 'status'>): Observable<UserAccount> {
    const exists = this.users.some(user => user.email === account.email);
    if (exists) {
      return throwError(() => new Error('Email already registered'));
    }

    const newUser: UserAccount = {
      ...account,
      id: this.users.length + 1,
      role: 'customer',
      status: 'active'
    };

    this.users = [...this.users, newUser];
    this.persistUsers();

    // 🟡 REPLACE WITH SPRING BOOT:
    // return this.http.post<UserAccount>('/api/auth/register', account);
    return of(newUser);
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  updateProfile(update: Partial<Pick<UserAccount, 'email' | 'address' | 'contactNumber'>>): Observable<UserAccount> {
    const current = this.currentUserSubject.value;
    if (!current) {
      return throwError(() => new Error('Not authenticated'));
    }

    const updated: UserAccount = { ...current, ...update };
    this.users = this.users.map(user => user.id === updated.id ? updated : user);
    this.persistUsers();
    this.currentUserSubject.next(updated);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));

    // 🟡 REPLACE WITH SPRING BOOT:
    // return this.http.put<UserAccount>('/api/auth/profile', update).pipe(
    //   tap(user => {
    //     this.currentUserSubject.next(user);
    //     localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    //   })
    // );
    return of(updated);
  }

  changePassword(oldPassword: string, newPassword: string): Observable<UserAccount> {
    const current = this.currentUserSubject.value;
    if (!current) {
      return throwError(() => new Error('Not authenticated'));
    }

    if (current.password !== oldPassword) {
      return throwError(() => new Error('Old password is incorrect'));
    }

    const updated: UserAccount = { ...current, password: newPassword };
    this.users = this.users.map(user => user.id === updated.id ? updated : user);
    this.persistUsers();
    this.currentUserSubject.next(updated);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));

    // 🟡 REPLACE WITH SPRING BOOT:
    // return this.http.put<UserAccount>('/api/auth/change-password', {
    //   oldPassword,
    //   newPassword
    // }).pipe(
    //   tap(user => {
    //     this.currentUserSubject.next(user);
    //     localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    //   })
    // );
    return of(updated);
  }

  deactivateAccount(): Observable<UserAccount> {
    const current = this.currentUserSubject.value;
    if (!current) {
      return throwError(() => new Error('Not authenticated'));
    }

    const updated: UserAccount = { ...current, status: 'deactivated' };
    this.users = this.users.map(user => user.id === updated.id ? updated : user);
    this.persistUsers();
    this.currentUserSubject.next(updated);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));

    // 🟡 REPLACE WITH SPRING BOOT:
    // return this.http.put<UserAccount>('/api/auth/deactivate', {}).pipe(
    //   tap(user => {
    //     this.currentUserSubject.next(user);
    //     localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    //   })
    // );
    return of(updated);
  }

  restoreAccount(password: string): Observable<UserAccount> {
    const current = this.currentUserSubject.value;
    if (!current) {
      return throwError(() => new Error('Not authenticated'));
    }

    // Verify password before restoring account
    if (current.password !== password) {
      return throwError(() => new Error('Incorrect password. Account cannot be restored.'));
    }

    const updated: UserAccount = { ...current, status: 'active' };
    this.users = this.users.map(user => user.id === updated.id ? updated : user);
    this.persistUsers();
    this.currentUserSubject.next(updated);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));

    // 🟡 REPLACE WITH SPRING BOOT:
    // return this.http.put<UserAccount>('/api/auth/restore', { password }).pipe(
    //   tap(user => {
    //     this.currentUserSubject.next(user);
    //     localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    //   })
    // );
    return of(updated);
  }

  getCurrentUser(): UserAccount | null {
    return this.currentUserSubject.value;
  }

  validateEmail(email: string): { valid: boolean; message?: string } {
    if (!email || email.trim() === '') {
      return { valid: false, message: 'Email is required.' };
    }
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!pattern.test(email)) {
      return { valid: false, message: 'Please enter a valid email address.' };
    }
    return { valid: true };
  }

  validatePassword(password: string): { valid: boolean; message?: string } {
    if (!password || password.trim() === '') {
      return { valid: false, message: 'Password is required.' };
    }
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters.' };
    }
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUpper || !hasLower || !hasNumber) {
      return { 
        valid: false, 
        message: 'Password must contain uppercase, lowercase, and numbers.' 
      };
    }
    return { valid: true };
  }

  validateContactNumber(contact: string): { valid: boolean; message?: string } {
    if (!contact || contact.trim() === '') {
      return { valid: false, message: 'Contact number is required.' };
    }
    const pattern = /^\d{10}$/;
    if (!pattern.test(contact.replace(/[^\d]/g, ''))) {
      return { valid: false, message: 'Contact number must be 10 digits.' };
    }
    return { valid: true };
  }

  private persistUsers(): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(this.users));
  }

  private seedUsers(): UserAccount[] {
    return [
      {
        id: 1,
        name: 'Admin',
        email: 'admin@grocery.dev',
        contactNumber: '9999999999',
        address: 'HQ',
        password: 'Admin@123',
        role: 'admin',
        status: 'active'
      },
      {
        id: 2,
        name: 'Customer',
        email: 'customer@grocery.dev',
        contactNumber: '8888888888',
        address: 'Customer Lane',
        password: 'Customer@123',
        role: 'customer',
        status: 'active'
      }
    ];
  }
}
