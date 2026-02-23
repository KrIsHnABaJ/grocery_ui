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
    this.api.decrementProductQuantity(item.id, 1).subscribe({
      next: (response) => {
        // Update local item's quantity from server response
        const cartItem = this.items.find(entry => entry.id === item.id);
        if (cartItem && response && response.quantity !== undefined) {
          cartItem.maxStock = response.quantity;
        }
      },
      error: (err) => {
        console.error('Failed to decrement product quantity:', err);
      }
    });
    return true;
  }

  removeById(id:number){
    const item = this.items.find(entry => entry.id === id);
    if (item) {
      // Restore the product quantity back to inventory
      this.api.incrementProductQuantity(id, item.cartQuantity || 1).subscribe({
        next: () => {
          console.log(`Restored ${item.cartQuantity || 1} units of product ${id} to inventory`);
        },
        error: (err) => {
          console.error('Failed to restore product quantity:', err);
        }
      });
    }
    this.items = this.items.filter(item => item.id !== id);
  }

  updateQuantity(id:number, quantity:number){
    const target = this.items.find(item => item.id === id);
    if (!target) {
      return;
    }
    
    const oldQuantity = target.cartQuantity || 1;
    const newQuantity = Math.max(1, quantity); // Ensure at least 1
    const quantityDiff = newQuantity - oldQuantity;
    
    if (quantityDiff === 0) {
      return; // No change
    }
    
    if (quantityDiff > 0) {
      // Increasing quantity - need to decrement inventory
      this.api.decrementProductQuantity(id, quantityDiff).subscribe({
        next: (response) => {
          console.log(`Decremented ${quantityDiff} units from product ${id}`);
          target.cartQuantity = newQuantity;
          if (response && response.quantity !== undefined) {
            target.maxStock = response.quantity;
          }
        },
        error: (err) => {
          console.error('Failed to decrement product quantity:', err);
        }
      });
    } else {
      // Decreasing quantity - need to increment inventory back
      this.api.incrementProductQuantity(id, Math.abs(quantityDiff)).subscribe({
        next: (response) => {
          console.log(`Restored ${Math.abs(quantityDiff)} units to product ${id}`);
          target.cartQuantity = newQuantity;
          if (response && response.quantity !== undefined) {
            target.maxStock = response.quantity;
          }
        },
        error: (err) => {
          console.error('Failed to restore product quantity:', err);
        }
      });
    }
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

  clear(restoreInventory: boolean = false){
    if (restoreInventory) {
      // Restore all items back to inventory (e.g., user abandoned cart)
      this.items.forEach(item => {
        this.api.incrementProductQuantity(item.id, item.cartQuantity || 1).subscribe({
          next: () => {
            console.log(`Restored ${item.cartQuantity || 1} units of product ${item.id} to inventory`);
          },
          error: (err) => {
            console.error('Failed to restore product quantity:', err);
          }
        });
      });
    }
    this.items = [];
  }
}
