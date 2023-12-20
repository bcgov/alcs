import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { ApplicationOwnerDto } from '../../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../../services/application-owner/application-owner.service';
import { PARCEL_OWNERSHIP_TYPE } from '../../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../../services/application-parcel/application-parcel.service';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import { OWNER_TYPE } from '../../../../shared/dto/owner.dto';
import { FileHandle } from '../../../../shared/file-drag-drop/drag-drop.directive';
import { EditApplicationSteps } from '../edit-submission.component';
import { FilesStepComponent } from '../files-step.partial';
import { PrimaryContactConfirmationDialogComponent } from './primary-contact-confirmation-dialog/primary-contact-confirmation-dialog.component';
import { OwnerDialogComponent } from 'src/app/shared/owner-dialogs/owner-dialog/owner-dialog.component';
import { CrownOwnerDialogComponent } from 'src/app/shared/owner-dialogs/crown-owner-dialog/crown-owner-dialog.component';
import { scrollToElement } from 'src/app/shared/utils/scroll-helper';

@Component({
  selector: 'app-primary-contact',
  templateUrl: './primary-contact.component.html',
  styleUrls: ['./primary-contact.component.scss'],
})
export class PrimaryContactComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.PrimaryContact;

  parcelOwners: ApplicationOwnerDto[] = [];
  owners: ApplicationOwnerDto[] = [];
  files: (ApplicationDocumentDto & { errorMessage?: string })[] = [];

  needsAuthorizationLetter = false;
  selectedThirdPartyAgent = false;
  selectedLocalGovernment = false;
  selectedOwnerUuid: string | undefined = undefined;
  isCrownOwner = false;
  isGovernmentUser = false;
  governmentName: string | undefined;
  isDirty = false;
  showVirusError = false;
  hasCrownParcels = false;

  primaryContactType = new FormControl<boolean | null>(null, [Validators.required]);

  firstName = new FormControl<string | null>('', [Validators.required]);
  lastName = new FormControl<string | null>('', [Validators.required]);
  organizationName = new FormControl<string | null>('');
  phoneNumber = new FormControl<string | null>('', [Validators.required]);
  email = new FormControl<string | null>('', [Validators.required, Validators.email]);

  form = new FormGroup({
    firstName: this.firstName,
    lastName: this.lastName,
    organizationName: this.organizationName,
    phoneNumber: this.phoneNumber,
    email: this.email,
  });

  private submissionUuid = '';

  constructor(
    private applicationService: ApplicationSubmissionService,
    private applicationOwnerService: ApplicationOwnerService,
    private applicationParcelService: ApplicationParcelService,
    private authenticationService: AuthenticationService,
    applicationDocumentService: ApplicationDocumentService,
    dialog: MatDialog,
    toastService: ToastService
  ) {
    super(applicationDocumentService, dialog, toastService);
  }

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.fileId = application.fileNumber;
        this.submissionUuid = application.uuid;
        this.loadOwners(application.uuid, application.primaryContactOwnerUuid);
      }
    });

    this.authenticationService.$currentProfile.pipe(takeUntil(this.$destroy)).subscribe((profile) => {
      this.isGovernmentUser = !!profile?.isLocalGovernment || !!profile?.isFirstNationGovernment;
      this.governmentName = profile?.government;
      if (this.isGovernmentUser || this.selectedLocalGovernment) {
        this.prepareGovernmentOwners();
      }
    });

    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.files = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.AUTHORIZATION_LETTER);
    });
  }

  async onSave() {
    await this.save();
  }

  async attachAuthorizationLetter(file: FileHandle) {
    const res = await this.attachFile(file, DOCUMENT_TYPE.AUTHORIZATION_LETTER);
    this.showVirusError = !res;
  }

  onSelectAgent() {
    this.onSelectOwner('agent');
  }

  onSelectGovernment() {
    this.onSelectOwner('government');
  }

  onSelectOwner(uuid: string) {
    this.isDirty = true;
    this.selectedOwnerUuid = uuid;
    const selectedOwner = this.parcelOwners.find((owner) => owner.uuid === uuid);
    this.parcelOwners = this.parcelOwners.map((owner) => ({
      ...owner,
      isSelected: owner.uuid === uuid,
    }));
    this.selectedThirdPartyAgent = (selectedOwner && selectedOwner.type.code === OWNER_TYPE.AGENT) || uuid == 'agent';
    this.selectedLocalGovernment =
      (selectedOwner && selectedOwner.type.code === OWNER_TYPE.GOVERNMENT) || uuid == 'government';
    this.form.reset();

    if (this.selectedLocalGovernment) {
      this.organizationName.setValidators([Validators.required]);
    } else {
      this.organizationName.setValidators([]);
    }

    if (this.selectedThirdPartyAgent || this.selectedLocalGovernment) {
      this.firstName.enable();
      this.lastName.enable();
      this.organizationName.enable();
      this.email.enable();
      this.phoneNumber.enable();
      this.isCrownOwner = false;
    } else {
      this.firstName.disable();
      this.lastName.disable();
      this.organizationName.disable();
      this.email.disable();
      this.phoneNumber.disable();

      if (selectedOwner) {
        this.form.patchValue({
          firstName: selectedOwner.firstName,
          lastName: selectedOwner.lastName,
          organizationName: selectedOwner.organizationName,
          phoneNumber: selectedOwner.phoneNumber,
          email: selectedOwner.email,
        });
        this.isCrownOwner = selectedOwner.type.code === OWNER_TYPE.CROWN;
      }
    }
    this.calculateLetterRequired();

    setTimeout(() => {
      scrollToElement({ id: 'owner-info', center: false });
    });
  }

  private calculateLetterRequired() {
    if (this.selectedLocalGovernment) {
      this.needsAuthorizationLetter = false;
    } else {
      const isSelfApplicant =
        this.parcelOwners.length === 1 && this.parcelOwners[0].type.code === OWNER_TYPE.INDIVIDUAL;
      this.needsAuthorizationLetter = this.selectedThirdPartyAgent || this.hasCrownParcels || !isSelfApplicant;
    }

    this.files = this.files.map((file) => ({
      ...file,
      errorMessage: !this.needsAuthorizationLetter
        ? 'Authorization Letter not required. Please remove this file.'
        : undefined,
    }));
  }

  protected async save() {
    if (this.isDirty || this.form.dirty) {
      let selectedOwner: ApplicationOwnerDto | undefined = this.owners.find(
        (owner) => owner.uuid === this.selectedOwnerUuid
      );

      if (this.selectedThirdPartyAgent || this.selectedLocalGovernment) {
        await this.applicationOwnerService.setPrimaryContact({
          applicationSubmissionUuid: this.submissionUuid,
          organization: this.organizationName.getRawValue() ?? '',
          firstName: this.firstName.getRawValue() ?? '',
          lastName: this.lastName.getRawValue() ?? '',
          email: this.email.getRawValue() ?? '',
          phoneNumber: this.phoneNumber.getRawValue() ?? '',
          ownerUuid: selectedOwner?.uuid,
          type: this.selectedThirdPartyAgent ? OWNER_TYPE.AGENT : OWNER_TYPE.GOVERNMENT,
        });
      } else if (selectedOwner) {
        await this.applicationOwnerService.setPrimaryContact({
          applicationSubmissionUuid: this.submissionUuid,
          ownerUuid: selectedOwner.uuid,
        });
      }
      await this.reloadApplication();
    }
  }

  private async reloadApplication() {
    const application = await this.applicationService.getByUuid(this.submissionUuid);
    this.$applicationSubmission.next(application);
  }

  private async loadOwners(submissionUuid: string, primaryContactOwnerUuid?: string) {
    //Map Owners from Parcels to only count linked ones
    const parcels = await this.applicationParcelService.fetchBySubmissionUuid(submissionUuid);
    const allOwners = await this.applicationOwnerService.fetchBySubmissionId(submissionUuid);
    if (parcels && allOwners) {
      this.hasCrownParcels =
        !!parcels && parcels.some((parcel) => parcel.ownershipTypeCode === PARCEL_OWNERSHIP_TYPE.CROWN);

      const uniqueParcelOwners = parcels
        .flatMap((parcel) => parcel.owners)
        .reduce((map, owner) => {
          return map.set(owner.uuid, owner);
        }, new Map<string, ApplicationOwnerDto>());
      const nonParcelOwners = allOwners.filter((owner) =>
        [OWNER_TYPE.AGENT, OWNER_TYPE.GOVERNMENT].includes(owner.type.code)
      );
      const parcelOwners = [...uniqueParcelOwners.values()];
      const owners = [...parcelOwners, ...nonParcelOwners];

      const selectedOwner = owners.find((owner) => owner.uuid === primaryContactOwnerUuid);
      this.parcelOwners = owners.filter(
        (owner) => ![OWNER_TYPE.AGENT, OWNER_TYPE.GOVERNMENT].includes(owner.type.code)
      );

      this.parcelOwners = parcelOwners;
      this.owners = owners;

      if (selectedOwner) {
        this.selectedThirdPartyAgent = selectedOwner.type.code === OWNER_TYPE.AGENT;
        this.selectedLocalGovernment = selectedOwner.type.code === OWNER_TYPE.GOVERNMENT;
      }

      this.primaryContactType.setValue(!this.selectedThirdPartyAgent);

      if (this.selectedLocalGovernment) {
        this.organizationName.setValidators([Validators.required]);
      } else {
        this.organizationName.setValidators([]);
      }

      if (selectedOwner && (this.selectedThirdPartyAgent || this.selectedLocalGovernment)) {
        this.selectedOwnerUuid = selectedOwner.uuid;
        this.form.patchValue({
          firstName: selectedOwner.firstName,
          lastName: selectedOwner.lastName,
          organizationName: selectedOwner.organizationName,
          phoneNumber: selectedOwner.phoneNumber,
          email: selectedOwner.email,
        });
      } else if (selectedOwner) {
        this.onSelectOwner(selectedOwner.uuid);
      } else {
        this.firstName.disable();
        this.lastName.disable();
        this.organizationName.disable();
        this.email.disable();
        this.phoneNumber.disable();
      }

      if (this.isGovernmentUser || this.selectedLocalGovernment) {
        this.prepareGovernmentOwners();
      }

      if (this.showErrors) {
        this.form.markAllAsTouched();
      }
      this.isDirty = false;
      this.calculateLetterRequired();
    }
  }

  private prepareGovernmentOwners() {
    this.parcelOwners = [];
  }

  async onSelectPrimaryContactType(selectedThirdPartyAgent: boolean | null) {
    if (this.form.dirty || (this.selectedOwnerUuid !== 'agent' && this.selectedOwnerUuid !== 'government')) {
      await this.dialog
        .open(PrimaryContactConfirmationDialogComponent, {
          panelClass: 'no-padding',
          disableClose: true,
        })
        .beforeClosed()
        .subscribe(async (confirmed) => {
          if (confirmed) {
            this.switchPrimaryContactType(selectedThirdPartyAgent);
          } else {
            this.primaryContactType.setValue(selectedThirdPartyAgent);
          }
        });
    } else {
      this.switchPrimaryContactType(selectedThirdPartyAgent);
    }
  }

  switchPrimaryContactType(selectedThirdPartyAgent: boolean | null) {
    if (selectedThirdPartyAgent) {
      this.onSelectAgent();
    } else if (this.isGovernmentUser) {
      this.onSelectGovernment();
    } else {
      this.selectedThirdPartyAgent = false;
    }
  }

  onEdit(selectedOwnerUuid: string) {
    const selectedOwner = this.parcelOwners.find((owner) => owner.uuid === selectedOwnerUuid);

    let dialog;

    if (this.isCrownOwner) {
      dialog = this.dialog.open(CrownOwnerDialogComponent, {
        data: {
          existingOwner: selectedOwner,
          submissionUuid: this.submissionUuid,
          ownerService: this.applicationOwnerService,
        },
      });
    } else {
      dialog = this.dialog.open(OwnerDialogComponent, {
        data: {
          existingOwner: selectedOwner,
          submissionUuid: this.submissionUuid,
          ownerService: this.applicationOwnerService,
        },
      });
    }

    dialog.afterClosed().subscribe(async (updatedContact) => {
      if (updatedContact && this.selectedOwnerUuid !== undefined) {
        this.firstName.setValue(updatedContact.firstName);
        this.lastName.setValue(updatedContact.lastName);
        this.organizationName.setValue(updatedContact.organizationName);
        this.phoneNumber.setValue(updatedContact.phoneNumber);
        this.email.setValue(updatedContact.email);
      }
    });
  }
}
