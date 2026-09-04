import { Component, OnDestroy, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ROLES } from '../../../../services/authentication/authentication.service';
import {
  ComplianceAndEnforcementService,
  DEFAULT_C_AND_E_FETCH_OPTIONS,
  Status,
  statusFromFile,
} from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { UserService } from '../../../../services/user/user.service';

@Component({
  selector: 'app-details-overview',
  templateUrl: './details-overview.component.html',
  styleUrls: ['./details-overview.component.scss'],
    standalone: false
})
export class DetailsOverviewComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  isEditingStatus = false;
  isEditingFilePath = false;

  fileNumber?: string;

  status = new FormControl<Status | null>(null);
  filePath = new FormControl<string | null>(null);

  ROLES = ROLES;
  readonly userProfile = toSignal(this.userService.$userProfile);

  constructor(
    private readonly service: ComplianceAndEnforcementService,
    private readonly userService: UserService,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.service.$file.pipe(takeUntil(this.$destroy)).subscribe((file) => {
      if (file) {
        this.fileNumber = file.fileNumber;
        this.status.setValue(statusFromFile(file));
        this.filePath.setValue(file.filePath);
      }
    });
  }

  startEditStatus() {
    this.isEditingStatus = true;
  }

  endEditStatus() {
    this.isEditingStatus = false;
  }

  cancelEditStatus() {
    if (this.service.$file.value) {
      this.status.setValue(statusFromFile(this.service.$file.value));
    }
    this.endEditStatus();
  }

  startEditFilePath() {
    this.isEditingFilePath = true;
  }

  endEditFilePath() {
    this.isEditingFilePath = false;
  }

  cancelEditFilePath() {
    this.filePath.setValue(this.service.$file.value?.filePath ?? null);
    this.endEditFilePath();
  }

  async saveStatus() {
    if (!this.fileNumber || !this.status.value) {
      return;
    }

    await this.service.setStatus(this.fileNumber, this.status.value, { idType: 'fileNumber' });
    this.service.loadFile(this.fileNumber, DEFAULT_C_AND_E_FETCH_OPTIONS);

    this.endEditStatus();
  }

  async saveFilePath() {
    if (!this.fileNumber || this.filePath.value === undefined || this.filePath.value === null) {
      return;
    }

    await this.service.setFilePath(this.fileNumber, this.filePath.value, { idType: 'fileNumber' });
    this.service.loadFile(this.fileNumber, DEFAULT_C_AND_E_FETCH_OPTIONS);

    this.endEditFilePath();
  }

  async copyFilePath() {
    if (!this.filePath.value) {
      return;
    }

    await navigator.clipboard.writeText(this.filePath.value);

    this.toastService.showSuccessToast('File path copied to clipboard');
  }

  async ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
