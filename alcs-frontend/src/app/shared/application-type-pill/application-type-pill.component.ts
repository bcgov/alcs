import { Component, Input } from '@angular/core';

export type ApplicationPill = {
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  label?: string;
  shortLabel?: string;
};

@Component({
  selector: 'app-application-type-pill[type]',
  templateUrl: './application-type-pill.component.html',
  styleUrls: ['./application-type-pill.component.scss'],
})
export class ApplicationTypePillComponent {
  @Input() type!: ApplicationPill;
  @Input() useShortLabel = false;

  constructor() {}
}
