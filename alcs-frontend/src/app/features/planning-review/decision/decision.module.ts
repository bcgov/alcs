import { NgModule } from '@angular/core';
import { MatOptionModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { DecisionDocumentsComponent } from './decision-documents/decision-documents.component';
import { DecisionInputComponent } from './decision-input/decision-input.component';
import { DecisionComponent } from './decision.component';
import { ReleaseDialogComponent } from './release-dialog/release-dialog.component';
import { RevertToDraftDialogComponent } from './revert-to-draft-dialog/revert-to-draft-dialog.component';

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
    component: DecisionInputComponent,
    portalOnly: false,
  },
  {
    path: 'draft/:uuid/edit/:index',
    menuTitle: 'Decision',
    component: DecisionInputComponent,
    portalOnly: false,
  },
];

@NgModule({
  declarations: [
    DecisionComponent,
    DecisionComponent,
    DecisionInputComponent,
    DecisionDocumentsComponent,
    RevertToDraftDialogComponent,
    ReleaseDialogComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(decisionChildRoutes), MatTabsModule, MatOptionModule],
})
export class DecisionModule {}
