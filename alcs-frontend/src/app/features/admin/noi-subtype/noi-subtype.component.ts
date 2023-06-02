import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { NoiSubtypeService } from '../../../services/noi-subtype/noi-subtype.service';
import { NoticeOfIntentSubtypeDto } from '../../../services/notice-of-intent/notice-of-intent.dto';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { NoiSubtypeDialogComponent } from './noi-subtype-dialog/noi-subtype-dialog.component';

@Component({
  selector: 'app-noi-subtype',
  templateUrl: './noi-subtype.component.html',
  styleUrls: ['./noi-subtype.component.scss'],
})
export class NoiSubtypeComponent implements OnInit {
  destroy = new Subject<void>();

  subtypes: NoticeOfIntentSubtypeDto[] = [];
  displayedColumns: string[] = ['label', 'description', 'code', 'isActive', 'actions'];

  constructor(
    private noiSubtypeService: NoiSubtypeService,
    public dialog: MatDialog,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  async fetch() {
    this.subtypes = await this.noiSubtypeService.fetch();
  }

  async onCreate() {
    const dialog = this.dialog.open(NoiSubtypeDialogComponent, {
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

  async onEdit(subtypeDto: NoticeOfIntentSubtypeDto) {
    const dialog = this.dialog.open(NoiSubtypeDialogComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      width: '70%',
      data: subtypeDto,
    });
    dialog.beforeClosed().subscribe(async (result) => {
      if (result) {
        await this.fetch();
      }
    });
  }

  async onDelete(subtypeDto: NoticeOfIntentSubtypeDto) {
    this.confirmationDialogService
      .openDialog({
        body: `Are you sure you want to delete ${subtypeDto.label}?`,
      })
      .subscribe(async (answer) => {
        if (answer) {
          await this.noiSubtypeService.delete(subtypeDto.code);
          await this.fetch();
        }
      });
  }
}
