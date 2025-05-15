import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { NotificationDocumentDto } from '../../../../../services/notification-document/notification-document.dto';
import { NotificationDocumentService } from '../../../../../services/notification-document/notification-document.service';
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
  documents: NotificationDocumentDto[] = [];

  @Input() $notificationDocuments = new BehaviorSubject<NotificationDocumentDto[]>([]);

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<NotificationDocumentDto> = new MatTableDataSource<NotificationDocumentDto>();

  constructor(
    private readonly notificationDocumentService: NotificationDocumentService,
    private readonly documentService: DocumentService,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.$notificationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.dataSource = new MatTableDataSource(documents);
    });
  }

  async openFile(file: NotificationDocumentDto) {
    const res = await this.notificationDocumentService.openFile(file.uuid);
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
