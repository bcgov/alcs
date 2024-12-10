import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CeoCriterionService } from '../../../../services/ceo-criterion/ceo-criterion.service';
import { NgModel } from '@angular/forms';
import { CeoCriterionDto } from '../../../../services/application/decision/application-decision-v2/application-decision.dto';
import { codeExistsDirectiveValidator } from 'src/app/shared/validators/code-exists-validator';

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
    @Inject(MAT_DIALOG_DATA)
    public data: {
      ceoCriterion: CeoCriterionDto | undefined;
      existingCodes: string[];
    },
    private dialogRef: MatDialogRef<CeoCriterionDialogComponent>,
    private ceoCriterionService: CeoCriterionService,
  ) {
    if (data?.ceoCriterion) {
      this.description = data.ceoCriterion.description;
      this.label = data.ceoCriterion.label;
      this.code = data.ceoCriterion.code;
      this.number = data.ceoCriterion.number.toString();
    }
    this.isEdit = !!data?.ceoCriterion;
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

  isCodeExisting(model: NgModel) {
    return codeExistsDirectiveValidator(model, this.data.existingCodes, this.code);
  }
}
