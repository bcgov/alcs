import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, of, takeUntil } from 'rxjs';
import { ApplicationReviewService } from '../../services/application-review/application-review.service';
import { ApplicationDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { ToastService } from '../../services/toast/toast.service';
import { CustomStepperComponent } from '../../shared/custom-stepper/custom-stepper.component';
import { ReturnApplicationDialogComponent } from './return-application-dialog/return-application-dialog.component';
import { ReviewContactInformationComponent } from './review-contact-information/review-contact-information.component';
import { ReviewOcpComponent } from './review-ocp/review-ocp.component';
import { ReviewResolutionComponent } from './review-resolution/review-resolution.component';
import { ReviewZoningComponent } from './review-zoning/review-zoning.component';

export enum ReviewApplicationSteps {
  ContactInformation = 0,
  OCP = 1,
  Zoning = 2,
  Resolution = 3,
  Attachments = 4,
  ReviewAndSubmit = 5,
}

export enum ReviewApplicationFngSteps {
  ContactInformation = 0,
  Resolution = 1,
  Attachments = 2,
  ReviewAndSubmitFng = 3,
}

export class NavigateToStep {
  from!: number;
  to!: number;
}

@Component({
  selector: 'app-review-application',
  templateUrl: './review-application.component.html',
  styleUrls: ['./review-application.component.scss'],
})
export class ReviewApplicationComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  application: ApplicationDto | undefined;
  $application = new BehaviorSubject<ApplicationDto | undefined>(undefined);
  fileId = '';

  isFirstNationGovernment = true;
  reviewAppSteps = ReviewApplicationSteps;
  reviewAppFngSteps = ReviewApplicationFngSteps;

  @ViewChild('cdkStepper') public customStepper!: CustomStepperComponent;

  @ViewChild(ReviewContactInformationComponent) reviewContactInformationComponent!: ReviewContactInformationComponent;
  @ViewChild(ReviewOcpComponent) reviewOcpComponent!: ReviewOcpComponent;
  @ViewChild(ReviewZoningComponent) reviewZoningComponent!: ReviewZoningComponent;
  @ViewChild(ReviewResolutionComponent) reviewResolutionComponent!: ReviewResolutionComponent;

  constructor(
    private applicationService: ApplicationService,
    private applicationReviewService: ApplicationReviewService,
    private router: Router,
    private dialog: MatDialog,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this.$destroy)).subscribe((paramMap) => {
      const fileId = paramMap.get('fileId');
      if (fileId) {
        this.fileId = fileId;
        const stepInd = paramMap.get('stepInd');

        if (stepInd) {
          // setTimeout is required for stepper to be initialized
          setTimeout(() => {
            this.customStepper.navigateToStep(parseInt(stepInd), true);
          });
        }

        this.loadApplication(fileId);
        this.loadApplicationReview(fileId);
      }
    });

    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      this.application = application;
    });
    this.applicationReviewService.$applicationReview.pipe(takeUntil(this.$destroy)).subscribe((appReview) => {
      this.isFirstNationGovernment = appReview?.isFirstNationGovernment ?? false;
    });
  }

  async loadApplicationReview(fileId: string) {
    await this.applicationReviewService.getByFileId(fileId);
  }

  async loadApplication(fileId: string) {
    const application = await this.applicationService.getByFileId(fileId);
    this.$application.next(application);
  }

  onReturnApplication() {
    this.dialog
      .open(ReturnApplicationDialogComponent, {
        panelClass: 'no-padding',
        disableClose: true,
        data: {
          fileId: this.application?.fileNumber,
        },
      })
      .beforeClosed()
      .subscribe((result: boolean) => {
        if (result) {
          this.router.navigateByUrl('/home');
        }
      });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async saveApplicationReview(step: number) {
    if (this.isFirstNationGovernment) {
      switch (step) {
        case ReviewApplicationFngSteps.ContactInformation:
          await this.reviewContactInformationComponent.onSave();
          break;
        case ReviewApplicationFngSteps.Resolution:
          await this.reviewResolutionComponent.onSave();
          break;
        case ReviewApplicationFngSteps.ReviewAndSubmitFng:
        case ReviewApplicationFngSteps.Attachments:
          return;
        default:
          this.toastService.showErrorToast('Error updating application.');
      }
    } else {
      switch (step) {
        case ReviewApplicationSteps.ContactInformation:
          await this.reviewContactInformationComponent.onSave();
          break;
        case ReviewApplicationSteps.OCP:
          await this.reviewOcpComponent.onSave();
          break;
        case ReviewApplicationSteps.Zoning:
          await this.reviewZoningComponent.onSave();
          break;
        case ReviewApplicationSteps.Resolution:
          await this.reviewResolutionComponent.onSave();
          break;
        case ReviewApplicationSteps.ReviewAndSubmit:
        case ReviewApplicationSteps.Attachments:
          return;
        default:
          this.toastService.showErrorToast('Error updating application.');
      }
    }
  }

  // this gets fired whenever applicant navigates away from edit page
  async canDeactivate(): Promise<Observable<boolean>> {
    await this.saveApplicationReview(this.customStepper.selectedIndex);

    return of(true);
  }

  async onBeforeSwitchStep(index: number) {
    this.router.navigateByUrl(`application/${this.fileId}/review/${index}`);
  }

  async onStepChange($event: StepperSelectionEvent) {
    const el = document.getElementById(`stepWrapper_${$event.selectedIndex}`);
    el?.scrollIntoView({ behavior: 'smooth' });
  }
}
