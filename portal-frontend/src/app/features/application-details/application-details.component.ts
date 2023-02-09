import { Component, Input } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { PARCEL_TYPE } from '../../services/application-parcel/application-parcel.dto';
import { ApplicationDetailedDto, ApplicationDto } from '../../services/application/application.dto';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.scss'],
})
export class ApplicationDetailsComponent {
  $destroy = new Subject<void>();

  @Input() $application!: BehaviorSubject<ApplicationDetailedDto | undefined>;
  @Input() isValidate: boolean = true;
  isParcelDetailsValid = false;
  parcelType = PARCEL_TYPE;

  parcelValidation(isParcelDetailsValid: boolean) {
    this.isParcelDetailsValid = isParcelDetailsValid;
    console.log('ApplicationDetailsComponent', this.isParcelDetailsValid);
  }

  private runValidation() {
    console.log('ApplicationDetailsComponent runValidation');
  }
}
