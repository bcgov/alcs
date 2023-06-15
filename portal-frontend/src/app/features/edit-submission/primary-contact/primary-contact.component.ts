import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto, DOCUMENT_TYPE } from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { APPLICATION_OWNER, ApplicationOwnerDto } from '../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';
import { ApplicationSubmissionDetailedDto } from '../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../services/application-submission/application-submission.service';
import { FileHandle } from '../../../shared/file-drag-drop/drag-drop.directive';
import { RemoveFileConfirmationDialogComponent } from '../../alcs-edit-submission/remove-file-confirmation-dialog/remove-file-confirmation-dialog.component';
import { EditApplicationSteps } from '../edit-submission.component';
import { FilesStepComponent } from '../files-step.partial';
import { StepComponent } from '../step.partial';

@Component({
  selector: 'app-primary-contact',
  templateUrl: './primary-contact.component.html',
  styleUrls: ['./primary-contact.component.scss'],
})
export class PrimaryContactComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.PrimaryContact;

  nonAgentOwners: ApplicationOwnerDto[] = [];
  owners: ApplicationOwnerDto[] = [];
  files: (ApplicationDocumentDto & { errorMessage?: string })[] = [];

  needsAuthorizationLetter = false;
  selectedThirdPartyAgent = false;
  selectedOwnerUuid: string | undefined = undefined;
  isCrownOwner = false;

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

    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.files = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.AUTHORIZATION_LETTER);
    });
  }

  async onSave() {
    await this.save();
  }

  protected async save() {
    let selectedOwner: ApplicationOwnerDto | undefined = this.owners.find(
      (owner) => owner.uuid === this.selectedOwnerUuid
    );

    if (this.selectedThirdPartyAgent) {
      await this.applicationOwnerService.setPrimaryContact({
        applicationSubmissionUuid: this.submissionUuid,
        agentOrganization: this.organizationName.getRawValue() ?? '',
        agentFirstName: this.firstName.getRawValue() ?? '',
        agentLastName: this.lastName.getRawValue() ?? '',
        agentEmail: this.email.getRawValue() ?? '',
        agentPhoneNumber: this.phoneNumber.getRawValue() ?? '',
        ownerUuid: selectedOwner?.uuid,
      });
    } else if (selectedOwner) {
      await this.applicationOwnerService.setPrimaryContact({
        applicationSubmissionUuid: this.submissionUuid,
        ownerUuid: selectedOwner.uuid,
      });
    }
  }

  onSelectOwner(uuid: string) {
    this.selectedOwnerUuid = uuid;
    const selectedOwner = this.nonAgentOwners.find((owner) => owner.uuid === uuid);
    this.nonAgentOwners = this.nonAgentOwners.map((owner) => ({
      ...owner,
      isSelected: owner.uuid === uuid,
    }));
    const hasSelectedAgent = (selectedOwner && selectedOwner.type.code === APPLICATION_OWNER.AGENT) || uuid == 'agent';
    this.selectedThirdPartyAgent = hasSelectedAgent;
    this.form.reset();

    if (hasSelectedAgent) {
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

    this.needsAuthorizationLetter = !(
      this.owners.length === 1 && this.owners[0].type.code === APPLICATION_OWNER.INDIVIDUAL
    );
    this.files = this.files.map((file) => ({
      ...file,
      errorMessage: this.needsAuthorizationLetter
        ? undefined
        : 'Authorization Letter not required. Please remove this file.',
    }));
  }

  onSelectAgent() {
    this.onSelectOwner('agent');
  }

  private async loadOwners(submissionUuid: string, primaryContactOwnerUuid?: string) {
    const owners = await this.applicationOwnerService.fetchBySubmissionId(submissionUuid);
    if (owners) {
      const selectedOwner = owners.find((owner) => owner.uuid === primaryContactOwnerUuid);
      this.nonAgentOwners = owners.filter((owner) => owner.type.code !== APPLICATION_OWNER.AGENT);
      this.owners = owners;

      if (selectedOwner && selectedOwner.type.code === APPLICATION_OWNER.AGENT) {
        this.selectedOwnerUuid = selectedOwner.uuid;
        this.selectedThirdPartyAgent = true;
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

      if (this.showErrors) {
        this.form.markAllAsTouched();
      }
    }
  }
}
