// src/main.ts

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component'; // Your root component
import { provideRouter } from '@angular/router'; // For routing setup
import { routes } from './app/app.routes'; // Your application routes
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { environment } from './environments/environment'; // Your Firebase config

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // This sets up your routing
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    provideMessaging(() => getMessaging()),
    // Any other global providers needed
  ]
}).catch(err => console.error(err));