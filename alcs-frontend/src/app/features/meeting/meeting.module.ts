import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MeetingComponent } from './meeting.component';

const routes: Routes = [
  {
    path: '',
    component: MeetingComponent,
  },
];

@NgModule({
  declarations: [MeetingComponent],
  imports: [CommonModule, SharedModule.forRoot(), RouterModule.forChild(routes)],
  exports: [],
})
export class MeetingModule {}
