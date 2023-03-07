import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CeoCriterionComponent } from './ceo-criterion/ceo-criterion.component';
import { HolidayComponent } from './holiday/holiday.component';
import { LocalGovernmentComponent } from './local-government/local-government.component';
import { UnarchiveComponent } from './unarchive/unarchive.component';

export const childRoutes = [
  {
    path: '',
    menuTitle: 'Stat Holidays',
    icon: 'calendar_month',
    component: HolidayComponent,
  },
  {
    path: 'lg',
    menuTitle: 'L/FNG Governments',
    icon: 'gavel',
    component: LocalGovernmentComponent,
  },
  {
    path: 'ceo',
    menuTitle: 'CEO Criterion',
    icon: 'psychology',
    component: CeoCriterionComponent,
  },
  {
    path: 'unarchive',
    menuTitle: 'Unarchive Cards',
    icon: 'unarchive',
    component: UnarchiveComponent,
  },
];

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {
  childRoutes = childRoutes;

  constructor(private route: ActivatedRoute) {}
}
