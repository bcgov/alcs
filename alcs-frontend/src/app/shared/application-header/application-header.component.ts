import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AMENDMENT_TYPE_LABEL } from '../../features/board/dialogs/amendment/amendment-dialog.component';
import { RECON_TYPE_LABEL } from '../../features/board/dialogs/reconsiderations/reconsideration-dialog.component';
import { ApplicationAmendmentDto } from '../../services/application/application-amendment/application-amendment.dto';
import { ApplicationReconsiderationDto } from '../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationDto } from '../../services/application/application.dto';
import { CommissionerApplicationDto } from '../../services/commissioner/commissioner.dto';

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
      if ('card' in application) {
        this.showCardMenu = true;
      }
      if ('hasRecons' in application) {
        this.showReconLabel = application.hasRecons;
      }
      if ('hasAmendments' in application) {
        this.showAmendmentLabel = application.hasAmendments;
      }
    }
  }

  _reconsiderations: ApplicationReconsiderationDto[] = [];
  @Input() set reconsiderations(reconsiderations: ApplicationReconsiderationDto[]) {
    this.showReconLabel = reconsiderations.length > 0;
    this._reconsiderations = reconsiderations;
  }

  _amendments: ApplicationAmendmentDto[] = [];
  @Input() set amendments(amendments: ApplicationAmendmentDto[]) {
    this.showAmendmentLabel = amendments.reduce((showLabel, amendment) => {
      return amendment.isReviewApproved === null;
    }, false);
    this._amendments = amendments;
  }

  reconLabel = RECON_TYPE_LABEL;
  amendmentLabel = AMENDMENT_TYPE_LABEL;
  showCardMenu = false;
  showAmendmentLabel = false;
  showReconLabel = false;

  constructor(private router: Router) {}

  async onGoToCard() {
    if (this._application && 'card' in this._application) {
      const boardCode = this._application.card.board.code;
      const cardUuid = this._application.card.uuid;
      const cardTypeCode = this._application.card.type;
      await this.router.navigateByUrl(`/board/${boardCode}?card=${cardUuid}&type=${cardTypeCode}`);
    }
  }

  async onGoToReconCard(recon: ApplicationReconsiderationDto) {
    const boardCode = recon.card.board.code;
    const cardTypeCode = recon.card.type;
    await this.router.navigateByUrl(`/board/${boardCode}?card=${recon.card.uuid}&type=${cardTypeCode}`);
  }
}
