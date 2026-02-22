import { Routes } from '@angular/router';
import { OrderHistoryComponent } from './pages/order-history/order-history';
import { authGuard } from '../../core/guards/auth.guard';

export const ORDER_ROUTES: Routes = [
  { path: '', component: OrderHistoryComponent, canActivate: [authGuard] }
];
