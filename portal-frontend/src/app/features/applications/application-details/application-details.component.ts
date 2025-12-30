import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import {
  ApplicationOwnerDetailedDto,
  ApplicationOwnerDto,
} from '../../../services/application-owner/application-owner.dto';
import { ApplicationParcelService } from '../../../services/application-parcel/application-parcel.service';
import { ApplicationSubmissionDetailedDto } from '../../../services/application-submission/application-submission.dto';
import { LocalGovernmentDto } from '../../../services/code/code.dto';
import { CodeService } from '../../../services/code/code.service';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../../shared/dto/document.dto';
import { OWNER_TYPE } from '../../../shared/dto/owner.dto';
import { MOBILE_BREAKPOINT } from '../../../shared/utils/breakpoints';
import { DocumentService } from '../../../services/document/document.service';
import { downloadFile } from '../../../shared/utils/file';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
    selector: 'app-application-details',
    templateUrl: './application-details.component.html',
    styleUrls: ['./application-details.component.scss'],
    standalone: false
})
export class ApplicationDetailsComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

  @Input() $application!: BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>;
  @Input() $applicationDocuments!: BehaviorSubject<ApplicationDocumentDto[]>;
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;

  applicationSubmission: ApplicationSubmissionDetailedDto | undefined;
  primaryContact: ApplicationOwnerDetailedDto | undefined;
  localGovernment: LocalGovernmentDto | undefined;
  authorizationLetters: ApplicationDocumentDto[] = [];
  otherFiles: ApplicationDocumentDto[] = [];
  needsAuthorizationLetter = true;
  appDocuments: ApplicationDocumentDto[] = [];
  OWNER_TYPE = OWNER_TYPE;

  private localGovernments: LocalGovernmentDto[] = [];
  private otherFileTypes = [DOCUMENT_TYPE.PHOTOGRAPH, DOCUMENT_TYPE.PROFESSIONAL_REPORT, DOCUMENT_TYPE.OTHER];

  constructor(
    private codeService: CodeService,
    private applicationDocumentService: ApplicationDocumentService,
    private applicationParcelService: ApplicationParcelService,
    private router: Router,
    private documentService: DocumentService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadGovernments();
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((app) => {
      this.applicationSubmission = app;
      if (app) {
        this.primaryContact = app.owners.find((owner) => owner.uuid === app.primaryContactOwnerUuid);
        this.populateLocalGovernment(app.localGovernmentUuid);
        this.calculateAuthorizationLetterRequired(app.uuid);
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

  async downloadFile(uuid: string) {
    try {
      const { url, fileName } = await this.documentService.getDownloadUrlAndFileName(uuid, false, true);

      downloadFile(url, fileName);
    } catch (e) {
      this.toastService.showErrorToast('Failed to download file');
    }
  }

  async onNavigateToStep(step: number) {
    if (this.draftMode) {
      await this.router.navigateByUrl(
        `alcs/application/${this.applicationSubmission?.fileNumber}/edit/${step}?errors=t`
      );
    } else {
      await this.router.navigateByUrl(`application/${this.applicationSubmission?.fileNumber}/edit/${step}?errors=t`);
    }
  }

  private async loadGovernments() {
    const codes = await this.codeService.loadCodes();
    this.localGovernments = codes.localGovernments.sort((a, b) => (a.name > b.name ? 1 : -1));
    if (this.applicationSubmission?.localGovernmentUuid) {
      this.populateLocalGovernment(this.applicationSubmission?.localGovernmentUuid);
    }
  }

  private populateLocalGovernment(governmentUuid: string) {
    const lg = this.localGovernments.find((lg) => lg.uuid === governmentUuid);
    if (lg) {
      this.localGovernment = lg;
    }
  }

  private async calculateAuthorizationLetterRequired(submissionUuid: string) {
    //Map Owners from Parcels to only count linked ones
    const parcels = await this.applicationParcelService.fetchBySubmissionUuid(submissionUuid);
    if (parcels) {
      const uniqueOwnerMap = parcels
        .flatMap((parcel) => parcel.owners)
        .reduce((map, owner) => {
          return map.set(owner.uuid, owner);
        }, new Map<string, ApplicationOwnerDto>());
      const owners = [...uniqueOwnerMap.values()];

      const isSelfApplicant = owners.length === 1 && this.primaryContact?.type.code === OWNER_TYPE.INDIVIDUAL;
      const isGovernmentContact = this.primaryContact?.type.code === OWNER_TYPE.GOVERNMENT;
      this.needsAuthorizationLetter = isGovernmentContact || !isSelfApplicant;
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }
}
