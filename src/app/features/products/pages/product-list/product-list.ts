import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api';
import { CartService } from '../../../../core/services/cart';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductListComponent implements OnInit {

  products:any[]=[];
  searchTerm = '';

  constructor(
    private api:ApiService,
    private cart:CartService
  ){}

  ngOnInit(){
    this.loadProducts();
  }

  loadProducts(){
    this.api.getProducts().subscribe(data => {
      this.products = data;
    });
  }

  get filteredProducts(){
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.products;
    }
    return this.products.filter(p =>
      (p.name || '').toLowerCase().includes(term) ||
      (p.description || '').toLowerCase().includes(term) ||
      String(p.id || '').toLowerCase().includes(term)
    );
  }

}
