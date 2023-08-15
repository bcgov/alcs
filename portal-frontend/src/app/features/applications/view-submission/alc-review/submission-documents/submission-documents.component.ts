import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';

@Component({
  selector: 'app-submission-documents',
  templateUrl: './submission-documents.component.html',
  styleUrls: ['./submission-documents.component.scss'],
})
export class SubmissionDocumentsComponent implements OnInit, OnDestroy {
  private $destroy = new Subject<void>();

  displayedColumns: string[] = ['type', 'fileName', 'source', 'uploadedAt', 'actions'];
  documents: ApplicationDocumentDto[] = [];

  @Input() $applicationDocuments = new BehaviorSubject<ApplicationDocumentDto[]>([]);

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<ApplicationDocumentDto> = new MatTableDataSource<ApplicationDocumentDto>();

  constructor(private applicationDocumentService: ApplicationDocumentService) {}

  ngOnInit(): void {
    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.dataSource = new MatTableDataSource(documents);
    });
  }

  async openFile(uuid: string) {
    const res = await this.applicationDocumentService.openFile(uuid);
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
