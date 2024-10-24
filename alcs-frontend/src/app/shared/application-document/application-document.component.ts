import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Component, Input, OnChanges, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ApplicationDocumentDto } from '../../services/application/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../services/application/application-document/application-document.service';
import { FILE_NAME_TRUNCATE_LENGTH } from '../constants';
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

  @ViewChild('orderMenu') orderMenu!: TemplateRef<any>;

  displayedColumns: string[] = ['index', 'source', 'type', 'fileName', 'uploadedAt', 'action', 'sorting'];
  documents: ApplicationDocumentDto[] = [];
  dataSource = new MatTableDataSource<ApplicationDocumentDto>([]);
  overlayRef: OverlayRef | null = null;
  selectedRecord: string | undefined;

  readonly fileNameTruncLen = FILE_NAME_TRUNCATE_LENGTH;

  constructor(
    private applicationDocumentService: ApplicationDocumentService,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.loadDocuments();
    if (!this.sortable) {
      this.displayedColumns = ['index', 'source', 'type', 'fileName', 'uploadedAt', 'action'];
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
    this.moveItem(event.previousIndex, event.currentIndex);
  }

  async openMenu($event: MouseEvent, record: ApplicationDocumentDto) {
    if (!this.sortable) {
      return;
    }
    this.overlayRef?.detach();
    $event.preventDefault();
    this.selectedRecord = record.uuid;
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
    this.applicationDocumentService.updateSort(order);
  }
}
