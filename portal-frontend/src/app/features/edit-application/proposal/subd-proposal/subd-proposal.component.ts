import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import {
  ApplicationDocumentDto,
  DOCUMENT_TYPE,
} from '../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import {
  ApplicationSubmissionDetailedDto,
  ApplicationSubmissionUpdateDto,
} from '../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../services/application-submission/application-submission.service';
import { FileHandle } from '../../../../shared/file-drag-drop/drag-drop.directive';
import { EditApplicationSteps } from '../../edit-application.component';

@Component({
  selector: 'app-subd-proposal',
  templateUrl: './subd-proposal.component.html',
  styleUrls: ['./subd-proposal.component.scss'],
})
export class SubdProposalComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  currentStep = EditApplicationSteps.Proposal;
  @Input() $application!: BehaviorSubject<ApplicationSubmissionDetailedDto | undefined>;
  @Input() $applicationDocuments!: BehaviorSubject<ApplicationDocumentDto[]>;
  @Input() showErrors = false;
  @Output() navigateToStep = new EventEmitter<number>();

  DOCUMENT = DOCUMENT_TYPE;

  homesiteSeverance: ApplicationDocumentDto[] = [];
  proposalMap: ApplicationDocumentDto[] = [];

  purpose = new FormControl<string | null>(null, [Validators.required]);
  suitability = new FormControl<string | null>(null, [Validators.required]);
  agriculturalSupport = new FormControl<string | null>(null, [Validators.required]);
  isHomeSiteSeverance = new FormControl<string | null>(null, [Validators.required]);

  form = new FormGroup({
    purpose: this.purpose,
    suitability: this.suitability,
    agriculturalSupport: this.agriculturalSupport,
    isHomeSiteSeverance: this.isHomeSiteSeverance,
  });
  private fileId: string | undefined;

  constructor(
    private router: Router,
    private applicationService: ApplicationSubmissionService,
    private applicationDocumentService: ApplicationDocumentService
  ) {}

  ngOnInit(): void {
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.fileId = application.fileNumber;

        let isHomeSiteSeverance = null;
        if (application.subdIsHomeSiteSeverance !== null) {
          isHomeSiteSeverance = application.subdIsHomeSiteSeverance ? 'true' : 'false';
        }

        this.form.patchValue({
          purpose: application.subdPurpose,
          suitability: application.subdSuitability,
          agriculturalSupport: application.subdAgricultureSupport,
          isHomeSiteSeverance,
        });

        if (this.showErrors) {
          this.form.markAllAsTouched();
        }
      }
    });

    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.homesiteSeverance = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.HOMESITE_SEVERANCE);
      this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    });
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

  async attachFile(file: FileHandle, documentType: DOCUMENT_TYPE) {
    if (this.fileId) {
      await this.save();
      const mappedFiles = file.file;
      await this.applicationDocumentService.attachExternalFile(this.fileId, mappedFiles, documentType);
      const documents = await this.applicationDocumentService.getByFileId(this.fileId);
      if (documents) {
        this.$applicationDocuments.next(documents);
      }
    }
  }

  async deleteFile($event: ApplicationDocumentDto) {
    await this.applicationDocumentService.deleteExternalFile($event.uuid);
    if (this.fileId) {
      const documents = await this.applicationDocumentService.getByFileId(this.fileId);
      if (documents) {
        this.$applicationDocuments.next(documents);
      }
    }
  }

  async openFile(uuid: string) {
    const res = await this.applicationDocumentService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }

  private async save() {
    if (this.fileId) {
      const subdPurpose = this.purpose.getRawValue();
      const subdSuitability = this.suitability.getRawValue();
      const subdAgricultureSupport = this.agriculturalSupport.getRawValue();
      const subdIsHomeSiteSeverance = this.isHomeSiteSeverance.getRawValue();

      const updateDto: ApplicationSubmissionUpdateDto = {
        subdPurpose,
        subdSuitability,
        subdAgricultureSupport,
        subdIsHomeSiteSeverance: subdIsHomeSiteSeverance !== null ? subdIsHomeSiteSeverance === 'true' : null,
      };

      const updatedApp = await this.applicationService.updatePending(this.fileId, updateDto);
      this.$application.next(updatedApp);
    }
  }

  onNavigateToStep(step: number) {
    this.navigateToStep.emit(step);
  }
}
