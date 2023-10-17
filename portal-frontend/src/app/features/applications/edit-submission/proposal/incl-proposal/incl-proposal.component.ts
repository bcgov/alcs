import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { AuthenticationService } from '../../../../../services/authentication/authentication.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { FileHandle } from '../../../../../shared/file-drag-drop/drag-drop.directive';
import { formatBooleanToString } from '../../../../../shared/utils/boolean-helper';
import { parseStringToBoolean } from '../../../../../shared/utils/string-helper';
import { FilesStepComponent } from '../../files-step.partial';
import { ApplicationSubmissionService } from '../../../../../services/application-submission/application-submission.service';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';
import { EditApplicationSteps } from '../../edit-submission.component';
import { takeUntil } from 'rxjs';
import { ApplicationSubmissionUpdateDto } from '../../../../../services/application-submission/application-submission.dto';

interface InclForm {
  hectares: FormControl<string | null>;
  purpose: FormControl<string | null>;
  agSupport: FormControl<string | null>;
  improvements: FormControl<string | null>;
  governmentOwnsAllParcels?: FormControl<string | null | undefined>;
}

@Component({
  selector: 'app-incl-proposal',
  templateUrl: './incl-proposal.component.html',
  styleUrls: ['./incl-proposal.component.scss'],
})
export class InclProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  DOCUMENT = DOCUMENT_TYPE;
  currentStep = EditApplicationSteps.Proposal;
  private submissionUuid = '';
  showGovernmentQuestions = false;
  governmentName? = '';
  disableNotificationFileUploads = false;

  showProposalMapVirus = false;
  showProofOfAdvertisingVirus = false;
  showProofOfSignageVirus = false;
  showReportOfPublicHearingVirus = false;

  hectares = new FormControl<string | null>(null, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  agSupport = new FormControl<string | null>(null, [Validators.required]);
  improvements = new FormControl<string | null>(null, [Validators.required]);
  governmentOwnsAllParcels = new FormControl<string | undefined>(undefined, [Validators.required]);

  form = new FormGroup<InclForm>({
    hectares: this.hectares,
    purpose: this.purpose,
    agSupport: this.agSupport,
    improvements: this.improvements,
  });

  proposalMap: ApplicationDocumentDto[] = [];
  noticeOfPublicHearing: ApplicationDocumentDto[] = [];
  proofOfSignage: ApplicationDocumentDto[] = [];
  reportOfPublicHearing: ApplicationDocumentDto[] = [];

  constructor(
    private applicationSubmissionService: ApplicationSubmissionService,
    private authenticationService: AuthenticationService,
    applicationDocumentService: ApplicationDocumentService,
    dialog: MatDialog,
    toastService: ToastService
  ) {
    super(applicationDocumentService, dialog, toastService);
  }

  ngOnInit(): void {
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((applicationSubmission) => {
      if (applicationSubmission) {
        this.fileId = applicationSubmission.fileNumber;
        this.submissionUuid = applicationSubmission.uuid;

        this.form.patchValue({
          hectares: applicationSubmission.inclExclHectares?.toString(),
          purpose: applicationSubmission.purpose,
          agSupport: applicationSubmission.inclAgricultureSupport,
          improvements: applicationSubmission.inclImprovements,
        });

        if (applicationSubmission.inclGovernmentOwnsAllParcels !== null) {
          this.showGovernmentQuestions = true;
          this.governmentOwnsAllParcels.setValue(
            formatBooleanToString(applicationSubmission.inclGovernmentOwnsAllParcels)
          );
          this.disableNotificationFileUploads = applicationSubmission.inclGovernmentOwnsAllParcels;
          this.form.setControl('governmentOwnsAllParcels', this.governmentOwnsAllParcels);
        }

        if (this.showErrors) {
          this.form.markAllAsTouched();
        }
      }
    });

    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
      this.noticeOfPublicHearing = documents.filter(
        (document) => document.type?.code === DOCUMENT_TYPE.PROOF_OF_ADVERTISING
      );
      this.proofOfSignage = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROOF_OF_SIGNAGE);
      this.reportOfPublicHearing = documents.filter(
        (document) => document.type?.code === DOCUMENT_TYPE.REPORT_OF_PUBLIC_HEARING
      );
    });

    this.authenticationService.$currentProfile.pipe(takeUntil(this.$destroy)).subscribe((userProfile) => {
      if (userProfile) {
        this.showGovernmentQuestions =
          this.showGovernmentQuestions || userProfile?.isLocalGovernment || userProfile?.isFirstNationGovernment;
        this.governmentName = userProfile.government;
        if (this.showGovernmentQuestions) {
          this.form.setControl('governmentOwnsAllParcels', this.governmentOwnsAllParcels);
          if (this.showErrors) {
            this.form.markAllAsTouched();
          }
        }
      }
    });
  }

  async onSave() {
    await this.save();
  }

  async attachProposalMap(file: FileHandle) {
    const res = await this.attachFile(file, DOCUMENT_TYPE.PROPOSAL_MAP);
    this.showProposalMapVirus = !res;
  }

  async attachProofOfAdvertising(file: FileHandle) {
    const res = await this.attachFile(file, DOCUMENT_TYPE.PROOF_OF_ADVERTISING);
    this.showProofOfAdvertisingVirus = !res;
  }

  async attachProofOfSignage(file: FileHandle) {
    const res = await this.attachFile(file, DOCUMENT_TYPE.PROOF_OF_SIGNAGE);
    this.showProofOfSignageVirus = !res;
  }

  async attachReportOfPublicHearing(file: FileHandle) {
    const res = await this.attachFile(file, DOCUMENT_TYPE.REPORT_OF_PUBLIC_HEARING);
    this.showReportOfPublicHearingVirus = !res;
  }

  protected async save() {
    if (this.fileId) {
      const inclExclHectares = this.hectares.value;
      const purpose = this.purpose.value;
      const inclAgricultureSupport = this.agSupport.value;
      const inclImprovements = this.improvements.value;
      const inclGovernmentOwnsAllParcels = this.governmentOwnsAllParcels.value;

      const updateDto: ApplicationSubmissionUpdateDto = {
        inclExclHectares: inclExclHectares ? parseFloat(inclExclHectares) : null,
        purpose,
        inclAgricultureSupport,
        inclImprovements,
        inclGovernmentOwnsAllParcels: parseStringToBoolean(inclGovernmentOwnsAllParcels),
      };

      const updatedApp = await this.applicationSubmissionService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }

  onSelectLocalGovernmentParcelOwner($event: MatButtonToggleChange) {
    this.disableNotificationFileUploads = $event.value === 'true';
  }
}
