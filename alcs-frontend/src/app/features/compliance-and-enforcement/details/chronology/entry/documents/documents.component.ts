import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { ComplianceAndEnforcementDocumentDto } from '../../../../../../services/compliance-and-enforcement/documents/document.dto';
import { FILE_NAME_TRUNCATE_LENGTH } from '../../../../../../shared/constants';
import { DOCUMENT_TYPE } from '../../../../../../shared/document/document.dto';

@Component({
  selector: 'app-compliance-and-enforcement-chronology-entry-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  standalone: false,
})
export class ComplianceAndEnforcementChronologyEntryDocumentsComponent implements OnDestroy {
  readonly fileNameTruncLen = FILE_NAME_TRUNCATE_LENGTH;

  @Input() isDraft: boolean = false;
  @Input() set documents(documents: ComplianceAndEnforcementDocumentDto[] | undefined) {
    this.documentsTableData.data = documents ?? [];
  }

  @Output() edit: EventEmitter<ComplianceAndEnforcementDocumentDto> =
    new EventEmitter<ComplianceAndEnforcementDocumentDto>();
  @Output() delete: EventEmitter<ComplianceAndEnforcementDocumentDto> =
    new EventEmitter<ComplianceAndEnforcementDocumentDto>();

  documentsTableData: MatTableDataSource<ComplianceAndEnforcementDocumentDto> =
    new MatTableDataSource<ComplianceAndEnforcementDocumentDto>();
  documentColumns: string[] = ['source', 'type', 'fileName', 'actions'];
  @ViewChild(MatSort) sort!: MatSort;

  DOCUMENT_TYPE = DOCUMENT_TYPE;

  $destroy = new Subject<void>();

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
