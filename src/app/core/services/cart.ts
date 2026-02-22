import { Injectable } from '@angular/core';
import { ApiService } from './api';

/**
 * 🟡 CART SERVICE - LOCAL STATE MANAGEMENT
 * This service manages the shopping cart locally in memory.
 * It calls ApiService.decrementProductQuantity() to update backend inventory.
 * 
 * NOTE: Cart data is NOT persisted to database.
 * When user navigates away or closes browser, cart is cleared (by design).
 * 
 * KEY INTEGRATION POINTS WITH SPRING BOOT:
 * 1. add() method calls ApiService.decrementProductQuantity() → PUT /api/products/:id/decrement-quantity
 * 2. placeOrder() (in CartPageComponent) calls ApiService.placeOrder() → POST /api/orders
 * 
 * OPTIONAL FUTURE ENHANCEMENTS:
 * - Persist cart to localStorage: localStorage.setItem('cart', JSON.stringify(items))
 * - Save cart to database/session: POST /api/cart/save
 * - Load saved cart: GET /api/cart/load
 * - Validate inventory before checkout: POST /api/cart/validate
 */

@Injectable({ providedIn: 'root' })
export class CartService {

  private items:any[] = [];

  constructor(private api: ApiService) {}

  add(item:any){
    // Check if product has any available quantity left
    if (!item.quantity || item.quantity <= 0) {
      return false;
    }

    const existing = this.items.find(entry => entry.id === item.id);
    if (existing) {
      existing.cartQuantity = (existing.cartQuantity || 1) + 1;
    } else {
      // Store with cartQuantity for what's in cart, keep remaining stock info
      this.items.push({ 
        ...item, 
        cartQuantity: 1,
        maxStock: item.quantity 
      });
    }
    // Decrement product quantity from inventory
    this.api.decrementProductQuantity(item.id, 1);
    return true;
  }

  removeById(id:number){
    this.items = this.items.filter(item => item.id !== id);
  }

  updateQuantity(id:number, quantity:number){
    const target = this.items.find(item => item.id === id);
    if (!target) {
      return;
    }
    // Ensure quantity is between 1 and max stock
    const validQuantity = Math.max(1, Math.min(quantity, target.maxStock));
    target.cartQuantity = validQuantity;
  }

  getItems(){
    return this.items.map(item => ({
      ...item,
      quantity: item.cartQuantity
    }));
  }

  getTotal(){
    return this.items.reduce((sum,p)=>sum+(p.price * (p.cartQuantity || 1)),0);
  }

  clear(){
    this.items = [];
  }
}
