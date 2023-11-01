import { NgIf } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { SharedModule } from '../../../shared/shared.module';
import { ConditionComponent } from './conditions/condition/condition.component';
import { ConditionsComponent } from './conditions/conditions.component';
import { DecisionV1DialogComponent } from './decision-v1/decision-v1-dialog/decision-v1-dialog.component';
import { DecisionV1Component } from './decision-v1/decision-v1.component';
import { InclExclComponent } from './decision-v2/decision-component/incl-excl/incl-excl.component';
import { NaruComponent } from './decision-v2/decision-component/naru/naru.component';
import { NfupComponent } from './decision-v2/decision-component/nfup/nfup.component';
import { PfrsComponent } from './decision-v2/decision-component/pfrs/pfrs.component';
import { PofoComponent } from './decision-v2/decision-component/pofo/pofo.component';
import { RosoComponent } from './decision-v2/decision-component/roso/roso.component';
import { SubdComponent } from './decision-v2/decision-component/subd/subd.component';
import { ExpiryDateComponent } from './decision-v2/decision-component/expiry-date/expiry-date.component';
import { DecisionDocumentsComponent } from './decision-v2/decision-documents/decision-documents.component';
import { DecisionComponentComponent } from './decision-v2/decision-input/decision-components/decision-component/decision-component.component';
import { InclExclInputComponent } from './decision-v2/decision-input/decision-components/decision-component/incl-excl-input/incl-excl-input.component';
import { NaruInputComponent } from './decision-v2/decision-input/decision-components/decision-component/naru-input/naru-input.component';
import { NfuInputComponent } from './decision-v2/decision-input/decision-components/decision-component/nfu-input/nfu-input.component';
import { PfrsInputComponent } from './decision-v2/decision-input/decision-components/decision-component/pfrs-input/pfrs-input.component';
import { PofoInputComponent } from './decision-v2/decision-input/decision-components/decision-component/pofo-input/pofo-input.component';
import { RosoInputComponent } from './decision-v2/decision-input/decision-components/decision-component/roso-input/roso-input.component';
import { SubdInputComponent } from './decision-v2/decision-input/decision-components/decision-component/subd-input/subd-input.component';
import { ExpiryDateInputComponent } from './decision-v2/decision-input/decision-components/decision-component/expiry-date-input/expiry-date-input.component';
import { DecisionComponentsComponent } from './decision-v2/decision-input/decision-components/decision-components.component';
import { DecisionConditionComponent } from './decision-v2/decision-input/decision-conditions/decision-condition/decision-condition.component';
import { DecisionConditionsComponent } from './decision-v2/decision-input/decision-conditions/decision-conditions.component';
import { DecisionDocumentUploadDialogComponent } from './decision-v2/decision-input/decision-file-upload-dialog/decision-document-upload-dialog.component';
import { DecisionInputV2Component } from './decision-v2/decision-input/decision-input-v2.component';
import { DecisionV2Component } from './decision-v2/decision-v2.component';
import { ReleaseDialogComponent } from './decision-v2/release-dialog/release-dialog.component';
import { RevertToDraftDialogComponent } from './decision-v2/revert-to-draft-dialog/revert-to-draft-dialog.component';
import { DecisionComponent } from './decision.component';
import { BasicComponent } from './decision-v2/decision-component/basic/basic.component';

export const decisionChildRoutes = [
  {
    path: '',
    menuTitle: 'Decision',
    component: DecisionComponent,
    portalOnly: false,
  },
  {
    path: 'create',
    menuTitle: 'Decision',
    component: DecisionInputV2Component,
    portalOnly: false,
  },
  {
    path: 'draft/:uuid/edit/:index',
    menuTitle: 'Decision',
    component: DecisionInputV2Component,
    portalOnly: false,
  },
  {
    path: 'conditions/:uuid',
    menuTitle: 'Conditions',
    component: ConditionsComponent,
    portalOnly: false,
  },
];

@NgModule({
  declarations: [
    DecisionComponent,
    DecisionV2Component,
    DecisionInputV2Component,
    DecisionV1Component,
    DecisionV1DialogComponent,
    ReleaseDialogComponent,
    DecisionComponentComponent,
    DecisionComponentsComponent,
    DecisionDocumentUploadDialogComponent,
    RevertToDraftDialogComponent,
    DecisionDocumentsComponent,
    NfuInputComponent,
    DecisionConditionComponent,
    DecisionConditionsComponent,
    ExpiryDateInputComponent,
    NfupComponent,
    ExpiryDateComponent,
    PofoInputComponent,
    PofoComponent,
    RosoComponent,
    RosoInputComponent,
    PfrsInputComponent,
    SubdInputComponent,
    PfrsComponent,
    NaruComponent,
    SubdComponent,
    InclExclComponent,
    InclExclInputComponent,
    NaruInputComponent,
    ConditionsComponent,
    ConditionComponent,
    BasicComponent,
  ],
  imports: [
    SharedModule.forRoot(),
    RouterModule.forChild(decisionChildRoutes),
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatTableModule,
    NgIf,
    NgxMaskDirective,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
  ],
})
export class DecisionModule {}
