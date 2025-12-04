import { Component, Inject, ViewChild } from '@angular/core';
import { CardType } from '../../../../../shared/card/card.component';
import { BoardDto, BoardStatusDto } from '../../../../../services/board/board.dto';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BOARD_TYPE_CODES, BoardService } from '../../../../../services/board/board.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import {
  CreateNoticeOfIntentDecisionConditionCardDto,
  NoticeOfIntentDecisionConditionDto,
} from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision.dto';
import { NoticeOfIntentDecisionConditionCardService } from '../../../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-condition/notice-of-intent-decision-condition-card/notice-of-intent-decision-condition-card.service';

@Component({
    selector: 'app-noi-condition-card-dialog',
    templateUrl: './condition-card-dialog.component.html',
    styleUrl: './condition-card-dialog.component.scss',
    standalone: false
})
export class ConditionCardDialogComponent {
  displayColumns: string[] = ['select', 'index', 'type', 'description'];
  conditionBoard: BoardDto | undefined;
  selectedStatus = '';

  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<{ condition: NoticeOfIntentDecisionConditionDto; index: number; selected: boolean }> =
    new MatTableDataSource();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { conditions: { condition: NoticeOfIntentDecisionConditionDto; index: number }[]; decision: string },
    private dialogRef: MatDialogRef<ConditionCardDialogComponent>,
    private decisionConditionCardService: NoticeOfIntentDecisionConditionCardService,
    private boardService: BoardService,
    private toastService: ToastService,
  ) {}

  async ngOnInit() {
    this.dataSource.data = this.data.conditions.map((item) => ({
      condition: item.condition,
      selected: false,
      index: item.index + 1,
    }));

    this.conditionBoard = await this.boardService.fetchBoardDetail(BOARD_TYPE_CODES.NOICON);
  }

  onStatusSelected(noticeOfIntentStatus: BoardStatusDto) {
    this.selectedStatus = noticeOfIntentStatus.statusCode;
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
    const createDto: CreateNoticeOfIntentDecisionConditionCardDto = {
      conditionsUuids: selectedConditions,
      decisionUuid: this.data.decision,
      cardStatusCode: this.selectedStatus,
    };
    const res = await this.decisionConditionCardService.create(createDto);
    if (res) {
      this.toastService.showSuccessToastWithLink(
        'Condition card created successfully',
        'GO TO BOARD',
        `/board/noicon?card=${res.cardUuid}&type=${CardType.NOI_CON}`,
      );
      this.dialogRef.close({ action: 'save', result: true });
    } else {
      this.toastService.showErrorToast('Failed to create condition card');
      this.dialogRef.close({ action: 'save', result: false });
    }
  }
}
