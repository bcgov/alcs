import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { NoticeOfIntentDocumentDto } from '../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../services/notice-of-intent-document/notice-of-intent-document.service';
import {
  NOI_SUBMISSION_STATUS,
  NoticeOfIntentSubmissionDetailedDto,
} from '../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../services/notice-of-intent-submission/notice-of-intent-submission.service';

@Component({
  selector: 'app-view-noi-submission',
  templateUrl: './view-notice-of-intent-submission.component.html',
  styleUrls: ['./view-notice-of-intent-submission.component.scss'],
})
export class ViewNoticeOfIntentSubmissionComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  $noiSubmission = new BehaviorSubject<NoticeOfIntentSubmissionDetailedDto | undefined>(undefined);
  $noiDocuments = new BehaviorSubject<NoticeOfIntentDocumentDto[]>([]);
  submission: NoticeOfIntentSubmissionDetailedDto | undefined;
  selectedIndex = 0;

  constructor(
    private noiSubmissionService: NoticeOfIntentSubmissionService,
    private noiDocumentService: NoticeOfIntentDocumentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.$destroy)).subscribe((paramMap) => {
      const fileId = paramMap.get('fileId');
      if (fileId) {
        this.loadSubmission(fileId);
        this.loadDocuments(fileId);
      }
    });
  }

  async loadSubmission(fileId: string) {
    const noiSubmission = await this.noiSubmissionService.getByFileId(fileId);
    this.submission = noiSubmission;
    if (this.submission?.status.code === NOI_SUBMISSION_STATUS.ALC_DECISION) {
      this.selectedIndex = 1;
    }
    this.$noiSubmission.next(noiSubmission);
  }

  async loadDocuments(fileId: string) {
    const documents = await this.noiDocumentService.getByFileId(fileId);
    if (documents) {
      this.$noiDocuments.next(documents);
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onNavigateHome() {
    await this.router.navigateByUrl(`home/nois`);
  }

  async onCancel(uuid: string) {
    await this.noiSubmissionService.cancel(uuid);
    await this.router.navigateByUrl(`home`);
  }

  onDownloadSubmissionPdf(fileNumber: string) {
    //TODO: When we add PDFs
  }
}
