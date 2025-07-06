import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDashboardComponent } from './dashboard';
import { Router } from '@angular/router';

export class LandingPageComponent {

  constructor(private router: Router) { } // Inject Router

  navigateToLogin() {
    this.router.navigate(['salesgraph']); // Now 'this.router' is defined
  }

  navigateToLanding() {
    this.router.navigate(['notes-uploaded']); // Now 'this.router' is defined
  }
}
