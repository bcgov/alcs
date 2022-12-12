import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { BoardStatusDto } from '../../../../services/board/board.dto';
import { BoardService } from '../../../../services/board/board.service';
import { CardUpdateDto } from '../../../../services/card/card.dto';
import { CardService } from '../../../../services/card/card.service';
import { PlanningReviewDto } from '../../../../services/planning-review/planning-review.dto';
import { ToastService } from '../../../../services/toast/toast.service';
import { AssigneeDto } from '../../../../services/user/user.dto';
import { UserService } from '../../../../services/user/user.service';
import { PLANNING_TYPE_LABEL } from '../../../../shared/application-type-pill/application-type-pill.constants';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-detail-dialog',
  templateUrl: './planning-review-dialog.component.html',
  styleUrls: ['./planning-review-dialog.component.scss'],
})
export class PlanningReviewDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  $users: Observable<AssigneeDto[]> | undefined;
  selectedAssignee?: AssigneeDto;
  selectedAssigneeName?: string;
  selectedApplicationStatus = '';
  selectedBoard?: string;
  selectedRegion?: string;
  title?: string;
  planningType = PLANNING_TYPE_LABEL;

  planningReview: PlanningReviewDto = this.data;
  isDirty = false;
  boardStatuses: BoardStatusDto[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PlanningReviewDto,
    private dialogRef: MatDialogRef<PlanningReviewDialogComponent>,
    private userService: UserService,
    private cardService: CardService,
    private boardService: BoardService,
    private toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.planningReview = this.data;
    this.selectedAssignee = this.data.card.assignee;
    this.selectedAssigneeName = this.selectedAssignee?.name;
    this.selectedApplicationStatus = this.data.card.status.code;
    this.selectedBoard = this.data.card.board.code;
    this.selectedRegion = this.data.region.code;

    this.$users = this.userService.$assignableUsers;
    this.userService.fetchAssignableUsers();

    this.dialogRef.backdropClick().subscribe(() => {
      this.dialogRef.close(this.isDirty);
    });

    this.boardService.$boards.pipe(takeUntil(this.$destroy)).subscribe((boards) => {
      const loadedBoard = boards.find((board) => board.code === this.selectedBoard);
      if (loadedBoard) {
        this.boardStatuses = loadedBoard.statuses;
      }
    });

    this.title = this.planningReview.fileNumber;
  }

  filterAssigneeList(term: string, item: AssigneeDto) {
    const termLower = term.toLocaleLowerCase();
    return (
      item.email.toLocaleLowerCase().indexOf(termLower) > -1 || item.name.toLocaleLowerCase().indexOf(termLower) > -1
    );
  }

  onAssigneeSelected(assignee: AssigneeDto) {
    this.selectedAssignee = assignee;
    this.planningReview.card.assignee = assignee;
    this.updateCard({
      assigneeUuid: assignee?.uuid ?? null,
    });
  }

  onStatusSelected(applicationStatus: BoardStatusDto) {
    this.selectedApplicationStatus = applicationStatus.statusCode;
    this.updateCard({
      statusCode: applicationStatus.statusCode,
    });
  }

  updateCard(changes: Omit<CardUpdateDto, 'uuid'>) {
    this.cardService
      .updateCard({
        ...changes,
        uuid: this.planningReview.card.uuid,
      })
      .then(() => {
        this.isDirty = true;
        this.toastService.showSuccessToast('Card updated');
      });
  }

  onTogglePriority() {
    const answer = this.confirmationDialogService.openDialog({
      body: this.planningReview.card.highPriority ? 'Remove priority from this card?' : 'Add priority to this card?',
    });
    answer.subscribe((answer) => {
      if (answer) {
        this.cardService
          .updateCard({
            uuid: this.planningReview.card.uuid,
            highPriority: !this.planningReview.card.highPriority,
            assigneeUuid: this.planningReview.card.assignee?.uuid,
          })
          .then(() => {
            this.isDirty = true;
            this.planningReview.card.highPriority = !this.planningReview.card.highPriority;
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
