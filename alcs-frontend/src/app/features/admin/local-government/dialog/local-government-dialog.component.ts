import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { LocalGovernmentDto } from '../../../../services/admin-local-government/admin-local-government.dto';
import { AdminLocalGovernmentService } from '../../../../services/admin-local-government/admin-local-government.service';
import { ApplicationRegionDto } from '../../../../services/application/application-code.dto';
import { ApplicationService } from '../../../../services/application/application.service';

@Component({
  selector: 'app-admin-local-government-dialog',
  templateUrl: './local-government-dialog.component.html',
  styleUrls: ['./local-government-dialog.component.scss'],
})
export class LocalGovernmentDialogComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  title: string = 'Create';
  model: {
    isFirstNation: string;
    isActive: string;
    preferredRegionCode: string | null;
    name: string;
    bceidBusinessGuid: string | null;
    uuid?: string;
    emails: string;
  };
  regions: ApplicationRegionDto[] = [];

  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: LocalGovernmentDto,
    private dialogRef: MatDialogRef<LocalGovernmentDialogComponent>,
    private localGovernmentService: AdminLocalGovernmentService,
    private applicationService: ApplicationService
  ) {
    this.model = {
      emails: '',
      isActive: '',
      name: '',
      isFirstNation: 'false',
      preferredRegionCode: null,
      bceidBusinessGuid: null,
    };
  }

  ngOnInit(): void {
    if (this.data) {
      this.model = {
        ...this.data,
        isFirstNation: this.data.isFirstNation ? 'true' : 'false',
        isActive: this.data.isActive ? 'true' : 'false',
        emails: this.data.emails ? this.data.emails.join(', ') : '',
      };
      this.title = this.model.uuid ? 'Edit' : 'Create';
    }

    this.applicationService.$applicationRegions.pipe(takeUntil(this.$destroy)).subscribe((regions) => {
      this.regions = regions;
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onSubmit() {
    this.isLoading = true;

    if (this.model) {
      const dto = {
        name: this.model.name,
        bceidBusinessGuid: this.model.bceidBusinessGuid || null,
        isFirstNation: this.model.isFirstNation === 'true',
        isActive: this.model.isActive === 'true',
        preferredRegionCode: this.model.preferredRegionCode,
        emails: this.model.emails.split(', '),
      };

      if (this.model.uuid) {
        await this.localGovernmentService.update(this.model.uuid, dto);
      } else {
        await this.localGovernmentService.create(dto);
      }
      this.isLoading = false;
      this.dialogRef.close(true);
    }
  }
}
