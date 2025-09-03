import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  ComplianceAndEnforcementService,
  Status,
  statusFromFile,
} from '../../../../services/compliance-and-enforcement/compliance-and-enforcement.service';

@Component({
  selector: 'app-details-overview',
  templateUrl: './details-overview.component.html',
  styleUrls: ['./details-overview.component.scss'],
})
export class DetailsOverviewComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();

  isEditingStatus = false;

  fileNumber?: string;

  status = new FormControl<Status | null>(null);

  constructor(private readonly service: ComplianceAndEnforcementService) {}

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
    this.service.loadFile(this.fileNumber, { withProperty: true });

    this.endEdit();
  }

  async ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
