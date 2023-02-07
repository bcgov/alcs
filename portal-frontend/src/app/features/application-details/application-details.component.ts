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
  @Input() isValidate: boolean = true;
  isParcelDetailsValid = false;

  parcelValidation(isParcelDetailsValid: boolean) {
    this.isParcelDetailsValid = isParcelDetailsValid;
    console.log('ApplicationDetailsComponent', this.isParcelDetailsValid);
  }

  private runValidation() {
    console.log('ApplicationDetailsComponent runValidation');
  }
}
