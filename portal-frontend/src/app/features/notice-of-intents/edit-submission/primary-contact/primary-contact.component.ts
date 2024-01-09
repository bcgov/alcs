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
import { OwnerDialogComponent } from '../../../../shared/owner-dialogs/owner-dialog/owner-dialog.component';
import { PrimaryContactConfirmationDialogComponent } from './primary-contact-confirmation-dialog/primary-contact-confirmation-dialog.component';
import { CrownOwnerDialogComponent } from '../../../../shared/owner-dialogs/crown-owner-dialog/crown-owner-dialog.component';
import { scrollToElement } from '../../../../shared/utils/scroll-helper';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

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
  _selectedOwnerUuid: string | undefined = undefined;
  isCrownOwner = false;
  isGovernmentUser = false;
  governmentName: string | undefined;
  isDirty = false;
  hasCrownParcels = false;

  ownersList = new FormControl<string | null>(null, [Validators.required]);
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

  set selectedOwnerUuid(value: string | undefined) {
    this._selectedOwnerUuid = value;
    // Input expects null instead of undefined
    this.ownersList.setValue(value ?? null);
  }

  get selectedOwnerUuid() {
    return this._selectedOwnerUuid;
  }

  onSelectAgent() {
    this.onSelectOwner('agent');
  }

  onSelectGovernment() {
    this.onSelectOwner('government');
  }

  onSelectOwner(uuid: string) {
    this.isDirty = true;

    const selectedOwner = this.parcelOwners.find((owner) => owner.uuid === uuid);
    this.parcelOwners = this.parcelOwners.map((owner) => ({
      ...owner,
      isSelected: owner.uuid === uuid,
    }));

    this.selectedThirdPartyAgent = selectedOwner?.type.code === OWNER_TYPE.AGENT || uuid == 'agent';
    this.selectedLocalGovernment = selectedOwner?.type.code === OWNER_TYPE.GOVERNMENT || uuid == 'government';

    if (this.selectedLocalGovernment) {
      this.organizationName.setValidators([Validators.required]);
    } else {
      this.organizationName.setValidators([]);
    }

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

    this.calculateLetterRequired();

    setTimeout(() => {
      this.selectedOwnerUuid = uuid;
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
    if (this.isDirty || this.form.dirty || !this.selectedThirdPartyAgent) {
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
      } else {
        await this.noticeOfIntentOwnerService.setPrimaryContact({
          noticeOfIntentSubmissionUuid: this.submissionUuid,
          ownerUuid: selectedOwner?.uuid,
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

    if (!parcels || !allOwners) {
      return;
    }

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
    this.parcelOwners = owners.filter((owner) => ![OWNER_TYPE.AGENT, OWNER_TYPE.GOVERNMENT].includes(owner.type.code));

    this.parcelOwners = parcelOwners;
    this.owners = owners;

    // onSelectOwner only not called on first load of page
    if (selectedOwner) {
      this.onSelectOwner(selectedOwner.uuid);
    } else if (parcelOwners.length === 1) {
      this.onSelectOwner(parcelOwners[0].uuid);
    }

    // Needed for L/FNG user on first load
    this.selectedLocalGovernment = selectedOwner?.type.code === OWNER_TYPE.GOVERNMENT;
    if (this.selectedLocalGovernment) {
      this.organizationName.setValidators([Validators.required]);
      this.prepareGovernmentOwners();
    } else {
      this.organizationName.setValidators([]);
    }

    if (this.showErrors) {
      this.form.markAllAsTouched();
    }
    this.isDirty = false;
    this.calculateLetterRequired();
  }

  private prepareGovernmentOwners() {
    this.parcelOwners = [];
  }

  async onSelectPrimaryContactType(event: MatButtonToggleChange) {
    const isExistingOwner = event.value;
    const hasValues = Object.values(this.form.value).some((value) => value);

    if (hasValues) {
      await this.dialog
        .open(PrimaryContactConfirmationDialogComponent, {
          panelClass: 'no-padding',
          disableClose: true,
          data: {
            isGovernmentUser: this.isGovernmentUser,
            governmentName: this.governmentName,
          },
        })
        .beforeClosed()
        .subscribe(async (confirmed) => {
          if (confirmed) {
            this.form.reset();
            this.switchPrimaryContactType(isExistingOwner);
          }
        });
    } else {
      this.switchPrimaryContactType(isExistingOwner);
    }
  }

  private switchPrimaryContactType(isExistingOwner: boolean | null) {
    if (!isExistingOwner) {
      // '3rd-party agent
      this.onSelectAgent();
    } else if (this.isGovernmentUser) {
      // L/FNG contact
      this.onSelectGovernment();
    } else if (this.parcelOwners.length === 1) {
      // Only 1 existing user
      this.onSelectOwner(this.parcelOwners[0].uuid);
    } else if (this.selectedThirdPartyAgent) {
      // = 0 or > 1 existing owners
      this.selectedOwnerUuid = undefined;
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

      if (updatedContact?.action === 'delete' || updatedContact?.type === 'delete') {
        this.parcelOwners = this.parcelOwners.filter((owner) => owner.uuid !== this.selectedOwnerUuid);

        if (this.parcelOwners.length === 1) {
          this.onSelectOwner(this.parcelOwners[0].uuid);
        } else {
          this.selectedOwnerUuid = undefined;
        }
      }
    });
  }
}
