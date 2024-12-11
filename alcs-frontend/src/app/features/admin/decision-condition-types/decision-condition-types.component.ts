import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ApplicationDecisionConditionTypeDto } from '../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { DecisionConditionTypesDialogComponent } from './decision-condition-types-dialog/decision-condition-types-dialog.component';
import { ApplicationDecisionConditionTypesService } from '../../../services/application/application-decision-condition-types/application-decision-condition-types.service';
import { NoticeofIntentDecisionConditionTypesService } from '../../../services/notice-of-intent/notice-of-intent-decision-condition-types/notice-of-intent-decision-condition-types.service';
import { NoticeOfIntentDecisionConditionTypeDto } from '../../../services/notice-of-intent/decision-v2/notice-of-intent-decision.dto';
import { ApplicationDecisionConditionService } from '../../../services/application/decision/application-decision-v2/application-decision-condition/application-decision-condition.service';
import { NoticeOfIntentDecisionConditionService } from '../../../services/notice-of-intent/decision-v2/notice-of-intent-decision-condition/notice-of-intent-decision-condition.service';

@Component({
  selector: 'app-decision-condition-types',
  templateUrl: './decision-condition-types.component.html',
  styleUrls: ['./decision-condition-types.component.scss'],
})
export class DecisionConditionTypesComponent implements OnInit {
  @Input() public service:
    | ApplicationDecisionConditionTypesService
    | NoticeofIntentDecisionConditionTypesService
    | undefined;

  @Input() public conditionService:
    | ApplicationDecisionConditionService
    | NoticeOfIntentDecisionConditionService
    | undefined;

  destroy = new Subject<void>();

  decisionConditionTypeDtos: ApplicationDecisionConditionTypeDto[] | NoticeOfIntentDecisionConditionTypeDto[] = [];
  displayedColumns: string[] = ['label', 'description', 'code', 'isActive', 'actions'];

  constructor(
    public dialog: MatDialog,
    private confirmationDialogService: ConfirmationDialogService,
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  async fetch() {
    if (!this.service) return;
    this.decisionConditionTypeDtos = await this.service.fetch();
  }

  async onCreate() {
    const dialog = this.dialog.open(DecisionConditionTypesDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: {
        service: this.service,
        conditionService: this.conditionService,
      },
    });
    dialog.beforeClosed().subscribe(async (result) => {
      if (result) {
        await this.fetch();
      }
    });
  }

  async onEdit(dto: ApplicationDecisionConditionTypeDto | NoticeOfIntentDecisionConditionTypeDto) {
    const dialog = this.dialog.open(DecisionConditionTypesDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: {
        service: this.service,
        conditionService: this.conditionService,
        content: dto,
      },
    });
    dialog.beforeClosed().subscribe(async (result) => {
      if (result) {
        await this.fetch();
      }
    });
  }

  async onDelete(dto: ApplicationDecisionConditionTypeDto | NoticeOfIntentDecisionConditionTypeDto) {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete ${dto.label}?`,
      })
      .subscribe(async (answer) => {
        if (answer) {
          if (!this.service) return;
          await this.service.delete(dto.code);
          await this.fetch();
        }
      });
  }
}
