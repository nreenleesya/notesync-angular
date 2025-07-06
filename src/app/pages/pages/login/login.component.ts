import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';

@Component({
  selector: 'app-login-page',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class LoginPageComponent {
  private router = inject(Router);
  private auth = inject(Auth);

  email = '';
  password = '';
  errorMessage: string | null = null;
  isLoading = false;

  async googleSignIn(): Promise<void> {
    this.errorMessage = null;
    this.isLoading = true;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
      // Let the auth guard handle the navigation
      this.router.navigate(['dashboard']);
    } catch (error: any) {
      console.error('Error during Google sign-in:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        this.errorMessage = 'Sign-in window was closed. Please try again.';
      } else {
        this.errorMessage = 'Google Sign-In failed. Please try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  async login(): Promise<void> {
    this.errorMessage = null;
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    this.isLoading = true;
    try {
      await signInWithEmailAndPassword(this.auth, this.email, this.password);
      // Let the auth guard handle the navigation
      this.router.navigate(['dashboard']);
    } catch (error: any) {
      console.error('Email/Password Sign-In failed:', error);
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          this.errorMessage = 'Invalid email or password.';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'Invalid email format.';
          break;
        case 'auth/too-many-requests':
          this.errorMessage = 'Too many failed login attempts. Please try again later.';
          break;
        default:
          this.errorMessage = 'Login failed. Please check your credentials and try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }
}