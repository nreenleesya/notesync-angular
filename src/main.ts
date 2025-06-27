import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router'; // Ensure this import is here
import { AppComponent } from './app/app.component'; // Ensure AppComponent is imported
import { routes } from './app/app.routes'; // Ensure your routes file is imported

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes) // This sets up your routing
  ]
}).catch(err => console.error(err));