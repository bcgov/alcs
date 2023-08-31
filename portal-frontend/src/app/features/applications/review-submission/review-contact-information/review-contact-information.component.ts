import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationSubmissionReviewService } from '../../../../services/application-submission-review/application-submission-review.service';
import { ReviewApplicationSteps } from '../review-submission.component';

@Component({
  selector: 'app-review-contact-information',
  templateUrl: './review-contact-information.component.html',
  styleUrls: ['./review-contact-information.component.scss'],
})
export class ReviewContactInformationComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  @Output() navigateToStep = new EventEmitter<number>();
  currentStep = ReviewApplicationSteps.ContactInformation;
  @Input() showErrors = false;

  lgFileNumber = new FormControl<string | null>('', [Validators.required]);
  firstName = new FormControl<string | null>('', [Validators.required]);
  lastName = new FormControl<string | null>('', [Validators.required]);
  position = new FormControl<string | null>('', [Validators.required]);
  department = new FormControl<string | null>('', [Validators.required]);
  phoneNumber = new FormControl<string | null>('', [Validators.required]);
  email = new FormControl<string | null>('', [Validators.required, Validators.email]);
  isFirstNationGovernment = false;

  contactForm = new FormGroup({
    lgFileNumber: this.lgFileNumber,
    firstName: this.firstName,
    lastName: this.lastName,
    position: this.position,
    department: this.department,
    phoneNumber: this.phoneNumber,
    email: this.email,
  });
  private fileId: string | undefined;

  constructor(private applicationReviewService: ApplicationSubmissionReviewService, private router: Router) {}

  ngOnInit(): void {
    this.applicationReviewService.$applicationReview.pipe(takeUntil(this.$destroy)).subscribe((applicationReview) => {
      if (applicationReview) {
        this.fileId = applicationReview.applicationFileNumber;

        this.lgFileNumber.setValue(applicationReview.localGovernmentFileNumber);
        this.firstName.setValue(applicationReview.firstName);
        this.lastName.setValue(applicationReview.lastName);
        this.position.setValue(applicationReview.position);
        this.department.setValue(applicationReview.department);
        this.phoneNumber.setValue(applicationReview.phoneNumber);
        this.email.setValue(applicationReview.email);
        this.isFirstNationGovernment = applicationReview.isFirstNationGovernment;

        if (this.showErrors) {
          this.contactForm.markAllAsTouched();
        }
      }
    });
  }

  async onSave() {
    await this.saveProgress();
  }

  async onExit() {
    if (this.fileId) {
      await this.router.navigateByUrl(`/application/${this.fileId}`);
    }
  }

  private async saveProgress() {
    if (this.fileId && this.contactForm.dirty) {
      await this.applicationReviewService.update(this.fileId, {
        localGovernmentFileNumber: this.lgFileNumber.getRawValue(),
        firstName: this.firstName.getRawValue(),
        lastName: this.lastName.getRawValue(),
        position: this.position.getRawValue(),
        department: this.department.getRawValue(),
        phoneNumber: this.phoneNumber.getRawValue(),
        email: this.email.getRawValue(),
      });
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  onNavigateToStep(step: number) {
    this.navigateToStep.emit(step);
  }
}
