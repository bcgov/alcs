import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { OverviewComponent } from './overview/overview.component';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { DraftComponent } from './draft/draft.component';
import { SubmitterComponent } from './submitter/submitter.component';
import { PropertyComponent } from './property/property.component';
import { ComplianceAndEnforcementDocumentsComponent } from './documents/documents.component';
import { ResponsiblePartiesComponent } from './responsible-parties/responsible-parties.component';
import { DetailsOverviewComponent } from './details/overview/details-overview.component';
import { ComplianceAndEnforcementComponent } from './compliance-and-enforcement.component';
import { CommonModule } from '@angular/common';
import { DetailsHeaderComponent } from './details/header/details-header.component';

export const detailsRoutes: (Route & { icon?: string; menuTitle?: string })[] = [
  {
    path: '',
    component: DetailsOverviewComponent,
    icon: 'summarize',
    menuTitle: 'Overview',
  },
];

const routes: Routes = [
  {
    path: ':fileNumber',
    component: ComplianceAndEnforcementComponent,
    children: detailsRoutes.concat([]),
  },
  {
    path: ':fileNumber/draft',
    component: DraftComponent,
  },
];

@NgModule({
  declarations: [
    DraftComponent,
    OverviewComponent,
    SubmitterComponent,
    PropertyComponent,
    ComplianceAndEnforcementDocumentsComponent,
    ResponsiblePartiesComponent,
    ComplianceAndEnforcementComponent,
    DetailsHeaderComponent,
    DetailsOverviewComponent,
  ],
  imports: [SharedModule.forRoot(), RouterModule.forChild(routes), MatMomentDateModule, CommonModule, SharedModule],
})
export class ComplianceAndEnforcementModule {}
