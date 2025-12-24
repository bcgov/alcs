import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ApplicationDecisionMakerService } from '../../../services/application/application-decision-maker/application-decision-maker.service';
import { DecisionMakerDto } from '../../../services/application/decision/application-decision-v2/application-decision.dto';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { DecisionMakerDialogComponent } from './decision-maker-dialog/decision-maker-dialog.component';

@Component({
    selector: 'app-decision-maker',
    templateUrl: './decision-maker.component.html',
    styleUrls: ['./decision-maker.component.scss'],
    standalone: false
})
export class DecisionMakerComponent implements OnInit {
  destroy = new Subject<void>();

  decisionMakers: DecisionMakerDto[] = [];
  displayedColumns: string[] = ['label', 'description', 'code', 'isActive', 'actions'];

  constructor(
    private decisionMakerService: ApplicationDecisionMakerService,
    public dialog: MatDialog,
    private confirmationDialogService: ConfirmationDialogService,
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  async fetch() {
    this.decisionMakers = await this.decisionMakerService.fetch();
  }

  async onCreate() {
    const dialog = this.dialog.open(DecisionMakerDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: { existingCodes: this.decisionMakers.map((dm) => dm.code.toLowerCase()) },
    });
    dialog.beforeClosed().subscribe(async (result) => {
      if (result) {
        await this.fetch();
      }
    });
  }

  async onEdit(decisionMakerDto: DecisionMakerDto) {
    const dialog = this.dialog.open(DecisionMakerDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: { decisionMaker: decisionMakerDto, existingCodes: this.decisionMakers.map((dm) => dm.code.toLowerCase()) },
    });
    dialog.beforeClosed().subscribe(async (result) => {
      if (result) {
        await this.fetch();
      }
    });
  }

  async onDelete(decisionMakerDto: DecisionMakerDto) {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete ${decisionMakerDto.label}?`,
      })
      .subscribe(async (answer) => {
        if (answer) {
          await this.decisionMakerService.delete(decisionMakerDto.code);
          await this.fetch();
        }
      });
  }
}
