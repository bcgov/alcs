import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDto } from '../../../services/application/application.dto';

@Component({
  selector: 'app-review-and-submit',
  templateUrl: './review-and-submit.component.html',
  styleUrls: ['./review-and-submit.component.scss'],
})
export class ReviewAndSubmitComponent {
  @Input() $application!: BehaviorSubject<ApplicationDto | undefined>;
}
