// src/app/pages/landing/landing.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for standalone components
import { RouterLink } from '@angular/router'; // Import RouterLink for navigation

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink], // Add RouterLink to imports
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.css']
})
export class LandingPageComponent {
  // This component will serve as the main landing page displaying the promo cards.
  // The navigation to /promo1 and /promo2 will be handled by routerLink in the HTML.
}
