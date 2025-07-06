// src/app/pages/pages/signup/signup.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For [(ngModel)]
import { Router } from '@angular/router';

// Corrected Firebase Auth imports for modular SDK:
import {
  Auth,
  createUserWithEmailAndPassword,
  // signInWithPopup, // Only import if you use Google/social sign-up here
} from '@angular/fire/auth'; // Functions from @angular/fire

import {
  GoogleAuthProvider, // <-- Corrected: GoogleAuthProvider from firebase/auth
  User,               // User type from firebase/auth (if you need to type a user object)
} from 'firebase/auth'; // <-- Source for GoogleAuthProvider and User type

// If you plan to store additional user data in Firestore after signup,
// you would import Firestore-related modules here:
// import { Firestore, doc, setDoc, serverTimestamp } from '@angular/fire/firestore';


@Component({
  selector: 'app-signup-page', // Using 'app-signup-page' as in your code
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule], // FormsModule is essential for [(ngModel)]
})
export class SignupPageComponent {
  private router = inject(Router);
  private auth = inject(Auth);
  // private firestore = inject(Firestore); // Uncomment if you use Firestore for user profiles

  email = '';
  password = '';
  confirmPassword = '';
  errorMessage: string | null = null;
  username = ''; // Initialize username as string

  async signup(): Promise<void> {
    this.errorMessage = null; // Clear previous errors

    // Basic form validation
    if (!this.email || !this.password || !this.confirmPassword || this.username.trim() === '') {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    // Corrected username validation (check if it's empty, not if it equals itself)
    if (this.username.trim() === '') {
      this.errorMessage = 'Username cannot be empty.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    try {
      // Use Firebase Auth to create user with email and password
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      console.log('Firebase Sign-Up successful for user:', userCredential.user.uid);

      // IMPORTANT: If you want to save the username to Firestore, do it here.
      // You would NOT use Mongoose here. This is frontend Angular code.
      // Example (uncomment and implement if you use Firestore for user profiles):
      /*
      if (this.firestore && userCredential.user.uid) {
        await setDoc(doc(this.firestore, 'users', userCredential.user.uid), {
          email: this.email,
          username: this.username,
          createdAt: serverTimestamp() // from '@angular/fire/firestore'
        });
        console.log('User profile saved to Firestore.');
      }
      */

      // After successful signup and optional Firestore profile creation, navigate
      this.router.navigate(['/login']); // Navigate to login page after successful signup
    } catch (error: any) {
      console.error('Firebase Sign-Up failed:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          this.errorMessage = 'This email is already registered.';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'Invalid email format.';
          break;
        case 'auth/weak-password':
          this.errorMessage = 'Password should be at least 6 characters.';
          break;
        default:
          this.errorMessage = 'Sign-Up failed. Please try again.';
      }
    }
  }

  // If you later add Google Sign-up to this page, you'd add a method like this:
  /*
  async googleSignUp(): Promise<void> {
    this.errorMessage = null;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
      console.log('Google Sign-Up successful!');
      this.router.navigate(['/userdashboard']); // Or wherever you want to redirect
    } catch (error: any) {
      console.error('Google Sign-Up failed:', error);
      this.errorMessage = 'Google Sign-Up failed. Please try again.';
    }
  }
  */
}