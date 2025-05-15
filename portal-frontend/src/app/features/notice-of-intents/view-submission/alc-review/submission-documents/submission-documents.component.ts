import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { NoticeOfIntentDocumentDto } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { downloadFile, openFileInline } from '../../../../../shared/utils/file';
import { DocumentService } from '../../../../../services/document/document.service';
import { ToastService } from '../../../../../services/toast/toast.service';

@Component({
  selector: 'app-submission-documents',
  templateUrl: './submission-documents.component.html',
  styleUrls: ['./submission-documents.component.scss'],
})
export class SubmissionDocumentsComponent implements OnInit, OnDestroy {
  private $destroy = new Subject<void>();

  displayedColumns: string[] = ['type', 'fileName', 'source', 'uploadedAt', 'actions'];
  documents: NoticeOfIntentDocumentDto[] = [];

  @Input() $noiDocuments = new BehaviorSubject<NoticeOfIntentDocumentDto[]>([]);

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<NoticeOfIntentDocumentDto> = new MatTableDataSource<NoticeOfIntentDocumentDto>();

  constructor(
    private readonly noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
    private readonly documentService: DocumentService,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.$noiDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.dataSource = new MatTableDataSource(documents);
    });
  }

  async openFile(file: NoticeOfIntentDocumentDto) {
    const res = await this.noticeOfIntentDocumentService.openFile(file.uuid);
    if (res) {
      openFileInline(res.url, file.fileName);
    }
  }

  async downloadFile(uuid: string) {
    try {
      const { url, fileName } = await this.documentService.getDownloadUrlAndFileName(uuid, false, true);

      downloadFile(url, fileName);
    } catch (e) {
      console.warn('Failed to download file', e);
      this.toastService.showErrorToast('Failed to download file');
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
