import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../../core/services/api';
import { NotificationService } from '../../../../core/services/notifications';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css'
})
export class AddProductComponent {

  product:any = {};
  errorMessage = '';

  constructor(private api:ApiService,
              private router:Router,
              private notifications: NotificationService){}

  save(){
    this.errorMessage = '';

    if (!this.product.name || !this.product.description) {
      this.errorMessage = 'Name and description are required.';
      return;
    }

    if (this.product.price > 10000) {
      this.errorMessage = 'Price cannot exceed 10,000.';
      return;
    }

    this.api.addProduct(this.product).subscribe(() => {
      this.product = {};
      this.notifications.show('Product added successfully.', 'success');
      this.router.navigate(['/admin/products']);
    });
  }
}
