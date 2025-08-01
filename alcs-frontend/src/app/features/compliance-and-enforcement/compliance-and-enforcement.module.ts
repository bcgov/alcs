import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { OverviewComponent } from './overview/overview.component';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { DraftComponent } from './draft/draft.component';
import { SubmitterComponent } from './submitter/submitter.component';

const routes: Routes = [
  {
    path: ':fileNumber/draft',
    component: DraftComponent,
  },
];

@NgModule({
  declarations: [DraftComponent, OverviewComponent, SubmitterComponent],
  imports: [SharedModule.forRoot(), RouterModule.forChild(routes), MatMomentDateModule],
})
export class ComplianceAndEnforcementModule {}
