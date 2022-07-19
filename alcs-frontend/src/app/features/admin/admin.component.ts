import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { DragDropColumn } from '../../shared/drag-drop-board/drag-drop-column.interface';
import { DragDropItem } from '../../shared/drag-drop-board/drag-drop-item.interface';
import { ApplicationService } from '../application/application.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  public cards: DragDropItem[] = [];
  public columns: DragDropColumn[] = [];

  constructor(private applicationService: ApplicationService, public dialog: MatDialog) {}

  async ngOnInit() {
    this.applicationService.$applicationStatuses.subscribe((statuses) => {
      const allStatuses = statuses.map((status) => status.code);

      this.columns = statuses.map((status) => ({
        status: status.code,
        name: status.description,
        allowedTransitions: allStatuses,
      }));
    });

    this.applicationService.$applications.subscribe((applications) => {
      this.cards = applications.map((application) => ({
        status: application.status.code,
        label: application.title,
        assignee: 'Me',
        id: application.fileNumber,
      }));
    });
  }

  onSelected(id: string) {
    this.dialog.open(ApplicationDialog, {
      width: '250px',
      data: { id },
    });
  }

  onDropped($event: { id: string; status: string }) {
    this.applicationService.updateApplication($event.id, {
      statusId: '',
    });
  }
}

@Component({
  selector: 'dialog-animations-example-dialog',
  templateUrl: 'dialog.html',
})
export class ApplicationDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { id: string }) {}
}
