// src/app/pages/pages/dashboard/dashboard.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for @if, async pipe
import { Observable, Subscription } from 'rxjs';

// Corrected Firebase Auth imports:
// User type comes from 'firebase/auth'
import { User } from 'firebase/auth';
// Auth functions come from '@angular/fire/auth' when using AngularFire
import {
  Auth, // The Auth service itself, which you get via inject(Auth) or getAuth()
  getAuth, // <-- CRUCIAL: Import getAuth
  onAuthStateChanged,
  signInAnonymously,
  signInWithCustomToken,
  signOut
} from '@angular/fire/auth';
import { initializeApp } from '@angular/fire/app';

// Define the shape of the global variables provided by the environment
declare const __firebase_config: string;
declare const __initial_auth_token: string;
declare const __app_id: string;

@Component({
  selector: 'app-dashboard', // How you'd use it: <app-dashboard></app-dashboard>
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html', // Assuming this is the correct path to your HTML
  styleUrls: ['./dashboard.css']
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  user: User | null = null; // Direct property for user data
  private auth: Auth | undefined; // Firebase Auth instance, typed correctly
  private authStateSubscription?: Subscription; // Add subscription property

  constructor() { }

  ngOnDestroy(): void {
    // Unsubscribe from auth state observable if it exists
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    try {
      const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
      const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'; // Using __app_id

      // Initialize Firebase app and get Auth instance
      const app = initializeApp(firebaseConfig); // <-- initializeApp is now imported and used
      this.auth = getAuth(app); // <-- getAuth is now imported and used

      // Subscribe to auth state changes
      this.authStateSubscription = new Observable<User | null>(observer => {
        // Correctly type the 'currentUser' parameter
        const unsubscribe = onAuthStateChanged(this.auth as Auth, async (currentUser: User | null) => {
          if (currentUser) {
            this.user = currentUser;
            observer.next(currentUser);
            console.log("Dashboard: User is signed in:", currentUser.uid);
          } else {
            this.user = null;
            observer.next(null);
            console.log("Dashboard: No user is signed in.");
            // Attempt to sign in with custom token if available, otherwise anonymously
            if (initialAuthToken) {
              try {
                await signInWithCustomToken(this.auth as Auth, initialAuthToken);
                console.log("Dashboard: Signed in with custom token.");
              } catch (error) {
                console.error("Dashboard: Error signing in with custom token:", error);
                try {
                  await signInAnonymously(this.auth as Auth);
                  console.log("Dashboard: Signed in anonymously.");
                } catch (anonError) {
                  console.error("Dashboard: Error signing in anonymously:", anonError);
                }
              }
            } else {
              try {
                await signInAnonymously(this.auth as Auth);
                console.log("Dashboard: Signed in anonymously.");
              } catch (anonError) {
                console.error("Dashboard: Error signing in anonymously:", anonError);
              }
            }
          }
        });
        return unsubscribe; // Return the unsubscribe function for cleanup
      }).subscribe(); // Subscribe to activate the observable
    } catch (error) {
      console.error("Dashboard: Firebase initialization error:", error);
    }
  }

  // Method to handle sign out
  async logout(): Promise<void> {
    if (!this.auth) {
      console.error("Firebase Auth not initialized.");
      return;
    }
    try {
      await signOut(this.auth);
      console.log("Dashboard: User signed out.");
      // Redirect to login or landing page after logout
      window.location.href = '/login.html'; // Assuming login.html is your login page
    } catch (error: any) {
      console.error("Dashboard: Sign Out Error:", error);
      // Display user-friendly error message
    }
  }
}