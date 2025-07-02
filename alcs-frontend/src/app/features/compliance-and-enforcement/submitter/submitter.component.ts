import { Component, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import {
  ComplianceAndEnforcementSubmitterDto,
  UpdateComplianceAndEnforcementSubmitterDto,
} from '../../../services/compliance-and-enforcement/submitter/submitter.dto';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { strictEmailValidator } from '../../../shared/validators/email-validator';
import { InitialSubmissionType } from '../../../services/compliance-and-enforcement/compliance-and-enforcement.dto';

@Component({
  selector: 'app-compliance-and-enforcement-submitter',
  templateUrl: './submitter.component.html',
  styleUrls: ['./submitter.component.scss'],
})
export class SubmitterComponent implements OnDestroy {
  $destroy = new Subject<void>();

  isPatching = false;
  isSubscribed = false;

  form = new FormGroup({
    isAnonymous: new FormControl<boolean>(false),
    name: new FormControl<string>(''),
    email: new FormControl<string>('', [strictEmailValidator]),
    telephoneNumber: new FormControl<string>(''),
    affiliation: new FormControl<string>(''),
    additionalContactInformation: new FormControl<string>(''),
  });

  @Input() set parentForm(parentForm: FormGroup) {
    if (!parentForm || parentForm.contains('overview')) {
      return;
    }

    parentForm.addControl('overview', this.form);
  }

  $changes: BehaviorSubject<UpdateComplianceAndEnforcementSubmitterDto> =
    new BehaviorSubject<UpdateComplianceAndEnforcementSubmitterDto>({});

  @Input()
  set submitter(submitter: ComplianceAndEnforcementSubmitterDto | undefined) {
    if (submitter) {
      this.isPatching = true;
      this.form.disable();
      this.form.patchValue({
        isAnonymous: submitter.isAnonymous,
        name: submitter.name,
        email: submitter.email,
        telephoneNumber: submitter.telephoneNumber,
        affiliation: submitter.affiliation,
        additionalContactInformation: submitter.additionalContactInformation,
      });

      this.setAnonymity(submitter.isAnonymous);

      this.isPatching = false;
    }

    // Prevent resubscription
    if (!this.isSubscribed) {
      this.form.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((form) => {
        if (this.isPatching) {
          return;
        }

        this.$changes.next({
          isAnonymous: form.isAnonymous ?? undefined,
          name: form.name ?? '',
          email: form.email ?? '',
          telephoneNumber: form.telephoneNumber ?? '',
          affiliation: form.affiliation ?? '',
          additionalContactInformation: form.additionalContactInformation ?? '',
        });
      });

      this.isSubscribed = true;
    }
  }

  @Input()
  set initialSubmissionType(initialSubmissionType: InitialSubmissionType | undefined) {
    this.isPatching = true;
    if (initialSubmissionType === InitialSubmissionType.REFERRAL) {
      this.form.controls['affiliation'].setValidators(Validators.required);
    } else {
      this.form.controls['affiliation'].removeValidators(Validators.required);
    }
    this.form.controls['affiliation'].updateValueAndValidity();
    this.isPatching = false;
  }

  setAnonymity(isAnonymous: boolean) {
    if (isAnonymous === true) {
      this.form.disable();
      this.form.reset();
      this.form.controls['isAnonymous'].enable();
      this.form.controls['isAnonymous'].setValue(isAnonymous);
    } else {
      this.form.enable();
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
