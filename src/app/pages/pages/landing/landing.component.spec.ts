import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css']
})
export class LandingPageComponent {

  constructor(private router: Router) { } // Inject Router

  navigateToLogin() {
    this.router.navigate(['/login']); // Now 'this.router' is defined
  }
}