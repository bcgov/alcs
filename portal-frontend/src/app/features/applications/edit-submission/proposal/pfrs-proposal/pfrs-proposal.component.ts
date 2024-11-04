import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import { ApplicationDocumentDto } from '../../../../../services/application-document/application-document.dto';
import { ApplicationDocumentService } from '../../../../../services/application-document/application-document.service';
import { ApplicationSubmissionUpdateDto } from '../../../../../services/application-submission/application-submission.dto';
import { ApplicationSubmissionService } from '../../../../../services/application-submission/application-submission.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { DOCUMENT_TYPE } from '../../../../../shared/dto/document.dto';
import { FileHandle } from '../../../../../shared/file-drag-drop/drag-drop.directive';
import { formatBooleanToString } from '../../../../../shared/utils/boolean-helper';
import { MOBILE_BREAKPOINT } from '../../../../../shared/utils/breakpoints';
import { parseStringToBoolean } from '../../../../../shared/utils/string-helper';
import { EditApplicationSteps } from '../../edit-submission.component';
import { FilesStepComponent } from '../../files-step.partial';
import { SoilTableData } from '../../../../../shared/soil-table/soil-table.component';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogService } from '../../../../../shared/confirmation-dialog/confirmation-dialog.service';
import { v4 } from 'uuid';
import {
  STRUCTURE_TYPES,
  STRUCTURE_TYPE_OPTIONS,
  FormProposedStructure,
} from '../../../../notice-of-intents/edit-submission/additional-information/additional-information.component';
import { ProposedStructure } from '../../../../../services/notice-of-intent-submission/notice-of-intent-submission.dto';
import { AddStructureDialogComponent } from '../../../../notice-of-intents/edit-submission/additional-information/add-structure-dialog/add-structure-dialog.component';

@Component({
  selector: 'app-pfrs-proposal',
  templateUrl: './pfrs-proposal.component.html',
  styleUrls: ['./pfrs-proposal.component.scss'],
})
export class PfrsProposalComponent extends FilesStepComponent implements OnInit, OnDestroy {
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
  noticeOfWork: ApplicationDocumentDto[] = [];
  areComponentsDirty = false;

  showProposalMapVirus = false;
  showCrossSectionVirus = false;
  showReclamationPlanVirus = false;
  showBuildingPlanVirus = false;
  showNoticeOfWorkVirus = false;

  isNewStructure = new FormControl<boolean | null>(null, [Validators.required]);
  isFollowUp = new FormControl<string | null>(null, [Validators.required]);
  followUpIDs = new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]);
  purpose = new FormControl<string | null>(null, [Validators.required]);
  soilTypeRemoved = new FormControl<string | null>(null, [Validators.required]);
  reduceNegativeImpacts = new FormControl<string | null>(null, [Validators.required]);
  soilProjectDuration = new FormControl<string | null>(null, [Validators.required]);
  fillProjectDuration = new FormControl<string | null>(null, [Validators.required]);
  fillTypeToPlace = new FormControl<string | null>(null, [Validators.required]);
  alternativeMeasures = new FormControl<string | null>(null, [Validators.required]);
  isExtractionOrMining = new FormControl<string | null>(null, [Validators.required]);
  hasSubmittedNotice = new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]);

  // Conditional structure questions
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
    soilTypeRemoved: this.soilTypeRemoved,
    reduceNegativeImpacts: this.reduceNegativeImpacts,
    soilProjectDuration: this.soilProjectDuration,
    fillProjectDuration: this.fillProjectDuration,
    fillTypeToPlace: this.fillTypeToPlace,
    alternativeMeasures: this.alternativeMeasures,
    isExtractionOrMining: this.isExtractionOrMining,
    hasSubmittedNotice: this.hasSubmittedNotice,
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
  removalTableData: SoilTableData = {};
  alreadyRemovedTableData: SoilTableData = {};
  fillTableData: SoilTableData = {};
  alreadyFilledTableData: SoilTableData = {};
  requiresNoticeOfWork = false;

  constructor(
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

        this.alreadyRemovedTableData = {
          volume: applicationSubmission.soilAlreadyRemovedVolume ?? 0,
          area: applicationSubmission.soilAlreadyRemovedArea ?? 0,
          averageDepth: applicationSubmission.soilAlreadyRemovedAverageDepth ?? 0,
          maximumDepth: applicationSubmission.soilAlreadyRemovedMaximumDepth ?? 0,
        };

        this.removalTableData = {
          volume: applicationSubmission.soilToRemoveVolume ?? undefined,
          area: applicationSubmission.soilToRemoveArea ?? undefined,
          averageDepth: applicationSubmission.soilToRemoveAverageDepth ?? undefined,
          maximumDepth: applicationSubmission.soilToRemoveMaximumDepth ?? undefined,
        };

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

        if (applicationSubmission.soilIsExtractionOrMining) {
          this.hasSubmittedNotice.enable();
        }

        if (applicationSubmission.soilIsExtractionOrMining && applicationSubmission.soilHasSubmittedNotice) {
          this.requiresNoticeOfWork = true;
        }

        this.form.patchValue({
          isNewStructure: applicationSubmission.soilIsNewStructure,
          isFollowUp: formatBooleanToString(applicationSubmission.soilIsFollowUp),
          followUpIDs: applicationSubmission.soilFollowUpIDs,
          purpose: applicationSubmission.purpose,
          soilTypeRemoved: applicationSubmission.soilTypeRemoved,
          reduceNegativeImpacts: applicationSubmission.soilReduceNegativeImpacts,
          alternativeMeasures: applicationSubmission.soilAlternativeMeasures,
          fillTypeToPlace: applicationSubmission.soilFillTypeToPlace,
          soilProjectDuration: applicationSubmission.soilProjectDuration,
          fillProjectDuration: applicationSubmission.fillProjectDuration,
          isExtractionOrMining: formatBooleanToString(applicationSubmission.soilIsExtractionOrMining),
          hasSubmittedNotice: formatBooleanToString(applicationSubmission.soilHasSubmittedNotice),
          soilStructureFarmUseReason: applicationSubmission.soilStructureFarmUseReason,
          soilStructureResidentialUseReason: applicationSubmission.soilStructureResidentialUseReason,
          soilAgriParcelActivity: applicationSubmission.soilAgriParcelActivity,
          soilStructureResidentialAccessoryUseReason: applicationSubmission.soilStructureResidentialAccessoryUseReason,
          soilStructureOtherUseReason: applicationSubmission.soilStructureOtherUseReason,
        });

        this.structuresForm = new FormGroup({});
        this.proposedStructures = [];
        for (const structure of applicationSubmission.soilProposedStructures) {
          console.log(structure);
          this.addControl(structure.type, structure.area);
        }
        this.structuresSource = new MatTableDataSource(this.proposedStructures);

        this.updateStructureTypeFields();
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
      this.noticeOfWork = documents.filter((document) => document.type?.code === DOCUMENT_TYPE.NOTICE_OF_WORK);
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

  async attachNoticeOfWork(file: FileHandle) {
    const res = await this.attachFile(file, DOCUMENT_TYPE.NOTICE_OF_WORK);
    this.showNoticeOfWorkVirus = !res;
  }

  protected async save() {
    if (this.fileId && (this.form.dirty || this.structuresForm.dirty || this.areComponentsDirty)) {
      const isNewStructure = this.isNewStructure.getRawValue();
      const isFollowUp = this.isFollowUp.getRawValue();
      const followUpIDs = this.followUpIDs.getRawValue();
      const purpose = this.purpose.getRawValue();
      const soilTypeRemoved = this.soilTypeRemoved.getRawValue();
      const soilReduceNegativeImpacts = this.reduceNegativeImpacts.getRawValue();
      const soilFillTypeToPlace = this.fillTypeToPlace.getRawValue();
      const soilAlternativeMeasures = this.alternativeMeasures.getRawValue();

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
        soilTypeRemoved,
        soilFillTypeToPlace,
        soilReduceNegativeImpacts,
        soilAlternativeMeasures,
        soilIsNewStructure: isNewStructure,
        soilIsFollowUp: parseStringToBoolean(isFollowUp),
        soilFollowUpIDs: followUpIDs,
        soilToRemoveVolume: this.removalTableData?.volume ?? null,
        soilToRemoveArea: this.removalTableData?.area ?? null,
        soilToRemoveMaximumDepth: this.removalTableData?.maximumDepth ?? null,
        soilToRemoveAverageDepth: this.removalTableData?.averageDepth ?? null,
        soilAlreadyRemovedVolume: this.alreadyRemovedTableData?.volume ?? null,
        soilAlreadyRemovedArea: this.alreadyRemovedTableData?.area ?? null,
        soilAlreadyRemovedMaximumDepth: this.alreadyRemovedTableData?.maximumDepth ?? null,
        soilAlreadyRemovedAverageDepth: this.alreadyRemovedTableData?.averageDepth ?? null,
        soilToPlaceVolume: this.fillTableData?.volume ?? null,
        soilToPlaceArea: this.fillTableData?.area ?? null,
        soilToPlaceMaximumDepth: this.fillTableData?.maximumDepth ?? null,
        soilToPlaceAverageDepth: this.fillTableData?.averageDepth ?? null,
        soilAlreadyPlacedVolume: this.alreadyFilledTableData?.volume ?? null,
        soilAlreadyPlacedArea: this.alreadyFilledTableData?.area ?? null,
        soilAlreadyPlacedMaximumDepth: this.alreadyFilledTableData?.maximumDepth ?? null,
        soilAlreadyPlacedAverageDepth: this.alreadyFilledTableData?.averageDepth ?? null,
        soilProjectDuration: this.soilProjectDuration.value,
        fillProjectDuration: this.fillProjectDuration.value,
        soilHasSubmittedNotice: parseStringToBoolean(this.hasSubmittedNotice.getRawValue()),
        soilStructureFarmUseReason: this.soilStructureFarmUseReason.value,
        soilStructureResidentialUseReason: this.soilStructureResidentialUseReason.value,
        soilAgriParcelActivity: this.soilAgriParcelActivity.value,
        soilStructureResidentialAccessoryUseReason: this.soilStructureResidentialAccessoryUseReason.value,
        soilStructureOtherUseReason: this.soilStructureOtherUseReason.value,
        soilIsExtractionOrMining: parseStringToBoolean(this.isExtractionOrMining.getRawValue()),
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
          this.noticeOfWork.length > 0 ||
          this.reduceNegativeImpacts.value ||
          this.alternativeMeasures.value ||
          this.isExtractionOrMining.value ||
          this.hasSubmittedNotice.value)) ||
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
              for (const noticeOfWork_ of this.noticeOfWork) {
                this.onDeleteFile(noticeOfWork_);
              }

              // Clear questions
              this.reduceNegativeImpacts.reset();
              this.alternativeMeasures.reset();
              this.isExtractionOrMining.reset();
              this.hasSubmittedNotice.reset();
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

  onChangeIsFollowUp(selectedValue: string) {
    if (selectedValue === 'true') {
      this.followUpIDs.enable();
    } else if (selectedValue === 'false') {
      this.followUpIDs.disable();
      this.followUpIDs.setValue(null);
    }
  }

  onChangeMiningExtraction(selectedValue: string) {
    if (selectedValue === 'true') {
      this.hasSubmittedNotice.enable();
    } else if (selectedValue === 'false') {
      this.hasSubmittedNotice.disable();
      this.hasSubmittedNotice.setValue(null);
    }
  }

  onChangeNoticeOfWork(selectedValue: string) {
    this.requiresNoticeOfWork = selectedValue === 'true';
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

    this.updateStructureTypeFields();
    this.form.markAsDirty();
  }

  updateStructureTypeFields() {
    // Remove

    if (this.structureTypeCounts[STRUCTURE_TYPES.FARM_STRUCTURE] === 0) {
      this.soilStructureFarmUseReason.removeValidators([Validators.required]);
      this.soilStructureFarmUseReason.reset();
      this.soilAgriParcelActivity.removeValidators([Validators.required]);
      this.soilAgriParcelActivity.reset();
    }

    if (
      this.structureTypeCounts[STRUCTURE_TYPES.PRINCIPAL_RESIDENCE] === 0 &&
      this.structureTypeCounts[STRUCTURE_TYPES.ADDITIONAL_RESIDENCE] === 0 &&
      this.structureTypeCounts[STRUCTURE_TYPES.ACCESSORY_STRUCTURE] === 0
    ) {
      this.soilStructureResidentialUseReason.reset();
      this.soilStructureResidentialUseReason.removeValidators([Validators.required]);
    }

    if (this.structureTypeCounts[STRUCTURE_TYPES.OTHER_STRUCTURE] === 0) {
      this.soilStructureResidentialAccessoryUseReason.reset();
      this.soilStructureResidentialAccessoryUseReason.removeValidators([Validators.required]);
    }

    if (this.structureTypeCounts[STRUCTURE_TYPES.ACCESSORY_STRUCTURE] === 0) {
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

    this.structuresForm.markAsDirty();
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
