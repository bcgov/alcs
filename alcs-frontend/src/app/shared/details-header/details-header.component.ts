import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ApplicationTypeDto } from '../../services/application/application-code.dto';
import { ApplicationModificationDto } from '../../services/application/application-modification/application-modification.dto';
import { ApplicationReconsiderationDto } from '../../services/application/application-reconsideration/application-reconsideration.dto';
import { DEFAULT_NO_STATUS } from '../../services/application/application-submission-status/application-submission-status.dto';
import { ApplicationSubmissionStatusService } from '../../services/application/application-submission-status/application-submission-status.service';
import { ApplicationDto } from '../../services/application/application.dto';
import { CardDto } from '../../services/card/card.dto';
import { CommissionerApplicationDto } from '../../services/commissioner/commissioner.dto';
import { NoticeOfIntentModificationDto } from '../../services/notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentDto } from '../../services/notice-of-intent/notice-of-intent.dto';
import { ApplicationSubmissionStatusPill } from '../application-submission-status-type-pill/application-submission-status-type-pill.component';
import {
  MODIFICATION_TYPE_LABEL,
  RECON_TYPE_LABEL,
  RETROACTIVE_TYPE_LABEL,
} from '../application-type-pill/application-type-pill.constants';

@Component({
  selector: 'app-details-header[application]',
  templateUrl: './details-header.component.html',
  styleUrls: ['./details-header.component.scss'],
})
export class DetailsHeaderComponent {
  destroy = new Subject<void>();

  @Input() heading = 'Title Here';
  @Input() types: ApplicationTypeDto[] = [];
  @Input() days = 'Calendar Days';
  @Input() showStatus = false;

  _application: ApplicationDto | CommissionerApplicationDto | NoticeOfIntentDto | undefined;

  @Input() set application(application: ApplicationDto | CommissionerApplicationDto | NoticeOfIntentDto | undefined) {
    if (application) {
      this._application = application;

      if ('retroactive' in application) {
        this.isNOI = true;
      }

      if ('type' in application) {
        this.types = [application.type];
      }
      this.setupLinkedCards();
      if ('hasRecons' in application) {
        this.showReconLabel = application.hasRecons;
      }
      if ('hasModifications' in application) {
        this.showModificationLabel = application.hasModifications;
      }
      if ('retroactive' in application) {
        this.showRetroLabel = !!application.retroactive;
      }

      if (this.showStatus) {
        this.submissionStatusService
          .fetchCurrentStatusByFileNumber(application.fileNumber, false)
          .then(
            (status) =>
              (this.currentStatus = {
                label: status.status.label,
                backgroundColor: status.status.alcsBackgroundColor,
                textColor: status.status.alcsColor,
              })
          )
          .catch((e) => {
            console.warn(`No statuses for ${application.fileNumber}. Is it a manually created submission?`);
            this.currentStatus = DEFAULT_NO_STATUS;
          });
      }
    }
  }

  _reconsiderations: ApplicationReconsiderationDto[] = [];
  @Input() set reconsiderations(reconsiderations: ApplicationReconsiderationDto[]) {
    this.showReconLabel = reconsiderations.length > 0;
    this._reconsiderations = reconsiderations;
    this.setupLinkedCards();
  }

  _modifications: (ApplicationModificationDto | NoticeOfIntentModificationDto)[] = [];
  @Input() set modifications(modifications: (ApplicationModificationDto | NoticeOfIntentModificationDto)[]) {
    this.showModificationLabel = modifications.reduce((showLabel, modification) => {
      return modification.reviewOutcome === null || modification.reviewOutcome.code !== 'REF';
    }, false);
    this._modifications = modifications;
    this.setupLinkedCards();
  }

  reconLabel = RECON_TYPE_LABEL;
  modificationLabel = MODIFICATION_TYPE_LABEL;
  retroactiveLabel = RETROACTIVE_TYPE_LABEL;
  showModificationLabel = false;
  showReconLabel = false;
  showRetroLabel = false;
  linkedCards: (CardDto & { displayName: string })[] = [];
  isNOI = false;
  currentStatus?: ApplicationSubmissionStatusPill;

  constructor(private router: Router, private submissionStatusService: ApplicationSubmissionStatusService) {}

  async onGoToCard(card: CardDto) {
    const boardCode = card.boardCode;
    const cardUuid = card.uuid;
    const cardTypeCode = card.type;
    await this.router.navigateByUrl(`/board/${boardCode}?card=${cardUuid}&type=${cardTypeCode}`);
  }

  async setupLinkedCards() {
    const application = this._application;
    const result = [];
    if (application && 'card' in application && application.card) {
      result.push({
        ...application.card,
        displayName: 'Standard Card',
      });
    }
    const mappedModificationCards = this._modifications
      .filter((modification) => !!modification.card)
      .map((modification, index) => ({
        ...modification.card,
        displayName: `Modification #${index + 1}`,
      }));
    result.push(...mappedModificationCards);

    const mappedReconCards = this._reconsiderations
      .filter((recon) => !!recon.card)
      .map((recon, index) => ({
        ...recon.card,
        displayName: `Reconsideration #${index + 1}`,
      }));
    result.push(...mappedReconCards);

    this.linkedCards = result;
  }
}
