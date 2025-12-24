import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DOCUMENT_TYPE } from '../../../shared/document/document.dto';
import { environment } from '../../../../environments/environment';
import { CommissionerApplicationDto } from '../../../services/commissioner/commissioner.dto';
import { CommissionerService } from '../../../services/commissioner/commissioner.service';
import { FileTagService } from '../../../services/common/file-tag.service';
import { ApplicationTagService } from '../../../services/application/application-tag/application-tag.service';
import { ApplicationSubmissionStatusService } from '../../../services/application/application-submission-status/application-submission-status.service';

@Component({
    selector: 'app-commissioner-application',
    templateUrl: './commissioner-application.component.html',
    styleUrls: ['./commissioner-application.component.scss'],
    providers: [{ provide: FileTagService, useClass: ApplicationTagService }],
    standalone: false
})
export class CommissionerApplicationComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();
  DOCUMENT_TYPE = DOCUMENT_TYPE;
  application: CommissionerApplicationDto | undefined;
  fileNumber: string | undefined;

  constructor(
    private commissionerService: CommissionerService,
    public applicationStatusService: ApplicationSubmissionStatusService,
    private route: ActivatedRoute,
    private titleService: Title,
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy)).subscribe(async (routeParams) => {
      const { fileNumber } = routeParams;
      this.fileNumber = fileNumber;
      this.application = await this.commissionerService.fetchApplication(fileNumber);
      this.titleService.setTitle(
        `${environment.siteName} | ${this.application.fileNumber} (${this.application.applicant})`,
      );
    });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
