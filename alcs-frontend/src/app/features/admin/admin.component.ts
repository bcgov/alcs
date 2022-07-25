import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CardDetailDialogComponent } from '../../card-detail-dialog/card-detail-dialog.component';
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
        name: status.label,
        allowedTransitions: allStatuses,
      }));
    });

    this.applicationService.$applications.subscribe((applications) => {
      this.cards = applications.map((application) => ({
        status: application.status,
        label: application.title,
        assignee: 'Me',
        id: application.fileNumber,
      }));
    });

    this.applicationService.refreshApplications();
  }

  async onSelected(id: string) {
    try {
      const application = await this.applicationService.fetchApplication(id);
      this.dialog.open(CardDetailDialogComponent, {
        minHeight: '500px',
        minWidth: '250px',
        height: '80%',
        width: '40%',
        data: {
          fileNumber: application.fileNumber,
          title: application.title,
          body: application.body,
          status: application.status,
        },
      });
    } catch (err) {
      console.log(err);
    }
  }

  onDropped($event: { id: string; status: string }) {
    this.applicationService
      .updateApplication({
        fileNumber: $event.id,
        status: $event.status,
      })
      .then((r) => {
        //TODO: Move this to a toast
        console.log('Application Updated');
      });
  }
}
