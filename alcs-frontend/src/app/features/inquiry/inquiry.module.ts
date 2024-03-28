import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InquiryDetailService } from '../../services/inquiry/inquiry-detail.service';
import { SharedModule } from '../../shared/shared.module';
import { DetailsComponent } from './detail/details.component';
import { DocumentUploadDialogComponent } from './documents/document-upload-dialog/document-upload-dialog.component';
import { DocumentsComponent } from './documents/documents.component';
import { HeaderComponent } from './header/header.component';
import { childRoutes, InquiryComponent } from './inquiry.component';
import { OverviewComponent } from './overview/overview.component';
import { ParcelsComponent } from './parcel/parcels.component';

const routes: Routes = [
  {
    path: ':fileNumber',
    component: InquiryComponent,
    children: childRoutes,
  },
];

@NgModule({
  providers: [InquiryDetailService],
  declarations: [
    InquiryComponent,
    OverviewComponent,
    HeaderComponent,
    DetailsComponent,
    ParcelsComponent,
    DocumentsComponent,
    DocumentUploadDialogComponent,
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes), CdkDropList, CdkDrag],
  exports: [HeaderComponent],
})
export class InquiryModule {}
