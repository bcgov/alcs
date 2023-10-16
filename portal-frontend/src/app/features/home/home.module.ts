import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CreateSubmissionDialogComponent } from '../create-submission-dialog/create-submission-dialog.component';
import { InboxTableComponent } from './inbox/inbox-table/inbox-table.component';
import { HomeComponent } from './home.component';
import { InboxListComponent } from './inbox/inbox-list/inbox-list.component';
import { InboxComponent } from './inbox/inbox.component';

const routes: Routes = [
  {
    path: '',
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
  imports: [SharedModule, RouterModule.forChild(routes), MatPaginatorModule],
  providers: [],
})
export class HomeModule {}
