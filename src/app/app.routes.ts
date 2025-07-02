import { RouterModule, Routes } from '@angular/router';
import {
  AuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';
import { LoginPageComponent } from './pages/pages/login/login.component';
import { LandingPageComponent } from './pages/pages/landing/landing.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['chat']);

export const routes: Routes = [
  {
    path: '', // This path represents the root URL (e.g., http://localhost:4200/)
    component: LandingPageComponent // When the path is empty, load the NOTESALEComponent
  },
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToHome },
  },
];
