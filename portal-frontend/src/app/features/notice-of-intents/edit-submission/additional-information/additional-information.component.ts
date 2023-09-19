import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { takeUntil } from 'rxjs';
import { NoticeOfIntentDocumentDto } from '../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import {
  NoticeOfIntentSubmissionUpdateDto,
  ProposedStructure,
} from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import { formatBooleanToString } from '../../../../shared/utils/boolean-helper';
import { parseStringToBoolean } from '../../../../shared/utils/string-helper';
import { EditNoiSteps } from '../edit-submission.component';
import { FilesStepComponent } from '../files-step.partial';
import { DeleteStructureConfirmationDialogComponent } from './delete-structure-confirmation-dialog/delete-structure-confirmation-dialog.component';
import { SoilRemovalConfirmationDialogComponent } from './soil-removal-confirmation-dialog/soil-removal-confirmation-dialog.component';

export enum STRUCTURE_TYPES {
  FARM_STRUCTURE = 'Farm Structure',
  PRINCIPAL_RESIDENCE = 'Residential - Principal Residence',
  ADDITIONAL_RESIDENCE = 'Residential - Additional Residence',
  ACCESSORY_STRUCTURE = 'Residential - Accessory Structure',
  OTHER_STRUCTURE = 'Other Structure',
}

type FormProposedStructure = { type: STRUCTURE_TYPES | null; area: string | null };

export const RESIDENTIAL_STRUCTURE_TYPES = [
  STRUCTURE_TYPES.ACCESSORY_STRUCTURE,
  STRUCTURE_TYPES.ADDITIONAL_RESIDENCE,
  STRUCTURE_TYPES.PRINCIPAL_RESIDENCE,
];

@Component({
  selector: 'app-additional-information',
  templateUrl: './additional-information.component.html',
  styleUrls: ['./additional-information.component.scss'],
})
export class AdditionalInformationComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditNoiSteps.ExtraInfo;

  DOCUMENT = DOCUMENT_TYPE;
  STRUCTURE_TYPES = [
    STRUCTURE_TYPES.FARM_STRUCTURE,
    STRUCTURE_TYPES.PRINCIPAL_RESIDENCE,
    STRUCTURE_TYPES.ADDITIONAL_RESIDENCE,
    STRUCTURE_TYPES.ACCESSORY_STRUCTURE,
    STRUCTURE_TYPES.OTHER_STRUCTURE,
  ];

  private submissionUuid = '';

  confirmRemovalOfSoil = false;
  buildingPlans: NoticeOfIntentDocumentDto[] = [];

  proposedStructures: FormProposedStructure[] = [];
  structuresSource = new MatTableDataSource(this.proposedStructures);
  displayedColumns = ['index', 'type', 'area', 'action'];

  isSoilStructureFarmUseReasonVisible = false;
  isSoilStructureResidentialUseReasonVisible = false;
  isSoilAgriParcelActivityVisible = false;
  isSoilStructureResidentialAccessoryUseReasonVisible = false;
  isSoilOtherUseReasonVisible = false;

  isRemovingSoilForNewStructure = new FormControl<string | null>(null, [Validators.required]);
  soilStructureFarmUseReason = new FormControl<string | null>(null);
  soilStructureResidentialUseReason = new FormControl<string | null>(null);
  soilAgriParcelActivity = new FormControl<string | null>(null);
  soilStructureResidentialAccessoryUseReason = new FormControl<string | null>(null);
  soilStructureOtherUseReason = new FormControl<string | null>(null);

  form = new FormGroup({
    isRemovingSoilForNewStructure: this.isRemovingSoilForNewStructure,
    soilStructureFarmUseReason: this.soilStructureFarmUseReason,
    soilStructureResidentialUseReason: this.soilStructureResidentialUseReason,
    soilAgriParcelActivity: this.soilAgriParcelActivity,
    soilStructureResidentialAccessoryUseReason: this.soilStructureResidentialAccessoryUseReason,
    soilStructureOtherUseReason: this.soilStructureOtherUseReason,
  });

  structuresForm = new FormGroup({} as any);

  firstQuestion: string = 'FIX THIS';

  constructor(
    private noticeOfIntentSubmissionService: NoticeOfIntentSubmissionService,
    noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
    dialog: MatDialog
  ) {
    super(noticeOfIntentDocumentService, dialog);
  }

  ngOnInit(): void {
    this.$noiSubmission.pipe(takeUntil(this.$destroy)).subscribe((noiSubmission) => {
      if (noiSubmission) {
        this.fileId = noiSubmission.fileNumber;
        this.submissionUuid = noiSubmission.uuid;

        switch (noiSubmission.typeCode) {
          case 'ROSO':
            this.firstQuestion = 'Are you placing fill in order to build a structure?';
            break;
          case 'POFO':
            this.firstQuestion = 'Are you placing fill in order to build a structure?';
            break;
          case 'PFRS':
            this.firstQuestion = 'Are you removing soil and placing fill in order to build a structure?';
            break;
        }

        if (noiSubmission.soilIsRemovingSoilForNewStructure) {
          this.confirmRemovalOfSoil = true;
        }

        this.form.patchValue({
          isRemovingSoilForNewStructure: formatBooleanToString(noiSubmission.soilIsRemovingSoilForNewStructure),
          soilStructureFarmUseReason: noiSubmission.soilStructureFarmUseReason,
          soilStructureResidentialUseReason: noiSubmission.soilStructureResidentialUseReason,
          soilAgriParcelActivity: noiSubmission.soilAgriParcelActivity,
          soilStructureResidentialAccessoryUseReason: noiSubmission.soilStructureResidentialAccessoryUseReason,
          soilStructureOtherUseReason: noiSubmission.soilStructureOtherUseReason,
        });

        this.proposedStructures = noiSubmission.soilProposedStructures.map((structure) => ({
          ...structure,
          area: structure.area ? structure.area.toString(10) : null,
        }));

        const newForm = new FormGroup({});
        for (const [index, lot] of noiSubmission.soilProposedStructures.entries()) {
          newForm.addControl(`${index}-type`, new FormControl(lot.type, [Validators.required]));
          newForm.addControl(`${index}-area`, new FormControl(lot.area, [Validators.required]));
        }
        this.structuresForm = newForm;

        this.structuresSource = new MatTableDataSource(this.proposedStructures);
        this.prepareStructureSpecificTextInputs();

        if (this.showErrors) {
          this.structuresForm.markAllAsTouched();
          this.form.markAllAsTouched();
        }
      }
    });

    this.$noiDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.buildingPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.BUILDING_PLAN);
    });
  }

  prepareStructureSpecificTextInputs() {
    this.setVisibilityAndValidatorsForFarmFields();
    this.setVisibilityAndValidatorsForAccessoryFields();
    this.setVisibilityAndValidatorsForResidentialFields();
    this.setVisibilityAndValidatorsForOtherFields();
  }

  private setVisibilityAndValidatorsForResidentialFields() {
    if (
      this.proposedStructures.some(
        (structure) => structure.type && RESIDENTIAL_STRUCTURE_TYPES.includes(structure.type)
      )
    ) {
      this.isSoilStructureResidentialUseReasonVisible = true;
      this.setRequired(this.soilStructureResidentialUseReason);
    } else {
      this.isSoilStructureResidentialUseReasonVisible = false;
      this.soilStructureResidentialUseReason.removeValidators([Validators.required]);
      this.soilStructureResidentialUseReason.reset();
    }
  }

  private setVisibilityAndValidatorsForOtherFields() {
    const hasOtherStructure = this.proposedStructures.some(
      (structure) => structure.type && structure.type === STRUCTURE_TYPES.OTHER_STRUCTURE
    );
    if (hasOtherStructure) {
      this.isSoilOtherUseReasonVisible = true;
      this.setRequired(this.soilStructureOtherUseReason);
    } else {
      this.isSoilOtherUseReasonVisible = false;
      this.soilStructureOtherUseReason.removeValidators([Validators.required]);
      this.soilStructureOtherUseReason.reset();
    }
  }

  private setVisibilityAndValidatorsForAccessoryFields() {
    if (this.proposedStructures.some((structure) => structure.type === STRUCTURE_TYPES.ACCESSORY_STRUCTURE)) {
      this.isSoilStructureResidentialAccessoryUseReasonVisible = true;
      this.setRequired(this.soilStructureResidentialAccessoryUseReason);
    } else {
      this.isSoilStructureResidentialAccessoryUseReasonVisible = false;
      this.soilStructureResidentialAccessoryUseReason.removeValidators([Validators.required]);
      this.soilStructureResidentialAccessoryUseReason.reset();
    }
  }

  private setVisibilityAndValidatorsForFarmFields() {
    if (this.proposedStructures.some((structure) => structure.type === STRUCTURE_TYPES.FARM_STRUCTURE)) {
      this.isSoilAgriParcelActivityVisible = true;
      this.isSoilStructureFarmUseReasonVisible = true;
      this.setRequired(this.soilAgriParcelActivity);
      this.setRequired(this.soilStructureFarmUseReason);
    } else {
      this.isSoilAgriParcelActivityVisible = false;
      this.isSoilStructureFarmUseReasonVisible = false;
      this.soilAgriParcelActivity.removeValidators([Validators.required]);
      this.soilStructureFarmUseReason.removeValidators([Validators.required]);
      this.soilAgriParcelActivity.reset();
      this.soilStructureFarmUseReason.reset();
    }
  }

  async onSave() {
    await this.save();
  }

  protected async save(): Promise<void> {
    if (this.fileId && (this.form.dirty || this.structuresForm.dirty)) {
      const isRemovingSoilForNewStructure = this.isRemovingSoilForNewStructure.value;
      const soilStructureFarmUseReason = this.soilStructureFarmUseReason.value;
      const soilStructureResidentialUseReason = this.soilStructureResidentialUseReason.value;
      const soilAgriParcelActivity = this.soilAgriParcelActivity.value;
      const soilStructureResidentialAccessoryUseReason = this.soilStructureResidentialAccessoryUseReason.value;
      const soilStructureOtherUseReason = this.soilStructureOtherUseReason.value;

      const updatedStructures: ProposedStructure[] = [];
      for (const [index, lot] of this.proposedStructures.entries()) {
        const lotType = this.structuresForm.controls[`${index}-type`].value;
        const lotArea = this.structuresForm.controls[`${index}-area`].value;
        updatedStructures.push({
          type: lotType,
          area: lotArea ? parseFloat(lotArea) : null,
        });
      }

      const updateDto: NoticeOfIntentSubmissionUpdateDto = {
        soilStructureFarmUseReason,
        soilStructureResidentialUseReason,
        soilIsRemovingSoilForNewStructure: parseStringToBoolean(isRemovingSoilForNewStructure),
        soilAgriParcelActivity,
        soilStructureResidentialAccessoryUseReason,
        soilStructureOtherUseReason,
        soilProposedStructures: updatedStructures,
      };

      const updatedApp = await this.noticeOfIntentSubmissionService.updatePending(this.submissionUuid, updateDto);
      this.$noiSubmission.next(updatedApp);
    }
  }

  onChangeIsRemovingSoilForNewStructure($event: MatButtonToggleChange) {
    const parsedSelectedValue = parseStringToBoolean($event.value);

    if (this.confirmRemovalOfSoil && parsedSelectedValue === false) {
      this.dialog
        .open(SoilRemovalConfirmationDialogComponent, {
          panelClass: 'no-padding',
          disableClose: true,
        })
        .beforeClosed()
        .subscribe(async (result) => {
          if (result) {
            await this.noticeOfIntentDocumentService.deleteExternalFiles(this.buildingPlans.map((doc) => doc.uuid));
            this.buildingPlans = [];

            this.confirmRemovalOfSoil = false;
            this.form.reset();
            this.form.markAsDirty();
            this.form.controls.isRemovingSoilForNewStructure.setValue('false');
            this.proposedStructures = [];
            this.structuresSource = new MatTableDataSource(this.proposedStructures);

            await this.save();
          } else {
            this.form.controls.isRemovingSoilForNewStructure.setValue('true');
          }
        });
    } else {
      this.confirmRemovalOfSoil = parsedSelectedValue ?? false;
    }
  }

  onChangeStructureType(index: number, value: STRUCTURE_TYPES) {
    this.proposedStructures[index].type = value;
    this.prepareStructureSpecificTextInputs();
    this.form.markAsDirty();
  }

  onStructureRemove(index: number) {
    this.dialog
      .open(DeleteStructureConfirmationDialogComponent, {
        panelClass: 'no-padding',
        disableClose: true,
      })
      .beforeClosed()
      .subscribe(async (result) => {
        if (result) {
          this.deleteStructure(index);
        }
      });
  }

  private deleteStructure(index: number) {
    const deletedStructure: FormProposedStructure = this.proposedStructures.splice(index, 1)[0];
    this.structuresSource = new MatTableDataSource(this.proposedStructures);
    this.structuresForm.removeControl(`${index}-type`);
    this.structuresForm.removeControl(`${index}-area`);
    this.structuresForm.markAsDirty();

    if (deletedStructure.type === STRUCTURE_TYPES.FARM_STRUCTURE) {
      this.setVisibilityAndValidatorsForFarmFields();
    }

    if (deletedStructure.type === STRUCTURE_TYPES.ACCESSORY_STRUCTURE) {
      this.setVisibilityAndValidatorsForAccessoryFields();
    }

    if (deletedStructure.type && RESIDENTIAL_STRUCTURE_TYPES.includes(deletedStructure.type)) {
      this.setVisibilityAndValidatorsForResidentialFields();
    }

    if (deletedStructure.type === STRUCTURE_TYPES.OTHER_STRUCTURE) {
      this.setVisibilityAndValidatorsForOtherFields();
    }
  }

  onStructureAdd() {
    this.proposedStructures.push({ type: null, area: '' });
    this.structuresSource = new MatTableDataSource(this.proposedStructures);

    const index = this.proposedStructures.length - 1;
    this.structuresForm.addControl(`${index}-type`, new FormControl(null, [Validators.required]));
    this.structuresForm.addControl(`${index}-area`, new FormControl(null, [Validators.required]));
    this.structuresForm.markAsDirty();
  }

  private setRequired(formControl: FormControl<any>) {
    formControl.setValidators([Validators.required]);
  }
}
