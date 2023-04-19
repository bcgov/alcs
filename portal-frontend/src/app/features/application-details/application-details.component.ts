import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import {
  ApplicationDocumentDto,
  DOCUMENT_SOURCE,
  DOCUMENT_TYPE,
} from '../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../services/application-document/application-document.service';
import { APPLICATION_OWNER, ApplicationOwnerDetailedDto } from '../../services/application-owner/application-owner.dto';
import { PARCEL_TYPE } from '../../services/application-parcel/application-parcel.dto';
import { ApplicationSubmissionDetailedDto } from '../../services/application-submission/application-submission.dto';
import { LocalGovernmentDto } from '../../services/code/code.dto';
import { CodeService } from '../../services/code/code.service';

@Component({
  selector: 'app-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.scss'],
})
export class ApplicationDetailsComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  @Input() $application!: BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>;
  @Input() $applicationDocuments!: BehaviorSubject<ApplicationDocumentDto[]>;
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;

  parcelType = PARCEL_TYPE;
  application: ApplicationSubmissionDetailedDto | undefined;
  primaryContact: ApplicationOwnerDetailedDto | undefined;
  localGovernment: LocalGovernmentDto | undefined;
  authorizationLetters: ApplicationDocumentDto[] = [];
  otherFiles: ApplicationDocumentDto[] = [];
  needsAuthorizationLetter = true;
  appDocuments: ApplicationDocumentDto[] = [];

  private localGovernments: LocalGovernmentDto[] = [];
  private otherFileTypes = [DOCUMENT_TYPE.PHOTOGRAPH, DOCUMENT_TYPE.PROFESSIONAL_REPORT, DOCUMENT_TYPE.OTHER];

  constructor(
    private codeService: CodeService,
    private applicationDocumentService: ApplicationDocumentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGovernments();
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((app) => {
      this.application = app;
      if (app) {
        this.primaryContact = app.owners.find((owner) => owner.uuid === app.primaryContactOwnerUuid);
        this.populateLocalGovernment(app.localGovernmentUuid);
        this.needsAuthorizationLetter = !(
          app.owners.length === 1 && app.owners[0].type.code === APPLICATION_OWNER.INDIVIDUAL
        );
      }
    });

    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.otherFiles = documents
        .filter((file) => (file.type ? this.otherFileTypes.includes(file.type.code) : true))
        .filter((file) => file.source === DOCUMENT_SOURCE.APPLICANT)
        .sort((a, b) => {
          return a.uploadedAt - b.uploadedAt;
        });

      this.authorizationLetters = documents
        .filter((file) => file.type?.code === DOCUMENT_TYPE.AUTHORIZATION_LETTER)
        .filter((file) => file.source === DOCUMENT_SOURCE.APPLICANT)
        .sort((a, b) => {
          return a.uploadedAt - b.uploadedAt;
        });

      this.appDocuments = documents;
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async openFile(uuid: string) {
    const res = await this.applicationDocumentService.openFile(uuid);
    window.open(res?.url, '_blank');
  }

  onNavigateToStep(step: number) {
    if (this.draftMode) {
      this.router.navigateByUrl(`alcs/application/${this.application?.fileNumber}/edit/${step}?errors=t`);
    } else {
      this.router.navigateByUrl(`application/${this.application?.fileNumber}/edit/${step}?errors=t`);
    }
  }

  private async loadGovernments() {
    const codes = await this.codeService.loadCodes();
    this.localGovernments = codes.localGovernments.sort((a, b) => (a.name > b.name ? 1 : -1));
    if (this.application?.localGovernmentUuid) {
      this.populateLocalGovernment(this.application?.localGovernmentUuid);
    }
  }

  private populateLocalGovernment(governmentUuid: string) {
    const lg = this.localGovernments.find((lg) => lg.uuid === governmentUuid);
    if (lg) {
      this.localGovernment = lg;
    }
  }
}
