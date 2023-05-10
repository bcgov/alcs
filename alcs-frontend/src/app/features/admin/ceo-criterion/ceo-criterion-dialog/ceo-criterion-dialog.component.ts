import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CeoCriterionDto } from '../../../../services/application/decision/application-decision-v1/application-decision.dto';
import { CeoCriterionService } from '../../../../services/ceo-criterion/ceo-criterion.service';

@Component({
  selector: 'app-ceo-criterion-dialog',
  templateUrl: './ceo-criterion-dialog.component.html',
  styleUrls: ['./ceo-criterion-dialog.component.scss'],
})
export class CeoCriterionDialogComponent {
  description = '';
  label = '';
  code = '';
  number: string | null = null;

  isLoading = false;
  isEdit = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CeoCriterionDto | undefined,
    private dialogRef: MatDialogRef<CeoCriterionDialogComponent>,
    private ceoCriterionService: CeoCriterionService
  ) {
    if (data) {
      this.description = data.description;
      this.label = data.label;
      this.code = data.code;
      this.number = data.number.toString();
    }
    this.isEdit = !!data;
  }

  async onSubmit() {
    this.isLoading = true;

    if (this.number === null) {
      return;
    }

    const dto = {
      number: parseInt(this.number, 10),
      code: this.code,
      label: this.label,
      description: this.description,
    };

    if (this.isEdit) {
      await this.ceoCriterionService.update(this.code, dto);
    } else {
      await this.ceoCriterionService.create(dto);
    }
    this.isLoading = false;
    this.dialogRef.close(true);
  }
}
