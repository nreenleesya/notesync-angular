// src/app/pages/promotions/promo2/promo2.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for standalone components
import { RouterLink } from '@angular/router'; // Added RouterLink for back button in HTML

@Component({
  selector: 'app-promo2',
  standalone: true,
  // Added RouterLink to imports for the back button in the HTML template
  imports: [CommonModule, RouterLink],
  // Corrected: Assuming standard Angular file naming convention
  templateUrl: './promo2.html',
  styleUrls: ['./promo2.css']
})
export class Promo2Component {
  // You can add logic specific to Promo 2 here, e.g., fetching deal details
  dealDetails = {
    title: 'New User Deals',
    description: 'Exclusive discounts on premium documents for first-time buyers.',
    eligibility: 'First-time buyers only',
    offerExpires: 'December 31, 2025'
  };
}
