import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { PublicNoticeOfIntentSubmissionDto } from '../../../../../services/public/public-notice-of-intent.dto';
import { PublicDocumentDto } from '../../../../../services/public/public.dto';
import { PublicService } from '../../../../../services/public/public.service';
import { downloadFile, openFileInline } from '../../../../../shared/utils/file';
import { DocumentService } from '../../../../../services/document/document.service';
import { ToastService } from '../../../../../services/toast/toast.service';

type PublicDocumentWithoutTypeDto = Omit<PublicDocumentDto, 'type'>;

@Component({
  selector: 'app-submission-documents',
  templateUrl: './submission-documents.component.html',
  styleUrls: ['./submission-documents.component.scss'],
})
export class PublicSubmissionDocumentsComponent implements OnInit, OnDestroy {
  private $destroy = new Subject<void>();

  displayedColumns: string[] = ['type', 'fileName', 'source', 'uploadedAt', 'actions'];
  @Input() documents!: PublicDocumentDto[];
  @Input() submission!: PublicNoticeOfIntentSubmissionDto;

  dataSource: MatTableDataSource<PublicDocumentDto> = new MatTableDataSource<PublicDocumentDto>();
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private readonly publicService: PublicService,
    private readonly documentService: DocumentService,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.dataSource.data = this.documents;
    this.dataSource.sortingDataAccessor = (
      { type, ...rest }: PublicDocumentDto,
      sortHeaderId: string,
    ): string | number => {
      if (sortHeaderId === 'type') {
        return type?.label ?? '';
      }

      return (rest as PublicDocumentWithoutTypeDto)[sortHeaderId as keyof PublicDocumentWithoutTypeDto] ?? '';
    };
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  async openFile(file: PublicDocumentDto) {
    const res = await this.publicService.getNoticeOfIntentOpenFileUrl(this.submission.fileNumber, file.uuid);
    if (res) {
      openFileInline(res.url, file.fileName);
    }
  }

  async downloadFile(uuid: string) {
    try {
      const { url, fileName } = await this.documentService.getDownloadUrlAndFileName(uuid, false, false);

      downloadFile(url, fileName);
    } catch (e) {
      console.error('Failed to download file', e);
      this.toastService.showErrorToast('Failed to download file');
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
