import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CeoCriterionDto } from '../../../../services/application/decision/application-decision-v1/application-decision.dto';
import { CeoCriterionService } from '../../../../services/ceo-criterion/ceo-criterion.service';
import { NoiSubtypeService } from '../../../../services/noi-subtype/noi-subtype.service';
import { NoticeOfIntentSubtypeDto } from '../../../../services/notice-of-intent/notice-of-intent.dto';
import { NoticeOfIntentService } from '../../../../services/notice-of-intent/notice-of-intent.service';

@Component({
  selector: 'app-noi-subtype-dialog',
  templateUrl: './noi-subtype-dialog.component.html',
  styleUrls: ['./noi-subtype-dialog.component.scss'],
})
export class NoiSubtypeDialogComponent {
  description = '';
  label = '';
  code = '';
  isActive = 'true';

  isLoading = false;
  isEdit = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: NoticeOfIntentSubtypeDto | undefined,
    private dialogRef: MatDialogRef<NoiSubtypeDialogComponent>,
    private noiSubtypeService: NoiSubtypeService
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

    const dto: NoticeOfIntentSubtypeDto = {
      code: this.code,
      label: this.label,
      description: this.description,
      isActive: this.isActive === 'true',
    };

    if (this.isEdit) {
      await this.noiSubtypeService.update(this.code, dto);
    } else {
      await this.noiSubtypeService.create(dto);
    }
    this.isLoading = false;
    this.dialogRef.close(true);
  }
}
