import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css'
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  expandedOrder: number | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getAllOrders().subscribe(data => {
      this.orders = data;
    });
  }

  toggleExpand(orderId: number): void {
    this.expandedOrder = this.expandedOrder === orderId ? null : orderId;
  }
}
