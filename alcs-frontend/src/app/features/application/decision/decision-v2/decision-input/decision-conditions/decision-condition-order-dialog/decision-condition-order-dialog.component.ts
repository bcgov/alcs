import {
  Component,
  Inject,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationDecisionConditionDto } from '../../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { countToString } from '../../../../../../../shared/utils/count-to-string';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-decision-condition-order-dialog',
  templateUrl: './decision-condition-order-dialog.component.html',
  styleUrl: './decision-condition-order-dialog.component.scss',
})
export class DecisionConditionOrderDialogComponent implements OnInit {
  displayedColumns = ['index', 'type', 'description', 'actions'];
  selectedRecord: string | undefined;
  overlayRef: OverlayRef | null = null;
  dataSource = new MatTableDataSource<ApplicationDecisionConditionDto>([]);
  conditionsToOrder: ApplicationDecisionConditionDto[] = [];

  @ViewChild('orderMenu') orderMenu!: TemplateRef<any>;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { conditions: ApplicationDecisionConditionDto[] },
    private dialogRef: MatDialogRef<DecisionConditionOrderDialogComponent>,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
  ) {}

  ngOnInit(): void {
    const orderIndexes = this.data.conditions.map((c) => c.order);
    const isAllZero = orderIndexes.every((val, i, arr) => val === arr[0] && arr[0] === 0);
    if (isAllZero) {
      let index = 0;
      this.data.conditions.forEach((c) => {
        c.order = index;
        index++;
      });
    }
    this.conditionsToOrder = this.data.conditions
      .sort((a, b) => a.order - b.order)
      .map((a) => {
        return { ...a };
      });
    this.dataSource.data = this.conditionsToOrder;
  }

  async onRowDropped(event: CdkDragDrop<ApplicationDecisionConditionDto, any>) {
    this.moveItem(event.previousIndex, event.currentIndex);
  }

  async openMenu($event: MouseEvent, record: ApplicationDecisionConditionDto) {
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

  sendToBottom(record: ApplicationDecisionConditionDto) {
    this.conditionsToOrder.forEach((item) => {
      if (item.order > record.order) {
        item.order--;
      }
    });
    record.order = this.conditionsToOrder.length - 1;
    this.dataSource.data = this.conditionsToOrder.sort((a, b) => a.order - b.order);
    this.overlayRef?.detach();
    this.selectedRecord = undefined;
  }

  sendToTop(record: ApplicationDecisionConditionDto) {
    this.conditionsToOrder.forEach((item) => {
      if (item.order < record.order) {
        item.order++;
      }
    });
    record.order = 0;
    this.dataSource.data = this.conditionsToOrder.sort((a, b) => a.order - b.order);
    this.overlayRef?.detach();
    this.selectedRecord = undefined;
  }

  clearMenu() {
    this.overlayRef?.detach();
    this.selectedRecord = undefined;
  }

  private moveItem(currentIndex: number, targetIndex: number) {
    this.conditionsToOrder
      .sort((a, b) => a.order - b.order)
      .forEach((item) => {
        if (currentIndex > targetIndex) {
          if (item.order < currentIndex && item.order >= targetIndex) {
            item.order++;
          }
        } else if (item.order > currentIndex) {
          if (item.order <= targetIndex) {
            item.order--;
          }
        }
      });
    this.conditionsToOrder[currentIndex].order = targetIndex;
    this.dataSource.data = this.conditionsToOrder.sort((a, b) => a.order - b.order);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const order = this.conditionsToOrder.map((cond, index) => ({
      uuid: cond.uuid,
      order: cond.order,
    }));
    this.dialogRef.close({ payload: order, data: this.conditionsToOrder });
  }

  alphaIndex(index: number) {
    return countToString(index);
  }
}
