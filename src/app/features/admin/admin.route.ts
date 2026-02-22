import { Routes } from '@angular/router';
import { AdminProductsComponent } from './pages/admin-products/admin-products';
import { AddProductComponent } from '../products/pages/add-product/add-product';
import { UpdateProductComponent } from './pages/update-product/update-product';
import { BulkUploadComponent } from './pages/bulk-upload/bulk-upload';
import { AdminOrdersComponent } from './pages/admin-orders/admin-orders';
import { adminGuard } from '../../core/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    children: [
      { path: 'products', component: AdminProductsComponent },
      { path: 'products/add', component: AddProductComponent },
      { path: 'products/:id/edit', component: UpdateProductComponent },
      { path: 'bulk-upload', component: BulkUploadComponent },
      { path: 'orders', component: AdminOrdersComponent }
    ]
  }
];
