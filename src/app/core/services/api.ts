import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // ==================== PRODUCTS ====================

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/product-service/products`)
      .pipe(
        catchError(err => {
          console.error('Failed to fetch products', err);
          return of([]);
        })
      );
  }

  getProductById(id: number): Observable<any> {
    console.log(`API: Fetching product ${id} from ${this.baseUrl}/product-service/products/${id}`);
    return this.http.get<any>(`${this.baseUrl}/product-service/products/${id}`)
      .pipe(
        tap(data => console.log(`API: Product ${id} fetched:`, data)),
        catchError(err => {
          console.error(`API: Failed to fetch product ${id}`, err);
          throw err;
        })
      );
  }

  addProduct(product: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/product-service/products`, product)
      .pipe(
        catchError(err => {
          console.error('Failed to create product', err);
          throw err;
        })
      );
  }

  updateProduct(updated: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/product-service/products/${updated.id}`, updated)
      .pipe(
        catchError(err => {
          console.error('Failed to update product', err);
          throw err;
        })
      );
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/product-service/products/${id}`)
      .pipe(
        catchError(err => {
          console.error('Failed to delete product', err);
          throw err;
        })
      );
  }

  bulkAddProducts(items: any[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/product-service/products/bulk`, items)
      .pipe(
        catchError(err => {
          console.error('Failed to bulk add products', err);
          throw err;
        })
      );
  }

  decrementProductQuantity(productId: number, amount: number = 1): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/product-service/products/${productId}/decrement-quantity`,
      { amount }
    ).pipe(
      catchError(err => {
        console.error('Failed to decrement product quantity', err);
        return of(true);
      })
    );
  }

  incrementProductQuantity(productId: number, amount: number = 1): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/product-service/products/${productId}/increment-quantity`,
      { amount }
    ).pipe(
      catchError(err => {
        console.error('Failed to increment product quantity', err);
        return of(true);
      })
    );
  }

  // ==================== ORDERS ====================

  placeOrder(order: { userId: number; items: any[]; total: number }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/order-service/orders`, order)
      .pipe(
        catchError(err => {
          console.error('Failed to place order', err);
          throw err;
        })
      );
  }

  getOrdersByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/order-service/orders/user/${userId}`)
      .pipe(
        catchError(err => {
          console.error(`Failed to fetch orders for user ${userId}`, err);
          return of([]);
        })
      );
  }

  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/order-service/orders`)
      .pipe(
        catchError(err => {
          console.error('Failed to fetch all orders', err);
          return of([]);
        })
      );
  }
}
