import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject, combineLatest, of, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../services/application-document/application-document.dto';
import { ApplicationDetailedDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { ToastService } from '../../services/toast/toast.service';
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
export class EditApplicationComponent implements OnInit, OnDestroy {
  fileId = '';
  documents: ApplicationDocumentDto[] = [];

  $destroy = new Subject<void>();
  $application = new BehaviorSubject<ApplicationDetailedDto | undefined>(undefined);
  application: ApplicationDetailedDto | undefined;

  editAppSteps = EditApplicationSteps;
  previousStep = 0;

  @ViewChild('cdkStepper') public stepper!: MatStepper;

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
    private overlayService: OverlaySpinnerService
  ) {}

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  ngOnInit(): void {
    combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.paramMap])
      .pipe(takeUntil(this.$destroy))
      .subscribe(([queryParamMap, paramMap]) => {
        const fileId = paramMap.get('fileId');
        if (fileId) {
          this.loadApplication(fileId);

          const stepInd = paramMap.get('stepInd');
          const parcelUuid = queryParamMap.get('parcelUuid');

          if (stepInd) {
            // setTimeout is required for stepper to be initialized
            setTimeout(() => {
              this.stepper.selectedIndex = stepInd;
              if (parcelUuid) {
                this.parcelDetailsComponent.openParcel(parcelUuid);
              }
            });
          }
        }
      });
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

  async onSubmitToAlcs() {
    if (!this.application?.localGovernmentUuid) {
      this.toastService.showErrorToast('Please set local government first.');
      return;
    }

    if (this.application) {
      await this.applicationService.submitToAlcs(this.fileId);
    }
  }

  // TODO cleanup
  async canDeactivate(): Promise<Observable<boolean>> {
    console.log('canDeactivate start saving');
    await this.saveApplication(this.stepper.selectedIndex);

    console.log('canDeactivate finish');
    return of(true);
  }

  async onStepChange($event: StepperSelectionEvent) {
    // reload application every time step changes
    this.previousStep = $event.previouslySelectedIndex;
    this.$application.next(await this.applicationService.getByFileId(this.fileId));

    await this.saveApplication(this.previousStep);

    // scrolls to step if step selected programmatically
    const el = document.getElementById(`stepWrapper_${$event.selectedIndex}`);
    el?.scrollIntoView({ behavior: 'smooth' });
  }

  async saveApplication(step: number) {
    switch (step) {
      case EditApplicationSteps.AppParcel:
        console.log('save parcel details');
        await this.parcelDetailsComponent.onSave();
        break;
      case EditApplicationSteps.OtherParcel:
        console.log('save other parcels');
        await this.otherParcelsComponent.onSave();
        break;
      case EditApplicationSteps.PrimaryContact:
        console.log('save PrimaryContact');
        await this.primaryContactComponent.onSave();
        break;
      case EditApplicationSteps.Government:
        console.log('save Government');
        await this.selectGovernmentComponent.onSave();
        break;
      case EditApplicationSteps.LandUse:
        console.log('save LandUse');
        await this.landUseComponent.onSave();
        break;
      case EditApplicationSteps.Proposal:
        console.log('save Proposal');
        await this.nfuProposalComponent.onSave();
        break;
      case EditApplicationSteps.Attachments:
        console.log('save Attachments');
        await this.otherAttachmentsComponent.onSave();
        break;
      default:
        console.log('save default');
        this.toastService.showErrorToast('Error updating application.');
    }
  }
}
