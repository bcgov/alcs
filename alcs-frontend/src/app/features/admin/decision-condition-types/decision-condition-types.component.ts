import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ApplicationDecisionConditionTypeDto } from '../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { DecisionConditionTypesService } from '../../../services/decision-condition-types/decision-condition-types.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { DecisionConditionTypesDialogComponent } from './decision-condition-types-dialog/decision-condition-types-dialog.component';

@Component({
  selector: 'app-decision-condition-types',
  templateUrl: './decision-condition-types.component.html',
  styleUrls: ['./decision-condition-types.component.scss'],
})
export class DecisionConditionTypesComponent implements OnInit {
  destroy = new Subject<void>();

  decisionConditionTypeDtos: ApplicationDecisionConditionTypeDto[] = [];
  displayedColumns: string[] = ['label', 'description', 'code', 'actions'];

  constructor(
    private decisionConditionTypesService: DecisionConditionTypesService,
    public dialog: MatDialog,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  async fetch() {
    this.decisionConditionTypeDtos = await this.decisionConditionTypesService.fetch();
  }

  async onCreate() {
    const dialog = this.dialog.open(DecisionConditionTypesDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
    });
    dialog.beforeClosed().subscribe(async (result) => {
      if (result) {
        await this.fetch();
      }
    });
  }

  async onEdit(decisionConditionTypeDto: ApplicationDecisionConditionTypeDto) {
    const dialog = this.dialog.open(DecisionConditionTypesDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: decisionConditionTypeDto,
    });
    dialog.beforeClosed().subscribe(async (result) => {
      if (result) {
        await this.fetch();
      }
    });
  }

  async onDelete(decisionConditionTypeDto: ApplicationDecisionConditionTypeDto) {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete ${decisionConditionTypeDto.label}?`,
      })
      .subscribe(async (answer) => {
        if (answer) {
          await this.decisionConditionTypesService.delete(decisionConditionTypeDto.code);
          await this.fetch();
        }
      });
  }
}
