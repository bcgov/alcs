import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { PARCEL_TYPE } from '../../../services/application-parcel/application-parcel.dto';
import { LocalGovernmentDto } from '../../../services/code/code.dto';
import { CodeService } from '../../../services/code/code.service';
import { NoticeOfIntentDocumentDto } from '../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentOwnerDto } from '../../../services/notice-of-intent-owner/notice-of-intent-owner.dto';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../../shared/dto/document.dto';
import { OWNER_TYPE } from '../../../shared/dto/owner.dto';

@Component({
  selector: 'app-noi-details',
  templateUrl: './notice-of-intent-details.component.html',
  styleUrls: ['./notice-of-intent-details.component.scss'],
})
export class NoticeOfIntentDetailsComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  @Input() $noticeOfIntentSubmission!: BehaviorSubject<NoticeOfIntentSubmissionDetailedDto | undefined>;
  @Input() $noiDocuments!: BehaviorSubject<NoticeOfIntentDocumentDto[]>;
  @Input() showErrors = true;
  @Input() showEdit = true;
  @Input() draftMode = false;
  @Input() originalSubmissionUuid = '';
  @Input() updatedFields: string[] = [];

  parcelType = PARCEL_TYPE;
  noiSubmission: NoticeOfIntentSubmissionDetailedDto | undefined;
  primaryContact: NoticeOfIntentOwnerDto | undefined;
  localGovernment: LocalGovernmentDto | undefined;
  authorizationLetters: NoticeOfIntentDocumentDto[] = [];
  otherFiles: NoticeOfIntentDocumentDto[] = [];
  needsAuthorizationLetter = true;
  appDocuments: NoticeOfIntentDocumentDto[] = [];
  OWNER_TYPE = OWNER_TYPE;

  private localGovernments: LocalGovernmentDto[] = [];
  private otherFileTypes = [DOCUMENT_TYPE.PHOTOGRAPH, DOCUMENT_TYPE.PROFESSIONAL_REPORT, DOCUMENT_TYPE.OTHER];

  constructor(
    private codeService: CodeService,
    private noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGovernments();
    this.$noticeOfIntentSubmission.pipe(takeUntil(this.$destroy)).subscribe((noiSubmission) => {
      this.noiSubmission = noiSubmission;
      if (noiSubmission) {
        this.primaryContact = noiSubmission.owners.find(
          (owner) => owner.uuid === noiSubmission.primaryContactOwnerUuid
        );
        this.populateLocalGovernment(noiSubmission.localGovernmentUuid);

        this.needsAuthorizationLetter =
          this.primaryContact?.type.code !== OWNER_TYPE.GOVERNMENT &&
          !(
            noiSubmission.owners.length === 1 &&
            (noiSubmission.owners[0].type.code === OWNER_TYPE.INDIVIDUAL ||
              noiSubmission.owners[0].type.code === OWNER_TYPE.GOVERNMENT)
          );
      }
    });

    this.$noiDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
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
    const res = await this.noticeOfIntentDocumentService.openFile(uuid);
    window.open(res?.url, '_blank');
  }

  async onNavigateToStep(step: number) {
    if (this.draftMode) {
      await this.router.navigateByUrl(`alcs/notice-of-intent/${this.noiSubmission?.fileNumber}/edit/${step}?errors=t`);
    } else {
      await this.router.navigateByUrl(`notice-of-intent/${this.noiSubmission?.fileNumber}/edit/${step}?errors=t`);
    }
  }

  private async loadGovernments() {
    const codes = await this.codeService.loadCodes();
    this.localGovernments = codes.localGovernments.sort((a, b) => (a.name > b.name ? 1 : -1));
    if (this.noiSubmission?.localGovernmentUuid) {
      this.populateLocalGovernment(this.noiSubmission?.localGovernmentUuid);
    }
  }

  private populateLocalGovernment(governmentUuid: string) {
    const lg = this.localGovernments.find((lg) => lg.uuid === governmentUuid);
    if (lg) {
      this.localGovernment = lg;
    }
  }
}
