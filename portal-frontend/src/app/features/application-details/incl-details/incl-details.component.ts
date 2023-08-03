import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationSubmissionDetailedDto } from '../../../services/application-submission/application-submission.dto';
import { ApplicationDocumentDto, DOCUMENT_TYPE } from '../../../services/application-document/application-document.dto';
import { AuthenticationService } from '../../../services/authentication/authentication.service';

@Component({
  selector: 'app-incl-details',
  templateUrl: './incl-details.component.html',
  styleUrls: ['./incl-details.component.scss'],
})
export class InclDetailsComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;
  @Input() updatedFields: string[] = [];

  governmentName = 'applying government';

  _applicationSubmission: ApplicationSubmissionDetailedDto | undefined;
  isGovernmentCreator = false;

  @Input() set applicationSubmission(applicationSubmission: ApplicationSubmissionDetailedDto | undefined) {
    if (applicationSubmission) {
      this._applicationSubmission = applicationSubmission;
    }
  }

  @Input() set applicationDocuments(documents: ApplicationDocumentDto[]) {
    this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    this.noticeOfPublicHearing = documents.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.PROOF_OF_ADVERTISING
    );
    this.proofOfSignage = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROOF_OF_SIGNAGE);
    this.reportOfPublicHearing = documents.filter(
      (document) => document.type?.code === DOCUMENT_TYPE.REPORT_OF_PUBLIC_HEARING
    );
  }

  proposalMap: ApplicationDocumentDto[] = [];
  noticeOfPublicHearing: ApplicationDocumentDto[] = [];
  proofOfSignage: ApplicationDocumentDto[] = [];
  reportOfPublicHearing: ApplicationDocumentDto[] = [];

  constructor(
    private router: Router,
    private applicationDocumentService: ApplicationDocumentService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.authenticationService.$currentProfile.pipe(takeUntil(this.$destroy)).subscribe((userProfile) => {
      if (userProfile && userProfile.government && this.showEdit) {
        this.governmentName = userProfile.government;
        this.isGovernmentCreator = true;
      }
    });
  }

  async onEditSection(step: number) {
    if (this.draftMode) {
      await this.router.navigateByUrl(
        `/alcs/application/${this._applicationSubmission?.fileNumber}/edit/${step}?errors=t`
      );
    } else {
      await this.router.navigateByUrl(`application/${this._applicationSubmission?.fileNumber}/edit/${step}?errors=t`);
    }
  }

  async openFile(uuid: string) {
    const res = await this.applicationDocumentService.openFile(uuid);
    window.open(res?.url, '_blank');
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
