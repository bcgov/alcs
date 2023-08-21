import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorizationComponent } from './features/authorization/authorization.component';
import { HomeComponent } from './features/home/home.component';
import { LandingPageComponent } from './features/landing-page/landing-page.component';
import { LoginComponent } from './features/login/login.component';
import { AlcsAuthGuard } from './services/authentication/alcs-auth.guard';
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
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/applications/view-submission/view-application-submission.module').then(
        (m) => m.ViewApplicationSubmissionModule
      ),
  },
  {
    title: 'Edit Application',
    path: 'application/:fileId/edit',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/applications/edit-submission/edit-submission.module').then((m) => m.EditSubmissionModule),
  },
  {
    title: 'ALCS Edit Application',
    path: 'alcs/application/:fileId/edit',
    canActivate: [AlcsAuthGuard],
    loadChildren: () =>
      import('./features/applications/alcs-edit-submission/alcs-edit-submission.module').then(
        (m) => m.AlcsEditSubmissionModule
      ),
  },
  {
    title: 'ALCS Edit Notice of Intent',
    path: 'alcs/notice-of-intent/:fileId/edit',
    canActivate: [AlcsAuthGuard],
    loadChildren: () =>
      import('./features/notice-of-intents/alcs-edit-submission/alcs-edit-submission.module').then(
        (m) => m.AlcsEditSubmissionModule
      ),
  },
  {
    title: 'Review Application',
    path: 'application/:fileId/review',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/applications/review-submission/review-submission.module').then(
        (m) => m.ReviewSubmissionModule
      ),
  },
  {
    title: 'View Notice of Intent',
    path: 'notice-of-intent/:fileId',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/notice-of-intents/view-submission/view-notice-of-intent-submission.module').then(
        (m) => m.ViewNoticeOfIntentSubmissionModule
      ),
  },
  {
    title: 'Edit Notice of Intent',
    path: 'notice-of-intent/:fileId/edit',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/notice-of-intents/edit-submission/edit-submission.module').then((m) => m.EditSubmissionModule),
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
