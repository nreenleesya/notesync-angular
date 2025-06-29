import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import {  importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http'; // Often needed for Firebase operations
import { getMessaging, provideMessaging } from '@angular/fire/messaging'; // For Firebase Messaging

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';
provideFirebaseApp(() => initializeApp(environment.firebase));

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(routes), provideClientHydration(withEventReplay()), provideFirebaseApp(() => initializeApp({ projectId: "notesync-332b5", appId: "1:467539007887:web:88081bed3623264b1b53fa", storageBucket: "notesync-332b5.firebasestorage.app", apiKey: "AIzaSyCIHgV9su9DZCyrkj4X1Q9_zqwbSbHYEXA", authDomain: "notesync-332b5.firebaseapp.com", messagingSenderId: "467539007887", measurementId: "G-CH0BLR1CNC" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideStorage(() => getStorage()), provideMessaging(() => getMessaging())
  ]
};
