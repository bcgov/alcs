import { Component, Input, OnDestroy } from '@angular/core';
import { firstValueFrom, of, Subject } from 'rxjs';
import { ComplianceAndEnforcementDto } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import {
  ComplianceAndEnforcementService,
  DEFAULT_C_AND_E_FETCH_OPTIONS,
  Status,
  statusFromFile,
} from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { ComplianceAndEnforcementAssignDialogComponent } from './assign-dialog/assign-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../../../services/toast/toast.service';

@Component({
  selector: 'app-compliance-and-enforcement-details-header',
  templateUrl: './details-header.component.html',
  styleUrls: ['./details-header.component.scss'],
})
export class DetailsHeaderComponent implements OnDestroy {
  Status = Status;

  $destroy = new Subject<void>();

  fileNumber?: string;
  status: Status | null = null;

  constructor(
    private readonly dialog: MatDialog,
    private readonly complianceAndEnforcementService: ComplianceAndEnforcementService,
    private readonly toastService: ToastService,
  ) {}

  private _file?: ComplianceAndEnforcementDto;
  @Input() set file(file: ComplianceAndEnforcementDto | undefined) {
    if (file) {
      this._file = file;
      this.fileNumber = file?.fileNumber;
      this.status = statusFromFile(file);
    }
  }
  get file() {
    return this._file;
  }

  @Input() propertyOwnerName?: string;

  openAssignDialog() {
    this.dialog
      .open(ComplianceAndEnforcementAssignDialogComponent, {
        data: {
          assigneeUuid: this.file?.assignee?.uuid ?? null,
        },
        width: '600px',
      })
      .afterClosed()
      .subscribe(async ({ saved, officerUuid }) => {
        if (saved) {
          if (officerUuid === undefined) {
            console.error('No officer UUID returned from dialog');
            this.toastService.showErrorToast('No officer UUID returned from dialog');
            return;
          }

          if (!this.fileNumber) {
            console.error('No file number set, cannot assign officer');
            this.toastService.showErrorToast('No file number set, cannot assign officer');
            return;
          }

          try {
            await this.saveAssignedOfficer(this.fileNumber, officerUuid);
          } catch (error) {
            console.error('Error saving assigned officer:', error);
            this.toastService.showErrorToast('Error saving assigned officer');
            return;
          }

          await this.complianceAndEnforcementService.loadFile(this.fileNumber, DEFAULT_C_AND_E_FETCH_OPTIONS);
        }
      });
  }

  private async saveAssignedOfficer(fileNumber: string, officerUuid: string) {
    try {
      await firstValueFrom(
        this.complianceAndEnforcementService.update(
          fileNumber,
          { assigneeUuid: officerUuid },
          { idType: 'fileNumber' },
        ),
      );
      this.toastService.showSuccessToast('Compliance and Enforcement Officer assigned');
    } catch (error) {
      console.error('Error assigning Compliance and Enforcement Officer:', error);
      this.toastService.showErrorToast('Error assigning Compliance and Enforcement Officer');
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
