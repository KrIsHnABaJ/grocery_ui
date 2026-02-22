import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart';
import { NotificationService } from '../../../core/services/notifications';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCardComponent {

  @Input() product:any;
  @Input() showDelete = false;
  @Output() delete = new EventEmitter<number>();

  get isOutOfStock(): boolean {
    return !this.product?.quantity || this.product.quantity <= 0;
  }

  constructor(
    private cart:CartService, 
    private notifications: NotificationService,
    private auth: AuthService
  ){}

  addToCart(){
    if (this.isOutOfStock) {
      this.notifications.show('Product is out of stock.', 'error');
      return;
    }

    const user = this.auth.getCurrentUser();
    if (user && user.status !== 'active') {
      this.notifications.show('Your account is deactivated. Please activate it in your profile to add products.', 'error');
      return;
    }

    const success = this.cart.add(this.product);
    if (success) {
      this.notifications.show('Added to cart.', 'success');
    }
  }

  remove(){
    if (this.product?.id) {
      this.delete.emit(this.product.id);
    }
  }
}
