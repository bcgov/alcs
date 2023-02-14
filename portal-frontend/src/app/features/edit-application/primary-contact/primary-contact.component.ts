import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto, DOCUMENT } from '../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../services/application-document/application-document.service';
import {
  APPLICATION_OWNER,
  ApplicationOwnerDetailedDto,
  ApplicationOwnerDto,
} from '../../../services/application-owner/application-owner.dto';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';
import { ApplicationDetailedDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';
import { FileHandle } from '../../../shared/file-drag-drop/drag-drop.directive';

@Component({
  selector: 'app-primary-contact',
  templateUrl: './primary-contact.component.html',
  styleUrls: ['./primary-contact.component.scss'],
})
export class PrimaryContactComponent implements OnInit, OnDestroy {
  @Input() $application!: BehaviorSubject<ApplicationDetailedDto | undefined>;
  $destroy = new Subject<void>();
  nonAgentOwners: ApplicationOwnerDto[] = [];
  owners: ApplicationOwnerDto[] = [];
  private fileId: string | undefined;
  files: ApplicationDocumentDto[] = [];

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
        this.owners = application.owners;
        this.nonAgentOwners = application.owners.filter((owner) => owner.type.code !== APPLICATION_OWNER.AGENT);
        this.selectedOwnerUuid = application.primaryContactOwnerUuid;

        const selectedOwner = application.owners.find((owner) => owner.uuid === this.selectedOwnerUuid);
        if (selectedOwner && selectedOwner.type.code === APPLICATION_OWNER.AGENT) {
          this.selectedThirdPartyAgent = true;
          this.form.patchValue({
            firstName: selectedOwner.firstName,
            lastName: selectedOwner.lastName,
            organizationName: selectedOwner.organizationName,
            phoneNumber: selectedOwner.phoneNumber,
            email: selectedOwner.email,
          });
        }

        this.files = application.documents.filter((document) => document.type === DOCUMENT.AUTHORIZATION_LETTER);
        if (this.nonAgentOwners.length > 1 && application.primaryContactOwnerUuid) {
          this.needsAuthorizationLetter = true;
        }
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

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  async onSaveExit() {
    await this.save();
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
      } else {
        await this.applicationOwnerService.setPrimaryContact({
          fileNumber: this.fileId,
          ownerUuid: selectedOwner?.uuid,
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
    this.needsAuthorizationLetter = this.nonAgentOwners.length > 1 || hasSelectedAgent;
  }

  onSelectAgent() {
    this.onSelectOwner('agent');
  }
}
