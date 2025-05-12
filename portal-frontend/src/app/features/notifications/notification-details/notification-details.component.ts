import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { LocalGovernmentDto } from '../../../services/code/code.dto';
import { CodeService } from '../../../services/code/code.service';
import { NotificationDocumentDto } from '../../../services/notification-document/notification-document.dto';
import { NotificationSubmissionDetailedDto } from '../../../services/notification-submission/notification-submission.dto';
import { DOCUMENT_SOURCE, DOCUMENT_TYPE } from '../../../shared/dto/document.dto';
import { OWNER_TYPE } from '../../../shared/dto/owner.dto';
import { downloadFile } from '../../../shared/utils/file';
import { MOBILE_BREAKPOINT } from '../../../shared/utils/breakpoints';
import { DocumentService } from '../../../services/document/document.service';

@Component({
  selector: 'app-notification-details',
  templateUrl: './notification-details.component.html',
  styleUrls: ['./notification-details.component.scss'],
})
export class NotificationDetailsComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

  @Input() $notificationSubmission!: BehaviorSubject<NotificationSubmissionDetailedDto | undefined>;
  @Input() $notificationDocuments!: BehaviorSubject<NotificationDocumentDto[]>;
  @Input() showErrors = true;
  @Input() showEdit = true;

  notificationSubmission: NotificationSubmissionDetailedDto | undefined;
  localGovernment: LocalGovernmentDto | undefined;
  otherFiles: NotificationDocumentDto[] = [];
  notificationDocuments: NotificationDocumentDto[] = [];
  OWNER_TYPE = OWNER_TYPE;

  private localGovernments: LocalGovernmentDto[] = [];
  private otherFileTypes = [DOCUMENT_TYPE.PHOTOGRAPH, DOCUMENT_TYPE.PROFESSIONAL_REPORT, DOCUMENT_TYPE.OTHER];

  constructor(
    private codeService: CodeService,
    private documentService: DocumentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadGovernments();
    this.$notificationSubmission.pipe(takeUntil(this.$destroy)).subscribe((notificationSubmission) => {
      this.notificationSubmission = notificationSubmission;
      if (notificationSubmission) {
        this.populateLocalGovernment(notificationSubmission.localGovernmentUuid);
      }
    });

    this.$notificationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.otherFiles = documents
        .filter((file) => (file.type ? this.otherFileTypes.includes(file.type.code) : true))
        .filter((file) => file.source === DOCUMENT_SOURCE.APPLICANT)
        .sort((a, b) => {
          return a.uploadedAt - b.uploadedAt;
        });

      this.notificationDocuments = documents;
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async downloadFile(uuid: string) {
    const { url, fileName } = await this.documentService.getDownloadUrlAndFileName(uuid, false, true);

    downloadFile(url, fileName);
  }

  async onNavigateToStep(step: number) {
    await this.router.navigateByUrl(`notification/${this.notificationSubmission?.fileNumber}/edit/${step}?errors=t`);
  }

  private async loadGovernments() {
    const codes = await this.codeService.loadCodes();
    this.localGovernments = codes.localGovernments.sort((a, b) => (a.name > b.name ? 1 : -1));
    if (this.notificationSubmission?.localGovernmentUuid) {
      this.populateLocalGovernment(this.notificationSubmission?.localGovernmentUuid);
    }
  }

  private populateLocalGovernment(governmentUuid: string) {
    const lg = this.localGovernments.find((lg) => lg.uuid === governmentUuid);
    if (lg) {
      this.localGovernment = lg;
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }
}
