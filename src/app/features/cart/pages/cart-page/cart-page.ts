import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../core/services/cart';
import { ApiService } from '../../../../core/services/api';
import { AuthService } from '../../../../core/services/auth';
import { NotificationService } from '../../../../core/services/notifications';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css'
})
export class CartPageComponent {

  constructor(
    public cart:CartService,
    private api:ApiService,
    private auth:AuthService,
    private notifications:NotificationService
  ){}

  remove(id:number){
    this.cart.removeById(id);
  }

  updateQuantity(id:number, value:string){
    const quantity = Number(value);
    if (!Number.isNaN(quantity)) {
      this.cart.updateQuantity(id, quantity);
    }
  }

  placeOrder(){
    const user = this.auth.getCurrentUser();
    if (!user) {
      this.notifications.show('Please login to place an order.', 'error');
      return;
    }

    if (user.status !== 'active') {
      this.notifications.show('Your account is deactivated. Please activate it in your profile to place an order.', 'error');
      return;
    }

    if (!this.cart.getItems().length) {
      this.notifications.show('Your cart is empty.', 'error');
      return;
    }

    this.api.placeOrder({
      userId: user.id,
      items: this.cart.getItems(),
      total: this.cart.getTotal()
    }).subscribe(() => {
      this.cart.clear();
      this.notifications.show('Order placed successfully!', 'success');
    });
  }
}
