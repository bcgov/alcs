import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorizationComponent } from './features/authorization/authorization.component';
import { EditApplicationComponent } from './features/edit-application/edit-application.component';
import { HomeComponent } from './features/home/home.component';
import { LandingPageComponent } from './features/landing-page/landing-page.component';
import { LoginComponent } from './features/login/login.component';
import { ReviewApplicationComponent } from './features/review-application/review-application.component';
import { ViewApplicationComponent } from './features/view-application/view-application.component';
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
    component: ViewApplicationComponent,
    canActivate: [AuthGuard],
  },
  {
    title: 'Edit Application',
    path: 'application/:fileId/edit',
    component: EditApplicationComponent,
    canActivate: [AuthGuard],
  },
  {
    title: 'Review Application',
    path: 'application/:fileId/review',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/review-application/review-application.module').then((m) => m.ReviewApplicationModule),
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
