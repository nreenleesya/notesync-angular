import { Component } from '@angular/core';
import { LoginService } from '../app/services/login'; // Adjust path if needed
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private loginService: LoginService) {}

  loginWithGoogle() {
    this.loginService.login();
  }
}