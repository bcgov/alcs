import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ApplicationDocumentDto, DOCUMENT } from '../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../services/application-document/application-document.service';
import { ApplicationDetailedDto, ApplicationUpdateDto } from '../../../../services/application/application.dto';
import { ApplicationService } from '../../../../services/application/application.service';
import { FileHandle } from '../../../../shared/file-drag-drop/drag-drop.directive';
import { EditApplicationSteps } from '../../edit-application.component';

@Component({
  selector: 'app-tur-proposal',
  templateUrl: './tur-proposal.component.html',
  styleUrls: ['./tur-proposal.component.scss'],
})
export class TurProposalComponent implements OnInit, OnDestroy {
  $destroy = new Subject<void>();
  currentStep = EditApplicationSteps.Proposal;
  @Input() $application!: BehaviorSubject<ApplicationDetailedDto | undefined>;
  @Input() showErrors = false;
  @Output() navigateToStep = new EventEmitter<number>();

  DOCUMENT = DOCUMENT;

  servingNotice: ApplicationDocumentDto[] = [];
  proposalMap: ApplicationDocumentDto[] = [];

  purpose = new FormControl<string | null>(null, [Validators.required]);
  outsideLands = new FormControl<string | null>(null, [Validators.required]);
  agriculturalActivities = new FormControl<string | null>(null, [Validators.required]);
  reduceNegativeImpacts = new FormControl<string | null>(null, [Validators.required]);
  totalCorridorArea = new FormControl<string | null>(null, [Validators.required]);
  allOwnersNotified = new FormControl<boolean>(false, [Validators.required]);

  form = new FormGroup({
    purpose: this.purpose,
    outsideLands: this.outsideLands,
    agriculturalActivities: this.agriculturalActivities,
    reduceNegativeImpacts: this.reduceNegativeImpacts,
    totalCorridorArea: this.totalCorridorArea,
    allOwnersNotified: this.allOwnersNotified,
  });
  private fileId: string | undefined;

  constructor(
    private router: Router,
    private applicationService: ApplicationService,
    private applicationDocumentService: ApplicationDocumentService
  ) {}

  ngOnInit(): void {
    this.$application.pipe(takeUntil(this.$destroy)).subscribe((application) => {
      if (application) {
        this.fileId = application.fileNumber;

        this.form.patchValue({
          purpose: application.turPurpose,
          outsideLands: application.turOutsideLands,
          agriculturalActivities: application.turAgriculturalActivities,
          reduceNegativeImpacts: application.turReduceNegativeImpacts,
          totalCorridorArea: application.turTotalCorridorArea?.toString(),
          allOwnersNotified: application.turAllOwnersNotified,
        });

        this.servingNotice = application.documents.filter((document) => document.type === DOCUMENT.SERVING_NOTICE);
        this.proposalMap = application.documents.filter((document) => document.type === DOCUMENT.PROPOSAL_MAP);

        if (this.showErrors) {
          this.form.markAllAsTouched();
        }
      }
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

  async attachFile(file: FileHandle, documentType: DOCUMENT) {
    if (this.fileId) {
      await this.save();
      const mappedFiles = file.file;
      await this.applicationDocumentService.attachExternalFile(this.fileId, mappedFiles, documentType);
      const updatedApp = await this.applicationService.getByFileId(this.fileId);
      this.$application.next(updatedApp);
    }
  }

  async deleteFile($event: ApplicationDocumentDto) {
    await this.applicationDocumentService.deleteExternalFile($event.uuid);
  }

  async openFile(uuid: string) {
    const res = await this.applicationDocumentService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }

  private async save() {
    if (this.fileId) {
      const turPurpose = this.purpose.getRawValue();
      const turOutsideLands = this.outsideLands.getRawValue();
      const turAgriculturalActivities = this.agriculturalActivities.getRawValue();
      const turReduceNegativeImpacts = this.reduceNegativeImpacts.getRawValue();
      const turTotalCorridorArea = this.totalCorridorArea.getRawValue();
      const turAllOwnersNotified = this.allOwnersNotified.getRawValue();

      const updateDto: ApplicationUpdateDto = {
        turPurpose,
        turOutsideLands,
        turAgriculturalActivities,
        turReduceNegativeImpacts,
        turTotalCorridorArea: turTotalCorridorArea ? parseFloat(turTotalCorridorArea) : null,
        turAllOwnersNotified,
      };

      const updatedApp = await this.applicationService.updatePending(this.fileId, updateDto);
      this.$application.next(updatedApp);
    }
  }

  onNavigateToStep(step: number) {
    this.navigateToStep.emit(step);
  }
}
