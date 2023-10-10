import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { ApplicationSubmissionReviewService } from '../../../services/application-submission-review/application-submission-review.service';
import {
  ApplicationSubmissionDetailedDto,
  SUBMISSION_STATUS,
} from '../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../services/application-submission/application-submission.service';
import { CodeService } from '../../../services/code/code.service';
import { PdfGenerationService } from '../../../services/pdf-generation/pdf-generation.service';
import { ToastService } from '../../../services/toast/toast.service';
import { CustomStepperComponent } from '../../../shared/custom-stepper/custom-stepper.component';
import { OverlaySpinnerService } from '../../../shared/overlay-spinner/overlay-spinner.service';
import { scrollToElement } from '../../../shared/utils/scroll-helper';
import { ChangeApplicationTypeDialogComponent } from './change-application-type-dialog/change-application-type-dialog.component';
import { LandUseComponent } from './land-use/land-use.component';
import { OtherAttachmentsComponent } from './other-attachments/other-attachments.component';
import { OtherParcelsComponent } from './other-parcels/other-parcels.component';
import { ParcelDetailsComponent } from './parcel-details/parcel-details.component';
import { PrimaryContactComponent } from './primary-contact/primary-contact.component';
import { ExclProposalComponent } from './proposal/excl-proposal/excl-proposal.component';
import { InclProposalComponent } from './proposal/incl-proposal/incl-proposal.component';
import { NaruProposalComponent } from './proposal/naru-proposal/naru-proposal.component';
import { NfuProposalComponent } from './proposal/nfu-proposal/nfu-proposal.component';
import { PfrsProposalComponent } from './proposal/pfrs-proposal/pfrs-proposal.component';
import { PofoProposalComponent } from './proposal/pofo-proposal/pofo-proposal.component';
import { RosoProposalComponent } from './proposal/roso-proposal/roso-proposal.component';
import { SubdProposalComponent } from './proposal/subd-proposal/subd-proposal.component';
import { TurProposalComponent } from './proposal/tur-proposal/tur-proposal.component';
import { SubmitConfirmationDialogComponent } from './review-and-submit/submit-confirmation-dialog/submit-confirmation-dialog.component';
import { SelectGovernmentComponent } from './select-government/select-government.component';

export enum EditApplicationSteps {
  AppParcel = 0,
  OtherParcel = 1,
  PrimaryContact = 2,
  Government = 3,
  LandUse = 4,
  Proposal = 5,
  Attachments = 6,
  ReviewAndSubmit = 7,
}

@Component({
  selector: 'app-edit-submission',
  templateUrl: './edit-submission.component.html',
  styleUrls: ['./edit-submission.component.scss'],
})
export class EditSubmissionComponent implements OnInit, OnDestroy, AfterViewInit {
  fileId = '';
  documents: ApplicationDocumentDto[] = [];

  $destroy = new Subject<void>();
  $applicationSubmission = new BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>(undefined);
  $applicationDocuments = new BehaviorSubject<ApplicationDocumentDto[]>([]);
  applicationSubmission: ApplicationSubmissionDetailedDto | undefined;

  editAppSteps = EditApplicationSteps;
  expandedParcelUuid?: string;

  showValidationErrors = false;

  @ViewChild('cdkStepper') public customStepper!: CustomStepperComponent;

  @ViewChild(ParcelDetailsComponent) parcelDetailsComponent!: ParcelDetailsComponent;
  @ViewChild(OtherParcelsComponent) otherParcelsComponent!: OtherParcelsComponent;
  @ViewChild(PrimaryContactComponent) primaryContactComponent!: PrimaryContactComponent;
  @ViewChild(SelectGovernmentComponent) selectGovernmentComponent!: SelectGovernmentComponent;
  @ViewChild(LandUseComponent) landUseComponent!: LandUseComponent;
  @ViewChild(NfuProposalComponent) nfuProposalComponent?: NfuProposalComponent;
  @ViewChild(TurProposalComponent) turProposalComponent?: TurProposalComponent;
  @ViewChild(SubdProposalComponent) subdProposalComponent?: SubdProposalComponent;
  @ViewChild(RosoProposalComponent) rosoProposalComponent?: RosoProposalComponent;
  @ViewChild(PofoProposalComponent) pofoProposalComponent?: RosoProposalComponent;
  @ViewChild(PfrsProposalComponent) pfrsProposalComponent?: PfrsProposalComponent;
  @ViewChild(NaruProposalComponent) naruProposalComponent?: NaruProposalComponent;
  @ViewChild(ExclProposalComponent) exclProposalComponent?: ExclProposalComponent;
  @ViewChild(InclProposalComponent) inclProposalComponent?: InclProposalComponent;
  @ViewChild(OtherAttachmentsComponent) otherAttachmentsComponent!: OtherAttachmentsComponent;

  constructor(
    private applicationSubmissionService: ApplicationSubmissionService,
    private applicationDocumentService: ApplicationDocumentService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private toastService: ToastService,
    private overlayService: OverlaySpinnerService,
    private router: Router,
    private pdfGenerationService: PdfGenerationService,
    private applicationReviewService: ApplicationSubmissionReviewService,
    private codeService: CodeService
  ) {}

  ngOnInit(): void {
    this.expandedParcelUuid = undefined;

    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((submission) => {
      this.applicationSubmission = submission;
      if (
        submission?.status.code &&
        ![SUBMISSION_STATUS.IN_PROGRESS, SUBMISSION_STATUS.WRONG_GOV, SUBMISSION_STATUS.INCOMPLETE].includes(
          submission?.status.code
        )
      ) {
        this.toastService.showErrorToast('Editing is not allowed. Please contact ALC for more details');
        this.router.navigate(['/home']);
      }
    });
  }

  ngAfterViewInit(): void {
    combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.paramMap])
      .pipe(takeUntil(this.$destroy))
      .subscribe(([queryParamMap, paramMap]) => {
        const fileId = paramMap.get('fileId');
        if (fileId) {
          this.loadApplication(fileId).then(() => {
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
    await this.router.navigateByUrl(`/application/${this.fileId}`);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  private async loadApplication(fileId: string, reload = false) {
    if (!this.applicationSubmission || reload) {
      this.overlayService.showSpinner();
      this.applicationSubmission = await this.applicationSubmissionService.getByFileId(fileId);
      const documents = await this.applicationDocumentService.getByFileId(fileId);
      if (documents) {
        this.$applicationDocuments.next(documents);
      }
      this.fileId = fileId;
      this.$applicationSubmission.next(this.applicationSubmission);
      this.overlayService.hideSpinner();
    }
  }

  async onApplicationTypeChangeClicked() {
    if (this.applicationSubmission) {
      this.dialog
        .open(ChangeApplicationTypeDialogComponent, {
          panelClass: 'no-padding',
          disableClose: true,
          autoFocus: false,
          data: {
            submissionUuid: this.applicationSubmission.uuid,
            submissionTypeCode: this.applicationSubmission.typeCode,
          },
        })
        .beforeClosed()
        .subscribe((result) => {
          if (result) {
            this.loadApplication(this.fileId, true);
          }
        });
    }
  }

  // this gets fired whenever applicant navigates away from edit page
  async canDeactivate(): Promise<Observable<boolean>> {
    await this.saveApplication(this.customStepper.selectedIndex);

    return of(true);
  }

  async onStepChange($event: StepperSelectionEvent) {
    // scrolls to step if step selected programmatically
    scrollToElement({ id: `siteLayout`, center: false });
  }

  async saveApplication(step: number) {
    switch (step) {
      case EditApplicationSteps.AppParcel:
        await this.parcelDetailsComponent.onSave();
        break;
      case EditApplicationSteps.OtherParcel:
        await this.otherParcelsComponent.onSave();
        break;
      case EditApplicationSteps.PrimaryContact:
        await this.primaryContactComponent.onSave();
        break;
      case EditApplicationSteps.Government:
        await this.selectGovernmentComponent.onSave();
        break;
      case EditApplicationSteps.LandUse:
        await this.landUseComponent.onSave();
        break;
      case EditApplicationSteps.Proposal:
        await this.saveProposalSteps();
        break;
      case EditApplicationSteps.Attachments:
        await this.otherAttachmentsComponent.onSave();
        break;
      case EditApplicationSteps.ReviewAndSubmit:
        return;
      default:
        this.toastService.showErrorToast('Error updating application.');
    }
  }

  private async saveProposalSteps() {
    if (this.nfuProposalComponent) {
      await this.nfuProposalComponent.onSave();
    }
    if (this.turProposalComponent) {
      await this.turProposalComponent.onSave();
    }
    if (this.subdProposalComponent) {
      await this.subdProposalComponent.onSave();
    }
    if (this.rosoProposalComponent) {
      await this.rosoProposalComponent.onSave();
    }
    if (this.pofoProposalComponent) {
      await this.pofoProposalComponent.onSave();
    }
    if (this.pfrsProposalComponent) {
      await this.pfrsProposalComponent.onSave();
    }
    if (this.naruProposalComponent) {
      await this.naruProposalComponent.onSave();
    }
    if (this.exclProposalComponent) {
      await this.exclProposalComponent.onSave();
    }
    if (this.inclProposalComponent) {
      await this.inclProposalComponent.onSave();
    }
  }

  async onBeforeSwitchStep(index: number) {
    // navigation to url will cause step change based on the index (index starts from 0)
    // The save will be triggered using canDeactivate guard
    this.showValidationErrors = this.customStepper.selectedIndex === EditApplicationSteps.ReviewAndSubmit;
    await this.router.navigateByUrl(`application/${this.fileId}/edit/${index}`);
  }

  onParcelDetailsInitialized() {
    if (this.expandedParcelUuid && this.parcelDetailsComponent) {
      this.parcelDetailsComponent.openParcel(this.expandedParcelUuid);
      this.expandedParcelUuid = undefined;
    }
  }

  async onDownloadPdf(fileNumber: string | undefined) {
    if (fileNumber) {
      await this.pdfGenerationService.generateSubmission(fileNumber);
    }
  }

  async onSubmit() {
    if (this.applicationSubmission) {
      const isTUR = this.applicationSubmission.typeCode === 'TURP';
      const government = await this.loadGovernment(this.applicationSubmission.localGovernmentUuid);
      const governmentName = government?.name ?? 'selected local / first nation government';

      this.dialog
        .open(SubmitConfirmationDialogComponent, {
          data: {
            governmentName: isTUR ? 'ALC' : governmentName,
            userIsGovernment: (government?.matchesUserGuid && !isTUR) ?? false,
          },
        })
        .beforeClosed()
        .subscribe((didConfirm) => {
          if (didConfirm) {
            this.submit();
          }
        });
    }
  }

  private async submit() {
    const submission = this.applicationSubmission;
    if (submission) {
      const didSubmit = await this.applicationSubmissionService.submitToAlcs(submission.uuid);
      if (didSubmit) {
        let government;
        if (this.applicationSubmission?.localGovernmentUuid) {
          government = await this.loadGovernment(this.applicationSubmission?.localGovernmentUuid);
        }

        if (government && government.matchesUserGuid && submission.typeCode !== 'TURP') {
          const review = await this.applicationReviewService.startReview(submission.fileNumber);
          if (review) {
            await this.router.navigateByUrl(`/application/${submission?.fileNumber}/review`);
          }
        } else {
          await this.router.navigateByUrl(`/application/${submission?.fileNumber}`);
        }
      }
    }
  }

  private async loadGovernment(uuid: string) {
    const codes = await this.codeService.loadCodes();
    const localGovernment = codes.localGovernments.find((a) => a.uuid === uuid);
    if (localGovernment) {
      return localGovernment;
    }
    return;
  }
}
