import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AdminComponent, childRoutes } from './admin.component';
import { BoardManagementDialogComponent } from './board-management/board-management-dialog/board-management-dialog.component';
import { BoardManagementComponent } from './board-management/board-management.component';
import { CardStatusDialogComponent } from './card-status/card-status-dialog/card-status-dialog.component';
import { CardStatusComponent } from './card-status/card-status.component';
import { CeoCriterionDialogComponent } from './ceo-criterion/ceo-criterion-dialog/ceo-criterion-dialog.component';
import { CeoCriterionComponent } from './ceo-criterion/ceo-criterion.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { MaintenanceBannerConfirmationDialogComponent } from './configuration/maintenance-banner-confirmation-dialog/maintenance-banner-confirmation-dialog.component';
import { DecisionConditionTypesDialogComponent } from './decision-condition-types/decision-condition-types-dialog/decision-condition-types-dialog.component';
import { DecisionConditionTypesComponent } from './decision-condition-types/decision-condition-types.component';
import { DecisionMakerDialogComponent } from './decision-maker/decision-maker-dialog/decision-maker-dialog.component';
import { DecisionMakerComponent } from './decision-maker/decision-maker.component';
import { HolidayDialogComponent } from './holiday/holiday-dialog/holiday-dialog.component';
import { HolidayComponent } from './holiday/holiday.component';
import { LocalGovernmentDialogComponent } from './local-government/dialog/local-government-dialog.component';
import { LocalGovernmentComponent } from './local-government/local-government.component';
import { NoiSubtypeDialogComponent } from './noi-subtype/noi-subtype-dialog/noi-subtype-dialog.component';
import { NoiSubtypeComponent } from './noi-subtype/noi-subtype.component';
import { UnarchiveComponent } from './unarchive/unarchive.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: childRoutes,
  },
];

@NgModule({
  declarations: [
    AdminComponent,
    HolidayComponent,
    HolidayDialogComponent,
    LocalGovernmentComponent,
    LocalGovernmentDialogComponent,
    CeoCriterionComponent,
    CeoCriterionDialogComponent,
    NoiSubtypeComponent,
    NoiSubtypeDialogComponent,
    UnarchiveComponent,
    DecisionMakerComponent,
    DecisionMakerDialogComponent,
    DecisionConditionTypesComponent,
    DecisionConditionTypesDialogComponent,
    CardStatusComponent,
    CardStatusDialogComponent,
    BoardManagementComponent,
    BoardManagementDialogComponent,
    ConfigurationComponent,
    MaintenanceBannerConfirmationDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule.forRoot(),
    RouterModule.forChild(routes),
    MatPaginatorModule,
    DragDropModule,
    MatChipsModule,
  ],
})
export class AdminModule {}
