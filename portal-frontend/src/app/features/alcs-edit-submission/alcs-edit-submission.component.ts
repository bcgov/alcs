import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationDocumentDto } from '../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../services/application-document/application-document.service';
import { ApplicationSubmissionDocumentGenerationService } from '../../services/application-submission/application-submisison-document-generation/application-submission-document-generation.service';
import { ApplicationSubmissionDraftService } from '../../services/application-submission/application-submission-draft.service';
import { ApplicationSubmissionDetailedDto } from '../../services/application-submission/application-submission.dto';
import { ToastService } from '../../services/toast/toast.service';
import { CustomStepperComponent } from '../../shared/custom-stepper/custom-stepper.component';
import { OverlaySpinnerService } from '../../shared/overlay-spinner/overlay-spinner.service';
import { EditApplicationSteps } from '../edit-submission/edit-submission.component';
import { LandUseComponent } from '../edit-submission/land-use/land-use.component';
import { OtherAttachmentsComponent } from '../edit-submission/other-attachments/other-attachments.component';
import { OtherParcelsComponent } from '../edit-submission/other-parcels/other-parcels.component';
import { ParcelDetailsComponent } from '../edit-submission/parcel-details/parcel-details.component';
import { PrimaryContactComponent } from '../edit-submission/primary-contact/primary-contact.component';
import { NfuProposalComponent } from '../edit-submission/proposal/nfu-proposal/nfu-proposal.component';
import { SubdProposalComponent } from '../edit-submission/proposal/subd-proposal/subd-proposal.component';
import { TurProposalComponent } from '../edit-submission/proposal/tur-proposal/tur-proposal.component';
import { SelectGovernmentComponent } from '../edit-submission/select-government/select-government.component';

@Component({
  selector: 'app-alcs-edit-submission',
  templateUrl: './alcs-edit-submission.component.html',
  styleUrls: ['./alcs-edit-submission.component.scss'],
})
export class AlcsEditSubmissionComponent implements OnInit, OnDestroy, AfterViewInit {
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
  @ViewChild(OtherParcelsComponent) otherParcelsComponent!: OtherAttachmentsComponent;
  @ViewChild(PrimaryContactComponent) primaryContactComponent!: PrimaryContactComponent;
  @ViewChild(SelectGovernmentComponent) selectGovernmentComponent!: SelectGovernmentComponent;
  @ViewChild(LandUseComponent) landUseComponent!: LandUseComponent;
  @ViewChild(NfuProposalComponent) nfuProposalComponent?: NfuProposalComponent;
  @ViewChild(TurProposalComponent) turProposalComponent?: TurProposalComponent;
  @ViewChild(SubdProposalComponent) subdProposalComponent?: SubdProposalComponent;
  @ViewChild(OtherAttachmentsComponent) otherAttachmentsComponent!: OtherAttachmentsComponent;

  constructor(
    private applicationSubmissionDraftService: ApplicationSubmissionDraftService,
    private applicationDocumentService: ApplicationDocumentService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private toastService: ToastService,
    private overlayService: OverlaySpinnerService,
    private router: Router,
    private applicationSubmissionDocumentGenerationService: ApplicationSubmissionDocumentGenerationService
  ) {}

  ngOnInit(): void {
    this.expandedParcelUuid = undefined;
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

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  private async loadApplication(fileId: string) {
    this.overlayService.showSpinner();
    this.applicationSubmission = await this.applicationSubmissionDraftService.getByFileId(fileId);
    const documents = await this.applicationDocumentService.getByFileId(fileId);
    if (documents) {
      this.$applicationDocuments.next(documents);
    }
    this.fileId = fileId;
    this.$applicationSubmission.next(this.applicationSubmission);
    this.overlayService.hideSpinner();
  }

  // this gets fired whenever applicant navigates away from edit page
  async canDeactivate(): Promise<Observable<boolean>> {
    await this.saveApplication(this.customStepper.selectedIndex);
    return of(true);
  }

  async onStepChange($event: StepperSelectionEvent) {
    // scrolls to step if step selected programmatically
    const el = document.getElementById(`stepWrapper_${$event.selectedIndex}`);
    el?.scrollIntoView({ behavior: 'smooth' });
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
        if (this.nfuProposalComponent) {
          await this.nfuProposalComponent.onSave();
        }
        if (this.turProposalComponent) {
          await this.turProposalComponent.onSave();
        }
        if (this.subdProposalComponent) {
          await this.subdProposalComponent.onSave();
        }
        break;
      case EditApplicationSteps.Attachments:
        await this.otherAttachmentsComponent.onSave();
        break;
      case EditApplicationSteps.ReviewAndSubmit:
        break;
      default:
        this.toastService.showErrorToast('Error updating application.');
    }
  }

  async switchStep(index: number) {
    // navigation to url will cause step change based on the index (index starts from 0)
    // The save will be triggered using canDeactivate guard
    this.showValidationErrors = this.customStepper.selectedIndex === EditApplicationSteps.ReviewAndSubmit;
    this.router.navigateByUrl(`alcs/application/${this.fileId}/edit/${index}`);
  }

  onParcelDetailsInitialized() {
    if (this.expandedParcelUuid && this.parcelDetailsComponent) {
      this.parcelDetailsComponent.openParcel(this.expandedParcelUuid);
      this.expandedParcelUuid = undefined;
    }
  }

  async onDownloadPdf(fileNumber: string | undefined) {
    if (fileNumber) {
      await this.applicationSubmissionDocumentGenerationService.generate(fileNumber);
    }
  }

  async onExit() {
    await this.applicationSubmissionDraftService.delete(this.fileId);
    window.location.href = `${environment.alcsUrl}/application/${this.fileId}/applicant-info`;
  }
}
