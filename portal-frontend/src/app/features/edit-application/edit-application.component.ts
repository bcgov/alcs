import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, combineLatest, of, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../services/application-document/application-document.dto';
import { ApplicationDetailedDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { ToastService } from '../../services/toast/toast.service';
import { CustomStepperComponent } from '../../shared/custom-stepper/custom-stepper.component';
import { OverlaySpinnerService } from '../../shared/overlay-spinner/overlay-spinner.service';
import { ChangeApplicationTypeDialogComponent } from './change-application-type-dialog/change-application-type-dialog.component';
import { LandUseComponent } from './land-use/land-use.component';
import { NfuProposalComponent } from './nfu/nfu-proposal/nfu-proposal.component';
import { OtherAttachmentsComponent } from './other-attachments/other-attachments.component';
import { OtherParcelsComponent } from './other-parcels/other-parcels.component';
import { ParcelDetailsComponent } from './parcel-details/parcel-details.component';
import { PrimaryContactComponent } from './primary-contact/primary-contact.component';
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
  selector: 'app-create-application',
  templateUrl: './edit-application.component.html',
  styleUrls: ['./edit-application.component.scss'],
})
export class EditApplicationComponent implements OnInit, OnDestroy, AfterViewInit {
  fileId = '';
  documents: ApplicationDocumentDto[] = [];

  $destroy = new Subject<void>();
  $application = new BehaviorSubject<ApplicationDetailedDto | undefined>(undefined);
  application: ApplicationDetailedDto | undefined;

  editAppSteps = EditApplicationSteps;
  expandedParcelUuid?: string;

  showValidationErrors = false;

  @ViewChild('cdkStepper') public customStepper!: CustomStepperComponent;

  @ViewChild(ParcelDetailsComponent) parcelDetailsComponent!: ParcelDetailsComponent;
  @ViewChild(OtherParcelsComponent) otherParcelsComponent!: OtherAttachmentsComponent;
  @ViewChild(PrimaryContactComponent) primaryContactComponent!: PrimaryContactComponent;
  @ViewChild(SelectGovernmentComponent) selectGovernmentComponent!: SelectGovernmentComponent;
  @ViewChild(LandUseComponent) landUseComponent!: LandUseComponent;
  @ViewChild(NfuProposalComponent) nfuProposalComponent!: NfuProposalComponent;
  @ViewChild(OtherAttachmentsComponent) otherAttachmentsComponent!: OtherAttachmentsComponent;

  constructor(
    private applicationService: ApplicationService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private toastService: ToastService,
    private overlayService: OverlaySpinnerService,
    private router: Router
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
    this.application = await this.applicationService.getByFileId(fileId);
    this.fileId = fileId;
    this.$application.next(this.application);
    this.overlayService.hideSpinner();
  }

  async onApplicationTypeChangeClicked() {
    this.dialog
      .open(ChangeApplicationTypeDialogComponent, {
        panelClass: 'no-padding',
        disableClose: true,
        autoFocus: false,
        data: {
          fileId: this.fileId,
        },
      })
      .beforeClosed()
      .subscribe((result) => {
        if (result) {
          this.loadApplication(this.fileId);
        }
      });
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
        await this.nfuProposalComponent.onSave();
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

  async onBeforeSwitchStep(index: number) {
    // navigation to url will cause step change based on the index (index starts from 0)
    // The save will be triggered using canDeactivate guard
    this.showValidationErrors = this.customStepper.selectedIndex === EditApplicationSteps.ReviewAndSubmit;
    this.router.navigateByUrl(`application/${this.fileId}/edit/${index}`);
  }

  onParcelDetailsInitialized() {
    if (this.expandedParcelUuid && this.parcelDetailsComponent) {
      this.parcelDetailsComponent.openParcel(this.expandedParcelUuid);
      this.expandedParcelUuid = undefined;
    }
  }
}
