import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../../core/services/api';
import { NotificationService } from '../../../../core/services/notifications';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css'
})
export class AdminProductsComponent implements OnInit {
  products: any[] = [];

  constructor(private api: ApiService, private notifications: NotificationService) {}

  ngOnInit(): void {
    this.api.getProducts().subscribe(data => {
      this.products = data;
    });
  }

  deleteProduct(id: number): void {
    this.api.deleteProduct(id).subscribe(() => {
      this.products = this.products.filter(product => product.id !== id);
      this.notifications.show('Product deleted.', 'success');
    });
  }
}
