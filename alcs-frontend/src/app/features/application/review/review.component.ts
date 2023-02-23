import { Component, OnInit } from '@angular/core';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { DOCUMENT_TYPE } from '../../../services/application/application-document/application-document.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
})
export class ReviewComponent implements OnInit {
  fileNumber: string = '';
  notificationSentDate: number | undefined = undefined;
  DOCUMENT_TYPE = DOCUMENT_TYPE;

  constructor(private applicationDetailService: ApplicationDetailService) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.subscribe((application) => {
      if (application) {
        this.fileNumber = application.fileNumber;
        this.notificationSentDate = application.notificationSentDate;
      }
    });
  }

  onSaveNotificationDate(newDate: number) {
    this.applicationDetailService.updateApplication(this.fileNumber, {
      notificationSentDate: newDate,
    });
  }
}
