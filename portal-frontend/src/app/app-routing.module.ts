import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorizationComponent } from './features/authorization/authorization.component';
import { CreateApplicationComponent } from './features/create-application/create-application.component';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/login/login.component';
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
    title: 'Create Application',
    path: 'create',
    component: CreateApplicationComponent,
    canActivate: [AuthGuard],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
