// src/app/pages/promotions/promo1/promo1.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for standalone components

@Component({
  selector: 'app-promo1',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './promo1.html',
  styleUrls: ['./promo1.css']
})
export class Promo1Component {
  // You can add logic specific to Promo 1 here, e.g., fetching deal details
  dealDetails = {
    title: 'Summer Sale!',
    description: 'Get up to 30% off on selected documents. Limited time offer!',
    discount: '30%',
    validUntil: 'August 31, 2025'
  };
}
