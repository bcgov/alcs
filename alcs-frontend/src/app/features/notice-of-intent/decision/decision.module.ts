import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { SharedModule } from '../../../shared/shared.module';
import { ConditionComponent } from './conditions/condition/condition.component';
import { ConditionsComponent } from './conditions/conditions.component';
import { DecisionDialogComponent } from './decision-dialog/decision-dialog.component';
import { DecisionV1Component } from './decision-v1/decision-v1.component';
import { BasicComponent } from './decision-v2/decision-component/basic/basic.component';
import { PfrsComponent } from './decision-v2/decision-component/pfrs/pfrs.component';
import { PofoComponent } from './decision-v2/decision-component/pofo/pofo.component';
import { RosoComponent } from './decision-v2/decision-component/roso/roso.component';
import { DecisionDocumentsComponent } from './decision-v2/decision-documents/decision-documents.component';
import { DecisionComponentComponent } from './decision-v2/decision-input/decision-components/decision-component/decision-component.component';
import { PfrsInputComponent } from './decision-v2/decision-input/decision-components/decision-component/pfrs-input/pfrs-input.component';
import { PofoInputComponent } from './decision-v2/decision-input/decision-components/decision-component/pofo-input/pofo-input.component';
import { RosoInputComponent } from './decision-v2/decision-input/decision-components/decision-component/roso-input/roso-input.component';
import { DecisionComponentsComponent } from './decision-v2/decision-input/decision-components/decision-components.component';
import { DecisionConditionComponent } from './decision-v2/decision-input/decision-conditions/decision-condition/decision-condition.component';
import { DecisionConditionsComponent } from './decision-v2/decision-input/decision-conditions/decision-conditions.component';
import { DecisionDocumentUploadDialogComponent } from './decision-v2/decision-input/decision-file-upload-dialog/decision-document-upload-dialog.component';
import { DecisionInputV2Component } from './decision-v2/decision-input/decision-input-v2.component';
import { DecisionV2Component } from './decision-v2/decision-v2.component';
import { ReleaseDialogComponent } from './decision-v2/release-dialog/release-dialog.component';
import { RevertToDraftDialogComponent } from './decision-v2/revert-to-draft-dialog/revert-to-draft-dialog.component';
import { DecisionComponent } from './decision.component';

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
    DecisionDialogComponent,
    ReleaseDialogComponent,
    DecisionComponentComponent,
    DecisionComponentsComponent,
    DecisionDocumentUploadDialogComponent,
    RevertToDraftDialogComponent,
    DecisionDocumentsComponent,
    DecisionConditionComponent,
    DecisionConditionsComponent,
    PofoInputComponent,
    PofoComponent,
    RosoComponent,
    RosoInputComponent,
    PfrsInputComponent,
    PfrsComponent,
    ConditionsComponent,
    ConditionComponent,
    BasicComponent,
  ],
  imports: [SharedModule.forRoot(), RouterModule.forChild(decisionChildRoutes), NgxMaskDirective],
})
export class DecisionModule {}
