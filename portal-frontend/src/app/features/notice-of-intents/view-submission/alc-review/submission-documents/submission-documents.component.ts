import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { NoticeOfIntentDocumentDto } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { openFileInline } from '../../../../../shared/utils/file';

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

  constructor(private noticeOfIntentDocumentService: NoticeOfIntentDocumentService) {}

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
    const res = await this.noticeOfIntentDocumentService.downloadFile(uuid);
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
