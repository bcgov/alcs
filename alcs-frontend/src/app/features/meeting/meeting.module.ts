import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MeetingOverviewComponent } from './meeting-overview/meeting-overview.component';
import { MeetingComponent } from './meeting.component';

const routes: Routes = [
  {
    path: '',
    component: MeetingComponent,
  },
];

@NgModule({
  declarations: [MeetingOverviewComponent, MeetingComponent],
  imports: [CommonModule, SharedModule.forRoot(), RouterModule.forChild(routes), MatExpansionModule],
})
export class MeetingModule {}
