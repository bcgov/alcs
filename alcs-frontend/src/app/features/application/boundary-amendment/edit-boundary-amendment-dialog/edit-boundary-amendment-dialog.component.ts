import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import { ApplicationBoundaryAmendmentDto } from '../../../../services/application/application-boundary-amendments/application-boundary-amendment.dto';
import { ApplicationBoundaryAmendmentService } from '../../../../services/application/application-boundary-amendments/application-boundary-amendment.service';
import { ApplicationDecisionV2Service } from '../../../../services/application/decision/application-decision-v2/application-decision-v2.service';
import { ToastService } from '../../../../services/toast/toast.service';

@Component({
  selector: 'app-boundary-amendment-dialog',
  templateUrl: './edit-boundary-amendment-dialog.component.html',
  styleUrls: ['./edit-boundary-amendment-dialog.component.scss'],
})
export class EditBoundaryAmendmentDialogComponent implements OnInit {
  uuid = new FormControl<string | null>(null);
  type = new FormControl<string | any>('', [Validators.required]);
  decisionComponents = new FormControl<string[]>([], [Validators.required]);
  area = new FormControl<string | null>(null, [Validators.required]);
  year = new FormControl<string | null>(null);
  period = new FormControl<string | null>(null);

  years: string[] = [];
  selectableComponents: { label: string; value: string }[] = [];

  form: FormGroup = new FormGroup({
    uuid: this.uuid,
    type: this.type,
    decisionComponents: this.decisionComponents,
    area: this.area,
    year: this.year,
    period: this.period,
  });

  constructor(
    public matDialogRef: MatDialogRef<EditBoundaryAmendmentDialogComponent>,
    private applicationBoundaryAmendmentService: ApplicationBoundaryAmendmentService,
    private applicationDecisionV2Service: ApplicationDecisionV2Service,
    private toastService: ToastService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      existingAmendment?: ApplicationBoundaryAmendmentDto;
      fileNumber: string;
      uuid: string;
    },
  ) {}

  ngOnInit(): void {
    const existingAmendment = this.data.existingAmendment;
    if (existingAmendment) {
      this.form.patchValue({
        uuid: existingAmendment.uuid,
        type: existingAmendment.type,
        area: existingAmendment.area,
        year: existingAmendment.year?.toString(),
        period: existingAmendment.period?.toString(),
        decisionComponents: existingAmendment.decisionComponents.map((component) => component.uuid),
      });
    }

    this.loadComponents();

    const nextYear = moment().year() + 1;
    for (let i = nextYear; i >= 1974; i--) {
      this.years.push(i.toString(10));
    }
  }

  async loadComponents() {
    const decisions = await this.applicationDecisionV2Service.fetchByApplication(this.data.fileNumber);
    const mappedComponents = [];

    for (const decision of decisions) {
      const decisionLabel = decision.resolutionNumber
        ? `#${decision.resolutionNumber}/${decision.resolutionYear}`
        : 'Draft';
      for (const component of decision.components) {
        mappedComponents.push({
          label: `${decisionLabel} ${component.applicationDecisionComponentType?.label}`,
          value: component.uuid!,
        });
      }
    }

    this.selectableComponents = mappedComponents;
  }

  async onConfirm() {
    const dto = {
      type: this.type.value,
      area: parseFloat(this.area.value!),
      year: this.year.value ? parseInt(this.year.value) : undefined,
      period: this.period.value ? parseInt(this.period.value) : undefined,
      decisionComponentUuids: this.decisionComponents.value ?? [],
    };

    if (this.data.existingAmendment) {
      await this.applicationBoundaryAmendmentService.update(this.data.existingAmendment.uuid, dto);
    } else {
      await this.applicationBoundaryAmendmentService.create(this.data.fileNumber, dto);
    }
    this.matDialogRef.close(true);
  }

  onCopy() {
    if (this.uuid.value) {
      navigator.clipboard.writeText(this.uuid.value);
      this.toastService.showSuccessToast(`${this.uuid.value} copied to clipboard.`);
    }
  }
}
