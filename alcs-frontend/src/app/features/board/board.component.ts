import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationTypeDto } from '../../services/application/application-code.dto';
import { ToastService } from '../../services/toast/toast.service';
import { CardData } from '../../shared/card/card.component';
import { DragDropColumn } from '../../shared/drag-drop-board/drag-drop-column.interface';
import { ApplicationDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { CardDetailDialogComponent } from '../card-detail-dialog/card-detail-dialog.component';
import { CreateCardDialogComponent } from '../create-card-detail-dialog/create-card-dialog.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  public cards: CardData[] = [];
  public columns: DragDropColumn[] = [];

  private applicationTypes: ApplicationTypeDto[] = [];

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

    this.applicationService.$applicationTypes.subscribe((types) => {
      this.applicationTypes = types;
    });

    this.applicationService.$applications.subscribe((applications) => {
      this.cards = applications.map(this.mapApplicationDtoToCard.bind(this));
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

  async onCreate() {
    this.dialog.open(CreateCardDialogComponent, {
      minHeight: '500px',
      minWidth: '250px',
      height: '80%',
      width: '40%',
      data: {},
    });
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

  private mapApplicationDtoToCard(application: ApplicationDto): CardData {
    const mappedType = this.applicationTypes.find((type) => type.code === application.type);
    return {
      status: application.status,
      title: `${application.fileNumber} (${application.applicant})`,
      assigneeInitials: application.assignee
        ? `${application.assignee?.givenName.charAt(0)}${application.assignee?.familyName.charAt(0)}`
        : undefined,
      id: application.fileNumber,
      type: mappedType!,
      activeDays: application.activeDays,
      paused: application.paused,
    };
  }
}
