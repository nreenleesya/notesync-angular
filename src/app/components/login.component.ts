import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from '../services/login'; // Adjust path if needed
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private loginService: LoginService) {}

  loginWithGoogle() {
    this.loginService.login();
  }
}