import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InquiryDetailService } from '../../services/inquiry/inquiry-detail.service';
import { SharedModule } from '../../shared/shared.module';
import { DetailsComponent } from './detail/details.component';
import { HeaderComponent } from './header/header.component';
import { childRoutes, InquiryComponent } from './inquiry.component';
import { OverviewComponent } from './overview/overview.component';

const routes: Routes = [
  {
    path: ':fileNumber',
    component: InquiryComponent,
    children: childRoutes,
  },
];

@NgModule({
  providers: [InquiryDetailService],
  declarations: [InquiryComponent, OverviewComponent, HeaderComponent, DetailsComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes), CdkDropList, CdkDrag],
  exports: [HeaderComponent],
})
export class InquiryModule {}
