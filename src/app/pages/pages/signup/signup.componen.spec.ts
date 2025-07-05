import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {

  constructor(private router: Router) { } // Inject Router

  navigateToLogin() {
    this.router.navigate(['/login']); // Now 'this.router' is defined
  }
}