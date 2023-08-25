import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  NOI_DECISION_COMPONENT_TYPE,
  NoticeOfIntentDecisionCodesDto,
  NoticeOfIntentDecisionComponentDto,
  NoticeOfIntentDecisionComponentTypeDto,
  PofoDecisionComponentDto,
  RosoDecisionComponentDto,
} from '../../../../../../../services/notice-of-intent/decision/notice-of-intent-decision.dto';
import { ToastService } from '../../../../../../../services/toast/toast.service';
import { AG_CAP_OPTIONS, AG_CAP_SOURCE_OPTIONS } from '../../../../../../../shared/dto/ag-cap.types.dto';
import { formatDateForApi } from '../../../../../../../shared/utils/api-date-formatter';

@Component({
  selector: 'app-decision-component',
  templateUrl: './decision-component.component.html',
  styleUrls: ['./decision-component.component.scss'],
})
export class DecisionComponentComponent implements OnInit {
  @Input() data!: NoticeOfIntentDecisionComponentDto;
  @Input() codes!: NoticeOfIntentDecisionCodesDto;
  @Output() dataChange = new EventEmitter<NoticeOfIntentDecisionComponentDto>();
  @Output() remove = new EventEmitter<void>();

  COMPONENT_TYPE = NOI_DECISION_COMPONENT_TYPE;

  agCapOptions = AG_CAP_OPTIONS;
  agCapSourceOptions = AG_CAP_SOURCE_OPTIONS;

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

  // general
  endDate = new FormControl<Date | null>(null, [Validators.required]);
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

      switch (this.data.noticeOfIntentDecisionComponentTypeCode) {
        case NOI_DECISION_COMPONENT_TYPE.POFO:
          this.patchPofoFields();
          break;
        case NOI_DECISION_COMPONENT_TYPE.ROSO:
          this.patchRosoFields();
          break;
        case NOI_DECISION_COMPONENT_TYPE.PFRS:
          this.patchPofoFields();
          this.patchRosoFields();
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
        noticeOfIntentDecisionComponentTypeCode: this.data.noticeOfIntentDecisionComponentTypeCode,
        noticeOfIntentDecisionComponentType: this.codes.decisionComponentTypes.find(
          (e) => e.code === this.data.noticeOfIntentDecisionComponentTypeCode
        )!,
        noticeOfIntentDecisionUuid: this.data.uuid,
        uuid: this.data.uuid,
      };

      const componentData = this.getComponentData(dataChange);
      this.dataChange.emit(componentData);
    });
  }

  private getComponentData(dataChange: {
    alrArea: number | null;
    agCap: string | null;
    agCapSource: string | null;
    agCapMap: string | null;
    agCapConsultant: string | null;
    noticeOfIntentDecisionComponentTypeCode: string;
    noticeOfIntentDecisionComponentType: NoticeOfIntentDecisionComponentTypeDto;
    noticeOfIntentDecisionUuid: string | undefined;
    uuid: string | undefined;
  }): NoticeOfIntentDecisionComponentDto {
    switch (dataChange.noticeOfIntentDecisionComponentTypeCode) {
      case NOI_DECISION_COMPONENT_TYPE.POFO:
        dataChange = { ...dataChange, ...this.getPofoDataChange() };
        break;
      case NOI_DECISION_COMPONENT_TYPE.ROSO:
        dataChange = { ...dataChange, ...this.getRosoDataChange() };
        break;
      case NOI_DECISION_COMPONENT_TYPE.PFRS:
        dataChange = { ...dataChange, ...this.getPfrsDataChange() };
        break;
      default:
        this.toastService.showErrorToast('Wrong decision component type');
        break;
    }
    return dataChange;
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

  onRemove() {
    this.remove.emit();
  }
}
