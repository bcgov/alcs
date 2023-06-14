import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ApplicationSubmissionUpdateDto } from '../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { EditApplicationSteps } from '../../edit-submission.component';
import { StepComponent } from '../../step.partial';
import { ChangeSubtypeConfirmationDialogComponent } from './change-subtype-confirmation-dialog/change-subtype-confirmation-dialog.component';

@Component({
  selector: 'app-naru-proposal',
  templateUrl: './naru-proposal.component.html',
  styleUrls: ['./naru-proposal.component.scss'],
})
export class NaruProposalComponent extends StepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Proposal;

  previousSubtype: string | null = null;
  subtype = new FormControl<string | null>(null, [Validators.required]);

  form = new FormGroup({
    subtype: this.subtype,
  });
  private fileId = '';
  private submissionUuid = '';

  constructor(
    private router: Router,
    private applicationSubmissionService: ApplicationSubmissionService,
    private dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((applicationSubmission) => {
      if (applicationSubmission) {
        this.fileId = applicationSubmission.fileNumber;
        this.submissionUuid = applicationSubmission.uuid;

        this.form.patchValue({
          subtype: applicationSubmission.naruSubtype,
        });
        this.previousSubtype = applicationSubmission.naruSubtype;

        if (this.showErrors) {
          this.form.markAllAsTouched();
        }
      }
    });
  }

  async onSave() {
    await this.save();
  }

  onChangeSubtype($event: MatRadioChange) {
    if (this.previousSubtype) {
      this.dialog
        .open(ChangeSubtypeConfirmationDialogComponent)
        .beforeClosed()
        .subscribe((didConfirm) => {
          if (didConfirm) {
            this.previousSubtype = $event.value;
          } else {
            this.subtype.setValue(this.previousSubtype);
          }
        });
    } else {
      this.previousSubtype = $event.value;
    }
  }

  private async save() {
    if (this.fileId) {
      const subtype = this.subtype.value;

      const updateDto: ApplicationSubmissionUpdateDto = {
        naruSubtype: subtype,
      };

      const updatedApp = await this.applicationSubmissionService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }
}
