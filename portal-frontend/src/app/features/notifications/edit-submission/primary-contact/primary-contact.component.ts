import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { NotificationSubmissionService } from '../../../../services/notification-submission/notification-submission.service';
import { EditNotificationSteps } from '../edit-submission.component';
import { StepComponent } from '../step.partial';

@Component({
  selector: 'app-primary-contact',
  templateUrl: './primary-contact.component.html',
  styleUrls: ['./primary-contact.component.scss'],
})
export class PrimaryContactComponent extends StepComponent implements OnInit, OnDestroy {
  currentStep = EditNotificationSteps.PrimaryContact;

  firstName = new FormControl<string | null>('', [Validators.required]);
  lastName = new FormControl<string | null>('', [Validators.required]);
  organizationName = new FormControl<string | null>('');
  phoneNumber = new FormControl<string | null>('', [Validators.required]);
  email = new FormControl<string | null>('', [Validators.required, Validators.email]);
  confirmEmail = new FormControl<string | null>('', [Validators.required, Validators.email]);

  form = new FormGroup({
    firstName: this.firstName,
    lastName: this.lastName,
    organizationName: this.organizationName,
    phoneNumber: this.phoneNumber,
    email: this.email,
    confirmEmail: this.confirmEmail,
  });

  private submissionUuid = '';

  constructor(private notificationSubmissionService: NotificationSubmissionService) {
    super();
  }

  ngOnInit(): void {
    this.$notificationSubmission.pipe(takeUntil(this.$destroy)).subscribe((submission) => {
      if (submission) {
        this.submissionUuid = submission.uuid;

        this.form.patchValue({
          firstName: submission.contactFirstName,
          lastName: submission.contactLastName,
          organizationName: submission.contactOrganization,
          phoneNumber: submission.contactPhone,
          email: submission.contactEmail,
          confirmEmail: submission.contactEmail,
        });
      }
    });
  }

  async onSave() {
    await this.save();
  }

  protected async save() {
    if (this.form.dirty) {
      const confirmEmail = this.confirmEmail.value;
      const email = this.email.value;

      const updated = await this.notificationSubmissionService.updatePending(this.submissionUuid, {
        contactFirstName: this.firstName.value,
        contactLastName: this.lastName.value,
        contactOrganization: this.organizationName.value,
        contactPhone: this.phoneNumber.value,
        contactEmail: confirmEmail === email ? email : null,
      });
      this.$notificationSubmission.next(updated);
    }
  }

  onChangeConfirmationEmail() {
    const confirmEmail = this.confirmEmail.value;
    const email = this.email.value;

    if (confirmEmail !== email) {
      this.confirmEmail.setErrors({
        notMatch: 'true',
      });
    } else {
      this.confirmEmail.updateValueAndValidity();
    }
  }
}
