import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login/login';
import { RegisterPageComponent } from './pages/register/register';
import { ProfilePageComponent } from './pages/profile/profile';
import { authGuard } from '../../core/guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'profile', component: ProfilePageComponent, canActivate: [authGuard] }
];
