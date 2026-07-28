import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { Route, RouterModule, Routes } from '@angular/router';
import { ROLES } from '../../services/authentication/authentication.service';
import { HasRolesGuard } from '../../services/authentication/hasRoles.guard';
import { SharedModule } from '../../shared/shared.module';
import { DecisionModule } from '../application/decision/decision.module';
import { ComplianceAndEnforcementComponent } from './compliance-and-enforcement.component';
import { ComplianceAndEnforcementChronologyComponent } from './details/chronology/chronology.component';
import { ComplianceAndEnforcementChronologyEntryDocumentsComponent } from './details/chronology/entry/documents/documents.component';
import { ComplianceAndEnforcementChronologyEntryComponent } from './details/chronology/entry/entry.component';
import { ComplianceAndEnforcementInspectionReportsComponent } from './details/chronology/entry/inspection/inspection-reports/inspection-reports.component';
import { ComplianceAndEnforcementChronologyEntryInspectionComponent } from './details/chronology/entry/inspection/inspection.component';
import { ComplianceAndEnforcementNoticeDocumentsComponent } from './details/chronology/entry/notice/documents/documents.component';
import { ComplianceAndEnforcementNoticeComponent } from './details/chronology/entry/notice/notice.component';
import { ComplianceAndEnforcementOrderDocumentsComponent } from './details/chronology/entry/order/documents/documents.component';
import { ComplianceAndEnforcementOrderComponent } from './details/chronology/entry/order/order.component';
import { ComplaintReferralComponent } from './details/complaint-referral/complaint-referral.component';
import { ComplaintReferralOverviewComponent } from './details/complaint-referral/overview/overview.component';
import { AddSubmitterDialogComponent } from './details/complaint-referral/submitters/add-submitter-dialog/add-submitter-dialog.component';
import { ComplaintReferralSubmittersComponent } from './details/complaint-referral/submitters/submitters.component';
import { ComplianceAndEnforcementAssignDialogComponent } from './details/header/assign-dialog/assign-dialog.component';
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
    canActivate: [HasRolesGuard],
    data: {
      roles: ROLES.C_AND_E,
    },
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
    canActivate: [HasRolesGuard],
    data: {
      roles: ROLES.C_AND_E,
    },
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
    canActivate: [HasRolesGuard],
    data: {
      roles: ROLES.C_AND_E,
    },
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
    canActivate: [HasRolesGuard],
    data: {
      roles: ROLES.C_AND_E,
    },
    children: [
      {
        path: '',
        component: ComplianceAndEnforcementChronologyComponent,
        data: { editing: null },
      },
      {
        path: 'entry/:entryUuid/inspection/:inspectionUuid/edit',
        component: ComplianceAndEnforcementChronologyEntryInspectionComponent,
      },
      {
        path: 'entry/:entryUuid/notice/:noticeUuid/edit',
        component: ComplianceAndEnforcementNoticeComponent,
      },
      {
        path: 'entry/:entryUuid/order/:orderUuid/edit',
        component: ComplianceAndEnforcementOrderComponent,
      },
    ],
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
    canActivate: [HasRolesGuard],
    data: {
      roles: ROLES.C_AND_E,
    },
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
    ComplianceAndEnforcementChronologyEntryInspectionComponent,
    ComplianceAndEnforcementInspectionReportsComponent,
    ComplianceAndEnforcementNoticeComponent,
    ComplianceAndEnforcementNoticeDocumentsComponent,
    ComplianceAndEnforcementOrderComponent,
    ComplianceAndEnforcementOrderDocumentsComponent,
  ],
  imports: [
    SharedModule.forRoot(),
    RouterModule.forChild(routes),
    MatMomentDateModule,
    CommonModule,
    SharedModule,
    DecisionModule,
  ],
})
export class ComplianceAndEnforcementModule {}
