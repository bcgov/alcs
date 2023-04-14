import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorizationComponent } from './features/authorization/authorization.component';
import { HomeComponent } from './features/home/home.component';
import { LandingPageComponent } from './features/landing-page/landing-page.component';
import { LoginComponent } from './features/login/login.component';
import { ViewSubmissionComponent } from './features/view-submission/view-submission.component';
import { AuthGuard } from './services/authentication/auth.guard';

const routes: Routes = [
  {
    title: 'Login',
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'authorized',
    component: AuthorizationComponent,
  },
  {
    title: 'Home',
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    title: 'Landing page',
    path: 'landing',
    component: LandingPageComponent,
    canActivate: [AuthGuard],
  },
  {
    title: 'View Application',
    path: 'application/:fileId',
    component: ViewSubmissionComponent,
    canActivate: [AuthGuard],
  },
  {
    title: 'Edit Application',
    path: 'application/:fileId/edit',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/edit-submission/edit-submission.module').then((m) => m.EditSubmissionModule),
  },
  {
    title: 'ALCS Edit Application',
    path: 'alcs/application/:fileId/edit',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/alcs-edit-submission/alcs-edit-submission.module').then((m) => m.AlcsEditSubmissionModule),
  },
  {
    title: 'Review Application',
    path: 'application/:fileId/review',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/review-submission/review-submission.module').then((m) => m.ReviewSubmissionModule),
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
