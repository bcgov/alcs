import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-no-data',
    templateUrl: './no-data.component.html',
    styleUrls: ['./no-data.component.scss'],
    standalone: false
})
export class NoDataComponent {
  @Input() showRequired = false;
  @Input() text?: string | null;

  constructor() {}
}
