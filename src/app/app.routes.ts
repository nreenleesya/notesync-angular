import { RouterModule, Routes } from '@angular/router';
import {
  AuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';
import { LoginPageComponent } from './pages/pages/login/login.component';
import { LandingPageComponent } from './pages/pages/landing/landing.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { SignupPageComponent } from './pages/pages/signup/signup.component';
import { SalesGraphComponent } from './pages/admin/salesgraph/salesgraph.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToDashboard = () => redirectLoggedInTo(['dashboard']);

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    component: LandingPageComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToDashboard },
  },
  {
    path: 'signup',
    component: SignupPageComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToDashboard },
  },
  {
    path: 'salesgraph',
    component: SalesGraphComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: '**',
    redirectTo: 'landing'
  }
];