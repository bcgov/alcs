import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PublicComponent } from './public.component';

const routes: Routes = [
  {
    path: '',
    component: PublicComponent,
  },
];

@NgModule({
  declarations: [PublicComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class PublicModule {}
