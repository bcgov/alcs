import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  APPLICATION_DECISION_COMPONENT_TYPE,
  DecisionComponentDto,
  NfuDecisionComponentDto,
  PofoDecisionComponentDto,
  RosoDecisionComponentDto,
  TurpDecisionComponentDto,
} from '../../../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ToastService } from '../../../../../../../services/toast/toast.service';
import { formatDateForApi } from '../../../../../../../shared/utils/api-date-formatter';
import { AG_CAP_OPTIONS, AG_CAP_SOURCE_OPTIONS } from '../../../../../proposal/proposal.component';

@Component({
  selector: 'app-decision-component',
  templateUrl: './decision-component.component.html',
  styleUrls: ['./decision-component.component.scss'],
})
export class DecisionComponentComponent implements OnInit {
  @Input() data!: DecisionComponentDto;
  @Output() dataChange = new EventEmitter<DecisionComponentDto>();

  COMPONENT_TYPE = APPLICATION_DECISION_COMPONENT_TYPE;

  agCapOptions = AG_CAP_OPTIONS;
  agCapSourceOptions = AG_CAP_SOURCE_OPTIONS;

  // nfu
  nfuType = new FormControl<string | null>(null, [Validators.required]);
  nfuSubType = new FormControl<string | null>(null, [Validators.required]);
  endDate = new FormControl<Date | null>(null);

  // turp
  expiryDate = new FormControl<Date | null>(null);

  //soil
  volume = new FormControl<number | null>(null);
  area = new FormControl<number | null>(null);
  maximumDepth = new FormControl<number | null>(null);
  averageDepth = new FormControl<number | null>(null);

  // pofo
  fillTypeToPlace = new FormControl<string | null>(null);

  // roso
  soilTypeRemoved = new FormControl<string | null>(null);

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

      this.patchNfuFields();
      this.patchTurpFields();
      this.patchPofoFields();
      this.patchRosoFields();
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
      default:
        this.toastService.showErrorToast('Wrong decision component type');
    }
    return dataChange;
  }

  private patchNfuFields() {
    if (this.data.applicationDecisionComponentTypeCode === APPLICATION_DECISION_COMPONENT_TYPE.NFUP) {
      this.form.addControl('nfuType', this.nfuType);
      this.form.addControl('nfuSubType', this.nfuSubType);
      this.form.addControl('endDate', this.endDate);

      this.nfuType.setValue(this.data.nfuType ? this.data.nfuType : null);
      this.nfuSubType.setValue(this.data.nfuSubType ? this.data.nfuSubType : null);
      this.endDate.setValue(this.data.endDate ? new Date(this.data.endDate) : null);
    }
  }

  private patchTurpFields() {
    if (this.data.applicationDecisionComponentTypeCode === APPLICATION_DECISION_COMPONENT_TYPE.TURP) {
      this.form.addControl('expiryDate', this.expiryDate);

      this.expiryDate.setValue(this.data.expiryDate ? new Date(this.data.expiryDate) : null);
    }
  }

  private patchPofoFields() {
    if (this.data.applicationDecisionComponentTypeCode === APPLICATION_DECISION_COMPONENT_TYPE.POFO) {
      this.form.addControl('endDate', this.endDate);
      this.form.addControl('fillTypeToPlace', this.fillTypeToPlace);
      this.form.addControl('area', this.area);
      this.form.addControl('volume', this.volume);
      this.form.addControl('maximumDepth', this.maximumDepth);
      this.form.addControl('averageDepth', this.averageDepth);

      this.endDate.setValue(this.data.endDate ? new Date(this.data.endDate) : null);
      this.fillTypeToPlace.setValue(this.data.soilFillTypeToPlace ?? null);
      this.area.setValue(this.data.soilToPlaceArea ?? null);
      this.volume.setValue(this.data.soilToPlaceVolume ?? null);
      this.maximumDepth.setValue(this.data.soilToPlaceMaximumDepth ?? null);
      this.averageDepth.setValue(this.data.soilToPlaceAverageDepth ?? null);
    }
  }

  private patchRosoFields() {
    if (this.data.applicationDecisionComponentTypeCode === APPLICATION_DECISION_COMPONENT_TYPE.ROSO) {
      this.form.addControl('endDate', this.endDate);
      this.form.addControl('soilTypeRemoved', this.soilTypeRemoved);
      this.form.addControl('area', this.area);
      this.form.addControl('volume', this.volume);
      this.form.addControl('maximumDepth', this.maximumDepth);
      this.form.addControl('averageDepth', this.averageDepth);

      this.endDate.setValue(this.data.endDate ? new Date(this.data.endDate) : null);
      this.soilTypeRemoved.setValue(this.data.soilTypeRemoved ?? null);
      this.area.setValue(this.data.soilToRemoveArea ?? null);
      this.volume.setValue(this.data.soilToRemoveVolume ?? null);
      this.maximumDepth.setValue(this.data.soilToRemoveMaximumDepth ?? null);
      this.averageDepth.setValue(this.data.soilToRemoveAverageDepth ?? null);
    }
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
      soilToPlaceArea: this.area.value ?? null,
      soilToPlaceVolume: this.volume.value ?? null,
      soilToPlaceMaximumDepth: this.maximumDepth.value ?? null,
      soilToPlaceAverageDepth: this.averageDepth.value ?? null,
    };
  }

  private getRosoDataChange(): RosoDecisionComponentDto {
    return {
      endDate: this.endDate.value ? formatDateForApi(this.endDate.value) : null,
      soilTypeRemoved: this.soilTypeRemoved.value ?? null,
      soilToRemoveVolume: this.area.value ?? null,
      soilToRemoveArea: this.volume.value ?? null,
      soilToRemoveMaximumDepth: this.maximumDepth.value ?? null,
      soilToRemoveAverageDepth: this.averageDepth.value ?? null,
    };
  }
}
