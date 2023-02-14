import { CdkStepper } from '@angular/cdk/stepper';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, combineLatest, takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../services/application-document/application-document.dto';
import { ApplicationDetailedDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { ToastService } from '../../services/toast/toast.service';
import { ChangeApplicationTypeDialogComponent } from './change-application-type-dialog/change-application-type-dialog.component';
import { ParcelDetailsComponent } from './parcel-details/parcel-details.component';

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

  @ViewChild('stepper') public stepper!: MatStepper;
  @ViewChild(ParcelDetailsComponent) parcelDetailsComponent!: ParcelDetailsComponent;

  @ViewChild('cdkStepper')
  public cdkStepper!: CdkStepper;
  editAppSteps = EditApplicationSteps;

  constructor(
    private applicationService: ApplicationService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private toastService: ToastService
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
            // setTimeout is required for stepper to work properly
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
    this.application = await this.applicationService.getByFileId(fileId);
    this.$application.next(this.application);
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
}
