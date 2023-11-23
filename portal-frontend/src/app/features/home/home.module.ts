import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CreateSubmissionDialogComponent } from '../create-submission-dialog/create-submission-dialog.component';
import { InboxTableComponent } from './inbox/inbox-table/inbox-table.component';
import { HomeComponent } from './home.component';
import { InboxListComponent } from './inbox/inbox-list/inbox-list.component';
import { InboxComponent } from './inbox/inbox.component';

const routes: Routes = [
  { path: '', redirectTo: 'applications', pathMatch: 'full' },
  {
    path: ':submissionType',
    component: HomeComponent,
  },
];

@NgModule({
  declarations: [
    HomeComponent,
    InboxTableComponent,
    CreateSubmissionDialogComponent,
    InboxListComponent,
    InboxComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes), MatPaginatorModule, MatOptionModule],
  providers: [],
})
export class HomeModule {}
