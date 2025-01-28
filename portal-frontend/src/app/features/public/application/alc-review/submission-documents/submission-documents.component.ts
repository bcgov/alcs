import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { PublicApplicationSubmissionDto } from '../../../../../services/public/public-application.dto';
import { PublicDocumentDto } from '../../../../../services/public/public.dto';
import { PublicService } from '../../../../../services/public/public.service';
import { openFileInline } from '../../../../../shared/utils/file';

type PublicDocumentWithoutTypeDto = Omit<PublicDocumentDto, 'type'>;

@Component({
  selector: 'app-submission-documents[applicationSubmission]',
  templateUrl: './submission-documents.component.html',
  styleUrls: ['./submission-documents.component.scss'],
})
export class PublicSubmissionDocumentsComponent implements OnInit, OnDestroy {
  private $destroy = new Subject<void>();

  displayedColumns: string[] = ['type', 'fileName', 'source', 'uploadedAt', 'actions'];
  documents: PublicDocumentDto[] = [];

  @Input() applicationDocuments!: PublicDocumentDto[];
  @Input() applicationSubmission!: PublicApplicationSubmissionDto;

  dataSource: MatTableDataSource<PublicDocumentDto> = new MatTableDataSource<PublicDocumentDto>();
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private publicService: PublicService) {}

  ngOnInit(): void {
    this.dataSource.data = this.applicationDocuments;
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
    const res = await this.publicService.getApplicationOpenFileUrl(this.applicationSubmission.fileNumber, file.uuid);
    if (res) {
      openFileInline(res.url, file.fileName);
    }
  }

  async downloadFile(uuid: string) {
    const res = await this.publicService.getApplicationDownloadFileUrl(this.applicationSubmission.fileNumber, uuid);
    if (res) {
      const downloadLink = document.createElement('a');
      downloadLink.href = res.url;
      downloadLink.download = res.url.split('/').pop()!;
      if (window.webkitURL == null) {
        downloadLink.onclick = (event: MouseEvent) => document.body.removeChild(<Node>event.target);
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
      }
      downloadLink.click();
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
