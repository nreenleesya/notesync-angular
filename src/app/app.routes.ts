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
import { UserDashboardComponent } from './pages/pages/dashboard/dashboard';
import { AdminComponent } from './pages/admin/admin profile/admin.component';
import { NotesUploadedComponent } from './pages/admin/notes uploaded/notes-uploaded.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToDashboard = () => redirectLoggedInTo(['dashboard']);

export const routes: Routes = [
  {
    path: '', // This path represents the root URL (e.g., http://localhost:4200/)
    component: LandingPageComponent // When the path is empty, load the NOTESALEComponent
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
      //{ path: 'upload-note', component: UploadNoteComponent }, /
  },
  { 
    path: 'notes-uploaded', 
    component: NotesUploadedComponent 
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
    path: 'salesgraph', // This path represents the root URL (e.g., http://localhost:4200/)
    component: SalesGraphComponent // When the path is empty, load the NOTESALEComponent
  },
  {
    path: 'userdashboard',
    component: UserDashboardComponent,
  },
  {
    path: 'admin',
    component: AdminComponent,
  }
];
