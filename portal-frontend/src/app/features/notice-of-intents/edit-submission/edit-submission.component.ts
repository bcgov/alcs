import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of, Subject, takeUntil } from 'rxjs';
import { NoticeOfIntentSubmissionDetailedDto } from '../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { ToastService } from '../../../services/toast/toast.service';
import { CustomStepperComponent } from '../../../shared/custom-stepper/custom-stepper.component';
import { OverlaySpinnerService } from '../../../shared/overlay-spinner/overlay-spinner.service';
import { scrollToElement } from '../../../shared/utils/scroll-helper';
import { EditApplicationSteps } from '../../applications/edit-submission/edit-submission.component';
import { ParcelDetailsComponent } from './parcels/parcel-details.component';

export enum EditNoiSteps {
  Parcel = 0,
  PrimaryContact = 1,
  Government = 2,
  LandUse = 3,
  Proposal = 4,
  ExtraInfo = 5,
  Attachments = 6,
  ReviewAndSubmit = 7,
}

@Component({
  selector: 'app-edit-submission',
  templateUrl: './edit-submission.component.html',
  styleUrls: ['./edit-submission.component.scss'],
})
export class EditSubmissionComponent implements OnDestroy, AfterViewInit {
  fileId = '';

  $destroy = new Subject<void>();
  $noiSubmission = new BehaviorSubject<NoticeOfIntentSubmissionDetailedDto | undefined>(undefined);
  noiSubmission: NoticeOfIntentSubmissionDetailedDto | undefined;

  steps = EditNoiSteps;
  expandedParcelUuid?: string;
  showValidationErrors = false;

  @ViewChild('cdkStepper') public customStepper!: CustomStepperComponent;

  @ViewChild(ParcelDetailsComponent) parcelDetailsComponent!: ParcelDetailsComponent;

  constructor(
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private toastService: ToastService,
    private overlayService: OverlaySpinnerService,
    private router: Router
  ) {
    this.expandedParcelUuid = undefined;

    this.$noiSubmission.pipe(takeUntil(this.$destroy)).subscribe((submission) => {
      this.noiSubmission = submission;
    });
  }

  ngAfterViewInit(): void {
    combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.paramMap])
      .pipe(takeUntil(this.$destroy))
      .subscribe(([queryParamMap, paramMap]) => {
        const fileId = paramMap.get('fileId');
        if (fileId) {
          this.loadSubmission(fileId).then(() => {
            const stepInd = paramMap.get('stepInd');
            const parcelUuid = queryParamMap.get('parcelUuid');
            const showErrors = queryParamMap.get('errors');
            if (showErrors) {
              this.showValidationErrors = showErrors === 't';
            }

            if (stepInd) {
              // setTimeout is required for stepper to be initialized
              setTimeout(() => {
                this.customStepper.navigateToStep(parseInt(stepInd), true);

                if (parcelUuid) {
                  this.expandedParcelUuid = parcelUuid;
                }
              });
            }
          });
        }
      });
  }

  async onExit() {
    await this.router.navigateByUrl(`/notice-of-intent/${this.fileId}`);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  // this gets fired whenever applicant navigates away from edit page
  async canDeactivate(): Promise<Observable<boolean>> {
    await this.saveSubmission(this.customStepper.selectedIndex);

    return of(true);
  }

  async onStepChange($event: StepperSelectionEvent) {
    // scrolls to step if step selected programmatically
    scrollToElement({ id: `stepWrapper_${$event.selectedIndex}`, center: false });
  }

  async onBeforeSwitchStep(index: number) {
    // navigation to url will cause step change based on the index (index starts from 0)
    // The save will be triggered using canDeactivate guard
    this.showValidationErrors = this.customStepper.selectedIndex === EditNoiSteps.ReviewAndSubmit;
    await this.router.navigateByUrl(`notice-of-intent/${this.fileId}/edit/${index}`);
  }

  async saveSubmission(step: number) {
    switch (step) {
      case EditApplicationSteps.AppParcel:
        await this.parcelDetailsComponent.onSave();
        break;
      default:
        this.toastService.showErrorToast('Error updating notice of intent.');
    }
  }

  async onDownloadPdf(fileNumber: string | undefined) {
    if (fileNumber) {
      //TODO: Hook this up later
    }
  }

  onChangeSubmissionType() {
    //TODO: Hook this up later
  }

  private async loadSubmission(fileId: string, reload = false) {
    if (!this.noiSubmission || reload) {
      this.overlayService.showSpinner();
      this.noiSubmission = await this.noticeOfIntentSubmissionService.getByFileId(fileId);
      this.fileId = fileId;
      this.$noiSubmission.next(this.noiSubmission);
      this.overlayService.hideSpinner();
    }
  }

  onParcelDetailsInitialized() {
    if (this.expandedParcelUuid && this.parcelDetailsComponent) {
      this.parcelDetailsComponent.openParcel(this.expandedParcelUuid);
      this.expandedParcelUuid = undefined;
    }
  }
}
