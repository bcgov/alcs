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
    preferredRegionCode: string;
    name: string;
    bceidBusinessGuid: string | null;
    uuid: string;
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
      ...data,
      isFirstNation: data.isFirstNation ? 'true' : 'false',
      isActive: data.isActive ? 'true' : 'false',
    };
    this.title = this.model.uuid ? 'Edit' : 'Create';
  }

  ngOnInit(): void {
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

    const dto = {
      name: this.model.name,
      bceidBusinessGuid: this.model.bceidBusinessGuid,
      isFirstNation: this.model.isFirstNation === 'true',
      isActive: this.model.isActive === 'true',
      preferredRegionCode: this.model.preferredRegionCode,
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
