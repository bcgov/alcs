import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ApplicationModificationDto } from '../../services/application/application-modification/application-modification.dto';
import { ApplicationReconsiderationDto } from '../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationDto } from '../../services/application/application.dto';
import { CardDto } from '../../services/card/card.dto';
import { CommissionerApplicationDto } from '../../services/commissioner/commissioner.dto';
import { MODIFICATION_TYPE_LABEL, RECON_TYPE_LABEL } from '../application-type-pill/application-type-pill.constants';

@Component({
  selector: 'app-application-header[application]',
  templateUrl: './application-header.component.html',
  styleUrls: ['./application-header.component.scss'],
})
export class ApplicationHeaderComponent {
  destroy = new Subject<void>();

  linkedCards: (CardDto & { displayName: string })[] = [];

  _application: ApplicationDto | CommissionerApplicationDto | undefined;
  @Input() set application(application: ApplicationDto | CommissionerApplicationDto | undefined) {
    if (application) {
      this._application = application;
      this.setupLinkedCards();
      if ('hasRecons' in application) {
        this.showReconLabel = application.hasRecons;
      }
      if ('hasModifications' in application) {
        this.showModificationLabel = application.hasModifications;
      }
    }
  }

  _reconsiderations: ApplicationReconsiderationDto[] = [];
  @Input() set reconsiderations(reconsiderations: ApplicationReconsiderationDto[]) {
    this.showReconLabel = reconsiderations.length > 0;
    this._reconsiderations = reconsiderations;
    this.setupLinkedCards();
  }

  _modifications: ApplicationModificationDto[] = [];
  @Input() set modifications(modifications: ApplicationModificationDto[]) {
    this.showModificationLabel = modifications.reduce((showLabel, modification) => {
      return modification.reviewOutcome === null || modification.reviewOutcome.code !== 'REF';
    }, false);
    this._modifications = modifications;
    this.setupLinkedCards();
  }

  reconLabel = RECON_TYPE_LABEL;
  modificationLabel = MODIFICATION_TYPE_LABEL;
  showModificationLabel = false;
  showReconLabel = false;

  constructor(private router: Router) {}

  async onGoToCard(card: CardDto) {
    const boardCode = card.board.code;
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
        displayName: 'Standard Application',
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
