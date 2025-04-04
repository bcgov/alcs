import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  APPLICATION_DECISION_COMPONENT_TYPE,
  ApplicationDecisionCodesDto,
  ApplicationDecisionComponentDto,
  DecisionComponentTypeDto,
  NfuDecisionComponentDto,
  PofoDecisionComponentDto,
  ProposedDecisionLotDto,
  RosoDecisionComponentDto,
  SubdDecisionComponentDto,
  PfrsDecisionComponentDto,
} from '../../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ToastService } from '../../../../../../../services/toast/toast.service';
import { AG_CAP_OPTIONS, AG_CAP_SOURCE_OPTIONS } from '../../../../../../../shared/dto/ag-cap.types.dto';
import { formatDateForApi } from '../../../../../../../shared/utils/api-date-formatter';
import { SubdInputComponent } from './subd-input/subd-input.component';

const MIN_SOIL_FIELDS = 0.00001;

@Component({
  selector: 'app-decision-component',
  templateUrl: './decision-component.component.html',
  styleUrls: ['./decision-component.component.scss'],
})
export class DecisionComponentComponent implements OnInit {
  @Input() data!: ApplicationDecisionComponentDto;
  @Input() codes!: ApplicationDecisionCodesDto;
  @Output() dataChange = new EventEmitter<ApplicationDecisionComponentDto>();
  @Output() remove = new EventEmitter<void>();

  @ViewChild(SubdInputComponent) subdInputComponent?: SubdInputComponent;

  COMPONENT_TYPE = APPLICATION_DECISION_COMPONENT_TYPE;

  agCapOptions = AG_CAP_OPTIONS;
  agCapSourceOptions = AG_CAP_SOURCE_OPTIONS;

  // nfu
  nfuType = new FormControl<string | null>(null, [Validators.required]);
  nfuSubType = new FormControl<string | null>(null, [Validators.required]);

  // pofo, pfrs
  fillTypeToPlace = new FormControl<string | null>(null, [Validators.required]);
  volumeToPlace = new FormControl<number | null>(null, [Validators.min(MIN_SOIL_FIELDS)]);
  areaToPlace = new FormControl<number | null>(null, [Validators.required, Validators.min(MIN_SOIL_FIELDS)]);
  maximumDepthToPlace = new FormControl<number | null>(null, [Validators.required, Validators.min(MIN_SOIL_FIELDS)]);
  averageDepthToPlace = new FormControl<number | null>(null, [Validators.required, Validators.min(MIN_SOIL_FIELDS)]);

  // roso, pfrs
  soilTypeRemoved = new FormControl<string | null>(null, [Validators.required]);
  volumeToRemove = new FormControl<number | null>(null, [Validators.min(MIN_SOIL_FIELDS)]);
  areaToRemove = new FormControl<number | null>(null, [Validators.required, Validators.min(MIN_SOIL_FIELDS)]);
  maximumDepthToRemove = new FormControl<number | null>(null, [Validators.required, Validators.min(MIN_SOIL_FIELDS)]);
  averageDepthToRemove = new FormControl<number | null>(null, [Validators.required, Validators.min(MIN_SOIL_FIELDS)]);

  // naru
  naruEndDate = new FormControl<Date | null>(null);

  //subd
  subdApprovedLots = new FormControl<ProposedDecisionLotDto[]>([], [Validators.required]);

  //incl/excl
  applicantType = new FormControl<string | null>(null, [Validators.required]);

  // general
  alrArea = new FormControl<number | null>(null, [Validators.required, Validators.min(MIN_SOIL_FIELDS)]);
  agCap = new FormControl<string | null>(null, [Validators.required]);
  agCapSource = new FormControl<string | null>(null, [Validators.required]);
  agCapMap = new FormControl<string | null>(null);
  agCapConsultant = new FormControl<string | null>(null);

  form: FormGroup = new FormGroup({
    alrArea: this.alrArea,
    agCap: this.agCap,
    agCapSource: this.agCapSource,
    agCapMap: this.agCapMap,
    agCapConsultant: this.agCapConsultant,
  });

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    if (this.data) {
      this.alrArea.setValue(this.data.alrArea ? this.data.alrArea : null);
      this.agCap.setValue(this.data.agCap ? this.data.agCap : null);
      this.agCapSource.setValue(this.data.agCapSource ? this.data.agCapSource : null);
      this.agCapMap.setValue(this.data.agCapMap ? this.data.agCapMap : null);
      this.agCapConsultant.setValue(this.data.agCapConsultant ? this.data.agCapConsultant : null);

      switch (this.data.applicationDecisionComponentTypeCode) {
        case APPLICATION_DECISION_COMPONENT_TYPE.NFUP:
          this.patchNfuFields();
          break;
        case APPLICATION_DECISION_COMPONENT_TYPE.TURP:
        case APPLICATION_DECISION_COMPONENT_TYPE.COVE:
          break;
        case APPLICATION_DECISION_COMPONENT_TYPE.POFO:
          this.patchPofoFields();
          break;
        case APPLICATION_DECISION_COMPONENT_TYPE.ROSO:
          this.patchRosoFields();
          break;
        case APPLICATION_DECISION_COMPONENT_TYPE.PFRS:
          this.patchPfrsFields();
          break;
        case APPLICATION_DECISION_COMPONENT_TYPE.NARU:
          this.patchNaruFields();
          break;
        case APPLICATION_DECISION_COMPONENT_TYPE.SUBD:
          this.patchSubdFields();
          break;
        case APPLICATION_DECISION_COMPONENT_TYPE.INCL:
        case APPLICATION_DECISION_COMPONENT_TYPE.EXCL:
          this.patchInclExclFields();
          break;
        default:
          this.toastService.showErrorToast('Wrong decision component type');
          break;
      }
    }

    this.onFormValueChanges();
  }

  markTouched() {
    this.subdInputComponent?.markAllAsTouched();
  }

  onRemove() {
    this.remove.emit();
  }

  private onFormValueChanges() {
    this.form.valueChanges.subscribe((changes) => {
      let dataChange = {
        alrArea: this.alrArea.value ? this.alrArea.value : null,
        agCap: this.agCap.value ? this.agCap.value : null,
        agCapSource: this.agCapSource.value ? this.agCapSource.value : null,
        agCapMap: this.agCapMap.value ? this.agCapMap.value : null,
        agCapConsultant: this.agCapConsultant.value ? this.agCapConsultant.value : null,
        applicationDecisionComponentTypeCode: this.data.applicationDecisionComponentTypeCode,
        applicationDecisionComponentType: this.codes.decisionComponentTypes.find(
          (e) => e.code === this.data.applicationDecisionComponentTypeCode,
        )!,
        applicationDecisionUuid: this.data.uuid,
        uuid: this.data.uuid,
      };

      dataChange = this.getComponentData(dataChange);

      this.dataChange.emit(dataChange);
    });
  }

  private getComponentData(dataChange: {
    alrArea: number | null;
    agCap: string | null;
    agCapSource: string | null;
    agCapMap: string | null;
    agCapConsultant: string | null;
    applicationDecisionComponentTypeCode: string;
    applicationDecisionComponentType: DecisionComponentTypeDto;
    applicationDecisionUuid: string | undefined;
    uuid: string | undefined;
  }) {
    switch (dataChange.applicationDecisionComponentTypeCode) {
      case APPLICATION_DECISION_COMPONENT_TYPE.NFUP:
        dataChange = { ...dataChange, ...this.getNfuDataChange() };
        break;
      case APPLICATION_DECISION_COMPONENT_TYPE.TURP:
      case APPLICATION_DECISION_COMPONENT_TYPE.COVE:
        break;
      case APPLICATION_DECISION_COMPONENT_TYPE.POFO:
        dataChange = { ...dataChange, ...this.getPofoDataChange() };
        break;
      case APPLICATION_DECISION_COMPONENT_TYPE.ROSO:
        dataChange = { ...dataChange, ...this.getRosoDataChange() };
        break;
      case APPLICATION_DECISION_COMPONENT_TYPE.PFRS:
        dataChange = { ...dataChange, ...this.getPfrsDataChange() };
        break;
      case APPLICATION_DECISION_COMPONENT_TYPE.NARU:
        break;
      case APPLICATION_DECISION_COMPONENT_TYPE.SUBD:
        dataChange = { ...dataChange, ...this.getSubdDataChange() };
        break;
      case APPLICATION_DECISION_COMPONENT_TYPE.INCL:
      case APPLICATION_DECISION_COMPONENT_TYPE.EXCL:
        dataChange = { ...dataChange, ...this.getInclExclDataChange() };
        break;
      default:
        this.toastService.showErrorToast('Wrong decision component type');
        break;
    }
    return dataChange;
  }

  private patchNfuFields() {
    this.form.addControl('nfuType', this.nfuType);
    this.form.addControl('nfuSubType', this.nfuSubType);

    this.nfuType.setValue(this.data.nfuType ? this.data.nfuType : null);
    this.nfuSubType.setValue(this.data.nfuSubType ? this.data.nfuSubType : null);
  }

  private patchPfrsFields() {
    this.patchPofoFields();
    this.patchRosoFields();
  }

  private patchPofoFields() {
    this.form.addControl('fillTypeToPlace', this.fillTypeToPlace);
    this.form.addControl('areaToPlace', this.areaToPlace);
    this.form.addControl('volumeToPlace', this.volumeToPlace);
    this.form.addControl('maximumDepthToPlace', this.maximumDepthToPlace);
    this.form.addControl('averageDepthToPlace', this.averageDepthToPlace);

    this.fillTypeToPlace.setValue(this.data.soilFillTypeToPlace ?? null);
    this.areaToPlace.setValue(this.data.soilToPlaceArea ?? null);
    this.volumeToPlace.setValue(this.data.soilToPlaceVolume ?? null);
    this.maximumDepthToPlace.setValue(this.data.soilToPlaceMaximumDepth ?? null);
    this.averageDepthToPlace.setValue(this.data.soilToPlaceAverageDepth ?? null);
  }

  private patchRosoFields() {
    this.form.addControl('soilTypeRemoved', this.soilTypeRemoved);
    this.form.addControl('areaToRemove', this.areaToRemove);
    this.form.addControl('volumeToRemove', this.volumeToRemove);
    this.form.addControl('maximumDepthToRemove', this.maximumDepthToRemove);
    this.form.addControl('averageDepthToRemove', this.averageDepthToRemove);

    this.soilTypeRemoved.setValue(this.data.soilTypeRemoved ?? null);
    this.areaToRemove.setValue(this.data.soilToRemoveArea ?? null);
    this.volumeToRemove.setValue(this.data.soilToRemoveVolume ?? null);
    this.maximumDepthToRemove.setValue(this.data.soilToRemoveMaximumDepth ?? null);
    this.averageDepthToRemove.setValue(this.data.soilToRemoveAverageDepth ?? null);
  }

  private patchNaruFields() {
    this.form.addControl('naruEndDate', this.naruEndDate);
  }

  private patchSubdFields() {
    this.form.addControl('subdApprovedLots', this.subdApprovedLots);

    const lots = this.data.lots?.sort((a, b) => a.index - b.index) ?? null;

    this.subdApprovedLots.setValue(lots);
  }

  private patchInclExclFields() {
    this.form.addControl('applicantType', this.applicantType);

    this.applicantType.setValue(this.data.inclExclApplicantType ?? null);
  }

  private getNfuDataChange(): NfuDecisionComponentDto {
    return {
      nfuType: this.nfuType.value ? this.nfuType.value : null,
      nfuSubType: this.nfuSubType.value ? this.nfuSubType.value : null,
    };
  }

  private getPofoDataChange(): PofoDecisionComponentDto {
    return {
      soilFillTypeToPlace: this.fillTypeToPlace.value ? this.fillTypeToPlace.value : null,
      soilToPlaceArea: this.areaToPlace.value ? this.areaToPlace.value : null,
      soilToPlaceVolume: this.volumeToPlace.value ? this.volumeToPlace.value : null,
      soilToPlaceMaximumDepth: this.maximumDepthToPlace.value ? this.maximumDepthToPlace.value : null,
      soilToPlaceAverageDepth: this.averageDepthToPlace.value ? this.averageDepthToPlace.value : null,
    };
  }

  private getRosoDataChange(): RosoDecisionComponentDto {
    return {
      soilTypeRemoved: this.soilTypeRemoved.value ? this.soilTypeRemoved.value : null,
      soilToRemoveArea: this.areaToRemove.value ? this.areaToRemove.value : null,
      soilToRemoveVolume: this.volumeToRemove.value ? this.volumeToRemove.value : null,
      soilToRemoveMaximumDepth: this.maximumDepthToRemove.value ? this.maximumDepthToRemove.value : null,
      soilToRemoveAverageDepth: this.averageDepthToRemove.value ? this.averageDepthToRemove.value : null,
    };
  }

  private getPfrsDataChange(): PfrsDecisionComponentDto {
    return {
      soilTypeRemoved: this.soilTypeRemoved.value ? this.soilTypeRemoved.value : null,
      soilToRemoveArea: this.areaToRemove.value ? this.areaToRemove.value : null,
      soilToRemoveVolume: this.volumeToRemove.value ? this.volumeToRemove.value : null,
      soilToRemoveMaximumDepth: this.maximumDepthToRemove.value ? this.maximumDepthToRemove.value : null,
      soilToRemoveAverageDepth: this.averageDepthToRemove.value ? this.averageDepthToRemove.value : null,
      soilFillTypeToPlace: this.fillTypeToPlace.value ? this.fillTypeToPlace.value : null,
      soilToPlaceArea: this.areaToPlace.value ? this.areaToPlace.value : null,
      soilToPlaceVolume: this.volumeToPlace.value ? this.volumeToPlace.value : null,
      soilToPlaceMaximumDepth: this.maximumDepthToPlace.value ? this.maximumDepthToPlace.value : null,
      soilToPlaceAverageDepth: this.averageDepthToPlace.value ? this.averageDepthToPlace.value : null,
    };
  }

  private getSubdDataChange(): SubdDecisionComponentDto {
    const update = this.subdApprovedLots.value?.map(
      (e) =>
        ({
          ...e,
          size: e.size ? e.size : null,
          alrArea: e.alrArea ? e.alrArea : null,
        }) as ProposedDecisionLotDto,
    );
    return {
      lots: update ?? undefined,
    };
  }

  private getInclExclDataChange() {
    return {
      inclExclApplicantType: this.applicantType.value ?? undefined,
    };
  }
}
