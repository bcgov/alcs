import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import { downloadFile, openFileInline } from '../../../../../shared/utils/file';
import { DocumentService } from '../../../../../services/document/document.service';
import { ToastService } from '../../../../../services/toast/toast.service';

@Component({
    selector: 'app-submission-documents',
    templateUrl: './submission-documents.component.html',
    styleUrls: ['./submission-documents.component.scss'],
    standalone: false
})
export class SubmissionDocumentsComponent implements OnInit, OnDestroy {
  private $destroy = new Subject<void>();

  displayedColumns: string[] = ['type', 'fileName', 'source', 'uploadedAt', 'actions'];
  documents: ApplicationDocumentDto[] = [];

  @Input() $applicationDocuments = new BehaviorSubject<ApplicationDocumentDto[]>([]);

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<ApplicationDocumentDto> = new MatTableDataSource<ApplicationDocumentDto>();

  constructor(
    private applicationDocumentService: ApplicationDocumentService,
    private documentService: DocumentService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.dataSource = new MatTableDataSource(documents);
    });
  }

  async downloadFile(uuid: string) {
    try {
      const { url, fileName } = await this.documentService.getDownloadUrlAndFileName(uuid, false, true);

      downloadFile(url, fileName);
    } catch (e) {
      this.toastService.showErrorToast('Failed to download file');
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
