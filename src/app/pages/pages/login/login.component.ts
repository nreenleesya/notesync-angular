import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginPageComponent {
  private router = inject(Router);
  private auth = inject(Auth);

  email = '';
  password = '';
  errorMessage: string | null = null;
  isLoading = false;

  private nextJsAppBaseUrl = 'http://localhost:3000'; // <--- !!! CHANGE THIS !!!

  async googleSignIn(): Promise<void> {
    this.errorMessage = null;
    this.isLoading = true;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
      // For Google Sign-In, we'll generally navigate to userdashboard
      // You might want to add a check here if specific Google accounts
      // should go to 'dashboard' (e.g., based on email domain)
      this.router.navigate(['userdashboard']);
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

      // --- MODIFICATION START ---
      // Check for the specific password
      if (this.password === 'notesyncs123') {
        this.router.navigate(['dashboard']); // Navigate to dashboard
      } else {
        this.router.navigate(['userdashboard']); // Navigate to userdashboard for all other passwords
      }
      // --- MODIFICATION END ---

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