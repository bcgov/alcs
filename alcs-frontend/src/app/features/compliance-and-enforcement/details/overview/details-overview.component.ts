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

  fileNumber?: string;

  status = new FormControl<Status | null>(null);

  ROLES = ROLES;
  readonly userProfile = toSignal(this.userService.$userProfile);

  constructor(
    private readonly service: ComplianceAndEnforcementService,
    private readonly userService: UserService,
  ) {}

  ngOnInit(): void {
    this.service.$file.pipe(takeUntil(this.$destroy)).subscribe((file) => {
      if (file) {
        this.fileNumber = file.fileNumber;
        this.status.setValue(statusFromFile(file));
      }
    });
  }

  startEdit() {
    this.isEditingStatus = true;
  }

  endEdit() {
    this.isEditingStatus = false;
  }

  async saveStatus() {
    if (!this.fileNumber || !this.status.value) {
      return;
    }

    await this.service.setStatus(this.fileNumber, this.status.value, { idType: 'fileNumber' });
    this.service.loadFile(this.fileNumber, DEFAULT_C_AND_E_FETCH_OPTIONS);

    this.endEdit();
  }

  async ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
