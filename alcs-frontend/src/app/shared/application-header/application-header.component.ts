import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ApplicationModificationDto } from '../../services/application/application-modification/application-modification.dto';
import { ApplicationReconsiderationDto } from '../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationDto } from '../../services/application/application.dto';
import { CommissionerApplicationDto } from '../../services/commissioner/commissioner.dto';
import { MODIFICATION_TYPE_LABEL, RECON_TYPE_LABEL } from '../application-type-pill/application-type-pill.constants';

@Component({
  selector: 'app-application-header[application]',
  templateUrl: './application-header.component.html',
  styleUrls: ['./application-header.component.scss'],
})
export class ApplicationHeaderComponent {
  destroy = new Subject<void>();

  _application: ApplicationDto | CommissionerApplicationDto | undefined;
  @Input() set application(application: ApplicationDto | CommissionerApplicationDto | undefined) {
    if (application) {
      this._application = application;
      if ('card' in application && application.card) {
        this.showCardMenu = true;
      }
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
  }

  _modifications: ApplicationModificationDto[] = [];
  @Input() set modifications(modifications: ApplicationModificationDto[]) {
    this.showModificationLabel = modifications.reduce((showLabel, modification) => {
      return modification.reviewOutcome === null || modification.reviewOutcome.code !== 'REF';
    }, false);
    this._modifications = modifications;
  }

  reconLabel = RECON_TYPE_LABEL;
  modificationLabel = MODIFICATION_TYPE_LABEL;
  showCardMenu = false;
  showModificationLabel = false;
  showReconLabel = false;

  constructor(private router: Router) {}

  async onGoToCard() {
    if (this._application && 'card' in this._application && this._application.card) {
      const boardCode = this._application.card.board.code;
      const cardUuid = this._application.card.uuid;
      const cardTypeCode = this._application.card.type;
      await this.router.navigateByUrl(`/board/${boardCode}?card=${cardUuid}&type=${cardTypeCode}`);
    }
  }

  async onGoToSubCard(subcard: ApplicationReconsiderationDto | ApplicationModificationDto) {
    const boardCode = subcard.card.board.code;
    const cardTypeCode = subcard.card.type;
    await this.router.navigateByUrl(`/board/${boardCode}?card=${subcard.card.uuid}&type=${cardTypeCode}`);
  }
}
