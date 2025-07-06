// src/app/pages/promotions/promo1/promo1.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for standalone components
import { RouterLink } from '@angular/router'; // Added RouterLink for back button in HTML

@Component({
  selector: 'app-promo1',
  standalone: true,
  imports: [CommonModule, RouterLink], // Make sure RouterLink is here
  templateUrl: './promo1.html', // Standard naming
  styleUrls: ['./promo1.css'] // Standard naming
})
export class Promo1Component {
  dealDetails = {
    title: 'Summer Sale!',
    description: 'Get up to 30% off on selected documents. Limited time offer!',
    discount: '30%',
    validUntil: 'August 31, 2025' // <--- ENSURE THIS IS 'validUntil'
  };
}
