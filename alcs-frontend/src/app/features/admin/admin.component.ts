import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardStatusComponent } from './card-status/card-status.component';
import { CeoCriterionComponent } from './ceo-criterion/ceo-criterion.component';
import { DecisionConditionTypesComponent } from './decision-condition-types/decision-condition-types.component';
import { DecisionMakerComponent } from './decision-maker/decision-maker.component';
import { HolidayComponent } from './holiday/holiday.component';
import { LocalGovernmentComponent } from './local-government/local-government.component';
import { NoiSubtypeComponent } from './noi-subtype/noi-subtype.component';
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
    menuTitle: 'CEO Criteria',
    icon: 'psychology',
    component: CeoCriterionComponent,
  },
  {
    path: 'dm',
    menuTitle: 'Decision Makers',
    icon: 'coffee_maker',
    component: DecisionMakerComponent,
  },
  {
    path: 'dct',
    menuTitle: 'Decision Condition Types',
    icon: 'hvac',
    component: DecisionConditionTypesComponent,
  },
  {
    path: 'noi',
    menuTitle: 'NOI Subtypes',
    icon: 'style',
    component: NoiSubtypeComponent,
  },
  {
    path: 'unarchive',
    menuTitle: 'Unarchive Cards',
    icon: 'unarchive',
    component: UnarchiveComponent,
  },
  {
    path: 'card-status',
    menuTitle: 'Columns',
    icon: 'view_week',
    component: CardStatusComponent,
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
