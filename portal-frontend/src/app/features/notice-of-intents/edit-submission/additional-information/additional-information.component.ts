import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { takeUntil } from 'rxjs';
import { v4 } from 'uuid';
import { NoticeOfIntentDocumentDto } from '../../../../services/notice-of-intent-document/notice-of-intent-document.dto';
import { NoticeOfIntentDocumentService } from '../../../../services/notice-of-intent-document/notice-of-intent-document.service';
import {
  NoticeOfIntentSubmissionUpdateDto,
  ProposedStructure,
} from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { NoticeOfIntentSubmissionService } from '../../../../services/notice-of-intent-submission/notice-of-intent-submission.service';
import { ToastService } from '../../../../services/toast/toast.service';
import { ConfirmationDialogService } from '../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { DOCUMENT_TYPE } from '../../../../shared/dto/document.dto';
import { FileHandle } from '../../../../shared/file-drag-drop/drag-drop.directive';
import { formatBooleanToString } from '../../../../shared/utils/boolean-helper';
import { parseStringToBoolean } from '../../../../shared/utils/string-helper';
import { EditNoiSteps } from '../edit-submission.component';
import { FilesStepComponent } from '../files-step.partial';
import { DeleteStructureConfirmationDialogComponent } from './delete-structure-confirmation-dialog/delete-structure-confirmation-dialog.component';
import { SoilRemovalConfirmationDialogComponent } from './soil-removal-confirmation-dialog/soil-removal-confirmation-dialog.component';
import { AddStructureDialogComponent } from './add-structure-dialog/add-structure-dialog.component';
import { MOBILE_BREAKPOINT } from '../../../../shared/utils/breakpoints';
import { HttpErrorResponse } from '@angular/common/http';

export enum STRUCTURE_TYPES {
  FARM_STRUCTURE = 'Farm Structure',
  PRINCIPAL_RESIDENCE = 'Residential - Principal Residence',
  ADDITIONAL_RESIDENCE = 'Residential - Additional Residence',
  ACCESSORY_STRUCTURE = 'Residential - Accessory Structure',
  OTHER_STRUCTURE = 'Other Structure',
}

export type FormProposedStructure = {
  type: STRUCTURE_TYPES | null;
  area: string | null;
  id: string;
};

export type TypeOption = { label: string; value: string };

export const RESIDENTIAL_STRUCTURE_TYPES = [
  STRUCTURE_TYPES.ACCESSORY_STRUCTURE,
  STRUCTURE_TYPES.ADDITIONAL_RESIDENCE,
  STRUCTURE_TYPES.PRINCIPAL_RESIDENCE,
];

export const STRUCTURE_TYPE_LABEL_MAP: Record<STRUCTURE_TYPES, string> = {
  [STRUCTURE_TYPES.FARM_STRUCTURE]: STRUCTURE_TYPES.FARM_STRUCTURE,
  [STRUCTURE_TYPES.PRINCIPAL_RESIDENCE]: 'Principal Residence',
  [STRUCTURE_TYPES.ADDITIONAL_RESIDENCE]: 'Additional Residence',
  [STRUCTURE_TYPES.ACCESSORY_STRUCTURE]: 'Residential Accessory Structure',
  [STRUCTURE_TYPES.OTHER_STRUCTURE]: STRUCTURE_TYPES.OTHER_STRUCTURE,
};

export const STRUCTURE_TYPE_OPTIONS = [
  {
    label: STRUCTURE_TYPES.FARM_STRUCTURE,
    value: STRUCTURE_TYPES.FARM_STRUCTURE,
  },
  {
    label: STRUCTURE_TYPE_LABEL_MAP[STRUCTURE_TYPES.PRINCIPAL_RESIDENCE],
    value: STRUCTURE_TYPES.PRINCIPAL_RESIDENCE,
  },
  {
    label: STRUCTURE_TYPE_LABEL_MAP[STRUCTURE_TYPES.ADDITIONAL_RESIDENCE],
    value: STRUCTURE_TYPES.ADDITIONAL_RESIDENCE,
  },
  {
    label: STRUCTURE_TYPE_LABEL_MAP[STRUCTURE_TYPES.ACCESSORY_STRUCTURE],
    value: STRUCTURE_TYPES.ACCESSORY_STRUCTURE,
  },
  {
    label: STRUCTURE_TYPES.OTHER_STRUCTURE,
    value: STRUCTURE_TYPES.OTHER_STRUCTURE,
  },
];

@Component({
  selector: 'app-additional-information',
  templateUrl: './additional-information.component.html',
  styleUrls: ['./additional-information.component.scss'],
})
export class AdditionalInformationComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditNoiSteps.ExtraInfo;
  isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

  structureTypeOptions = STRUCTURE_TYPE_OPTIONS;

  DOCUMENT = DOCUMENT_TYPE;

  private submissionUuid = '';
  typeCode: string = '';

  confirmRemovalOfSoil = false;
  showBuildingPlanHasVirusError = false;
  showBuildingPlanVirusScanFailedError = false;
  buildingPlans: NoticeOfIntentDocumentDto[] = [];

  proposedStructures: FormProposedStructure[] = [];
  structuresSource = new MatTableDataSource(this.proposedStructures);
  structures: ProposedStructure[] = [];
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
    private confirmationDialogService: ConfirmationDialogService,
    noticeOfIntentDocumentService: NoticeOfIntentDocumentService,
    dialog: MatDialog,
    toastService: ToastService,
  ) {
    super(noticeOfIntentDocumentService, dialog, toastService);
  }

  ngOnInit(): void {
    this.$noiSubmission.pipe(takeUntil(this.$destroy)).subscribe((noiSubmission) => {
      if (noiSubmission) {
        this.fileId = noiSubmission.fileNumber;
        this.submissionUuid = noiSubmission.uuid;
        this.typeCode = noiSubmission.typeCode;

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

        this.structuresForm = new FormGroup({});
        this.proposedStructures = [];
        for (const structure of noiSubmission.soilProposedStructures) {
          const newStructure = this.addControl(structure.area);
          if (structure.type !== null) {
            this.setStructureTypeInput(newStructure, structure.type);
          }
        }
        this.structuresSource = new MatTableDataSource(this.proposedStructures);
        this.prepareStructureSpecificTextInputs();

        this.form.patchValue({
          isRemovingSoilForNewStructure: formatBooleanToString(noiSubmission.soilIsRemovingSoilForNewStructure),
          soilStructureFarmUseReason: noiSubmission.soilStructureFarmUseReason,
          soilStructureResidentialUseReason: noiSubmission.soilStructureResidentialUseReason,
          soilAgriParcelActivity: noiSubmission.soilAgriParcelActivity,
          soilStructureResidentialAccessoryUseReason: noiSubmission.soilStructureResidentialAccessoryUseReason,
          soilStructureOtherUseReason: noiSubmission.soilStructureOtherUseReason,
        });

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

  async attachBuildingPlan(file: FileHandle) {
    try {
      await this.attachFile(file, DOCUMENT_TYPE.BUILDING_PLAN);
      this.showBuildingPlanHasVirusError = false;
      this.showBuildingPlanVirusScanFailedError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showBuildingPlanHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showBuildingPlanVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
    }
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
        (structure) => structure.type && RESIDENTIAL_STRUCTURE_TYPES.includes(structure.type),
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
      (structure) => structure.type && structure.type === STRUCTURE_TYPES.OTHER_STRUCTURE,
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
      for (const lot of this.proposedStructures) {
        const lotType = this.structuresForm.controls[`${lot.id}-type`].value;
        const lotArea = this.structuresForm.controls[`${lot.id}-area`].value;
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

  private structureChangeRequiresConfirmation(oldType: STRUCTURE_TYPES | null, newType: STRUCTURE_TYPES): boolean {
    const residentialTypes = [
      STRUCTURE_TYPES.PRINCIPAL_RESIDENCE,
      STRUCTURE_TYPES.ADDITIONAL_RESIDENCE,
      STRUCTURE_TYPES.ACCESSORY_STRUCTURE,
    ];
    const changingFromResidentialType = oldType && residentialTypes.includes(oldType);
    const changingToResidentialType = newType && residentialTypes.includes(newType);

    return !!(
      oldType !== newType &&
      ((oldType &&
        oldType === STRUCTURE_TYPES.FARM_STRUCTURE &&
        (this.soilAgriParcelActivity.value || this.soilStructureFarmUseReason.value)) ||
        (changingFromResidentialType && !changingToResidentialType && this.soilStructureResidentialUseReason.value) ||
        (oldType &&
          oldType === STRUCTURE_TYPES.ACCESSORY_STRUCTURE &&
          this.soilStructureResidentialAccessoryUseReason.value) ||
        (oldType && oldType === STRUCTURE_TYPES.OTHER_STRUCTURE && this.soilStructureOtherUseReason.value))
    );
  }

  private setStructureTypeInput(structure: FormProposedStructure, newType: STRUCTURE_TYPES) {
    structure.type = newType;
    this.prepareStructureSpecificTextInputs();
    this.structuresForm.get(`${structure.id}-type`)?.setValue(newType);
    this.form.markAsDirty();
  }

  private setStructureAreaInput(structure: FormProposedStructure, value: string) {
    structure.area = value;
    this.prepareStructureSpecificTextInputs();
    this.form.markAsDirty();
  }

  onChangeStructureType(id: string, newType: STRUCTURE_TYPES) {
    const structure = this.proposedStructures.find((structure) => structure.id === id);
    if (!structure) {
      console.error('Failed to find structure');
      return;
    }
    this.structuresSource = new MatTableDataSource(this.proposedStructures);
    const oldType = structure.type;
    if (!this.structureChangeRequiresConfirmation(oldType, newType)) {
      return this.setStructureTypeInput(structure, newType);
    } else {
      const dialog = this.confirmationDialogService.openDialog({
        title: 'Change Structure Type',
        body: 'Changing the structure type will remove inputs relevant to the current structure. Do you want to continue?',
        confirmAction: 'Confirm',
        cancelAction: 'Cancel',
      });

      dialog.subscribe((isConfirmed) => {
        if (isConfirmed) {
          this.setStructureTypeInput(structure, newType);
        } else {
          this.structuresForm.get(structure.id + '-type')?.setValue(oldType);
        }
      });
    }
  }

  onChangeArea(id: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const structure = this.proposedStructures.find((structure) => structure.id === id);
    if (!structure) {
      console.error('Failed to find structure');
      return;
    }
    this.setStructureAreaInput(structure, input.value);
  }

  onStructureRemove(id: string) {
    this.dialog
      .open(DeleteStructureConfirmationDialogComponent, {
        panelClass: 'no-padding',
      })
      .beforeClosed()
      .subscribe(async (result) => {
        if (result) {
          this.deleteStructure(id);
        }
      });
  }

  onStructureEdit(id: string) {
    const structureToEdit = this.proposedStructures.find((structure) => structure.id === id);
    const dialog = this.dialog.open(AddStructureDialogComponent, {
      width: '70%',
      data: {
        isEdit: true,
        structureId: structureToEdit?.id,
        structureData: {
          area: structureToEdit?.area,
          type: structureToEdit?.type,
          options: this.structureTypeOptions,
        },
      },
    });
    dialog.afterClosed().subscribe(async (result) => {
      if (!result) return;
      const structureToEdit = this.proposedStructures.find((structure) => structure.id === id);
      if (structureToEdit) {
        this.setStructureTypeInput(structureToEdit, result.dto.type);
        structureToEdit.area = result.dto.area.toString();
        this.structuresSource = new MatTableDataSource(this.proposedStructures);
        const areaControl = this.structuresForm.controls[`${structureToEdit?.id}-area`];
        const typeControl = this.structuresForm.controls[`${structureToEdit?.id}-type`];
        areaControl.setValue(structureToEdit.area?.toString());
        typeControl.setValue(structureToEdit.type);
        this.structuresForm.markAsDirty();
      }
    });
  }

  private deleteStructure(id: string) {
    const structureToDelete = this.proposedStructures.find((structure) => structure.id === id);

    if (!structureToDelete) {
      console.error('Failed to find deleted structure');
      return;
    }

    this.proposedStructures = this.proposedStructures.filter((structure) => structure.id !== structureToDelete.id);
    this.structuresSource = new MatTableDataSource(this.proposedStructures);
    this.structuresForm.removeControl(`${id}-type`);
    this.structuresForm.removeControl(`${id}-area`);
    this.structuresForm.markAsDirty();

    if (structureToDelete.type === STRUCTURE_TYPES.FARM_STRUCTURE) {
      this.setVisibilityAndValidatorsForFarmFields();
    }

    if (structureToDelete.type === STRUCTURE_TYPES.ACCESSORY_STRUCTURE) {
      this.setVisibilityAndValidatorsForAccessoryFields();
    }

    if (structureToDelete.type && RESIDENTIAL_STRUCTURE_TYPES.includes(structureToDelete.type)) {
      this.setVisibilityAndValidatorsForResidentialFields();
    }

    if (structureToDelete.type === STRUCTURE_TYPES.OTHER_STRUCTURE) {
      this.setVisibilityAndValidatorsForOtherFields();
    }
  }

  onStructureAdd() {
    if (this.isMobile) {
      const dialog = this.dialog.open(AddStructureDialogComponent, {
        width: '70%',
        data: {
          structureData: {
            options: this.structureTypeOptions,
          },
        },
      });
      dialog
        .beforeClosed()
        .subscribe(async (result: { isEditing: boolean; structureId: string; dto: ProposedStructure }) => {
          if (!result) return;
          const newStructure = this.addControl(result.dto.area);
          if (result.dto.type !== null) {
            this.setStructureTypeInput(newStructure, result.dto.type);
          }
          this.structuresSource = new MatTableDataSource(this.proposedStructures);
        });
    } else {
      this.addControl();
      this.structuresSource = new MatTableDataSource(this.proposedStructures);
    }
  }

  isWarning(index: number, item: ProposedStructure): boolean {
    return item.type === STRUCTURE_TYPES.PRINCIPAL_RESIDENCE || item.type === STRUCTURE_TYPES.ADDITIONAL_RESIDENCE;
  }

  private addControl(area: number | null = null): FormProposedStructure {
    const areaStr = area ? area.toString(10) : null;
    const newStructure: FormProposedStructure = { type: null, area: areaStr, id: v4() };
    this.proposedStructures.push(newStructure);
    this.structuresForm.addControl(
      `${newStructure.id}-type`,
      new FormControl<string | null>(null, [Validators.required]),
    );
    this.structuresForm.addControl(
      `${newStructure.id}-area`,
      new FormControl<string | null>(areaStr, [Validators.required]),
    );

    this.structuresForm.markAsDirty();

    return newStructure;
  }

  private setRequired(formControl: FormControl<any>) {
    formControl.setValidators([Validators.required]);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }
}
