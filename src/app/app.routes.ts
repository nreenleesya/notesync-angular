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
import { UserDashboardComponent } from './pages/pages/dashboard/dashboard'; // Assuming this is for a general user dashboard
import { AdminComponent } from './pages/admin/admin profile/admin.component'; // This seems to be your Profile component for admin
import { NotesUploadedComponent } from './pages/admin/notes uploaded/notes-uploaded.component';
import { Promo1Component } from './pages/promotions/promo1/promo1';   
import { Promo2Component } from './pages/promotions/promo2/promo2'; // Assuming these are for promotional pages

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToDashboard = () => redirectLoggedInTo(['dashboard']);

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent
  },
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
    data: { authGuardPipe: redirectUnauthorizedToLogin }, // Protect the dashboard
    children: [ // Define child routes here
      { path: '', redirectTo: 'profile', pathMatch: 'full' }, // Default child route for dashboard
      { path: 'profile', component: AdminComponent }, // Assuming AdminComponent is the Profile page
      { path: 'notes-uploaded', component: NotesUploadedComponent },
      { path: 'shop-management', component: UserDashboardComponent }, // Placeholder - replace with actual Shop Management Component
      { path: 'sales-graph', component: SalesGraphComponent },
      { path: 'promo1', component: Promo1Component },
      { path: 'promo2', component: Promo2Component },
      // { path: 'upload-note', component: UploadNoteComponent }, // If upload-note is also a sub-feature
    ]
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
  // Remove these direct routes as they will now be children of 'dashboard'
  // {
  //   path: 'salesgraph',
  //   component: SalesGraphComponent
  // },
  // {
  //   path: 'notes-uploaded',
  //   component: NotesUploadedComponent
  // },
  {
    path: 'userdashboard', // This seems like a separate dashboard, keep if intended
    component: UserDashboardComponent,
  },
  // Remove this direct route if AdminComponent is solely for 'profile' within dashboard
  // {
  //   path: 'admin',
  //   component: AdminComponent,
  // }
];