import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationReviewService } from '../../services/application-review/application-review.service';
import { ApplicationDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { CustomStepperComponent } from '../../shared/custom-stepper/custom-stepper.component';
import { ReturnApplicationDialogComponent } from './return-application-dialog/return-application-dialog.component';

export enum ReviewApplicationSteps {
  ContactInformation = 0,
  OCP = 1,
  Zoning = 2,
  Resolution = 3,
  Attachments = 4,
  ReviewAndSubmit = 5,
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

  isFirstNationGovernment = true;

  @ViewChild('cdkStepper') public customStepper!: CustomStepperComponent;

  constructor(
    private applicationService: ApplicationService,
    private applicationReviewService: ApplicationReviewService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.$destroy)).subscribe((paramMap) => {
      const fileId = paramMap.get('fileId');
      if (fileId) {
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
    switch (step) {
      case ReviewApplicationSteps.ContactInformation:
        // await this.parcelDetailsComponent.onSave();
        break;
      case ReviewApplicationSteps.OCP:
        // await this.otherParcelsComponent.onSave();
        break;
      case ReviewApplicationSteps.Zoning:
        // await this.primaryContactComponent.onSave();
        break;
      case ReviewApplicationSteps.Resolution:
        // await this.selectGovernmentComponent.onSave();
        break;
      case ReviewApplicationSteps.Attachments:
        // await this.landUseComponent.onSave();
        break;
      case ReviewApplicationSteps.ReviewAndSubmit:
        // await this.nfuProposalComponent.onSave();
        break;
  //     case EditApplicationSteps.Attachments:
  //       await this.otherAttachmentsComponent.onSave();
  //       break;
  //     case EditApplicationSteps.ReviewAndSubmit:
  //       return;
  //     default:
  //       this.toastService.showErrorToast('Error updating application.');
    }
  }

  async onBeforeSwitchStep(index: number) {
    this.customStepper.navigateToStep(index, true);
    console.log('onBeforeSwitchStep');
  }

  async onStepChange($event: StepperSelectionEvent) {
    console.log('onStepChange');
  }
}
