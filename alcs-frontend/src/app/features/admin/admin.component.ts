import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StatHolidayComponent } from './stat-holiday/stat-holiday.component';

export const childRoutes = [
  {
    path: '',
    menuTitle: 'Stat Holiday',
    icon: 'calendar_month',
    component: StatHolidayComponent,
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
