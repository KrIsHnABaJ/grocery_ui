import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../core/services/api';
import { NotificationService } from '../../../../core/services/notifications';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-product.html',
  styleUrl: './update-product.css'
})
export class UpdateProductComponent implements OnInit {
  product: any = null;
  loading = true;
  errorMessage = '';

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private notifications: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Loading product with ID:', id);
    
    this.api.getProductById(id).subscribe({
      next: (data) => {
        console.log('Product data received:', data);
        if (data) {
          this.product = { ...data };
          console.log('Product assigned:', this.product);
          this.loading = false;
          console.log('Loading set to false, triggering change detection');
          this.cdr.detectChanges();
        } else {
          console.error('No product data received');
          this.errorMessage = 'Product not found.';
          this.loading = false;
          this.cdr.detectChanges();
          this.notifications.show('Product not found.', 'error');
        }
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.errorMessage = 'Failed to load product.';
        this.loading = false;
        this.cdr.detectChanges();
        this.notifications.show('Failed to load product.', 'error');
      }
    });
  }

  save(): void {
    this.errorMessage = '';

    if (!this.product?.name || !this.product?.description) {
      this.errorMessage = 'Name and description are required.';
      return;
    }

    if (this.product.price > 10000) {
      this.errorMessage = 'Price cannot exceed 10,000.';
      return;
    }

    console.log('Updating product:', this.product);

    this.api.updateProduct(this.product).subscribe({
      next: (response) => {
        console.log('Product update response:', response);
        this.notifications.show('Product updated successfully.', 'success');
        this.router.navigate(['/admin/products']);
      },
      error: (err) => {
        console.error('Product update error:', err);
        this.errorMessage = err.error?.error || 'Failed to update product.';
        this.notifications.show(this.errorMessage, 'error');
      }
    });
  }
}
