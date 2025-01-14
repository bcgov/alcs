import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import { ApplicationSubmissionUpdateDto } from '../../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../../services/application-submission/application-submission.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { FileHandle } from '../../../../../shared/file-drag-drop/drag-drop.directive';
import { formatBooleanToString } from '../../../../../shared/utils/boolean-helper';
import { parseStringToBoolean } from '../../../../../shared/utils/string-helper';
import { EditApplicationSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';
import { SoilTableData } from '../../../../../shared/soil-table/soil-table.component';
import {
  FormProposedStructure,
  STRUCTURE_TYPE_OPTIONS,
  STRUCTURE_TYPES,
} from '../../../../notice-of-intents/edit-submission/additional-information/additional-information.component';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogService } from '../../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { MOBILE_BREAKPOINT } from '../../../../../shared/utils/breakpoints';
import { AddStructureDialogComponent } from '../../../../../features/notice-of-intents/edit-submission/additional-information/add-structure-dialog/add-structure-dialog.component';
import { ProposedStructure } from '../../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { v4 } from 'uuid';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-pofo-proposal',
  templateUrl: './pofo-proposal.component.html',
  styleUrls: ['./pofo-proposal.component.scss'],
})
export class PofoProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
  currentStep = EditApplicationSteps.Proposal;

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  }

  DOCUMENT = DOCUMENT_TYPE;

  structureTypes = STRUCTURE_TYPES;
  structureTypeOptions = STRUCTURE_TYPE_OPTIONS;
  structureTypeCounts: Record<STRUCTURE_TYPES, number> = Object.fromEntries(
    Object.entries(STRUCTURE_TYPES).map(([_, type]) => [type, 0]),
  ) as { [key in STRUCTURE_TYPES]: number };

  proposalMap: ApplicationDocumentDto[] = [];
  crossSections: ApplicationDocumentDto[] = [];
  reclamationPlan: ApplicationDocumentDto[] = [];
  buildingPlans: ApplicationDocumentDto[] = [];

  showProposalMapHasVirusError = false;
  showProposalMapVirusScanFailedError = false;
  showProposalMapUnknownError = false;
  showCrossSectionHasVirusError = false;
  showCrossSectionVirusScanFailedError = false;
  showCrossSectionUnknownError = false;
  showReclamationPlanHasVirusError = false;
  showReclamationPlanVirusScanFailedError = false;
  showReclamationPlanUnknownError = false;
  showBuildingPlanHasVirusError = false;
  showBuildingPlanVirusScanFailedError = false;
  showBuildingPlanUnknownError = false;

  isNewStructure = new FormControl<boolean | null>(null, [Validators.required]);
  isFollowUp = new FormControl<string | null>(null, [Validators.required]);
  followUpIDs = new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  fillTypeToPlace = new FormControl<string | null>(null, [Validators.required]);
  reduceNegativeImpacts = new FormControl<string | null>(null, [Validators.required]);
  alternativeMeasures = new FormControl<string | null>(null, [Validators.required]);
  projectDuration = new FormControl<string | null>(null, [Validators.required]);

  soilStructureFarmUseReason = new FormControl<string | null>(null);
  soilStructureResidentialUseReason = new FormControl<string | null>(null);
  soilAgriParcelActivity = new FormControl<string | null>(null);
  soilStructureResidentialAccessoryUseReason = new FormControl<string | null>(null);
  soilStructureOtherUseReason = new FormControl<string | null>(null);

  form = new FormGroup({
    isNewStructure: this.isNewStructure,
    isFollowUp: this.isFollowUp,
    followUpIDs: this.followUpIDs,
    purpose: this.purpose,
    fillTypeToPlace: this.fillTypeToPlace,
    alternativeMeasures: this.alternativeMeasures,
    reduceNegativeImpacts: this.reduceNegativeImpacts,
    projectDuration: this.projectDuration,
    soilStructureFarmUseReason: this.soilStructureFarmUseReason,
    soilStructureResidentialUseReason: this.soilStructureResidentialUseReason,
    soilAgriParcelActivity: this.soilAgriParcelActivity,
    soilStructureResidentialAccessoryUseReason: this.soilStructureResidentialAccessoryUseReason,
    soilStructureOtherUseReason: this.soilStructureOtherUseReason,
  });

  structuresForm = new FormGroup({} as any);
  proposedStructures: FormProposedStructure[] = [];
  structuresSource = new MatTableDataSource(this.proposedStructures);
  displayedColumns = ['index', 'type', 'area', 'action'];

  private submissionUuid = '';
  isMobile = false;
  private areComponentsDirty = false;
  fillTableData: SoilTableData = {};
  alreadyFilledTableData: SoilTableData = {};

  constructor(
    private router: Router,
    private applicationService: ApplicationSubmissionService,
    applicationDocumentService: ApplicationDocumentService,
    dialog: MatDialog,
    toastService: ToastService,
    private confirmationDialogService: ConfirmationDialogService,
  ) {
    super(applicationDocumentService, dialog, toastService);
  }

  ngOnInit(): void {
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

    this.$applicationSubmission.pipe(takeUntil(this.$destroy)).subscribe((applicationSubmission) => {
      if (applicationSubmission) {
        this.fileId = applicationSubmission.fileNumber;
        this.submissionUuid = applicationSubmission.uuid;

        this.alreadyFilledTableData = {
          volume: applicationSubmission.soilAlreadyPlacedVolume ?? 0,
          area: applicationSubmission.soilAlreadyPlacedArea ?? 0,
          averageDepth: applicationSubmission.soilAlreadyPlacedAverageDepth ?? 0,
          maximumDepth: applicationSubmission.soilAlreadyPlacedMaximumDepth ?? 0,
        };

        this.fillTableData = {
          volume: applicationSubmission.soilToPlaceVolume ?? undefined,
          area: applicationSubmission.soilToPlaceArea ?? undefined,
          averageDepth: applicationSubmission.soilToPlaceAverageDepth ?? undefined,
          maximumDepth: applicationSubmission.soilToPlaceMaximumDepth ?? undefined,
        };

        if (applicationSubmission.soilIsFollowUp) {
          this.followUpIDs.enable();
        }

        this.form.patchValue({
          isNewStructure: applicationSubmission.soilIsNewStructure,
          isFollowUp: formatBooleanToString(applicationSubmission.soilIsFollowUp),
          followUpIDs: applicationSubmission.soilFollowUpIDs,
          purpose: applicationSubmission.purpose,
          fillTypeToPlace: applicationSubmission.soilFillTypeToPlace,
          alternativeMeasures: applicationSubmission.soilAlternativeMeasures,
          reduceNegativeImpacts: applicationSubmission.soilReduceNegativeImpacts,
          projectDuration: applicationSubmission.soilProjectDuration,
        });

        this.proposedStructures = [];
        this.structuresForm = new FormGroup({});
        for (const structure of applicationSubmission.soilProposedStructures) {
          const newStructure = this.addControl(structure.area);
          if (structure.type !== null) {
            this.setStructureTypeInput(newStructure, structure.type);
          }
        }
        this.structuresSource = new MatTableDataSource(this.proposedStructures);

        this.updateStructureTypeFields();

        this.form.patchValue({
          soilStructureFarmUseReason: applicationSubmission.soilStructureFarmUseReason,
          soilStructureResidentialUseReason: applicationSubmission.soilStructureResidentialUseReason,
          soilAgriParcelActivity: applicationSubmission.soilAgriParcelActivity,
          soilStructureResidentialAccessoryUseReason: applicationSubmission.soilStructureResidentialAccessoryUseReason,
          soilStructureOtherUseReason: applicationSubmission.soilStructureOtherUseReason,
        });

        if (this.showErrors) {
          this.form.markAllAsTouched();
          this.structuresForm.markAllAsTouched();
        }
      }
    });

    this.$applicationDocuments.pipe(takeUntil(this.$destroy)).subscribe((documents) => {
      this.proposalMap = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.PROPOSAL_MAP);
      this.crossSections = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.CROSS_SECTIONS);
      this.reclamationPlan = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.RECLAMATION_PLAN);
      this.buildingPlans = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.BUILDING_PLAN);
    });
  }

  async onSave() {
    await this.save();
  }

  async attachProposalMap(file: FileHandle) {
    try {
      await this.attachFile(file, DOCUMENT_TYPE.PROPOSAL_MAP);
      this.showProposalMapHasVirusError = false;
      this.showProposalMapVirusScanFailedError = false;
      this.showProposalMapUnknownError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showProposalMapHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showProposalMapVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
      this.showProposalMapUnknownError =
        !this.showProposalMapHasVirusError && !this.showProposalMapVirusScanFailedError;
    }
  }

  async attachCrossSection(file: FileHandle) {
    try {
      await this.attachFile(file, DOCUMENT_TYPE.CROSS_SECTIONS);
      this.showCrossSectionHasVirusError = false;
      this.showCrossSectionVirusScanFailedError = false;
      this.showCrossSectionUnknownError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showCrossSectionHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showCrossSectionVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
      this.showCrossSectionUnknownError =
        !this.showCrossSectionHasVirusError && !this.showCrossSectionVirusScanFailedError;
    }
  }

  async attachReclamationPlan(file: FileHandle) {
    try {
      await this.attachFile(file, DOCUMENT_TYPE.RECLAMATION_PLAN);
      this.showReclamationPlanHasVirusError = false;
      this.showReclamationPlanVirusScanFailedError = false;
      this.showReclamationPlanUnknownError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showReclamationPlanHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showReclamationPlanVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
      this.showReclamationPlanUnknownError =
        !this.showReclamationPlanHasVirusError && !this.showReclamationPlanVirusScanFailedError;
    }
  }

  async attachBuildingPlan(file: FileHandle) {
    try {
      await this.attachFile(file, DOCUMENT_TYPE.BUILDING_PLAN);
      this.showBuildingPlanHasVirusError = false;
      this.showBuildingPlanVirusScanFailedError = false;
      this.showBuildingPlanUnknownError = false;
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        this.showBuildingPlanHasVirusError = err.status === 400 && err.error.name === 'VirusDetected';
        this.showBuildingPlanVirusScanFailedError = err.status === 500 && err.error.name === 'VirusScanFailed';
      }
      this.showBuildingPlanUnknownError =
        !this.showBuildingPlanHasVirusError && !this.showBuildingPlanVirusScanFailedError;
    }
  }

  protected async save() {
    if (this.fileId && (this.form.dirty || this.structuresForm.dirty || this.areComponentsDirty)) {
      const isNewStructure = this.isNewStructure.getRawValue();
      const isFollowUp = this.isFollowUp.getRawValue();
      const soilFollowUpIDs = this.followUpIDs.getRawValue();
      const purpose = this.purpose.getRawValue();
      const soilFillTypeToPlace = this.fillTypeToPlace.getRawValue();
      const soilAlternativeMeasures = this.alternativeMeasures.getRawValue();
      const soilReduceNegativeImpacts = this.reduceNegativeImpacts.getRawValue();
      const soilStructureFarmUseReason = this.soilStructureFarmUseReason.getRawValue();
      const soilStructureResidentialUseReason = this.soilStructureResidentialUseReason.getRawValue();
      const soilAgriParcelActivity = this.soilAgriParcelActivity.getRawValue();
      const soilStructureResidentialAccessoryUseReason = this.soilStructureResidentialAccessoryUseReason.getRawValue();
      const soilStructureOtherUseReason = this.soilStructureOtherUseReason.getRawValue();

      const updatedStructures: ProposedStructure[] = this.proposedStructures.map((lot) => {
        const lotType = this.structuresForm.controls[`${lot.id}-type`].value;
        const lotArea = this.structuresForm.controls[`${lot.id}-area`].value;
        return {
          type: lotType,
          area: lotArea ? parseFloat(lotArea) : null,
        };
      });

      const updateDto: ApplicationSubmissionUpdateDto = {
        purpose,
        soilFillTypeToPlace,
        soilAlternativeMeasures,
        soilReduceNegativeImpacts,
        soilIsNewStructure: isNewStructure,
        soilIsFollowUp: parseStringToBoolean(isFollowUp),
        soilFollowUpIDs,
        soilToPlaceVolume: this.fillTableData?.volume ?? null,
        soilToPlaceArea: this.fillTableData?.area ?? null,
        soilToPlaceMaximumDepth: this.fillTableData?.maximumDepth ?? null,
        soilToPlaceAverageDepth: this.fillTableData?.averageDepth ?? null,
        soilAlreadyPlacedVolume: this.alreadyFilledTableData?.volume ?? null,
        soilAlreadyPlacedArea: this.alreadyFilledTableData?.area ?? null,
        soilAlreadyPlacedMaximumDepth: this.alreadyFilledTableData?.maximumDepth ?? null,
        soilAlreadyPlacedAverageDepth: this.alreadyFilledTableData?.averageDepth ?? null,
        soilProjectDuration: this.projectDuration.value,
        soilProposedStructures: updatedStructures,
        soilStructureFarmUseReason,
        soilStructureResidentialUseReason,
        soilAgriParcelActivity,
        soilStructureResidentialAccessoryUseReason,
        soilStructureOtherUseReason,
      };

      const updatedApp = await this.applicationService.updatePending(this.submissionUuid, updateDto);
      this.$applicationSubmission.next(updatedApp);
    }
  }

  onChangeIsNewStructure(answeredYes: boolean | null) {
    const hasValuesThatWillBeCleared: boolean = !!(
      (answeredYes &&
        (this.crossSections.length > 0 ||
          this.reclamationPlan.length > 0 ||
          this.reduceNegativeImpacts.value ||
          this.alternativeMeasures.value)) ||
      (!answeredYes &&
        (this.proposedStructures.length > 0 ||
          this.soilStructureFarmUseReason.value ||
          this.soilStructureResidentialUseReason.value ||
          this.soilAgriParcelActivity.value ||
          this.soilStructureResidentialAccessoryUseReason.value ||
          this.soilStructureOtherUseReason.value ||
          this.buildingPlans.length > 0))
    );

    if (hasValuesThatWillBeCleared) {
      this.confirmationDialogService
        .openDialog({
          title: 'Are you removing soil in order to build a structure?',
          body: 'Warning: Changing your answer will remove all the saved progress on this step. Do you want to continue?',
          confirmAction: 'Confirm',
          cancelAction: 'Cancel',
        })
        .subscribe((isConfirmed) => {
          if (isConfirmed) {
            if (answeredYes) {
              // Clear docs
              for (const crossSection of this.crossSections) {
                this.onDeleteFile(crossSection);
              }
              for (const reclamationPlan_ of this.reclamationPlan) {
                this.onDeleteFile(reclamationPlan_);
              }

              // Clear questions
              this.reduceNegativeImpacts.reset();
              this.alternativeMeasures.reset();
            } else {
              // Clear docs
              for (const buildingPlan of this.buildingPlans) {
                this.onDeleteFile(buildingPlan);
              }

              // Clear structures
              this.structuresForm = new FormGroup({});
              this.proposedStructures = [];
              this.structuresSource = new MatTableDataSource(this.proposedStructures);
              for (const type of Object.keys(this.structureTypeCounts) as Array<STRUCTURE_TYPES>) {
                this.structureTypeCounts[type] = 0;
              }

              // Clear conditional questions
              this.soilStructureFarmUseReason.reset();
              this.soilStructureResidentialUseReason.reset();
              this.soilAgriParcelActivity.reset();
              this.soilStructureResidentialAccessoryUseReason.reset();
              this.soilStructureOtherUseReason.reset();
            }
          } else {
            this.isNewStructure.setValue(!answeredYes);
          }
        });
    }
  }

  onChangeFollowUp(selectedValue: string) {
    if (selectedValue === 'true') {
      this.followUpIDs.enable();
    } else if (selectedValue === 'false') {
      this.followUpIDs.disable();
      this.followUpIDs.setValue(null);
    }
  }

  onChangeStructureType(id: string, newType: STRUCTURE_TYPES) {
    const structure = this.proposedStructures.find((structure) => structure.id === id);

    if (!structure) {
      console.error('Failed to find structure');
      return;
    }

    this.structuresSource = new MatTableDataSource(this.proposedStructures);

    if (this.structureChangeRequiresConfirmation(structure.type, newType)) {
      this.confirmationDialogService
        .openDialog({
          title: 'Change Structure Type',
          body: 'Changing the structure type will remove inputs relevant to the current structure. Do you want to continue?',
          confirmAction: 'Confirm',
          cancelAction: 'Cancel',
        })
        .subscribe((isConfirmed) => {
          if (isConfirmed) {
            this.setStructureTypeInput(structure, newType);
          } else {
            this.structuresForm.get(structure.id + '-type')?.setValue(structure.type);
          }
        });
    } else {
      return this.setStructureTypeInput(structure, newType);
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

  private setStructureAreaInput(structure: FormProposedStructure, value: string) {
    structure.area = value;
    this.form.markAsDirty();
  }

  private structureChangeRequiresConfirmation(oldType: STRUCTURE_TYPES | null, newType: STRUCTURE_TYPES | null) {
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
    this.updateStructureCounts(structure.type, newType);

    structure.type = newType;
    this.structuresForm.get(`${structure.id}-type`)?.setValue(newType);

    this.updateStructureTypeFields();
    this.form.markAsDirty();
  }

  private updateStructureCounts(oldType: STRUCTURE_TYPES | null, newType: STRUCTURE_TYPES | null) {
    if (oldType !== null && this.structureTypeCounts[oldType] > 0) {
      this.structureTypeCounts[oldType]--;
    }

    if (newType !== null) {
      this.structureTypeCounts[newType]++;
    }
  }

  updateStructureTypeFields() {
    // Remove

    if (this.structureTypeCounts[STRUCTURE_TYPES.FARM_STRUCTURE] === 0) {
      this.soilStructureFarmUseReason.reset();
      this.soilStructureFarmUseReason.removeValidators([Validators.required]);
      this.soilAgriParcelActivity.reset();
      this.soilAgriParcelActivity.removeValidators([Validators.required]);
    }

    if (
      this.structureTypeCounts[STRUCTURE_TYPES.PRINCIPAL_RESIDENCE] === 0 &&
      this.structureTypeCounts[STRUCTURE_TYPES.ADDITIONAL_RESIDENCE] === 0 &&
      this.structureTypeCounts[STRUCTURE_TYPES.ACCESSORY_STRUCTURE] === 0
    ) {
      this.soilStructureResidentialUseReason.reset();
      this.soilStructureResidentialUseReason.removeValidators([Validators.required]);
    }

    if (this.structureTypeCounts[STRUCTURE_TYPES.ACCESSORY_STRUCTURE] === 0) {
      this.soilStructureResidentialAccessoryUseReason.reset();
      this.soilStructureResidentialAccessoryUseReason.removeValidators([Validators.required]);
    }

    if (this.structureTypeCounts[STRUCTURE_TYPES.OTHER_STRUCTURE] === 0) {
      this.soilStructureOtherUseReason.reset();
      this.soilStructureOtherUseReason.removeValidators([Validators.required]);
    }

    // Add

    if (this.structureTypeCounts[STRUCTURE_TYPES.FARM_STRUCTURE] > 0) {
      this.soilStructureFarmUseReason.setValidators([Validators.required]);
      this.soilAgriParcelActivity.setValidators([Validators.required]);
    }

    if (
      this.structureTypeCounts[STRUCTURE_TYPES.PRINCIPAL_RESIDENCE] > 0 ||
      this.structureTypeCounts[STRUCTURE_TYPES.ADDITIONAL_RESIDENCE] > 0 ||
      this.structureTypeCounts[STRUCTURE_TYPES.ACCESSORY_STRUCTURE] > 0
    ) {
      this.soilStructureResidentialUseReason.setValidators([Validators.required]);
    }

    if (this.structureTypeCounts[STRUCTURE_TYPES.ACCESSORY_STRUCTURE] > 0) {
      this.soilStructureResidentialAccessoryUseReason.setValidators([Validators.required]);
    }

    if (this.structureTypeCounts[STRUCTURE_TYPES.OTHER_STRUCTURE] > 0) {
      this.soilStructureOtherUseReason.setValidators([Validators.required]);
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

  addControl(area: number | null = null): FormProposedStructure {
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

  isWarning(index: number, item: ProposedStructure): boolean {
    return item.type === STRUCTURE_TYPES.PRINCIPAL_RESIDENCE || item.type === STRUCTURE_TYPES.ADDITIONAL_RESIDENCE;
  }

  onStructureRemove(id: string) {
    this.confirmationDialogService
      .openDialog({
        title:
          'Warning: Deleting the structure type can remove some content already saved to this page. Do you want to continue?',
        body: 'Changing the structure type will remove inputs relevant to the current structure. Do you want to continue?',
        confirmAction: 'Confirm',
        cancelAction: 'Cancel',
      })
      .subscribe(async (result) => {
        if (result) {
          this.deleteStructure(id);
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

    this.updateStructureCounts(structureToDelete.type, null);
    this.updateStructureTypeFields();
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
    dialog
      .afterClosed()
      .subscribe(async (result: { isEditing: boolean; structureId: string; dto: ProposedStructure }) => {
        if (!result) return;
        const structureToEdit = this.proposedStructures.find((structure) => structure.id === id);

        if (structureToEdit) {
          if (structureToEdit.type !== result.dto.type) {
            this.setStructureTypeInput(structureToEdit, result.dto.type!);
          }

          structureToEdit.area = result.dto.area ? result.dto.area.toString(10) : null;
          structureToEdit.type = result.dto.type;
          const areaControl = this.structuresForm.controls[`${structureToEdit?.id}-area`];
          const typeControl = this.structuresForm.controls[`${structureToEdit?.id}-type`];
          areaControl.setValue(structureToEdit.area?.toString());
          typeControl.setValue(structureToEdit.type);
          this.structuresForm.markAsDirty();
        }
      });
  }

  markDirty() {
    this.areComponentsDirty = true;
  }
}
