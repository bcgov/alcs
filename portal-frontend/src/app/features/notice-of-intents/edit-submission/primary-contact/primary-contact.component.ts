import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { PARCEL_OWNERSHIP_TYPE } from '../../../../services/application-parcel/application-parcel.dto';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { NoticeOfIntentDocumentDto } from '../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentOwnerDto } from '../../../../services/notice-of-intent-owner/notice-of-intent-owner.dto';
import { NoticeOfIntentOwnerService } from '../../../../services/notice-of-intent-owner/notice-of-intent-owner.service';
import { NoticeOfIntentParcelService } from '../../../../services/notice-of-intent-parcel/notice-of-intent-parcel.service';
import { NoticeOfIntentSubmissionService } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import { OWNER_TYPE } from '../../../../shared/dto/owner.dto';
import { FileHandle } from '../../../../shared/file-drag-drop/drag-drop.directive';
import { EditNoiSteps } from '../edit-submission.component';
import { FilesStepComponent } from '../files-step.partial';
import { OwnerDialogComponent } from 'src/app/shared/owner-dialogs/owner-dialog/owner-dialog.component';
import { PrimaryContactConfirmationDialogComponent } from './primary-contact-confirmation-dialog/primary-contact-confirmation-dialog.component';
import { CrownOwnerDialogComponent } from 'src/app/shared/owner-dialogs/crown-owner-dialog/crown-owner-dialog.component';

@Component({
  selector: 'app-primary-contact',
  templateUrl: './primary-contact.component.html',
  styleUrls: ['./primary-contact.component.scss'],
})
export class PrimaryContactComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditNoiSteps.PrimaryContact;

  parcelOwners: NoticeOfIntentOwnerDto[] = [];
  owners: NoticeOfIntentOwnerDto[] = [];
  files: (NoticeOfIntentDocumentDto & { errorMessage?: string })[] = [];

  needsAuthorizationLetter = false;
  showVirusError = false;
  selectedThirdPartyAgent = false;
  selectedLocalGovernment = false;
  selectedOwnerUuid: string | undefined = undefined;
  isCrownOwner = false;
  isGovernmentUser = false;
  governmentName: string | undefined;
  isDirty = false;
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
    private router: Router,
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
    private noticeOfIntentOwnerService: NoticeOfIntentOwnerService,
    private authenticationService: AuthenticationService,
    private parcelService: NoticeOfIntentParcelService,
    dialog: MatDialog,
    toastService: ToastService
  ) {
    super(noticeOfIntentDocumentService, dialog, toastService);
  }

  ngOnInit(): void {
    this.$noiSubmission.pipe(takeUntil(this.$destroy)).subscribe((submission) => {
      if (submission) {
        this.fileId = submission.fileNumber;
        this.submissionUuid = submission.uuid;
        this.loadOwners(submission.uuid, submission.primaryContactOwnerUuid);
      }
    });

    this.authenticationService.$currentProfile.pipe(takeUntil(this.$destroy)).subscribe((profile) => {
      this.isGovernmentUser = !!profile?.isLocalGovernment || !!profile?.isFirstNationGovernment;
      this.governmentName = profile?.government;
      if (this.isGovernmentUser || this.selectedLocalGovernment) {
        this.prepareGovernmentOwners();
      }
    });

    this.$noiDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
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
      let selectedOwner: NoticeOfIntentOwnerDto | undefined = this.owners.find(
        (owner) => owner.uuid === this.selectedOwnerUuid
      );

      if (this.selectedThirdPartyAgent || this.selectedLocalGovernment) {
        await this.noticeOfIntentOwnerService.setPrimaryContact({
          noticeOfIntentSubmissionUuid: this.submissionUuid,
          organization: this.organizationName.getRawValue() ?? '',
          firstName: this.firstName.getRawValue() ?? '',
          lastName: this.lastName.getRawValue() ?? '',
          email: this.email.getRawValue() ?? '',
          phoneNumber: this.phoneNumber.getRawValue() ?? '',
          ownerUuid: selectedOwner?.uuid,
          type: this.selectedThirdPartyAgent ? OWNER_TYPE.AGENT : OWNER_TYPE.GOVERNMENT,
        });
      } else if (selectedOwner) {
        await this.noticeOfIntentOwnerService.setPrimaryContact({
          noticeOfIntentSubmissionUuid: this.submissionUuid,
          ownerUuid: selectedOwner.uuid,
        });
      }
      await this.reloadSubmission();
    }
  }

  private async reloadSubmission() {
    const noiSubmission = await this.noticeOfIntentSubmissionService.getByUuid(this.submissionUuid);
    this.$noiSubmission.next(noiSubmission);
  }

  private async loadOwners(submissionUuid: string, primaryContactOwnerUuid?: string | null) {
    //Map Owners from Parcels to only count linked ones
    const parcels = await this.parcelService.fetchBySubmissionUuid(submissionUuid);
    const allOwners = await this.noticeOfIntentOwnerService.fetchBySubmissionId(submissionUuid);
    if (parcels && allOwners) {
      this.hasCrownParcels =
        !!parcels && parcels.some((parcel) => parcel.ownershipTypeCode === PARCEL_OWNERSHIP_TYPE.CROWN);

      const uniqueParcelOwners = parcels
        .flatMap((parcel) => parcel.owners)
        .reduce((map, owner) => {
          return map.set(owner.uuid, owner);
        }, new Map<string, NoticeOfIntentOwnerDto>());
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
          ownerService: this.noticeOfIntentOwnerService,
        },
      });
    } else {
      dialog = this.dialog.open(OwnerDialogComponent, {
        data: {
          existingOwner: selectedOwner,
          submissionUuid: this.submissionUuid,
          ownerService: this.noticeOfIntentOwnerService,
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
