import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';

/**
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
  username: string;
  contactNumber: string;
  address: string;
  role: UserRole;
  status: AccountStatus;
}

const CURRENT_USER_KEY = 'grocery.currentUser';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = 'http://localhost:8080';
  private currentUserSubject = new BehaviorSubject<UserAccount | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user was logged in before
    const storedCurrent = localStorage.getItem(CURRENT_USER_KEY);
    if (storedCurrent) {
      this.currentUserSubject.next(JSON.parse(storedCurrent));
    }
  }

  login(identifier: string, password: string): Observable<UserAccount> {
    return this.http.post<UserAccount>(`${this.baseUrl}/user-service/auth/login`, {
      identifier,
      password
    }).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      }),
      catchError(err => {
        console.error('Login failed', err);
        return throwError(() => new Error(err.error?.message || 'Invalid credentials'));
      })
    );
  }

  register(account: Omit<UserAccount, 'id' | 'role' | 'status' | 'username'> & { password: string }): Observable<UserAccount> {
    return this.http.post<UserAccount>(`${this.baseUrl}/user-service/auth/register`, account)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        }),
        catchError(err => {
          console.error('Registration failed', err);
          return throwError(() => new Error(err.error?.message || 'Registration failed'));
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/user-service/auth/logout`, {})
      .pipe(
        tap(() => {
          this.currentUserSubject.next(null);
          localStorage.removeItem(CURRENT_USER_KEY);
        }),
        catchError(err => {
          console.error('Logout failed', err);
          // Still clear local state even if server logout fails
          this.currentUserSubject.next(null);
          localStorage.removeItem(CURRENT_USER_KEY);
          return throwError(() => new Error('Logout failed'));
        })
      );
  }

  updateProfile(update: Partial<Pick<UserAccount, 'email' | 'address' | 'contactNumber'>>): Observable<UserAccount> {
    const user = this.currentUserSubject.value;
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (user) {
      headers = headers.set('X-User-Id', user.id.toString());
    }
    
    console.log('Sending profile update:', { user, update, headers: headers.keys() });
    
    return this.http.put<UserAccount>(
      `${this.baseUrl}/user-service/auth/profile`, 
      update,
      { headers }
    ).pipe(
      tap((updatedUser) => {
        console.log('Profile update response:', updatedUser);
        this.currentUserSubject.next(updatedUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      }),
      catchError(err => {
        console.error('Profile update failed - Error response:', err.error);
        console.error('Profile update failed - Full error:', err);
        return throwError(() => new Error(err.error?.error || err.error?.message || 'Profile update failed'));
      })
    );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<UserAccount> {
    const user = this.currentUserSubject.value;
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (user) {
      headers = headers.set('X-User-Id', user.id.toString());
    }
    
    console.log('Changing password for user:', user?.id);
    
    return this.http.put<UserAccount>(
      `${this.baseUrl}/user-service/auth/change-password`, 
      {
        oldPassword,
        newPassword
      },
      { headers }
    ).pipe(
      tap((updatedUser) => {
        console.log('Password changed successfully');
        this.currentUserSubject.next(updatedUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      }),
      catchError(err => {
        console.error('Password change failed - Error:', err.error);
        return throwError(() => new Error(err.error?.error || err.error?.message || 'Password change failed'));
      })
    );
  }

  deactivateAccount(password: string): Observable<UserAccount> {
    const user = this.currentUserSubject.value;
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (user) {
      headers = headers.set('X-User-Id', user.id.toString());
    }
    
    console.log('Deactivating account for user:', user?.id);
    
    return this.http.put<UserAccount>(
      `${this.baseUrl}/user-service/auth/deactivate`, 
      { password },
      { headers }
    ).pipe(
      tap((updatedUser) => {
        console.log('Account deactivated successfully');
        this.currentUserSubject.next(updatedUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      }),
      catchError(err => {
        console.error('Account deactivation failed - Error:', err.error);
        return throwError(() => new Error(err.error?.error || err.error?.message || 'Account deactivation failed'));
      })
    );
  }

  restoreAccount(password: string): Observable<UserAccount> {
    const user = this.currentUserSubject.value;
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (user) {
      headers = headers.set('X-User-Id', user.id.toString());
    }
    
    console.log('Restoring account for user:', user?.id);
    
    return this.http.put<UserAccount>(
      `${this.baseUrl}/user-service/auth/restore`, 
      { password },
      { headers }
    ).pipe(
      tap((updatedUser) => {
        console.log('Account restored successfully');
        this.currentUserSubject.next(updatedUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      }),
      catchError(err => {
        console.error('Account restore failed - Error:', err.error);
        return throwError(() => new Error(err.error?.error || err.error?.message || 'Account restore failed'));
      })
    );
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
}
