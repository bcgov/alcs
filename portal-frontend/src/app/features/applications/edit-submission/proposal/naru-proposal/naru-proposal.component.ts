import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import {
  ApplicationSubmissionUpdateDto,
  NaruSubtypeDto,
} from '../../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../../services/application-submission/application-submission.service';
import { CodeService } from '../../../../../services/code/code.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { FileHandle } from '../../../../../shared/file-drag-drop/drag-drop.directive';
import { EditApplicationSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';
import { SoilTableData } from '../../../../../shared/soil-table/soil-table.component';
import { ChangeSubtypeConfirmationDialogComponent } from './change-subtype-confirmation-dialog/change-subtype-confirmation-dialog.component';
import { ConfirmationDialogService } from '../../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { MatTableDataSource } from '@angular/material/table';
import { ExistingResidenceDialogComponent } from './existing-residence-dialog/existing-residence-dialog.component';
import { MOBILE_BREAKPOINT } from '../../../../../shared/utils/breakpoints';
import { isTruncated, truncate } from '../../../../../shared/utils/string-helper';
import { EXISTING_RESIDENCE_DESCRIPTION_CHAR_LIMIT } from '../../../../../shared/constants';

export type FormExisingResidence = { id?: number; floorArea: number; description: string; isExpanded: boolean };

@Component({
  selector: 'app-naru-proposal',
  templateUrl: './naru-proposal.component.html',
  styleUrls: ['./naru-proposal.component.scss'],
})
export class NaruProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Proposal;

  showProposalMapVirus = false;

  previousSubtype: string | null = null;
  subtype = new FormControl<string | null>(null, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  floorArea = new FormControl<string | null>(null, [Validators.required]);
  residenceNecessity = new FormControl<string | null>(null, [Validators.required]);
  locationRationale = new FormControl<string | null>(null, [Validators.required]);
  infrastructure = new FormControl<string | null>(null, [Validators.required]);
  existingStructures = new FormControl<string | null>(null, [Validators.required]);
  sleepingUnits = new FormControl<string | null>(null, [Validators.required]);
  agriTourism = new FormControl<string | null>(null, [Validators.required]);
  willImportFill = new FormControl<boolean | null>(null, [Validators.required]);
  fillType = new FormControl<string | null>(
    {
      disabled: true,
      value: null,
    },
    [Validators.required],
  );
  fillOrigin = new FormControl<string | null>(
    {
      disabled: true,
      value: null,
    },
    [Validators.required],
  );
  projectDuration = new FormControl<string | null>(
    {
      disabled: true,
      value: null,
    },
    [Validators.required],
  );

  existingResidences: FormExisingResidence[] = [];
  existingResidencesSource = new MatTableDataSource(this.existingResidences);
  proposalMap: ApplicationDocumentDto[] = [];
  fillTableData: SoilTableData = {};
  fillTableDisabled = true;
  isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  isExistingResidencesDirty = false;

  form = new FormGroup({
    subtype: this.subtype,
    purpose: this.purpose,
    floorArea: this.floorArea,
    residenceNecessity: this.residenceNecessity,
    locationRationale: this.locationRationale,
    infrastructure: this.infrastructure,
    existingStructures: this.existingStructures,
    willImportFill: this.willImportFill,
    fillType: this.fillType,
    fillOrigin: this.fillOrigin,
    projectDuration: this.projectDuration,
    sleepingUnits: this.sleepingUnits,
    agriTourism: this.agriTourism,
  });

  private submissionUuid = '';
  naruSubtypes: NaruSubtypeDto[] = [];
  existingResidencesDisplayedColumns: string[] = ['index', 'floorArea', 'description', 'action'];

  constructor(
    private router: Router,
    private applicationSubmissionService: ApplicationSubmissionService,
    private codeService: CodeService,
    applicationDocumentService: ApplicationDocumentService,
    dialog: MatDialog,
    private confirmationDialogService: ConfirmationDialogService,
    toastService: ToastService,
  ) {
    super(applicationDocumentService, dialog, toastService);
  }

  ngOnInit(): void {
    this.loadNaruSubtypes();
    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((applicationSubmission) => {
      if (applicationSubmission) {
        this.fileId = applicationSubmission.fileNumber;
        this.submissionUuid = applicationSubmission.uuid;

        this.form.patchValue({
          subtype: applicationSubmission.naruSubtype?.code,
          existingStructures: applicationSubmission.naruExistingStructures,
          willImportFill: applicationSubmission.naruWillImportFill,
          fillType: applicationSubmission.naruFillType,
          fillOrigin: applicationSubmission.naruFillOrigin,
          floorArea: applicationSubmission.naruFloorArea ? applicationSubmission.naruFloorArea.toString() : null,
          infrastructure: applicationSubmission.naruInfrastructure,
          locationRationale: applicationSubmission.naruLocationRationale,
          projectDuration: applicationSubmission.naruProjectDuration,
          purpose: applicationSubmission.purpose,
          residenceNecessity: applicationSubmission.naruResidenceNecessity,
          agriTourism: applicationSubmission.naruAgriTourism,
          sleepingUnits: applicationSubmission.naruSleepingUnits
            ? applicationSubmission.naruSleepingUnits.toString()
            : null,
        });
        this.previousSubtype = applicationSubmission.naruSubtype?.code ?? null;

        if (applicationSubmission.naruWillImportFill !== null) {
          this.onChangeFill(applicationSubmission.naruWillImportFill);
          this.form.patchValue({
            willImportFill: applicationSubmission.naruWillImportFill,
          });
        }

        this.fillTableData = {
          volume: applicationSubmission.naruToPlaceVolume ?? undefined,
          area: applicationSubmission.naruToPlaceArea ?? undefined,
          maximumDepth: applicationSubmission.naruToPlaceMaximumDepth ?? undefined,
          averageDepth: applicationSubmission.naruToPlaceAverageDepth ?? undefined,
        };

        if (applicationSubmission.naruExistingResidences) {
          this.existingResidences = applicationSubmission.naruExistingResidences?.map((item, index) => ({
            id: index + 1,
            floorArea: item.floorArea,
            description: item.description,
            isExpanded: false,
          }));
          this.existingResidencesSource = new MatTableDataSource(this.existingResidences);
        }

        if (this.showErrors) {
          this.form.markAllAsTouched();
        }
      }
    });

    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
    });
  }

  async onSave() {
    await this.save();
  }

  async attachProposalMap(file: FileHandle) {
    const res = await this.attachFile(file, DOCUMENT_TYPE.PROPOSAL_MAP);
    this.showProposalMapVirus = !res;
  }

  onChangeSubtype($event: MatRadioChange) {
    if (this.previousSubtype) {
      this.dialog
        .open(ChangeSubtypeConfirmationDialogComponent)
        .beforeClosed()
        .subscribe((didConfirm) => {
          if (didConfirm) {
            this.previousSubtype = $event.value;
          } else {
            this.subtype.setValue(this.previousSubtype);
          }
        });
    } else {
      this.previousSubtype = $event.value;
    }
  }

  onChangeFill(willImportFill: boolean) {
    const hasValues =
      this.projectDuration.value ||
      this.fillOrigin.value ||
      this.fillType.value ||
      this.fillTableData.area ||
      this.fillTableData.averageDepth ||
      this.fillTableData.maximumDepth ||
      this.fillTableData.volume;

    if (!willImportFill && hasValues) {
      this.confirmationDialogService
        .openDialog({
          title: 'Do you need to import any fill to construct or conduct the proposed Non-farm use?',
          body: 'Changing the answer to this question will remove content already saved to this page. Do you want to continue?',
        })
        .subscribe((confirmed) => {
          this.updateFillFields(!confirmed);
          this.willImportFill.setValue(!confirmed);
        });
    } else {
      this.updateFillFields(willImportFill);
    }
  }

  updateFillFields(willImportFill: boolean) {
    this.fillTableDisabled = !willImportFill;

    if (willImportFill) {
      this.projectDuration.enable();
      this.fillOrigin.enable();
      this.fillType.enable();
    } else {
      this.projectDuration.disable();
      this.fillOrigin.disable();
      this.fillType.disable();

      this.projectDuration.setValue(null);
      this.fillOrigin.setValue(null);
      this.fillType.setValue(null);
    }
  }

  protected async save() {
    if (this.fileId && (this.form.dirty || this.isExistingResidencesDirty)) {
      const {
        existingStructures,
        willImportFill,
        fillType,
        fillOrigin,
        floorArea,
        infrastructure,
        locationRationale,
        projectDuration,
        purpose,
        residenceNecessity,
        subtype,
        sleepingUnits,
        agriTourism,
      } = this.form.getRawValue();

      const updateDto: ApplicationSubmissionUpdateDto = {
        naruExistingStructures: existingStructures,
        naruWillImportFill: willImportFill,
        naruFillType: fillType,
        naruFillOrigin: fillOrigin,
        naruToPlaceAverageDepth: this.fillTableData.averageDepth ?? null,
        naruToPlaceMaximumDepth: this.fillTableData.maximumDepth ?? null,
        naruToPlaceArea: this.fillTableData.area ?? null,
        naruToPlaceVolume: this.fillTableData.volume ?? null,
        naruFloorArea: floorArea ? parseFloat(floorArea) : null,
        naruInfrastructure: infrastructure,
        naruLocationRationale: locationRationale,
        naruProjectDuration: projectDuration,
        purpose: purpose,
        naruResidenceNecessity: residenceNecessity,
        naruSubtypeCode: subtype,
        naruSleepingUnits: sleepingUnits ? parseFloat(sleepingUnits) : null,
        naruAgriTourism: agriTourism,
        naruExistingResidences: this.existingResidences.map(({ id, ...rest }) => rest),
      };
      const updatedApp = await this.applicationSubmissionService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }

  private async loadNaruSubtypes() {
    const subtypes = await this.codeService.loadCodes();
    this.naruSubtypes = subtypes.naruSubtypes;
  }

  markDirty() {
    this.form.markAsDirty();
  }

  onAddEditExistingResidence(existingResidence: FormExisingResidence | undefined, isEdit: boolean) {
    const dialog = this.dialog
      .open(ExistingResidenceDialogComponent, {
        width: this.isMobile ? '90%' : '75%',
        data: {
          isEdit: isEdit,
          existingResidenceData: existingResidence,
        },
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (!res.isCancel) {
          this.isExistingResidencesDirty = true;
          if (res.isEdit) {
            const index = this.existingResidences.findIndex((e) => e.id === res.existingResidence.id);
            if (index > -1) {
              this.existingResidences[index] = res.existingResidence;
            }
          } else {
            this.existingResidences.push({ ...res.existingResidence, id: this.existingResidences.length + 1 });
          }
          this.existingResidencesSource.data = this.existingResidences;
        }
      });
  }

  onDeleteExistingResidence(existingResidence: FormExisingResidence) {
    const index = this.existingResidences.findIndex((e) => e.id === existingResidence.id);
    if (index > -1) {
      this.existingResidences.splice(index, 1);
      this.existingResidencesSource.data = this.existingResidences;
      this.isExistingResidencesDirty = true;
      this.existingResidences.forEach((item, index) => {
        item.id = index + 1;
      });
    }
  }

  getTruncatedDescription(description: string): string {
    return truncate(description, EXISTING_RESIDENCE_DESCRIPTION_CHAR_LIMIT);
  }

  isDescriptionTruncated(description: string): boolean {
    return isTruncated(description, EXISTING_RESIDENCE_DESCRIPTION_CHAR_LIMIT);
  }

  toggleReadMore(existingResidence: FormExisingResidence) {
    const index = this.existingResidences.findIndex((e) => e.id === existingResidence.id);
    if (index > -1) {
      this.existingResidences[index].isExpanded = !this.existingResidences[index].isExpanded;
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }
}
