import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CommissionerComponent } from './commissioner.component';

const routes: Routes = [
  {
    path: ':fileNumber',
    component: CommissionerComponent,
  },
];

@NgModule({
  declarations: [CommissionerComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class CommissionerModule {}
