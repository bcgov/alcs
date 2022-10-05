import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ApplicationDecisionDto,
  ApplicationDecisionOutComeDto,
} from '../../../services/application/application-decision/application-decision.dto';
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
  codes: ApplicationDecisionOutComeDto[] = [];

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
    const { decisions, codes } = await this.decisionService.fetchByApplication(fileNumber);
    this.decisions = decisions;
    this.codes = codes;
  }

  mapCodeToLabel(outcomeCode: string) {
    return this.codes.find((code) => code.code == outcomeCode)!.label;
  }

  onCreate() {
    let minDate = new Date(0);
    if (this.decisions.length > 0) {
      minDate = new Date(this.decisions[this.decisions.length - 1].date);
    }

    debugger;

    this.dialog
      .open(DecisionDialogComponent, {
        minWidth: '600px',
        maxWidth: '900px',
        maxHeight: '80vh',
        width: '90%',
        data: {
          minDate,
          fileNumber: this.fileNumber,
          codes: this.codes,
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
    const decisionIndex = this.decisions.indexOf(decision);
    let minDate = new Date(0);
    if (decisionIndex !== this.decisions.length - 1) {
      minDate = new Date(this.decisions[this.decisions.length - 1].date);
    }
    this.dialog
      .open(DecisionDialogComponent, {
        minWidth: '600px',
        maxWidth: '900px',
        maxHeight: '80vh',
        width: '90%',
        data: {
          minDate,
          fileNumber: this.fileNumber,
          codes: this.codes,
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

  async attachFile(decisionUuid: string, event: Event) {
    const element = event.target as HTMLInputElement;
    const fileList = element.files;
    if (fileList && fileList.length > 0) {
      const file: File = fileList[0];
      const uploadedFile = await this.decisionService.uploadFile(decisionUuid, file);
      if (uploadedFile) {
        await this.loadDecisions(this.fileNumber);
      }
    }
  }

  async downloadFile(decisionUuid: string, decisionDocumentUuid: string, fileName: string) {
    await this.decisionService.downloadFile(decisionUuid, decisionDocumentUuid, fileName, false);
  }

  async openFile(decisionUuid: string, decisionDocumentUuid: string, fileName: string) {
    await this.decisionService.downloadFile(decisionUuid, decisionDocumentUuid, fileName);
  }

  async deleteFile(decisionUuid: string, decisionDocumentUuid: string) {
    await this.decisionService.deleteFile(decisionUuid, decisionDocumentUuid);
    await this.loadDecisions(this.fileNumber);
  }
}
