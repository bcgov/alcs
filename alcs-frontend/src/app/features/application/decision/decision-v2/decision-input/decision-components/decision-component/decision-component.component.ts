import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProposedLot } from '../../../../../../../services/application/application.dto';
import {
  APPLICATION_DECISION_COMPONENT_TYPE,
  DecisionCodesDto,
  DecisionComponentDto,
  DecisionComponentTypeDto,
  NaruDecisionComponentDto,
  NfuDecisionComponentDto,
  PofoDecisionComponentDto,
  RosoDecisionComponentDto,
  SubdDecisionComponentDto,
  TurpDecisionComponentDto,
} from '../../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ToastService } from '../../../../../../../services/toast/toast.service';
import { formatDateForApi } from '../../../../../../../shared/utils/api-date-formatter';
import { AG_CAP_OPTIONS, AG_CAP_SOURCE_OPTIONS } from '../../../../../proposal/proposal.component';
import { SubdInputComponent } from './subd-input/subd-input.component';

@Component({
  selector: 'app-decision-component',
  templateUrl: './decision-component.component.html',
  styleUrls: ['./decision-component.component.scss'],
})
export class DecisionComponentComponent implements OnInit {
  @Input() data!: DecisionComponentDto;
  @Input() codes!: DecisionCodesDto;
  @Output() dataChange = new EventEmitter<DecisionComponentDto>();

  @ViewChild(SubdInputComponent) subdInputComponent?: SubdInputComponent;

  COMPONENT_TYPE = APPLICATION_DECISION_COMPONENT_TYPE;

  agCapOptions = AG_CAP_OPTIONS;
  agCapSourceOptions = AG_CAP_SOURCE_OPTIONS;

  // nfu
  nfuType = new FormControl<string | null>(null, [Validators.required]);
  nfuSubType = new FormControl<string | null>(null, [Validators.required]);
  endDate = new FormControl<Date | null>(null, [Validators.required]);

  // turp
  expiryDate = new FormControl<Date | null>(null);

  // pofo, pfrs
  fillTypeToPlace = new FormControl<string | null>(null, [Validators.required]);
  volumeToPlace = new FormControl<number | null>(null, [Validators.required]);
  areaToPlace = new FormControl<number | null>(null, [Validators.required]);
  maximumDepthToPlace = new FormControl<number | null>(null, [Validators.required]);
  averageDepthToPlace = new FormControl<number | null>(null, [Validators.required]);

  // roso, pfrs
  soilTypeRemoved = new FormControl<string | null>(null, [Validators.required]);
  volumeToRemove = new FormControl<number | null>(null, [Validators.required]);
  areaToRemove = new FormControl<number | null>(null, [Validators.required]);
  maximumDepthToRemove = new FormControl<number | null>(null, [Validators.required]);
  averageDepthToRemove = new FormControl<number | null>(null, [Validators.required]);

  // naru
  naruSubtypeCode = new FormControl<string | null>(null, [Validators.required]);
  naruEndDate = new FormControl<Date | null>(null);

  //subd
  subdApprovedLots = new FormControl<ProposedLot[]>([], [Validators.required]);

  //incl/excl
  applicantType = new FormControl<string | null>(null, [Validators.required]);

  // general
  alrArea = new FormControl<number | null>(null, [Validators.required]);
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
          this.patchTurpFields();
          break;
        case APPLICATION_DECISION_COMPONENT_TYPE.POFO:
          this.patchPofoFields();
          break;
        case APPLICATION_DECISION_COMPONENT_TYPE.ROSO:
          this.patchRosoFields();
          break;
        case APPLICATION_DECISION_COMPONENT_TYPE.PFRS:
          this.patchPofoFields();
          this.patchRosoFields();
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
          (e) => e.code === this.data.applicationDecisionComponentTypeCode
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
        dataChange = { ...dataChange, ...this.getTurpDataChange() };
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
        dataChange = { ...dataChange, ...this.getNaruDataChange() };
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
    this.form.addControl('endDate', this.endDate);

    this.nfuType.setValue(this.data.nfuType ? this.data.nfuType : null);
    this.nfuSubType.setValue(this.data.nfuSubType ? this.data.nfuSubType : null);
    this.endDate.setValue(this.data.endDate ? new Date(this.data.endDate) : null);
  }

  private patchTurpFields() {
    this.form.addControl('expiryDate', this.expiryDate);

    this.expiryDate.setValue(this.data.expiryDate ? new Date(this.data.expiryDate) : null);
  }

  private patchPofoFields() {
    this.form.addControl('endDate', this.endDate);
    this.form.addControl('fillTypeToPlace', this.fillTypeToPlace);
    this.form.addControl('areaToPlace', this.areaToPlace);
    this.form.addControl('volumeToPlace', this.volumeToPlace);
    this.form.addControl('maximumDepthToPlace', this.maximumDepthToPlace);
    this.form.addControl('averageDepthToPlace', this.averageDepthToPlace);

    this.endDate.setValue(this.data.endDate ? new Date(this.data.endDate) : null);
    this.fillTypeToPlace.setValue(this.data.soilFillTypeToPlace ?? null);
    this.areaToPlace.setValue(this.data.soilToPlaceArea ?? null);
    this.volumeToPlace.setValue(this.data.soilToPlaceVolume ?? null);
    this.maximumDepthToPlace.setValue(this.data.soilToPlaceMaximumDepth ?? null);
    this.averageDepthToPlace.setValue(this.data.soilToPlaceAverageDepth ?? null);
  }

  private patchRosoFields() {
    this.form.addControl('endDate', this.endDate);
    this.form.addControl('soilTypeRemoved', this.soilTypeRemoved);
    this.form.addControl('areaToRemove', this.areaToRemove);
    this.form.addControl('volumeToRemove', this.volumeToRemove);
    this.form.addControl('maximumDepthToRemove', this.maximumDepthToRemove);
    this.form.addControl('averageDepthToRemove', this.averageDepthToRemove);

    this.endDate.setValue(this.data.endDate ? new Date(this.data.endDate) : null);
    this.soilTypeRemoved.setValue(this.data.soilTypeRemoved ?? null);
    this.areaToRemove.setValue(this.data.soilToRemoveArea ?? null);
    this.volumeToRemove.setValue(this.data.soilToRemoveVolume ?? null);
    this.maximumDepthToRemove.setValue(this.data.soilToRemoveMaximumDepth ?? null);
    this.averageDepthToRemove.setValue(this.data.soilToRemoveAverageDepth ?? null);
  }

  private patchNaruFields() {
    this.form.addControl('naruSubtypeCode', this.naruSubtypeCode);
    this.form.addControl('naruEndDate', this.naruEndDate);
    this.form.addControl('expiryDate', this.expiryDate);

    this.naruEndDate.setValue(this.data.endDate ? new Date(this.data.endDate) : null);
    this.expiryDate.setValue(this.data.expiryDate ? new Date(this.data.expiryDate) : null);
    this.naruSubtypeCode.setValue(this.data.naruSubtypeCode ?? null);
  }

  private patchSubdFields() {
    this.form.addControl('subdApprovedLots', this.subdApprovedLots);
    this.subdApprovedLots.setValue(this.data.subdApprovedLots ?? null);
  }

  private patchInclExclFields() {
    this.form.addControl('applicantType', this.applicantType);
    this.form.addControl('expiryDate', this.expiryDate);

    this.applicantType.setValue(this.data.inclExclApplicantType ?? null);
    this.expiryDate.setValue(this.data.expiryDate ? new Date(this.data.expiryDate) : null);
  }

  private getNfuDataChange(): NfuDecisionComponentDto {
    return {
      nfuType: this.nfuType.value ? this.nfuType.value : null,
      nfuSubType: this.nfuSubType.value ? this.nfuSubType.value : null,
      endDate: this.endDate.value ? formatDateForApi(this.endDate.value) : null,
    };
  }

  private getTurpDataChange(): TurpDecisionComponentDto {
    return {
      expiryDate: this.expiryDate.value ? formatDateForApi(this.expiryDate.value) : null,
    };
  }

  private getPofoDataChange(): PofoDecisionComponentDto {
    return {
      endDate: this.endDate.value ? formatDateForApi(this.endDate.value) : null,
      soilFillTypeToPlace: this.fillTypeToPlace.value ?? null,
      soilToPlaceArea: this.areaToPlace.value ?? null,
      soilToPlaceVolume: this.volumeToPlace.value ?? null,
      soilToPlaceMaximumDepth: this.maximumDepthToPlace.value ?? null,
      soilToPlaceAverageDepth: this.averageDepthToPlace.value ?? null,
    };
  }

  private getRosoDataChange(): RosoDecisionComponentDto {
    return {
      endDate: this.endDate.value ? formatDateForApi(this.endDate.value) : null,
      soilTypeRemoved: this.soilTypeRemoved.value ?? null,
      soilToRemoveArea: this.areaToRemove.value ?? null,
      soilToRemoveVolume: this.volumeToRemove.value ?? null,
      soilToRemoveMaximumDepth: this.maximumDepthToRemove.value ?? null,
      soilToRemoveAverageDepth: this.averageDepthToRemove.value ?? null,
    };
  }

  private getPfrsDataChange(): RosoDecisionComponentDto & PofoDecisionComponentDto {
    return {
      endDate: this.endDate.value ? formatDateForApi(this.endDate.value) : null,
      soilTypeRemoved: this.soilTypeRemoved.value ?? null,
      soilToRemoveArea: this.areaToRemove.value ?? null,
      soilToRemoveVolume: this.volumeToRemove.value ?? null,
      soilToRemoveMaximumDepth: this.maximumDepthToRemove.value ?? null,
      soilToRemoveAverageDepth: this.averageDepthToRemove.value ?? null,
      soilFillTypeToPlace: this.fillTypeToPlace.value ?? null,
      soilToPlaceArea: this.areaToPlace.value ?? null,
      soilToPlaceVolume: this.volumeToPlace.value ?? null,
      soilToPlaceMaximumDepth: this.maximumDepthToPlace.value ?? null,
      soilToPlaceAverageDepth: this.averageDepthToPlace.value ?? null,
    };
  }

  private getNaruDataChange(): NaruDecisionComponentDto {
    return {
      endDate: this.naruEndDate.value ? formatDateForApi(this.naruEndDate.value) : null,
      expiryDate: this.expiryDate.value ? formatDateForApi(this.expiryDate.value) : null,
      naruSubtypeCode: this.naruSubtypeCode.value ?? null,
    };
  }

  private getSubdDataChange(): SubdDecisionComponentDto {
    return {
      subdApprovedLots: this.subdApprovedLots.value ?? undefined,
    };
  }

  markTouched() {
    this.subdInputComponent?.markAllAsTouched();
  }

  private getInclExclDataChange() {
    return {
      inclExclApplicantType: this.applicantType.value ?? undefined,
      expiryDate: this.expiryDate.value ? formatDateForApi(this.expiryDate.value) : null,
    };
  }
}
