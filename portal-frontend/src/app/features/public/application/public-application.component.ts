import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../services/application-document/application-document.dto';
import { ApplicationParcelDto } from '../../../services/application-parcel/application-parcel.dto';
import { SUBMISSION_STATUS } from '../../../services/application-submission/application-submission.dto';
import { PublicApplicationSubmissionDto } from '../../../services/public/public.dto';
import { PublicService } from '../../../services/public/public.service';

@Component({
  selector: 'app-public-application',
  templateUrl: './public-application.component.html',
  styleUrls: ['./public-application.component.scss'],
})
export class PublicApplicationComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  SUBMISSION_STATUS = SUBMISSION_STATUS;

  submission: PublicApplicationSubmissionDto | undefined;
  documents: ApplicationDocumentDto[] = [];
  parcels: ApplicationParcelDto[] = [];

  constructor(private publicService: PublicService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.$destroy)).subscribe((routeParams) => {
      const fileId = routeParams.get('fileId');
      if (fileId) {
        this.loadApplication(fileId);
      }
    });
  }

  private async loadApplication(fileId: string) {
    const res = await this.publicService.getApplication(fileId);
    if (res) {
      const { submission, documents, parcels } = res;

      this.submission = submission;
      this.documents = documents;
      this.parcels = parcels;
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
