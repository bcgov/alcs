import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { PublicNoticeOfIntentSubmissionDto } from '../../../../../services/public/public-notice-of-intent.dto';
import { PublicDocumentDto } from '../../../../../services/public/public.dto';
import { PublicService } from '../../../../../services/public/public.service';

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

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<PublicDocumentDto> = new MatTableDataSource<PublicDocumentDto>();

  constructor(private publicService: PublicService) {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.documents);
  }

  async openFile(uuid: string) {
    const res = await this.publicService.getNoticeOfIntentOpenFileUrl(this.submission.fileNumber, uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }

  async downloadFile(uuid: string) {
    const res = await this.publicService.getNoticeOfIntentOpenFileUrl(this.submission.fileNumber, uuid);
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
