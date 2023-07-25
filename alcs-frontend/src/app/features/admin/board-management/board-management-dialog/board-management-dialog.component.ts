import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminBoardManagementService } from '../../../../services/admin-board-management/admin-board-management.service';
import { CardStatusDto } from '../../../../services/application/application-code.dto';
import { BoardDto, BoardStatusDto, MinimalBoardDto } from '../../../../services/board/board.dto';
import { BoardService } from '../../../../services/board/board.service';
import { CardStatusService } from '../../../../services/card/card-status/card-status.service';
import { CardType } from '../../../../shared/card/card.component';
import { BaseCodeDto } from '../../../../shared/dto/base.dto';

@Component({
  selector: 'app-decision-condition-types-dialog',
  templateUrl: './board-management-dialog.component.html',
  styleUrls: ['./board-management-dialog.component.scss'],
})
export class BoardManagementDialogComponent implements OnInit {
  title = new FormControl<string | null>(null, [Validators.required]);
  code = new FormControl<string | null>(null, [Validators.required]);
  permittedCardTypes = new FormControl<CardType[]>([], [Validators.required]);
  createCardTypes = new FormControl<CardType[]>([]);
  showOnSchedule = new FormControl<string>('true', [Validators.required]);

  step = 1;

  form = new FormGroup({
    title: this.title,
    code: this.code,
    permittedCardTypes: this.permittedCardTypes,
    createCardTypes: this.createCardTypes,
    showOnSchedule: this.showOnSchedule,
  });

  isLoading = false;
  isEdit = false;
  canDelete = false;
  canDeleteReason = '';
  cardTypes: BaseCodeDto[] = [];
  cardStatuses: CardStatusDto[] = [];
  selectedCardStatuses: CardStatusDto[] = [];
  cardTypeMap: Record<string, string> = {};
  cardCounts: Record<string, number> = {};

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      board: MinimalBoardDto | undefined;
      cardTypes: BaseCodeDto[];
    },
    private dialogRef: MatDialogRef<BoardManagementDialogComponent>,
    private cardStatusService: CardStatusService,
    private adminBoardManagementService: AdminBoardManagementService,
    private formBuilder: FormBuilder,
    private boardService: BoardService
  ) {
    if (data.board) {
      this.isEdit = true;
      this.form.controls.code.disable();
    }
    this.cardTypes = data.cardTypes;

    for (const type of this.cardTypes) {
      this.cardTypeMap[type.code] = type.label;
    }
  }

  async loadBoard(code: string) {
    return await this.boardService.fetchBoardDetail(code);
  }

  ngOnInit(): void {
    this.loadCanDelete();
    this.prepareDialog();
  }

  private async prepareDialog() {
    if (this.data.board) {
      const board = await this.loadBoard(this.data.board.code);

      this.form.patchValue({
        code: board.code,
        title: board.title,
        createCardTypes: board.createCardTypes,
        permittedCardTypes: board.allowedCardTypes,
        showOnSchedule: board.showOnSchedule ? 'true' : 'false',
      });

      await this.loadCardStatuses(board);
    } else {
      await this.loadCardStatuses();
    }
  }

  onNextStep() {
    this.step++;
  }

  onPreviousStep() {
    this.step--;
  }

  async onDelete() {
    const board = this.data.board;
    if (board) {
      await this.adminBoardManagementService.delete(board.code);
      this.dialogRef.close(true);
    }
  }

  onSelectCardStatus(status: CardStatusDto, $event: MatCheckboxChange) {
    if ($event.checked) {
      this.selectedCardStatuses.push(status);
    } else {
      this.selectedCardStatuses = this.selectedCardStatuses.filter((value) => value.code !== status.code);
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.selectedCardStatuses, event.previousIndex, event.currentIndex);
  }

  async onSubmit() {
    this.isLoading = true;

    const mappedStatuses: BoardStatusDto[] = this.selectedCardStatuses.map((status, index) => {
      return {
        order: index,
        label: status.label,
        statusCode: status.code,
      };
    });

    const dto: BoardDto = {
      code: this.code.value!,
      title: this.title.value!,
      statuses: mappedStatuses,
      allowedCardTypes: this.permittedCardTypes.value ?? [],
      createCardTypes: this.createCardTypes.value ?? [],
      showOnSchedule: this.showOnSchedule.value === 'true',
    };

    if (this.isEdit) {
      await this.adminBoardManagementService.update(this.data.board!.code, dto);
    } else {
      await this.adminBoardManagementService.create(dto);
    }
    this.isLoading = false;
    this.dialogRef.close(true);
  }

  private async loadCanDelete() {
    if (this.data.board) {
      const res = await this.adminBoardManagementService.canDelete(this.data.board?.code);
      if (res) {
        this.canDelete = res.canDelete;
        this.canDeleteReason = res.reason;
      }
    }
  }

  private async loadCardStatuses(board?: BoardDto) {
    const cardStatuses = await this.cardStatusService.fetch();

    const boardStatusCodes = board
      ? board.statuses
          .sort((a, b) => {
            return a.order - b.order;
          })
          .map((status) => status.statusCode)
      : [];

    if (board) {
      const cardCounts = await this.adminBoardManagementService.getCardCounts(board.code);
      if (cardCounts) {
        this.cardCounts = cardCounts;
      }
    }

    cardStatuses.forEach((status) => {
      const isSelected = boardStatusCodes.includes(status.code);
      const control = this.formBuilder.control(isSelected);
      if (this.cardCounts[status.code] > 0) {
        control.disable();
      }

      // @ts-ignore Angular wants a strictly typed form, we don't have that as the control names are dynamic
      this.form.addControl(status.code, control);
    });

    this.cardStatuses = cardStatuses;

    boardStatusCodes.forEach((code) => {
      const cardStatus = this.cardStatuses.find((cardStatus) => cardStatus.code === code);
      if (cardStatus) {
        this.selectedCardStatuses.push(cardStatus);
      }
    });
  }
}
