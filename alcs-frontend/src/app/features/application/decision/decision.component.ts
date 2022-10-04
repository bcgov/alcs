import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationDecisionDto } from '../../../services/application/application-decision/application-decision.dto';
import { ApplicationDecisionService } from '../../../services/application/application-decision/application-decision.service';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ToastService } from '../../../services/toast/toast.service';
import { DecisionDialogComponent } from './decision-dialog/decision-dialog.component';

@Component({
  selector: 'app-decision',
  templateUrl: './decision.component.html',
  styleUrls: ['./decision.component.scss'],
})
export class DecisionComponent implements OnInit {
  fileNumber: string = '';
  decisionDate: number | undefined;
  decisions: ApplicationDecisionDto[] = [];

  constructor(
    public dialog: MatDialog,
    private applicationDetailService: ApplicationDetailService,
    private decisionService: ApplicationDecisionService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.subscribe((application) => {
      if (application) {
        this.fileNumber = application.fileNumber;
        this.decisionDate = application.decisionDate;
        this.loadDecisions(application.fileNumber);
      }
    });
  }

  async loadDecisions(fileNumber: string) {
    this.decisions = await this.decisionService.fetchByApplication(fileNumber);
  }

  async setDecisionDate(time: number) {
    await this.applicationDetailService.updateApplication({
      fileNumber: this.fileNumber,
      decisionDate: time,
    });
    this.toastService.showSuccessToast('Application updated');
  }

  onCreate() {
    this.dialog
      .open(DecisionDialogComponent, {
        minWidth: '600px',
        maxWidth: '900px',
        maxHeight: '80vh',
        width: '90%',
        data: {
          fileNumber: this.fileNumber,
        },
      })
      .afterClosed()
      .subscribe((didCreate) => {
        if (didCreate) {
          this.loadDecisions(this.fileNumber);
        }
      });
  }

  onEdit(decision: ApplicationDecisionDto) {
    this.dialog
      .open(DecisionDialogComponent, {
        minWidth: '600px',
        maxWidth: '900px',
        maxHeight: '80vh',
        width: '90%',
        data: {
          fileNumber: this.fileNumber,
          existingDecision: decision,
        },
      })
      .afterClosed()
      .subscribe((didCreate) => {
        if (didCreate) {
          this.loadDecisions(this.fileNumber);
        }
      });
  }

  async deleteDecision(uuid: string) {
    await this.decisionService.delete(uuid);
    await this.loadDecisions(this.fileNumber);
    this.toastService.showSuccessToast('Decision deleted');
  }
}
