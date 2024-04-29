import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Component, Input, OnChanges, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ApplicationDocumentDto } from '../../../../services/application/application-document/application-document.dto';
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

  @ViewChild('orderMenu') orderMenu!: TemplateRef<any>;

  displayedColumns: string[] = ['index', 'type', 'fileName', 'source', 'uploadedAt', 'action', 'sorting'];
  documents: PlanningReviewDocumentDto[] = [];
  dataSource = new MatTableDataSource<PlanningReviewDocumentDto>([]);
  overlayRef: OverlayRef | null = null;
  selectedRecord: string | undefined;

  constructor(
    private planningReviewDocumentService: PlanningReviewDocumentService,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
  ) {}

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

  async onRowDropped(event: CdkDragDrop<ApplicationDocumentDto, any>) {
    this.moveItem(event.previousIndex, event.currentIndex);
  }

  async openMenu($event: MouseEvent, record: ApplicationDocumentDto) {
    if (!this.sortable) {
      return;
    }
    this.selectedRecord = record.uuid;
    this.overlayRef?.detach();
    $event.preventDefault();
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo({ x: $event.x, y: $event.y })
      .withPositions([
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });

    this.overlayRef.attach(
      new TemplatePortal(this.orderMenu, this.viewContainerRef, {
        $implicit: record,
      }),
    );
  }

  sendToBottom(record: ApplicationDocumentDto) {
    const currentIndex = this.documents.findIndex((item) => item.uuid === record.uuid);
    this.moveItem(currentIndex, this.documents.length - 1);
    this.overlayRef?.detach();
    this.selectedRecord = undefined;
  }

  sendToTop(record: ApplicationDocumentDto) {
    const currentIndex = this.documents.findIndex((item) => item.uuid === record.uuid);
    this.moveItem(currentIndex, 0);
    this.overlayRef?.detach();
    this.selectedRecord = undefined;
  }

  clearMenu() {
    this.overlayRef?.detach();
    this.selectedRecord = undefined;
  }

  private moveItem(currentIndex: number, targetIndex: number) {
    moveItemInArray(this.documents, currentIndex, targetIndex);
    const order = this.documents.map((doc, index) => ({
      uuid: doc.uuid,
      order: index,
    }));
    this.dataSource.data = this.documents;
    this.planningReviewDocumentService.updateSort(order);
  }
}
