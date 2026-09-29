import { Component, Input, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom, Subject } from 'rxjs';
import { ROLES } from '../../../../services/authentication/authentication.service';
import { ComplianceAndEnforcementDto } from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';
import {
  ComplianceAndEnforcementService,
  DEFAULT_C_AND_E_FETCH_OPTIONS,
  Status,
  statusFromFile,
} from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { UserService } from '../../../../services/user/user.service';
import { ComplianceAndEnforcementAssignDialogComponent } from './assign-dialog/assign-dialog.component';

@Component({
  selector: 'app-compliance-and-enforcement-details-header',
  templateUrl: './details-header.component.html',
  styleUrls: ['./details-header.component.scss'],
    standalone: false
})
export class DetailsHeaderComponent implements OnDestroy {
  Status = Status;

  $destroy = new Subject<void>();

  fileNumber?: string;
  status: Status | null = null;

  ROLES = ROLES;
  readonly userProfile = toSignal(this.userService.$userProfile);

  constructor(
    private readonly dialog: MatDialog,
    private readonly complianceAndEnforcementService: ComplianceAndEnforcementService,
    private readonly toastService: ToastService,
    private readonly userService: UserService,
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
