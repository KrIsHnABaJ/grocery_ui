import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full'
  },
  {
    path: 'products',
    loadChildren: () =>
      import('./features/products/products.route')
        .then(m => m.PRODUCT_ROUTES)
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.route')
        .then(m => m.AUTH_ROUTES)
  },
  {
    path: 'login',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'register',
    redirectTo: 'auth/register',
    pathMatch: 'full'
  },
  {
    path: 'profile',
    redirectTo: 'auth/profile',
    pathMatch: 'full'
  },
  {
    path: 'cart',
    loadChildren: () =>
      import('./features/cart/cart.route')
        .then(m => m.CART_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    loadChildren: () =>
      import('./features/orders/orders.route')
        .then(m => m.ORDER_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.route')
        .then(m => m.ADMIN_ROUTES),
    canActivate: [adminGuard]
  }
];
