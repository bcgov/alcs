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

  showProposalMapVirus = false;
  showCrossSectionVirus = false;
  showReclamationPlanVirus = false;
  showBuildingPlanVirus = false;

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
          soilStructureFarmUseReason: applicationSubmission.soilStructureFarmUseReason,
          soilStructureResidentialUseReason: applicationSubmission.soilStructureResidentialUseReason,
          soilAgriParcelActivity: applicationSubmission.soilAgriParcelActivity,
          soilStructureResidentialAccessoryUseReason: applicationSubmission.soilStructureResidentialAccessoryUseReason,
          soilStructureOtherUseReason: applicationSubmission.soilStructureOtherUseReason,
        });

        this.proposedStructures = [];
        this.structuresForm = new FormGroup({});
        for (const structure of applicationSubmission.soilProposedStructures) {
          this.addControl(structure.type, structure.area);
        }
        this.structuresSource = new MatTableDataSource(this.proposedStructures);

        if (this.showErrors) {
          this.form.markAllAsTouched();
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
    const res = await this.attachFile(file, DOCUMENT_TYPE.PROPOSAL_MAP);
    this.showProposalMapVirus = !res;
  }

  async attachCrossSection(file: FileHandle) {
    const res = await this.attachFile(file, DOCUMENT_TYPE.CROSS_SECTIONS);
    this.showCrossSectionVirus = !res;
  }

  async attachReclamationPlan(file: FileHandle) {
    const res = await this.attachFile(file, DOCUMENT_TYPE.RECLAMATION_PLAN);
    this.showReclamationPlanVirus = !res;
  }

  async attachBuildingPlan(file: FileHandle) {
    const res = await this.attachFile(file, DOCUMENT_TYPE.BUILDING_PLAN);
    this.showBuildingPlanVirus = !res;
  }

  protected async save() {
    if (this.fileId && (this.form.dirty || this.areComponentsDirty)) {
      const isNewStructure = this.isNewStructure.getRawValue();
      const isFollowUp = this.isFollowUp.getRawValue();
      const soilFollowUpIDs = this.followUpIDs.getRawValue();
      const purpose = this.purpose.getRawValue();
      const soilFillTypeToPlace = this.fillTypeToPlace.getRawValue();
      const soilAlternativeMeasures = this.alternativeMeasures.getRawValue();
      const soilReduceNegativeImpacts = this.reduceNegativeImpacts.getRawValue();

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
        soilStructureFarmUseReason: this.soilStructureFarmUseReason.value,
        soilStructureResidentialUseReason: this.soilStructureResidentialUseReason.value,
        soilProposedStructures: updatedStructures,
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
              this.crossSections = [];
              this.reclamationPlan = [];
              this.buildingPlans = [];

              // Clear questions
              this.reduceNegativeImpacts.reset();
              this.alternativeMeasures.reset();
            } else {
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

    if (this.hasInput(structure.type)) {
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

  private hasInput(type: STRUCTURE_TYPES | null) {
    switch (type) {
      case STRUCTURE_TYPES.FARM_STRUCTURE:
        return !!(this.soilAgriParcelActivity.value || this.soilStructureFarmUseReason.value);

      case STRUCTURE_TYPES.ACCESSORY_STRUCTURE:
        return !!(
          this.soilStructureResidentialUseReason.value || this.soilStructureResidentialAccessoryUseReason.value
        );

      case STRUCTURE_TYPES.OTHER_STRUCTURE:
        return !!this.soilStructureOtherUseReason.value;

      case STRUCTURE_TYPES.PRINCIPAL_RESIDENCE:
      case STRUCTURE_TYPES.ADDITIONAL_RESIDENCE:
        return !!this.soilStructureResidentialUseReason.value;

      case null:
        return false;

      default:
        return true;
    }
  }

  private setStructureTypeInput(structure: FormProposedStructure, newType: STRUCTURE_TYPES) {
    if (structure.type !== null && this.structureTypeCounts[structure.type] > 0) {
      this.structureTypeCounts[structure.type]--;
    }

    this.structureTypeCounts[newType]++;

    structure.type = newType;

    this.form.markAsDirty();
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
          this.addControl(result.dto.type, result.dto.area);
          this.structuresSource = new MatTableDataSource(this.proposedStructures);

          this.structureTypeCounts[result.dto.type!]++;
        });
    } else {
      this.addControl();
      this.structuresSource = new MatTableDataSource(this.proposedStructures);
    }
  }

  addControl(type: STRUCTURE_TYPES | null = null, area: number | null = null) {
    const areaStr = area ? area.toString(10) : null;
    const newStructure = { type, area: areaStr, id: v4() };
    this.proposedStructures.push(newStructure);
    this.structuresForm.addControl(
      `${newStructure.id}-type`,
      new FormControl<string | null>(type, [Validators.required]),
    );
    this.structuresForm.addControl(
      `${newStructure.id}-area`,
      new FormControl<string | null>(areaStr, [Validators.required]),
    );

    if (type) {
      this.structureTypeCounts[type]++;
    }
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

    if (structureToDelete.type !== null && this.structureTypeCounts[structureToDelete.type] > 0) {
      this.structureTypeCounts[structureToDelete.type]--;
    }
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
