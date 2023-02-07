import { Component, Input } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ApplicationDto } from '../../services/application/application.dto';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.scss'],
})
export class ApplicationDetailsComponent {
  $destroy = new Subject<void>();

  @Input() $application!: BehaviorSubject<ApplicationDto | undefined>;
}
