import { Component, Input } from '@angular/core';

export type ApplicationSubmissionStatusPill = {
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  label?: string;
  shortLabel?: string;
};

@Component({
  selector: 'app-application-submission-status-type-pill',
  templateUrl: './application-submission-status-type-pill.component.html',
  styleUrls: ['./application-submission-status-type-pill.component.scss'],
})
export class ApplicationSubmissionStatusTypePillComponent {
  @Input() type!: ApplicationSubmissionStatusPill;

  constructor() {}
}
