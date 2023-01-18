import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ChangeApplicationTypeDialogComponent } from './change-application-type-dialog/change-application-type-dialog.component';
import { EditApplicationComponent } from './edit-application.component';
import { OwnerEntryComponent } from './parcel-details/owner-entry/owner-entry.component';
import { ParcelDetailsComponent } from './parcel-details/parcel-details.component';
import { ParcelEntryComponent } from './parcel-details/parcel-entry/parcel-entry.component';

const routes: Routes = [
  {
    path: '',
    component: EditApplicationComponent,
  },
];

@NgModule({
  declarations: [
    ParcelDetailsComponent,
    OwnerEntryComponent,
    ParcelEntryComponent,
    ChangeApplicationTypeDialogComponent,
    EditApplicationComponent,
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class EditApplicationModule {}
