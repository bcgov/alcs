import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { CeoCriterionDto } from '../../../services/application/decision/application-decision-v1/application-decision.dto';
import { CeoCriterionService } from '../../../services/ceo-criterion/ceo-criterion.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { CeoCriterionDialogComponent } from './ceo-criterion-dialog/ceo-criterion-dialog.component';

@Component({
  selector: 'app-ceo-criterion',
  templateUrl: './ceo-criterion.component.html',
  styleUrls: ['./ceo-criterion.component.scss'],
})
export class CeoCriterionComponent implements OnInit {
  destroy = new Subject<void>();

  ceoCriterion: CeoCriterionDto[] = [];
  displayedColumns: string[] = ['number', 'label', 'description', 'code', 'actions'];

  constructor(
    private ceoCriterionService: CeoCriterionService,
    public dialog: MatDialog,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  async fetch() {
    this.ceoCriterion = await this.ceoCriterionService.fetch();
  }

  async onCreate() {
    const dialog = this.dialog.open(CeoCriterionDialogComponent, {
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

  async onEdit(ceoCriterion: CeoCriterionDto) {
    const dialog = this.dialog.open(CeoCriterionDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: ceoCriterion,
    });
    dialog.beforeClosed().subscribe(async (result) => {
      if (result) {
        await this.fetch();
      }
    });
  }

  async onDelete(ceoCriterion: CeoCriterionDto) {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete ${ceoCriterion.label}?`,
      })
      .subscribe(async (answer) => {
        if (answer) {
          await this.ceoCriterionService.delete(ceoCriterion.code);
          await this.fetch();
        }
      });
  }
}
