import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../services/toast/toast.service';
import { CardData } from '../../shared/card/card.component';
import { DragDropColumn } from '../../shared/drag-drop-board/drag-drop-column.interface';
import { ApplicationDto } from '../application/application.dto';
import { ApplicationService } from '../application/application.service';
import { CardDetailDialogComponent } from '../card-detail-dialog/card-detail-dialog.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  public cards: CardData[] = [];
  public columns: DragDropColumn[] = [];

  constructor(
    private applicationService: ApplicationService,
    public dialog: MatDialog,
    private toastService: ToastService
  ) {}

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
      this.cards = applications.map(AdminComponent.mapApplicationDtoToCard);
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
        data: application,
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
        this.toastService.showSuccessToast('Application Updated');
      });
  }

  private static mapApplicationDtoToCard(application: ApplicationDto): CardData {
    return {
      status: application.status,
      title: `${application.fileNumber} (${application.title})`,
      assigneeInitials: application.assignee
        ? `${application.assignee?.givenName.charAt(0)}${application.assignee?.familyName.charAt(0)}`
        : undefined,
      id: application.fileNumber,
      type: 'LUP',
      activeDays: application.activeDays,
      paused: application.paused,
    };
  }
}
