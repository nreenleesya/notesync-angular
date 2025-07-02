import { RouterModule, Routes } from '@angular/router';
import {
  AuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';
import { LoginPageComponent } from './pages/pages/login/login.component';
import { LandingPageComponent } from './pages/pages/landing/landing.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SignupPageComponent } from './pages/pages/signup/signup.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['chat']);

export const routes: Routes = [
  {
    path: 'landing', // This path represents the root URL (e.g., http://localhost:4200/)
    component: LandingPageComponent // When the path is empty, load the NOTESALEComponent
  },
  {
    path: 'dashboard', // This path represents the root URL (e.g., http://localhost:4200/)
    component: DashboardComponent // When the path is empty, load the NOTESALEComponent
  },
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToHome },
  },
   {
    path: 'signup', // This path represents the root URL (e.g., http://localhost:4200/)
    component: SignupPageComponent // When the path is empty, load the NOTESALEComponent
  },
];
