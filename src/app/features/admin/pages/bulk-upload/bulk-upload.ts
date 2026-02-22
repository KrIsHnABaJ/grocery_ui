import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api';
import { NotificationService } from '../../../../core/services/notifications';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bulk-upload.html',
  styleUrl: './bulk-upload.css'
})
export class BulkUploadComponent {
  preview: any[] = [];
  errorMessage = '';

  constructor(private api: ApiService, private notifications: NotificationService) {}

  handleFile(event: Event): void {
    this.errorMessage = '';
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      this.preview = this.parseCsv(content);
    };
    reader.readAsText(file);
  }

  upload(): void {
    this.errorMessage = '';

    if (!this.preview.length) {
      this.errorMessage = 'No products to upload.';
      return;
    }

    const invalid = this.preview.find(item => !item.name || !item.description || item.price > 10000);
    if (invalid) {
      this.errorMessage = 'Please ensure all products have name, description, and price <= 10,000.';
      return;
    }

    this.api.bulkAddProducts(this.preview).subscribe(() => {
      this.notifications.show('Bulk upload completed.', 'success');
      this.preview = [];
    });
  }

  private parseCsv(content: string): any[] {
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (!lines.length) {
      return [];
    }

    const rows = lines.map(line => line.split(',').map(value => value.trim()));
    const hasHeader = rows[0].some(value => value.toLowerCase() === 'name');
    const dataRows = hasHeader ? rows.slice(1) : rows;

    return dataRows.map(columns => ({
      name: columns[0],
      description: columns[1],
      price: Number(columns[2] || 0),
      quantity: Number(columns[3] || 0),
      imageUrl: columns[4]
    }));
  }
}
