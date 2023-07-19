import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ApplicationDocumentDto, DOCUMENT_TYPE } from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { APPLICATION_OWNER, ApplicationOwnerDto } from '../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';
import { ApplicationSubmissionService } from '../../../services/application-submission/application-submission.service';
import { AuthenticationService } from '../../../services/authentication/authentication.service';
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
  isLocalGovernmentUser = false;
  governmentName: string | undefined;

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
    private applicationService: ApplicationSubmissionService,
    applicationDocumentService: ApplicationDocumentService,
    private applicationOwnerService: ApplicationOwnerService,
    private authenticationService: AuthenticationService,
    dialog: MatDialog
  ) {
    super(applicationDocumentService, dialog);
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
      this.isLocalGovernmentUser = !!profile?.government;
      this.governmentName = profile?.government;
      if (this.isLocalGovernmentUser) {
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

  onSelectAgent() {
    this.onSelectOwner('agent');
  }

  onSelectGovernment() {
    this.onSelectOwner('government');
  }

  onSelectOwner(uuid: string) {
    this.selectedOwnerUuid = uuid;
    const selectedOwner = this.parcelOwners.find((owner) => owner.uuid === uuid);
    this.parcelOwners = this.parcelOwners.map((owner) => ({
      ...owner,
      isSelected: owner.uuid === uuid,
    }));
    this.selectedThirdPartyAgent =
      (selectedOwner && selectedOwner.type.code === APPLICATION_OWNER.AGENT) || uuid == 'agent';
    this.selectedLocalGovernment =
      (selectedOwner && selectedOwner.type.code === APPLICATION_OWNER.GOVERNMENT) || uuid == 'government';
    this.form.reset();

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
        this.isCrownOwner = selectedOwner.type.code === APPLICATION_OWNER.CROWN;
      }
    }

    const isSelfApplicant =
      this.owners[0].type.code === APPLICATION_OWNER.INDIVIDUAL ||
      this.owners[0].type.code === APPLICATION_OWNER.GOVERNMENT;

    this.needsAuthorizationLetter = !(
      isSelfApplicant &&
      (this.owners.length === 1 ||
        (this.owners.length === 2 &&
          this.owners[1].type.code === APPLICATION_OWNER.AGENT &&
          !this.selectedThirdPartyAgent))
    );
    this.files = this.files.map((file) => ({
      ...file,
      errorMessage: this.needsAuthorizationLetter
        ? undefined
        : 'Authorization Letter not required. Please remove this file.',
    }));
  }

  protected async save() {
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
        type: this.selectedThirdPartyAgent ? APPLICATION_OWNER.AGENT : APPLICATION_OWNER.GOVERNMENT,
      });
    } else if (selectedOwner) {
      await this.applicationOwnerService.setPrimaryContact({
        applicationSubmissionUuid: this.submissionUuid,
        ownerUuid: selectedOwner.uuid,
      });
    }
  }

  private async loadOwners(submissionUuid: string, primaryContactOwnerUuid?: string) {
    const owners = await this.applicationOwnerService.fetchBySubmissionId(submissionUuid);
    if (owners) {
      const selectedOwner = owners.find((owner) => owner.uuid === primaryContactOwnerUuid);
      this.parcelOwners = owners.filter(
        (owner) => ![APPLICATION_OWNER.AGENT, APPLICATION_OWNER.GOVERNMENT].includes(owner.type.code)
      );
      this.owners = owners;

      if (selectedOwner) {
        this.selectedThirdPartyAgent = selectedOwner.type.code === APPLICATION_OWNER.AGENT;
        this.selectedLocalGovernment = selectedOwner.type.code === APPLICATION_OWNER.GOVERNMENT;
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

      if (this.isLocalGovernmentUser) {
        this.prepareGovernmentOwners();
      }

      if (this.showErrors) {
        this.form.markAllAsTouched();
      }
    }
  }

  private prepareGovernmentOwners() {
    this.parcelOwners = [];
  }
}
