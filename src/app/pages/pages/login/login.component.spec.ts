import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(private router: Router) { } // Inject Router

  navigateToUserDashboard() {
    this.router.navigate(['/userdashboard']); // Now 'this.router' is defined
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']); // Now 'this.router' is defined
  }
}