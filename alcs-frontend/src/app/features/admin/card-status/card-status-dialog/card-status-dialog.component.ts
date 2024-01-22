import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CardStatusDto } from '../../../../services/application/application-code.dto';
import { CardStatusService } from '../../../../services/card/card-status/card-status.service';

@Component({
  selector: 'app-decision-condition-types-dialog',
  templateUrl: './card-status-dialog.component.html',
  styleUrls: ['./card-status-dialog.component.scss'],
})
export class CardStatusDialogComponent implements OnInit {
  description = '';
  label = '';
  code = '';

  isLoading = false;
  isEdit = false;
  canDelete = false;
  canDeleteReason = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CardStatusDto | undefined,
    private dialogRef: MatDialogRef<CardStatusDialogComponent>,
    private cardStatusService: CardStatusService
  ) {
    if (data) {
      this.description = data.description;
      this.label = data.label;
      this.code = data.code;
    }
    this.isEdit = !!data;
  }

  async onSubmit() {
    this.isLoading = true;

    const dto = {
      code: this.code,
      label: this.label,
      description: this.description,
    };

    if (this.isEdit) {
      await this.cardStatusService.update(this.code, dto);
    } else {
      await this.cardStatusService.create(dto);
    }
    this.isLoading = false;
    this.dialogRef.close(true);
  }

  ngOnInit(): void {
    this.loadCanDelete();
  }

  private async loadCanDelete() {
    const res = await this.cardStatusService.canDelete(this.code);
    if (res) {
      this.canDelete = res.canDelete;
      this.canDeleteReason = res.reason;
    }
  }

  async onDelete() {
    await this.cardStatusService.delete(this.code);
    this.dialogRef.close(true);
  }
}
