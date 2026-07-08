import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { ComplianceAndEnforcementDocumentDto } from '../../../../../../../services/compliance-and-enforcement/documents/document.dto';
import { FILE_NAME_TRUNCATE_LENGTH } from '../../../../../../../shared/constants';

@Component({
  selector: 'app-compliance-and-enforcement-notice-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  standalone: false,
})
export class ComplianceAndEnforcementNoticeDocumentsComponent implements OnDestroy {
  readonly fileNameTruncLen = FILE_NAME_TRUNCATE_LENGTH;

  @Input() set documents(documents: ComplianceAndEnforcementDocumentDto[] | undefined) {
    this.documentsTableData.data = documents ?? [];
  }

  @Output() edit: EventEmitter<ComplianceAndEnforcementDocumentDto> =
    new EventEmitter<ComplianceAndEnforcementDocumentDto>();
  @Output() delete: EventEmitter<ComplianceAndEnforcementDocumentDto> =
    new EventEmitter<ComplianceAndEnforcementDocumentDto>();

  documentsTableData: MatTableDataSource<ComplianceAndEnforcementDocumentDto> =
    new MatTableDataSource<ComplianceAndEnforcementDocumentDto>();
  documentColumns: string[] = ['source', 'type', 'fileName', 'uploadedAt', 'actions'];
  @ViewChild(MatSort) sort!: MatSort;

  $destroy = new Subject<void>();

  constructor() {}

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
