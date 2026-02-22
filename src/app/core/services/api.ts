import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/**
 * 🟡 BACKEND MAPPING FOR APISERVICE
 * This service handles product catalog and order management.
 * Replace all mock data with Spring Boot REST API calls.
 * 
 * SPRING BOOT ENDPOINTS TO CREATE:
 * 
 * ===== PRODUCT MANAGEMENT =====
 * 1. GET /api/products
 *    Response: [{ id, name, description, price, quantity, imageUrl }]
 * 
 * 2. GET /api/products/:id
 *    Response: { id, name, description, price, quantity, imageUrl }
 *    Error: 404 Product not found
 * 
 * 3. POST /api/products
 *    Request: { name, description, price, quantity, imageUrl? }
 *    Response: { id, name, description, price, quantity, imageUrl }
 *    Error: 400 Name/description required / Price > 10000
 * 
 * 4. PUT /api/products/:id
 *    Request: { name, description, price, quantity, imageUrl? }
 *    Response: { id, name, description, price, quantity, imageUrl }
 *    Error: 404 Not found / 400 Invalid fields
 * 
 * 5. DELETE /api/products/:id
 *    Response: { success: true }
 *    Error: 404 Not found
 * 
 * 6. POST /api/products/bulk
 *    Request: [{ name, description, price, quantity, imageUrl? }, ...]
 *    Response: [{ id, name, description, price, quantity, imageUrl }, ...]
 *    Error: 400 Invalid items
 * 
 * 7. PUT /api/products/:id/decrement-quantity
 *    Query: ?amount=1 (default: 1)
 *    Response: { success: true, newQuantity: number }
 *    Error: 404 Not found / 400 Insufficient quantity
 * 
 * ===== ORDER MANAGEMENT =====
 * 8. POST /api/orders
 *    Request: { userId: number, items: [{ id, price, quantity, cartQuantity }], total: number }
 *    Response: { id, userId, items, total, createdAt }
 *    Error: 400 Invalid items / Cart empty
 * 
 * 9. GET /api/orders/user/:userId
 *    Response: [{ id, userId, items, total, createdAt }, ...]
 * 
 * 10. GET /api/orders (admin only)
 *    Response: [{ id, userId, items, total, createdAt }, ...]
 *    Error: 401 Unauthorized / 403 Admin only
 */

@Injectable({ providedIn: 'root' })
export class ApiService {

  // 🟡 MOCK DATA (temporary until backend is ready)
  private products = [
    {
      id: 1,
      name: 'Rice',
      description: 'Premium Basmati Rice',
      price: 80,
      quantity: 10,
      imageUrl: 'https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 2,
      name: 'Milk',
      description: 'Fresh Cow Milk',
      price: 50,
      quantity: 20,
      imageUrl: 'https://images.unsplash.com/photo-1580915411954-282cb1c9a87d?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 3,
      name: 'Sugar',
      description: 'Refined Sugar',
      price: 45,
      quantity: 15,
      imageUrl: 'https://images.unsplash.com/photo-1505575967455-40e256f73376?auto=format&fit=crop&w=400&q=80'
    }
  ];

  private orders: any[] = [];

  getProducts(): Observable<any[]> {
    return of(this.products);

    // � REPLACE WITH SPRING BOOT:
    // return this.http.get<any[]>('/api/products');
  }

  getProductById(id: number): Observable<any | undefined> {
    return of(this.products.find(product => product.id === id));

    // 🟡 REPLACE WITH SPRING BOOT:
    // return this.http.get<any>(`/api/products/${id}`);
  }

  addProduct(product:any) {
    const newProduct = {
      ...product,
      id: this.products.length + 1,
      imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'
    };
    this.products.push(newProduct);
    return of(newProduct);

    // � REPLACE WITH SPRING BOOT:
    // return this.http.post<any>('/api/products', product);
  }

  updateProduct(updated:any) {
    this.products = this.products.map(product =>
      product.id === updated.id ? { ...product, ...updated } : product
    );
    return of(updated);

    // 🟡 REPLACE WITH SPRING BOOT:
    // return this.http.put<any>(`/api/products/${updated.id}`, updated);
  }

  deleteProduct(id:number) {
    this.products = this.products.filter(p => p.id !== id);
    return of(true);

    // � REPLACE WITH SPRING BOOT:
    // return this.http.delete<any>(`/api/products/${id}`);
  }

  bulkAddProducts(items:any[]) {
    const startId = this.products.length + 1;
    const mapped = items.map((item, index) => ({
      ...item,
      id: startId + index,
      imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'
    }));
    this.products = [...this.products, ...mapped];
    return of(mapped);

    // 🟡 REPLACE WITH SPRING BOOT:
    // return this.http.post<any[]>('/api/products/bulk', items);
  }

  placeOrder(order:any) {
    this.orders = [{
      ...order,
      id: this.orders.length + 1,
      createdAt: new Date().toISOString()
    }, ...this.orders];
    return of(true);

    // 🟡 REPLACE WITH SPRING BOOT:
    // return this.http.post<any>('/api/orders', order);
  }

  getOrdersByUser(userId: number) {
    return of(this.orders.filter(order => order.userId === userId));

    // 🟡 REPLACE WITH SPRING BOOT:
    // return this.http.get<any[]>(`/api/orders/user/${userId}`);
  }

  getAllOrders() {
    return of(this.orders);

    // 🟡 REPLACE WITH SPRING BOOT:
    // return this.http.get<any[]>('/api/orders');
  }

  decrementProductQuantity(productId: number, amount: number = 1) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      product.quantity = Math.max(0, product.quantity - amount);
    }
    return of(true);

    // 🟡 REPLACE WITH SPRING BOOT:
    // return this.http.put<any>(`/api/products/${productId}/decrement-quantity`, { amount });
  }
}
