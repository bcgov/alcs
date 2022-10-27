import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../services/application/application-detail.service';
import { ApplicationReconsiderationDto } from '../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDto } from '../../services/application/application.dto';
import { RECON_TYPE_LABEL } from '../../features/board/dialogs/reconsiderations/reconsideration-dialog.component';
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
    if (application && 'card' in application) {
      this.showCardMenu = true;
      this._application = application;
    }
  }
  @Input() reconsiderations: ApplicationReconsiderationDto[] = [];
  reconLabel = RECON_TYPE_LABEL;
  showCardMenu = false;

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
