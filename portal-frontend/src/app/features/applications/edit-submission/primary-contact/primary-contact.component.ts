import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { ApplicationOwnerDto } from '../../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../../services/application-owner/application-owner.service';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import { OWNER_TYPE } from '../../../../shared/dto/owner.dto';
import { FileHandle } from '../../../../shared/file-drag-drop/drag-drop.directive';
import { EditApplicationSteps } from '../edit-submission.component';
import { FilesStepComponent } from '../files-step.partial';

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
  }

  private calculateLetterRequired() {
    if (this.selectedLocalGovernment) {
      this.needsAuthorizationLetter = false;
    } else {
      const isSelfApplicant = this.owners.length > 0 && this.owners[0].type.code === OWNER_TYPE.INDIVIDUAL;
      this.needsAuthorizationLetter =
        this.selectedThirdPartyAgent ||
        !(
          isSelfApplicant &&
          (this.owners.length === 1 ||
            (this.owners.length === 2 &&
              this.owners[1].type.code === OWNER_TYPE.AGENT &&
              !this.selectedThirdPartyAgent))
        );
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
    const owners = await this.applicationOwnerService.fetchBySubmissionId(submissionUuid);
    if (owners) {
      const selectedOwner = owners.find((owner) => owner.uuid === primaryContactOwnerUuid);
      this.parcelOwners = owners.filter(
        (owner) => ![OWNER_TYPE.AGENT, OWNER_TYPE.GOVERNMENT].includes(owner.type.code)
      );
      this.owners = owners;

      if (selectedOwner) {
        this.selectedThirdPartyAgent = selectedOwner.type.code === OWNER_TYPE.AGENT;
        this.selectedLocalGovernment = selectedOwner.type.code === OWNER_TYPE.GOVERNMENT;
      }

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
}
