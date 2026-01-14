import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { Route, RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ComplianceAndEnforcementComponent } from './compliance-and-enforcement.component';
import { ComplaintReferralComponent } from './details/complaint-referral/complaint-referral.component';
import { ComplaintReferralOverviewComponent } from './details/complaint-referral/overview/overview.component';
import { AddSubmitterDialogComponent } from './details/complaint-referral/submitters/add-submitter-dialog/add-submitter-dialog.component';
import { ComplaintReferralSubmittersComponent } from './details/complaint-referral/submitters/submitters.component';
import { DetailsHeaderComponent } from './details/header/details-header.component';
import { DetailsOverviewComponent } from './details/overview/details-overview.component';
import { PropertyMapsComponent } from './details/property-maps/property-maps.component';
import { ResponsiblePartiesDetailsComponent } from './details/responsible-parties/responsible-parties.component';
import { ComplianceAndEnforcementDocumentsComponent } from './documents/documents.component';
import { DraftComponent } from './draft/draft.component';
import { OverviewComponent } from './overview/overview.component';
import { PropertyComponent } from './property/property.component';
import { ResponsiblePartiesComponent } from './responsible-parties/responsible-parties.component';
import { SubmitterComponent } from './submitter/submitter.component';
import { ComplianceAndEnforcementAssignDialogComponent } from './details/header/assign-dialog/assign-dialog.component';
import { ComplianceAndEnforcementChronologyComponent } from './details/chronology/chronology.component';
import { ComplianceAndEnforcementChronologyEntryComponent } from './details/chronology/entry/entry.component';
import { ComplianceAndEnforcementChronologyEntryDocumentsComponent } from './details/chronology/entry/documents/documents.component';

export const detailsRoutes: (Route & { icon?: string; menuTitle?: string })[] = [
  {
    path: '',
    component: DetailsOverviewComponent,
    icon: 'summarize',
    menuTitle: 'Overview',
  },
  {
    path: 'complaint-referral',
    icon: 'edit_note',
    menuTitle: 'Complaint / Referral',
    children: [
      {
        path: '',
        component: ComplaintReferralComponent,
        data: { editing: null },
      },
      {
        path: 'overview/edit',
        component: ComplaintReferralComponent,
        data: { editing: 'overview' },
      },
      {
        path: 'submitters/edit',
        component: ComplaintReferralComponent,
        data: { editing: 'submitters' },
      },
    ],
  },
  {
    path: 'responsible-parties',
    icon: 'people',
    menuTitle: 'Responsible Parties',
    children: [
      {
        path: '',
        component: ResponsiblePartiesDetailsComponent,
        data: { editing: null },
      },
      {
        path: 'edit',
        component: ResponsiblePartiesDetailsComponent,
        data: { editing: 'parties' },
      },
    ],
  },
  {
    path: 'property-maps',
    icon: 'location_on',
    menuTitle: 'Property & Maps',
    children: [
      {
        path: '',
        component: PropertyMapsComponent,
        data: { editing: null },
      },
      {
        path: 'edit',
        component: PropertyMapsComponent,
        data: { editing: 'property' },
      },
    ],
  },
  {
    path: 'chronology',
    icon: 'view_timeline',
    menuTitle: 'Chronology',
    component: ComplianceAndEnforcementChronologyComponent,
    data: { editing: null },
  },
];

const routes: Routes = [
  {
    path: ':fileNumber',
    component: ComplianceAndEnforcementComponent,
    children: detailsRoutes,
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
    ComplaintReferralComponent,
    ComplaintReferralOverviewComponent,
    ComplaintReferralSubmittersComponent,
    AddSubmitterDialogComponent,
    PropertyMapsComponent,
    ResponsiblePartiesDetailsComponent,
    ComplianceAndEnforcementAssignDialogComponent,
    ComplianceAndEnforcementChronologyComponent,
    ComplianceAndEnforcementChronologyEntryComponent,
    ComplianceAndEnforcementChronologyEntryDocumentsComponent,
  ],
  imports: [SharedModule.forRoot(), RouterModule.forChild(routes), MatMomentDateModule, CommonModule, SharedModule],
})
export class ComplianceAndEnforcementModule {}
