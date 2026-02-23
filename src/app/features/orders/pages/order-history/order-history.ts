import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api';
import { AuthService } from '../../../../core/services/auth';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css'
})
export class OrderHistoryComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  error = '';

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    console.log('Current user:', user);
    
    if (user) {
      this.api.getOrdersByUser(user.id).subscribe({
        next: (data) => {
          console.log('Orders received:', data);
          this.orders = data || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching orders:', err);
          this.error = 'Failed to load order history';
          this.loading = false;
        }
      });
    } else {
      this.error = 'Please login to view orders';
      this.loading = false;
    }
  }
}
