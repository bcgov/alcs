import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { PlanningReviewDocumentDto } from '../../../../services/planning-review/planning-review-document/planning-review-document.dto';
import { PlanningReviewDocumentService } from '../../../../services/planning-review/planning-review-document/planning-review-document.service';

@Component({
  selector: 'app-evidentiary-record[tableTitle][fileNumber][visibilityFlags]',
  templateUrl: './evidentiary-record.component.html',
  styleUrls: ['./evidentiary-record.component.scss'],
})
export class EvidentiaryRecordComponent implements OnChanges {
  @Input() tableTitle = '';
  @Input() fileNumber: string = '';
  @Input() visibilityFlags: string[] = [];
  @Input() sortable = false;

  displayedColumns: string[] = ['index', 'type', 'fileName', 'source', 'uploadedAt', 'action', 'sorting'];
  documents: PlanningReviewDocumentDto[] = [];
  dataSource = new MatTableDataSource<PlanningReviewDocumentDto>([]);

  constructor(private planningReviewDocumentService: PlanningReviewDocumentService) {}

  ngOnChanges(): void {
    this.loadDocuments();
    if (!this.sortable) {
      this.displayedColumns = ['index', 'type', 'fileName', 'source', 'uploadedAt', 'action'];
    }
  }

  async loadDocuments() {
    if (this.fileNumber) {
      this.documents = await this.planningReviewDocumentService.listByVisibility(this.fileNumber, this.visibilityFlags);
      this.documents.sort((a, b) => (a.evidentiaryRecordSorting ?? 9999) - (b.evidentiaryRecordSorting ?? 9999));
      this.dataSource.data = this.documents;
    }
  }

  async onDownload(uuid: string, fileName: string) {
    await this.planningReviewDocumentService.download(uuid, fileName, false);
  }

  async onOpen(uuid: string, fileName: string) {
    await this.planningReviewDocumentService.download(uuid, fileName);
  }

  async onRowDropped(event: CdkDragDrop<PlanningReviewDocumentDto, any>) {
    moveItemInArray(this.documents, event.previousIndex, event.currentIndex);
    const order = this.documents.map((doc, index) => ({
      uuid: doc.uuid,
      order: index,
    }));
    this.dataSource.data = this.documents;
    this.planningReviewDocumentService.updateSort(order);
  }
}
