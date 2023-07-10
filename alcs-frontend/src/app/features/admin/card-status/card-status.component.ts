import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { CardStatusDto } from '../../../services/application/application-code.dto';
import { CardStatusService } from '../../../services/card/card-status/card-status.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { CardStatusDialogComponent } from './card-status-dialog/card-status-dialog.component';

@Component({
  selector: 'app-card-status',
  templateUrl: './card-status.component.html',
  styleUrls: ['./card-status.component.scss'],
})
export class CardStatusComponent implements OnInit {
  destroy = new Subject<void>();

  cardStatusDtos: CardStatusDto[] = [];
  displayedColumns: string[] = ['label', 'description', 'code', 'actions'];

  constructor(
    private cardStatusService: CardStatusService,
    public dialog: MatDialog,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  async fetch() {
    this.cardStatusDtos = await this.cardStatusService.fetch();
  }

  async onCreate() {
    const dialog = this.dialog.open(CardStatusDialogComponent, {
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

  async onEdit(cardStatusDto: CardStatusDto) {
    const dialog = this.dialog.open(CardStatusDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: cardStatusDto,
    });
    dialog.beforeClosed().subscribe(async (result) => {
      if (result) {
        await this.fetch();
      }
    });
  }

  async onDelete(cardStatusDto: CardStatusDto) {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete ${cardStatusDto.label}?`,
      })
      .subscribe(async (answer) => {
        if (answer) {
          await this.cardStatusService.delete(cardStatusDto.code);
          await this.fetch();
        }
      });
  }
}
