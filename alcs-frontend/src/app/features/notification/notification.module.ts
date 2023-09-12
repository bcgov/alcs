import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationDetailService } from '../../services/notification/notification-detail.service';
import { SharedModule } from '../../shared/shared.module';
import { ApplicantInfoComponent } from './applicant-info/applicant-info.component';
import { NotificationDetailsModule } from './applicant-info/notification-details/notification-details.module';
import { DocumentUploadDialogComponent } from './documents/document-upload-dialog/document-upload-dialog.component';
import { NotificationDocumentsComponent } from './documents/documents.component';
import { NotificationComponent, postSubmissionRoutes } from './notification.component';
import { OverviewComponent } from './overview/overview.component';
import { UncancelNotificationDialogComponent } from './overview/uncancel-notification-dialog/uncancel-notification-dialog.component';

const routes: Routes = [
  {
    path: ':fileNumber',
    component: NotificationComponent,
    children: postSubmissionRoutes,
  },
];

@NgModule({
  providers: [NotificationDetailService],
  declarations: [
    NotificationComponent,
    OverviewComponent,
    NotificationDocumentsComponent,
    DocumentUploadDialogComponent,
    ApplicantInfoComponent,
    UncancelNotificationDialogComponent,
  ],
  imports: [SharedModule.forRoot(), RouterModule.forChild(routes), NotificationDetailsModule],
})
export class NotificationModule {}
