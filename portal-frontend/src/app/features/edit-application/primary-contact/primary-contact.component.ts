import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto, DOCUMENT } from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import { APPLICATION_OWNER, ApplicationOwnerDto } from '../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';
import { ApplicationDetailedDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { FileHandle } from '../../../shared/file-drag-drop/drag-drop.directive';
import { EditApplicationSteps } from '../edit-application.component';

@Component({
  selector: 'app-primary-contact',
  templateUrl: './primary-contact.component.html',
  styleUrls: ['./primary-contact.component.scss'],
})
export class PrimaryContactComponent implements OnInit, OnDestroy {
  @Input() $application!: BehaviorSubject<ApplicationDetailedDto | undefined>;
  @Output() navigateToStep = new EventEmitter<number>();
  currentStep = EditApplicationSteps.PrimaryContact;
  $destroy = new Subject<void>();

  nonAgentOwners: ApplicationOwnerDto[] = [];
  owners: ApplicationOwnerDto[] = [];
  private fileId: string | undefined;
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

  constructor(
    private router: Router,
    private applicationService: ApplicationService,
    private applicationDocumentService: ApplicationDocumentService,
    private applicationOwnerService: ApplicationOwnerService
  ) {}

  ngOnInit(): void {
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.fileId = application.fileNumber;
        this.files = application.documents.filter((document) => document.type === DOCUMENT.AUTHORIZATION_LETTER);
        this.loadOwners(application.fileNumber, application.primaryContactOwnerUuid);
      }
    });
  }

  async onAttachFile(file: FileHandle) {
    if (this.fileId) {
      await this.onSave();
      await this.applicationDocumentService.attachExternalFile(this.fileId, file.file, DOCUMENT.AUTHORIZATION_LETTER);
      const updatedApp = await this.applicationService.getByFileId(this.fileId);
      this.$application.next(updatedApp);
    }
  }

  async onRemoveFile(document: ApplicationDocumentDto) {
    if (this.fileId) {
      await this.onSave();
      await this.applicationDocumentService.deleteExternalFile(document.uuid);
      const updatedApp = await this.applicationService.getByFileId(this.fileId);
      this.$application.next(updatedApp);
    }
  }

  async ngOnDestroy() {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onSaveExit() {
    await this.router.navigateByUrl(`/application/${this.fileId}`);
  }

  async onSave() {
    await this.save();
  }

  private async save() {
    if (this.fileId) {
      let selectedOwner: ApplicationOwnerDto | undefined = this.owners.find(
        (owner) => owner.uuid === this.selectedOwnerUuid
      );

      if (this.selectedThirdPartyAgent) {
        await this.applicationOwnerService.setPrimaryContact({
          fileNumber: this.fileId,
          agentOrganization: this.organizationName.getRawValue() ?? '',
          agentFirstName: this.firstName.getRawValue() ?? '',
          agentLastName: this.lastName.getRawValue() ?? '',
          agentEmail: this.email.getRawValue() ?? '',
          agentPhoneNumber: this.phoneNumber.getRawValue() ?? '',
          ownerUuid: selectedOwner?.uuid,
        });
      } else if (selectedOwner) {
        await this.applicationOwnerService.setPrimaryContact({
          fileNumber: this.fileId,
          ownerUuid: selectedOwner.uuid,
        });
      }
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
    if (hasSelectedAgent) {
      this.firstName.enable();
      this.lastName.enable();
      this.organizationName.enable();
      this.email.enable();
      this.phoneNumber.enable();
    } else {
      this.form.reset();
      this.firstName.disable();
      this.lastName.disable();
      this.organizationName.disable();
      this.email.disable();
      this.phoneNumber.disable();
    }
    this.needsAuthorizationLetter = this.nonAgentOwners.length > 1 || hasSelectedAgent;
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

  private async loadOwners(fileNumber: string, primaryContactOwnerUuid?: string) {
    const owners = await this.applicationOwnerService.fetchByFileId(fileNumber);
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
    }
  }

  onNavigateToStep(step: number) {
    this.navigateToStep.emit(step);
  }
}
