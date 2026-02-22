import { Component, OnInit } from '@angular/core';
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
  errorMessage = '';

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getProductById(id).subscribe(data => {
      if (data) {
        this.product = { ...data };
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

    this.api.updateProduct(this.product).subscribe(() => {
      this.notifications.show('Product updated successfully.', 'success');
      this.router.navigate(['/admin/products']);
    });
  }
}
