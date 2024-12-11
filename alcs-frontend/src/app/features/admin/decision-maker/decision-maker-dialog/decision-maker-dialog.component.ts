import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApplicationDecisionMakerService } from '../../../../services/application/application-decision-maker/application-decision-maker.service';
import { DecisionMakerDto } from '../../../../services/application/decision/application-decision-v2/application-decision.dto';
import { NgModel } from '@angular/forms';
import { codeExistsDirectiveValidator } from '../../../../shared/validators/code-exists-validator';

@Component({
  selector: 'app-decision-maker-dialog',
  templateUrl: './decision-maker-dialog.component.html',
  styleUrls: ['./decision-maker-dialog.component.scss'],
})
export class DecisionMakerDialogComponent {
  description = '';
  label = '';
  code = '';
  isActive: string = 'true';

  isLoading = false;
  isEdit = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      decisionMaker: DecisionMakerDto | undefined;
      existingCodes: string[];
    },
    private dialogRef: MatDialogRef<DecisionMakerDialogComponent>,
    private decisionMakerService: ApplicationDecisionMakerService,
  ) {
    if (data?.decisionMaker) {
      this.description = data.decisionMaker.description;
      this.label = data.decisionMaker.label;
      this.code = data.decisionMaker.code;
      this.isActive = data.decisionMaker.isActive ? 'true' : 'false';
    }
    this.isEdit = !!data?.decisionMaker;
  }

  async onSubmit() {
    this.isLoading = true;

    const dto: DecisionMakerDto = {
      isActive: this.isActive === 'true',
      code: this.code,
      label: this.label,
      description: this.description,
    };

    if (this.isEdit) {
      await this.decisionMakerService.update(this.code, dto);
    } else {
      await this.decisionMakerService.create(dto);
    }
    this.isLoading = false;
    this.dialogRef.close(true);
  }

  isCodeExisiting(model: NgModel) {
    return codeExistsDirectiveValidator(model, this.data.existingCodes, this.code);
  }
}
