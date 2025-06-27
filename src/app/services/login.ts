import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private afAuth: AngularFireAuth) {}

  login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.afAuth.signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        console.log('Successfully logged in:', user);
        const credential = result.credential;
console.log('Google credential:', credential);
      })
      .catch((error) => {
        console.error('Login failed:', error);
      });
  }
}