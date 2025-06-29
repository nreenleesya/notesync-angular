// src/app/login-page/login-page.component.ts

import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for Angular directives like *ngIf
import { FormsModule } from '@angular/forms'; // Required for [(ngModel)] two-way data binding
import { ChatService } from 'src/app/services/chat.service';
import { Router } from '@angular/router'; // To navigate after login
import { Subscription } from 'rxjs'; // To manage subscriptions for cleanup
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth'; // For email/password login

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
  standalone: true,
  imports: [
    CommonModule, // Add CommonModule for basic directives (e.g., *ngIf for error messages)
    FormsModule, // Add FormsModule for [(ngModel)] two-way data binding
  ],
})
export class LoginPageComponent implements OnDestroy {
  // Inject services
  chatService = inject(ChatService);
  private router = inject(Router);
  private auth = inject(Auth); // Inject Firebase Auth directly for email/password sign-in

  // Properties to bind to the form input fields using [(ngModel)]
  email = '';
  password = '';
  errorMessage: string | null = null; // Property to display any login errors to the user

  // Subscription to the user$ observable from ChatService.
  // This will allow the component to react to changes in the user's authentication state,
  // particularly for redirection after login/logout.
  private userSubscription: Subscription;

  constructor() {
    // Subscribe to the chat service's user$ observable.
    // When a user logs in (user becomes non-null), navigate to the chat page.
    // If user logs out (user becomes null), the component stays on the login page.
    this.userSubscription = this.chatService.user$.subscribe((user) => {
      if (user) {
        // A user is logged in, so redirect to the chat page.
        console.log('LoginPageComponent: User detected, navigating to /chat');
        this.router.navigate(['/', 'chat']);
      } else {
        // User is logged out. If currently on a restricted page, could redirect to login.
        // For now, if already on login page, just log.
        console.log('LoginPageComponent: No user detected (logged out or not signed in).');
      }
    });
  }

  /**
   * Handles the Google Sign-In button click.
   * It delegates the actual sign-in process to the `ChatService`.
   */
  async googleSignIn(): Promise<void> {
    this.errorMessage = null; // Clear any previous error messages before attempting new login.
    try {
      // Call the `login()` method from `ChatService` which handles Google authentication.
      await this.chatService.login();
      // The navigation to '/chat' is handled by the `userSubscription` above once Firebase confirms login.
      console.log('Google Sign-In initiated successfully.');
    } catch (error: any) {
      console.error('Error during Google sign-in:', error);
      // Display a user-friendly error message based on the Firebase error code.
      if (error.code === 'auth/popup-closed-by-user') {
        this.errorMessage = 'Sign-in window was closed. Please try again.';
      } else {
        this.errorMessage = 'Google Sign-In failed. Please try again.';
      }
    }
  }

  /**
   * Handles the email and password login form submission.
   * It uses Firebase's `signInWithEmailAndPassword` directly.
   */
  async login(): Promise<void> {
    this.errorMessage = null; // Clear any previous error messages.

    // Basic client-side validation to ensure fields are not empty.
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    try {
      // Attempt to sign in with email and password using Firebase Auth.
      await signInWithEmailAndPassword(this.auth, this.email, this.password);
      console.log('Email/Password Sign-In successful!');
      // Navigation to '/chat' is handled by the `userSubscription` above.
    } catch (error: any) {
      console.error('Email/Password Sign-In failed:', error);
      // Provide user-friendly error messages based on common Firebase auth codes.
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
    }
  }

  /**
   * Angular lifecycle hook called when the component is destroyed.
   * Essential for unsubscribing from observables to prevent memory leaks.
   */
  ngOnDestroy(): void {
    // Unsubscribe from the userSubscription to avoid memory leaks when the component is removed from the DOM.
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
