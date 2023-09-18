import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { NotificationDocumentDto } from '../../../../../services/notification-document/notification-document.dto';
import { NotificationDocumentService } from '../../../../../services/notification-document/notification-document.service';

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

  constructor(private notificationDocumentService: NotificationDocumentService) {}

  ngOnInit(): void {
    this.$notificationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.dataSource = new MatTableDataSource(documents);
    });
  }

  async openFile(uuid: string) {
    const res = await this.notificationDocumentService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }

  async downloadFile(uuid: string) {
    const res = await this.notificationDocumentService.downloadFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  protected readonly open = open;
}
