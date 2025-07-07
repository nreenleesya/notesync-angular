// src/app/app.config.ts

import { ApplicationConfig, provideZoneChangeDetection, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // Often needed for Firebase operations

// Import necessary Firebase functions and providers
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getMessaging, provideMessaging } from '@angular/fire/messaging'; // For Firebase Messaging

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { environment } from '../environments/environment'; // Correct path to environment

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()), // Keep this if you're using SSR/Hydration
    provideHttpClient(), // Provide HttpClient for HTTP requests (Firebase might use it internally)
    provideBrowserGlobalErrorListeners(), // Keep this if you want global error handling

    // --- CORRECTED FIREBASE INITIALIZATION ---
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)), // Use environment.firebaseConfig
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideMessaging(() => getMessaging()),
    // --- END CORRECTED FIREBASE INITIALIZATION ---

    // Any other global providers needed
  ]
};