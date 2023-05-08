import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule } from '@angular/router';
import { MtxNativeDatetimeModule } from '@ng-matero/extensions/core';
import { MtxDatetimepickerModule } from '@ng-matero/extensions/datetimepicker';
import { InlineDatepickerComponent } from '../../../shared/inline-datepicker/inline-datepicker.component';
import { SharedModule } from '../../../shared/shared.module';
import { DecisionV1DialogComponent } from './decision-v1/decision-v1-dialog/decision-v1-dialog.component';
import { DecisionV1Component } from './decision-v1/decision-v1.component';
import { DecisionInputV2Component } from './decision-v2/decision-input/decision-input-v2.component';
import { DecisionV2DialogComponent } from './decision-v2/decision-v2-dialog/decision-v2-dialog.component';
import { DecisionV2Component } from './decision-v2/decision-v2.component';
import { DecisionComponent } from './decision.component';
import { ReleaseDialogComponent } from './decision-v2/release-dialog/release-dialog.component';

export const decisionChildRoutes = [
  {
    path: '',
    menuTitle: 'Decision',
    component: DecisionComponent,
    requiresAuthorization: true,
  },
  {
    path: 'create',
    menuTitle: 'Decision',
    component: DecisionInputV2Component,
    requiresAuthorization: true,
  },
  {
    path: 'draft/:uuid/edit',
    menuTitle: 'Decision',
    component: DecisionInputV2Component,
    requiresAuthorization: true,
  },
];

@NgModule({
  declarations: [
    DecisionComponent,
    DecisionV2Component,
    DecisionV2DialogComponent,
    DecisionInputV2Component,
    DecisionV1Component,
    DecisionV1DialogComponent,
    InlineDatepickerComponent,
    ReleaseDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule.forRoot(),
    RouterModule.forChild(decisionChildRoutes),
    MtxDatetimepickerModule,
    MtxNativeDatetimeModule,
    MatCheckboxModule,
  ],
  exports: [InlineDatepickerComponent],
})
export class DecisionModule {}
