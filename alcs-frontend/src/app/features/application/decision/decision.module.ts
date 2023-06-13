import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { DecisionV1DialogComponent } from './decision-v1/decision-v1-dialog/decision-v1-dialog.component';
import { DecisionV1Component } from './decision-v1/decision-v1.component';
import { DecisionConditionComponent } from './decision-v2/decision-input/decision-conditions/decision-condition/decision-condition.component';
import { DecisionConditionsComponent } from './decision-v2/decision-input/decision-conditions/decision-conditions.component';
import { DecisionDocumentsComponent } from './decision-v2/decision-documents/decision-documents.component';
import { DecisionComponentComponent } from './decision-v2/decision-input/decision-components/decision-component/decision-component.component';
import { NfuInputComponent } from './decision-v2/decision-input/decision-components/decision-component/nfu-input/nfu-input.component';
import { DecisionComponentsComponent } from './decision-v2/decision-input/decision-components/decision-components.component';
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
    portalOnly: true,
  },
  {
    path: 'create',
    menuTitle: 'Decision',
    component: DecisionInputV2Component,
    portalOnly: true,
  },
  {
    path: 'draft/:uuid/edit',
    menuTitle: 'Decision',
    component: DecisionInputV2Component,
    portalOnly: true,
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
  ],
  imports: [SharedModule.forRoot(), RouterModule.forChild(decisionChildRoutes), MatTabsModule],
})
export class DecisionModule {}
