import { Component, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SignupPageComponent {
  private router = inject(Router);
  private auth = inject(Auth);

  email = '';
  password = '';
  confirmPassword = '';
  errorMessage: string | null = null;
  username: any;

  async signup(): Promise<void> {
    this.errorMessage = null;

    if (!this.email || !this.password || !this.confirmPassword || !this.username) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

     if (this.username !== this.username) {
      this.errorMessage = 'Username is required.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    

    try {
      await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      console.log('Sign-Up successful!');
      const provider = new GoogleAuthProvider();
      const User = require('./models/User'); // Your Mongoose model

async function createUser(userData: any) {
  const newUser = new User(userData);
  await newUser.save();
  console.log('User created:', newUser);
}
      this.router.navigate(['login']);
    } catch (error: any) {
      console.error('Sign-Up failed:', error);
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
}
