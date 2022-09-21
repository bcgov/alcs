import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorizationComponent } from './features/authorization/authorization.component';
import { NotFoundComponent } from './features/errors/not-found/not-found.component';
import { LoginComponent } from './features/login/login.component';
import { ProvisionComponent } from './features/provision/provision.component';
import { AuthGuard } from './services/authentication/auth.guard';
import { HasRolesGuard } from './services/authentication/hasRoles.guard';

const routes: Routes = [
  {
    path: 'board',
    canActivate: [HasRolesGuard],
    loadChildren: () => import('./features/board/board.module').then((m) => m.BoardModule),
  },
  {
    path: 'home',
    canActivate: [HasRolesGuard],
    loadChildren: () => import('./features/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'application',
    canActivate: [HasRolesGuard],
    loadChildren: () => import('./features/application/application.module').then((m) => m.ApplicationModule),
  },
  {
    path: 'meeting',
    canActivate: [HasRolesGuard],
    loadChildren: () => import('./features/meeting/meeting.module').then((m) => m.MeetingModule),
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'authorized',
    component: AuthorizationComponent,
  },
  {
    path: 'provision',
    component: ProvisionComponent,
    canActivate: [AuthGuard],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
