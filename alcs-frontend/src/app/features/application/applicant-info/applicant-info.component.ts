import { Component, OnInit } from '@angular/core';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';

@Component({
  selector: 'app-applicant-info',
  templateUrl: './applicant-info.component.html',
  styleUrls: ['./applicant-info.component.scss'],
})
export class ApplicantInfoComponent implements OnInit {
  fileNumber: string = '';
  applicant: string = '';

  constructor(private applicationDetailService: ApplicationDetailService) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.subscribe((application) => {
      if (application) {
        this.fileNumber = application.fileNumber;
        this.applicant = application.applicant;
      }
    });
  }
}
