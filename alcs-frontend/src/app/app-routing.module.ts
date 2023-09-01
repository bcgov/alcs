import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthorizationComponent } from './features/authorization/authorization.component';
import { NotFoundComponent } from './features/errors/not-found/not-found.component';
import { LoginComponent } from './features/login/login.component';
import { ProvisionComponent } from './features/provision/provision.component';
import { AuthGuard } from './services/authentication/auth.guard';
import { ALL_ROLES, ROLES } from './services/authentication/authentication.service';
import { HasRolesGuard } from './services/authentication/hasRoles.guard';

export const ROLES_ALLOWED_APPLICATIONS = [ROLES.ADMIN, ROLES.LUP, ROLES.APP_SPECIALIST, ROLES.GIS, ROLES.SOIL_OFFICER];
export const ROLES_ALLOWED_BOARDS = ROLES_ALLOWED_APPLICATIONS;

const routes: Routes = [
  {
    path: 'board',
    canActivate: [HasRolesGuard],
    data: {
      roles: ROLES_ALLOWED_BOARDS,
    },
    loadChildren: () => import('./features/board/board.module').then((m) => m.BoardModule),
  },
  {
    path: 'home',
    canActivate: [HasRolesGuard],
    data: {
      roles: ALL_ROLES,
    },
    loadChildren: () => import('./features/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'application',
    canActivate: [HasRolesGuard],
    data: {
      roles: ROLES_ALLOWED_APPLICATIONS,
    },
    loadChildren: () => import('./features/application/application.module').then((m) => m.ApplicationModule),
  },
  {
    path: 'notice-of-intent',
    canActivate: [HasRolesGuard],
    data: {
      roles: ROLES_ALLOWED_APPLICATIONS,
    },
    loadChildren: () =>
      import('./features/notice-of-intent/notice-of-intent.module').then((m) => m.NoticeOfIntentModule),
  },
  {
    path: 'schedule',
    canActivate: [HasRolesGuard],
    data: {
      roles: [ROLES.ADMIN, ROLES.LUP, ROLES.APP_SPECIALIST, ROLES.GIS],
    },
    loadChildren: () => import('./features/meeting/meeting.module').then((m) => m.MeetingModule),
  },
  {
    path: 'commissioner',
    canActivate: [HasRolesGuard],
    data: {
      roles: [ROLES.COMMISSIONER],
    },
    loadChildren: () => import('./features/commissioner/commissioner.module').then((m) => m.CommissionerModule),
  },
  {
    path: 'admin',
    canActivate: [HasRolesGuard],
    data: {
      roles: [ROLES.ADMIN],
    },
    loadChildren: () => import('./features/admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'search',
    canActivate: [HasRolesGuard],
    data: {
      roles: ALL_ROLES,
    },
    loadChildren: () => import('./features/search/search.module').then((m) => m.SearchModule),
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
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
