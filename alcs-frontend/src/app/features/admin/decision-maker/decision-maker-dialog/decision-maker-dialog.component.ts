import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DecisionMakerDto } from '../../../../services/application/decision/application-decision-v1/application-decision.dto';
import { ApplicationDecisionMakerService } from '../../../../services/application/application-decision-maker/application-decision-maker.service';

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
    @Inject(MAT_DIALOG_DATA) public data: DecisionMakerDto | undefined,
    private dialogRef: MatDialogRef<DecisionMakerDialogComponent>,
    private decisionMakerService: ApplicationDecisionMakerService
  ) {
    if (data) {
      this.description = data.description;
      this.label = data.label;
      this.code = data.code;
      this.isActive = data.isActive ? 'true' : 'false';
    }
    this.isEdit = !!data;
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
}
