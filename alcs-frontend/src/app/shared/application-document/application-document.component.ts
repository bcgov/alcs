import { DataSource } from '@angular/cdk/collections';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ApplicationDocumentDto } from '../../services/application/application-document/application-document.dto';
import {
  ApplicationDocumentService,
  DOCUMENT_SOURCE,
} from '../../services/application/application-document/application-document.service';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-document[tableTitle][fileNumber][visibilityFlags]',
  templateUrl: './application-document.component.html',
  styleUrls: ['./application-document.component.scss'],
})
export class ApplicationDocumentComponent implements OnChanges {
  @Input() tableTitle = '';
  @Input() fileNumber: string = '';
  @Input() visibilityFlags: string[] = [];
  @Input() sortable = false;

  displayedColumns: string[] = ['type', 'fileName', 'source', 'uploadedAt', 'action', 'sorting'];
  documents: ApplicationDocumentDto[] = [];
  dataSource = new MatTableDataSource<ApplicationDocumentDto>([]);

  constructor(private applicationDocumentService: ApplicationDocumentService) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.loadDocuments();
    if (!this.sortable) {
      this.displayedColumns = ['type', 'fileName', 'source', 'uploadedAt', 'action'];
    }
  }

  async loadDocuments() {
    if (this.fileNumber) {
      this.documents = await this.applicationDocumentService.listByVisibility(this.fileNumber, this.visibilityFlags);
      this.documents.sort((a, b) => (a.evidentiaryRecordSorting ?? 9999) - (b.evidentiaryRecordSorting ?? 9999));
      this.dataSource.data = this.documents;
    }
  }

  async onDownload(uuid: string, fileName: string) {
    await this.applicationDocumentService.download(uuid, fileName, false);
  }

  async onOpen(uuid: string, fileName: string) {
    await this.applicationDocumentService.download(uuid, fileName);
  }

  async onRowDropped(event: CdkDragDrop<ApplicationDocumentDto, any>) {
    moveItemInArray(this.documents, event.previousIndex, event.currentIndex);
    const order = this.documents.map((doc, index) => ({
      uuid: doc.uuid,
      order: index,
    }));
    this.dataSource.data = this.documents;
    this.applicationDocumentService.updateSort(order);
  }
}
