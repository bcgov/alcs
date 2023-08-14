import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { takeUntil } from 'rxjs';
import { NoticeOfIntentDocumentDto } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import { NoticeOfIntentSubmissionUpdateDto } from '../../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { formatBooleanToString } from '../../../../../shared/utils/boolean-helper';
import { parseStringToBoolean } from '../../../../../shared/utils/string-helper';
import { EditNoiSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';

export enum STRUCTURE_TYPES {
  FARM_STRUCTURE = 'Farm Structure',
  PRINCIPAL_RESIDENCE = 'Residential - Principal Residence',
  ADDITIONAL_RESIDENCE = 'Residential - Additional Residence',
  ACCESSORY_STRUCTURE = 'Residential - Accessory Structure',
}

type ProposedStructure = { type: STRUCTURE_TYPES | null; area: string | null };

@Component({
  selector: 'app-roso-additional-information',
  templateUrl: './roso-additional-information.component.html',
  styleUrls: ['./roso-additional-information.component.scss'],
})
export class RosoAdditionalInformationComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditNoiSteps.ExtraInfo;

  DOCUMENT = DOCUMENT_TYPE;
  STRUCTURE_TYPES = [
    STRUCTURE_TYPES.FARM_STRUCTURE,
    STRUCTURE_TYPES.PRINCIPAL_RESIDENCE,
    STRUCTURE_TYPES.ADDITIONAL_RESIDENCE,
    STRUCTURE_TYPES.ACCESSORY_STRUCTURE,
  ];

  private submissionUuid = '';

  confirmRemovalOfSoil = false;

  buildingPlans: NoticeOfIntentDocumentDto[] = [];

  proposedStructures: ProposedStructure[] = [];
  structuresSource = new MatTableDataSource(this.proposedStructures);
  displayedColumns = ['index', 'type', 'area', 'action'];

  isSoilStructureFarmUseReasonVisible = false;
  isSoilStructureResidentialUseReasonVisible = false;
  isSoilAgriParcelActivityVisible = false;
  isSoilStructureResidentialAccessoryUseReasonVisible = false;

  isRemovingSoilForNewStructure = new FormControl<string | null>(null, [Validators.required]);
  soilStructureFarmUseReason = new FormControl<string | null>(null);
  soilStructureResidentialUseReason = new FormControl<string | null>(null);
  soilAgriParcelActivity = new FormControl<string | null>(null);
  soilStructureResidentialAccessoryUseReason = new FormControl<string | null>(null);

  form = new FormGroup({
    isRemovingSoilForNewStructure: this.isRemovingSoilForNewStructure,
    soilStructureFarmUseReason: this.soilStructureFarmUseReason,
    soilStructureResidentialUseReason: this.soilStructureResidentialUseReason,
    soilAgriParcelActivity: this.soilAgriParcelActivity,
    soilStructureResidentialAccessoryUseReason: this.soilStructureResidentialAccessoryUseReason,
  });

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

        if (noiSubmission.soilIsRemovingSoilForNewStructure) {
          this.confirmRemovalOfSoil = true;
        }

        this.form.patchValue({
          isRemovingSoilForNewStructure: formatBooleanToString(noiSubmission.soilIsRemovingSoilForNewStructure),
          soilStructureFarmUseReason: noiSubmission.soilStructureFarmUseReason,
          soilStructureResidentialUseReason: noiSubmission.soilStructureResidentialUseReason,
          soilAgriParcelActivity: noiSubmission.soilAgriParcelActivity,
          soilStructureResidentialAccessoryUseReason: noiSubmission.soilStructureResidentialAccessoryUseReason,
        });

        this.proposedStructures = noiSubmission.soilProposedStructures.map((structure) => ({
          ...structure,
          area: structure.area ? structure.area.toString(10) : null,
        }));
        this.structuresSource = new MatTableDataSource(this.proposedStructures);
        this.prepareStructureSpecificTextInputs();

        if (this.showErrors) {
          this.form.markAllAsTouched();
        }
      }
    });

    this.$noiDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.buildingPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.BUILDING_PLAN);
    });
  }

  prepareStructureSpecificTextInputs() {
    if (this.proposedStructures.some((structure) => structure.type === STRUCTURE_TYPES.FARM_STRUCTURE)) {
      this.isSoilAgriParcelActivityVisible = true;
      this.isSoilStructureFarmUseReasonVisible = true;
      this.soilAgriParcelActivity.setValidators([Validators.required]);
      this.soilStructureFarmUseReason.setValidators([Validators.required]);
    }

    if (this.proposedStructures.some((structure) => structure.type === STRUCTURE_TYPES.ACCESSORY_STRUCTURE)) {
      this.isSoilStructureResidentialAccessoryUseReasonVisible = true;
      this.soilStructureResidentialAccessoryUseReason.setValidators([Validators.required]);
    }

    if (
      this.proposedStructures.some(
        (structure) =>
          structure.type &&
          [
            STRUCTURE_TYPES.ADDITIONAL_RESIDENCE,
            STRUCTURE_TYPES.PRINCIPAL_RESIDENCE,
            STRUCTURE_TYPES.ACCESSORY_STRUCTURE,
          ].includes(structure.type)
      )
    ) {
      this.isSoilStructureResidentialUseReasonVisible = true;
      this.soilStructureResidentialUseReason.setValidators([Validators.required]);
    }
  }

  async onSave() {
    await this.save();
  }

  protected async save(): Promise<void> {
    if (this.fileId && this.form.dirty) {
      const isRemovingSoilForNewStructure = this.isRemovingSoilForNewStructure.getRawValue();
      const soilStructureFarmUseReason = this.soilStructureFarmUseReason.getRawValue();
      const soilStructureResidentialUseReason = this.soilStructureResidentialUseReason.getRawValue();
      const soilAgriParcelActivity = this.soilAgriParcelActivity.getRawValue();
      const soilStructureResidentialAccessoryUseReason = this.soilStructureResidentialAccessoryUseReason.getRawValue();

      const updateDto: NoticeOfIntentSubmissionUpdateDto = {
        soilStructureFarmUseReason,
        soilStructureResidentialUseReason,
        soilIsRemovingSoilForNewStructure: parseStringToBoolean(isRemovingSoilForNewStructure),
        soilAgriParcelActivity,
        soilStructureResidentialAccessoryUseReason,
        soilProposedStructures: this.proposedStructures.map((structure) => ({
          ...structure,
          area: structure.area ? parseFloat(structure.area) : null,
        })),
      };

      const updatedApp = await this.noticeOfIntentSubmissionService.updatePending(this.submissionUuid, updateDto);
      this.$noiSubmission.next(updatedApp);
    }
  }

  onChangeIsRemovingSoilForNewStructure(selectedValue: string) {
    this.confirmRemovalOfSoil = parseStringToBoolean(selectedValue) ?? false;
  }

  onChangeStructureType(index: number, value: STRUCTURE_TYPES) {
    this.proposedStructures[index].type = value;

    if (value === STRUCTURE_TYPES.FARM_STRUCTURE) {
      this.isSoilAgriParcelActivityVisible = true;
      this.isSoilStructureFarmUseReasonVisible = true;
      this.soilAgriParcelActivity.setValidators([Validators.required]);
      this.soilStructureFarmUseReason.setValidators([Validators.required]);
    }

    if (value === STRUCTURE_TYPES.ACCESSORY_STRUCTURE) {
      this.isSoilStructureResidentialAccessoryUseReasonVisible = true;
      this.soilStructureResidentialAccessoryUseReason.setValidators([Validators.required]);
    }

    if (
      [
        STRUCTURE_TYPES.ADDITIONAL_RESIDENCE,
        STRUCTURE_TYPES.PRINCIPAL_RESIDENCE,
        STRUCTURE_TYPES.ACCESSORY_STRUCTURE,
      ].includes(value)
    ) {
      this.isSoilStructureResidentialUseReasonVisible = true;
      this.soilStructureResidentialUseReason.setValidators([Validators.required]);
    }

    this.form.markAsDirty()
  }

  onStructureRemove(index: number) {
    const deletedStructure: ProposedStructure = this.proposedStructures.splice(index, 1)[0];
    this.structuresSource = new MatTableDataSource(this.proposedStructures);

    if (deletedStructure.type === STRUCTURE_TYPES.FARM_STRUCTURE) {
      const isAnyStructureWithTypeExists = this.proposedStructures.some(
        (e) => e.type === STRUCTURE_TYPES.FARM_STRUCTURE
      );

      if (!isAnyStructureWithTypeExists) {
        this.isSoilAgriParcelActivityVisible = false;
        this.isSoilStructureFarmUseReasonVisible = false;
        this.soilAgriParcelActivity.removeValidators([Validators.required]);
        this.soilStructureFarmUseReason.removeValidators([Validators.required]);
        this.soilAgriParcelActivity.setValue(null);
        this.soilStructureFarmUseReason.setValue(null);
      }
    }

    if (deletedStructure.type === STRUCTURE_TYPES.ACCESSORY_STRUCTURE) {
      const isAnyStructureWithTypeExists = this.proposedStructures.some(
        (e) => e.type === STRUCTURE_TYPES.ACCESSORY_STRUCTURE
      );

      if (!isAnyStructureWithTypeExists) {
        this.isSoilStructureResidentialAccessoryUseReasonVisible = false;
        this.soilStructureResidentialAccessoryUseReason.removeValidators([Validators.required]);
        this.soilStructureResidentialAccessoryUseReason.setValue(null);
      }
    }

    if (
      deletedStructure.type &&
      [
        STRUCTURE_TYPES.ADDITIONAL_RESIDENCE,
        STRUCTURE_TYPES.PRINCIPAL_RESIDENCE,
        STRUCTURE_TYPES.ACCESSORY_STRUCTURE,
      ].includes(deletedStructure.type)
    ) {
      const isAnyStructureWithTypeExists = this.proposedStructures.some(
        (e) =>
          e.type &&
          [
            STRUCTURE_TYPES.ADDITIONAL_RESIDENCE,
            STRUCTURE_TYPES.PRINCIPAL_RESIDENCE,
            STRUCTURE_TYPES.ACCESSORY_STRUCTURE,
          ].includes(e.type)
      );

      if (!isAnyStructureWithTypeExists) {
        this.isSoilStructureResidentialUseReasonVisible = false;
        this.soilStructureResidentialUseReason.removeValidators([Validators.required]);
        this.soilStructureResidentialUseReason.setValue(null);
      }
    }

    this.form.markAsDirty()
  }

  onStructureAdd() {
    this.proposedStructures.push({ type: null, area: '' });
    this.structuresSource = new MatTableDataSource(this.proposedStructures);
    this.form.markAsDirty()
  }

  onAreaChange(){
    this.form.markAsDirty()
  }
}
