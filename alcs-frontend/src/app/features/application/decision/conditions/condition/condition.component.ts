import { AfterViewInit, Component, Input } from '@angular/core';
import {
  ApplicationDecisionConditionDto,
  UpdateApplicationDecisionConditionDto,
  ApplicationDecisionDto
} from '../../../../../services/application/decision/application-decision-v2/application-decision-v2.dto';
import { ToastService } from '../../../../../services/toast/toast.service';
import {
  DECISION_CONDITION_COMPLETE_LABEL,
  DECISION_CONDITION_INCOMPLETE_LABEL,
  DECISION_CONDITION_SUPERSEDED_LABEL,
} from '../../../../../shared/application-type-pill/application-type-pill.constants';

@Component({
  selector: 'app-condition',
  templateUrl: './condition.component.html',
  styleUrls: ['./condition.component.scss'],
})
export class ConditionComponent implements AfterViewInit {
  @Input() condition!: ApplicationDecisionConditionDto;
  @Input() decision!: ApplicationDecisionDto;

  incompleteLabel = DECISION_CONDITION_INCOMPLETE_LABEL;
  completeLabel = DECISION_CONDITION_COMPLETE_LABEL;
  supersededLabel = DECISION_CONDITION_SUPERSEDED_LABEL;

  isReadMoreClicked = false;
  isReadMoreVisible = false;

  constructor(private toastService: ToastService) {}

  ngAfterViewInit(): void {
    setTimeout(() => (this.isReadMoreVisible = this.checkIfReadMoreVisible()));
  }

  async onUpdateCondition(
    field: keyof UpdateApplicationDecisionConditionDto,
    value: string[] | string | number | null
  ) {
    const condition = this.condition;
    if (condition) {
      let update = true;
      console.log('onUpdateCondition', { [field]: value });
      // const update = await this.applicationDetailService.updateApplication(application.fileNumber, {
      //   [field]: value,
      // });
      if (update) {
        this.toastService.showSuccessToast('Condition updated');
      }
    }
  }

  onToggleReadMore() {
    this.isReadMoreClicked = !this.isReadMoreClicked;
  }

  isEllipsisActive(e: string): boolean {
    const el = document.getElementById(e);
    // + 2 required as adjustment to height
    return el ? el.clientHeight + 2 < el.scrollHeight : false;
  }

  checkIfReadMoreVisible(): boolean {
    return this.isReadMoreClicked || this.isEllipsisActive(this.condition.uuid + 'Description');
  }
}
