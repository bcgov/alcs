import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LocalGovernmentDto } from '../../../../services/admin-local-government/admin-local-government.dto';
import { AdminLocalGovernmentService } from '../../../../services/admin-local-government/admin-local-government.service';

@Component({
  selector: 'app-admin-local-government-dialog',
  templateUrl: './local-government-dialog.component.html',
  styleUrls: ['./local-government-dialog.component.scss'],
})
export class LocalGovernmentDialogComponent {
  title: string = 'Create';
  model: {
    isFirstNation: string;
    isActive: string;
    preferredRegionCode: string;
    name: string;
    bceidBusinessGuid: string | null;
    uuid: string;
  };

  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: LocalGovernmentDto,
    private dialogRef: MatDialogRef<LocalGovernmentDialogComponent>,
    private localGovernmentService: AdminLocalGovernmentService
  ) {
    this.model = {
      ...data,
      isFirstNation: data.isFirstNation ? 'true' : 'false',
      isActive: data.isActive ? 'true' : 'false',
    };
    this.title = this.model.uuid ? 'Edit' : 'Create';
  }

  async onSubmit() {
    this.isLoading = true;

    const dto = {
      name: this.model.name,
      bceidBusinessGuid: this.model.bceidBusinessGuid,
      isFirstNation: this.model.isFirstNation === 'true',
      isActive: this.model.isActive === 'true',
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
