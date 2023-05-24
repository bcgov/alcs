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
import { StepComponent } from '../step.partial';

@Component({
  selector: 'app-primary-contact',
  templateUrl: './primary-contact.component.html',
  styleUrls: ['./primary-contact.component.scss'],
})
export class PrimaryContactComponent extends StepComponent implements OnInit, OnDestroy {
  @Input() $application!: BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>;
  @Input() $applicationDocuments!: BehaviorSubject<ApplicationDocumentDto[]>;
  currentStep = EditApplicationSteps.PrimaryContact;

  nonAgentOwners: ApplicationOwnerDto[] = [];
  owners: ApplicationOwnerDto[] = [];
  files: (ApplicationDocumentDto & { errorMessage?: string })[] = [];

  needsAuthorizationLetter = false;
  selectedThirdPartyAgent = false;
  selectedOwnerUuid: string | undefined = undefined;

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

  private fileId = '';
  private submissionUuid = '';

  constructor(
    private router: Router,
    private applicationService: ApplicationSubmissionService,
    private applicationDocumentService: ApplicationDocumentService,
    private applicationOwnerService: ApplicationOwnerService,
    private dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
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

  async onAttachFile(file: FileHandle) {
    if (this.fileId) {
      await this.onSave();
      await this.applicationDocumentService.attachExternalFile(
        this.fileId,
        file.file,
        DOCUMENT_TYPE.AUTHORIZATION_LETTER
      );
      const documents = await this.applicationDocumentService.getByFileId(this.fileId);
      if (documents) {
        this.$applicationDocuments.next(documents);
      }
    }
  }

  async onRemoveFile(document: ApplicationDocumentDto) {
    if (this.draftMode) {
      this.dialog
        .open(RemoveFileConfirmationDialogComponent)
        .beforeClosed()
        .subscribe(async (didConfirm) => {
          if (didConfirm) {
            this.removeFile(document);
          }
        });
    } else {
      await this.removeFile(document);
    }
  }

  async removeFile(document: ApplicationDocumentDto) {
    if (this.fileId) {
      await this.onSave();
      await this.applicationDocumentService.deleteExternalFile(document.uuid);
      const documents = await this.applicationDocumentService.getByFileId(this.fileId);
      if (documents) {
        this.$applicationDocuments.next(documents);
      }
    }
  }

  async onSave() {
    await this.save();
  }

  private async save() {
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
