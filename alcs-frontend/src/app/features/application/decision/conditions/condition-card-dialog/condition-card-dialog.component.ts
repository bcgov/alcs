import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  ApplicationDecisionConditionDto,
  CreateApplicationDecisionConditionCardDto,
} from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionConditionDto as OriginalApplicationDecisionConditionDto } from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ApplicationDecisionConditionCardService } from '../../../../../services/application/decision/application-decision-v2/application-decision-condition/application-decision-condition-card/application-decision-condition-card.service';
import { BOARD_TYPE_CODES, BoardService } from '../../../../../services/board/board.service';
import { BoardDto, BoardStatusDto } from '../../../../../services/board/board.dto';
import { ToastService } from '../../../../../services/toast/toast.service';

@Component({
  selector: 'app-condition-card-dialog',
  templateUrl: './condition-card-dialog.component.html',
  styleUrl: './condition-card-dialog.component.scss',
})
export class ConditionCardDialogComponent implements OnInit {
  displayColumns: string[] = ['select', 'index', 'type', 'description'];
  conditionBoard: BoardDto | undefined;
  selectedStatus = '';

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<{ condition: ApplicationDecisionConditionDto; index: number; selected: boolean }> =
    new MatTableDataSource();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { conditions: { condition: ApplicationDecisionConditionDto; index: number }[]; decision: string },
    private dialogRef: MatDialogRef<ConditionCardDialogComponent>,
    private decisionConditionCardService: ApplicationDecisionConditionCardService,
    private boardService: BoardService,
    private toastService: ToastService,
  ) {}

  async ngOnInit() {
    this.dataSource.data = this.data.conditions.map((item) => ({
      condition: item.condition,
      selected: false,
      index: item.index + 1,
    }));

    this.conditionBoard = await this.boardService.fetchBoardDetail(BOARD_TYPE_CODES.APPCON);
  }

  onStatusSelected(applicationStatus: BoardStatusDto) {
    this.selectedStatus = applicationStatus.statusCode;
  }

  isConditionCardNotNull(element: any): boolean {
    return element.condition.conditionCard !== null;
  }

  isSaveDisabled(): boolean {
    const isStatusSelected = !!this.selectedStatus;
    const isAnyRowSelected = this.dataSource.data.some((item) => item.selected);
    return !(isStatusSelected && isAnyRowSelected);
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  async onSave() {
    const selectedStatusCode = this.conditionBoard?.statuses.find(
      (status) => status.label === this.selectedStatus,
    )?.statusCode;
    const selectedConditions = this.dataSource.data.filter((item) => item.selected).map((item) => item.condition.uuid);
    const createDto: CreateApplicationDecisionConditionCardDto = {
      conditionsUuids: selectedConditions,
      decisionUuid: this.data.decision,
      cardStatusCode: this.selectedStatus,
    };
    const res = await this.decisionConditionCardService.create(createDto);
    if (res) {
      this.toastService.showSuccessToast('Condition card created successfully');
      this.dialogRef.close({ action: 'save', result: true });
    } else {
      this.toastService.showErrorToast('Failed to create condition card');
      this.dialogRef.close({ action: 'save', result: false });
    }
  }
}
