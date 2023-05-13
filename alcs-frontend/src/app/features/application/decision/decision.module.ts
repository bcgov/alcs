import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { RouterModule } from '@angular/router';
import { MtxNativeDatetimeModule } from '@ng-matero/extensions/core';
import { MtxDatetimepickerModule } from '@ng-matero/extensions/datetimepicker';
import { InlineDatepickerComponent } from '../../../shared/inline-datepicker/inline-datepicker.component';
import { SharedModule } from '../../../shared/shared.module';
import { DecisionV1DialogComponent } from './decision-v1/decision-v1-dialog/decision-v1-dialog.component';
import { DecisionV1Component } from './decision-v1/decision-v1.component';
import { DecisionComponentComponent } from './decision-v2/decision-components/decision-component/decision-component.component';
import { NfuInputComponent } from './decision-v2/decision-components/decision-component/nfu-input/nfu-input.component';
import { DecisionComponentsComponent } from './decision-v2/decision-components/decision-components.component';
import { DecisionDocumentsComponent } from './decision-v2/decision-documents/decision-documents.component';
import { DecisionDocumentUploadDialogComponent } from './decision-v2/decision-input/decision-file-upload-dialog/decision-document-upload-dialog.component';
import { DecisionInputV2Component } from './decision-v2/decision-input/decision-input-v2.component';
import { DecisionV2Component } from './decision-v2/decision-v2.component';
import { ReleaseDialogComponent } from './decision-v2/release-dialog/release-dialog.component';
import { DecisionComponent } from './decision.component';

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
    DecisionInputV2Component,
    DecisionV1Component,
    DecisionV1DialogComponent,
    InlineDatepickerComponent,
    ReleaseDialogComponent,
    DecisionComponentComponent,
    DecisionComponentsComponent,
    DecisionDocumentUploadDialogComponent,
    DecisionDocumentsComponent,
    NfuInputComponent,
  ],
  imports: [
    CommonModule,
    SharedModule.forRoot(),
    RouterModule.forChild(decisionChildRoutes),
    MtxDatetimepickerModule,
    MtxNativeDatetimeModule,
    MatCheckboxModule,
    MatSortModule,
  ],
  exports: [InlineDatepickerComponent],
})
export class DecisionModule {}
