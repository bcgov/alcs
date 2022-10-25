import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationReconsiderationDto } from '../../../services/application/application-reconsideration/application-reconsideration.dto';
import { ApplicationReconsiderationService } from '../../../services/application/application-reconsideration/application-reconsideration.service';
import { ApplicationDto } from '../../../services/application/application.dto';
import { RECON_TYPE_LABEL } from '../../board/dialogs/reconsiderations/reconsideration-dialog.component';

@Component({
  selector: 'app-application-header',
  templateUrl: './application-header.component.html',
  styleUrls: ['./application-header.component.scss'],
})
export class ApplicationHeaderComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();
  application: ApplicationDto | undefined;
  reconsiderations: ApplicationReconsiderationDto[] = [];
  reconLabel = RECON_TYPE_LABEL;

  constructor(
    private applicationDetailService: ApplicationDetailService,
    private reconsiderationService: ApplicationReconsiderationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.applicationDetailService.$application.pipe(takeUntil(this.destroy)).subscribe((application) => {
      if (application) {
        this.application = application;
      }
    });

    this.reconsiderationService.$reconsiderations.pipe(takeUntil(this.destroy)).subscribe((recons) => {
      this.reconsiderations = [...recons].reverse(); //Reverse since we go low to high versus normally high to low
    });
  }

  async onGoToCard() {
    const boardCode = this.application?.card.board.code;
    const fileNumber = this.application?.card.uuid;
    const cardTypeCode = this.application?.card.type;
    await this.router.navigateByUrl(`/board/${boardCode}?card=${fileNumber}&type=${cardTypeCode}`);
  }

  async onGoToReconCard(recon: ApplicationReconsiderationDto) {
    const boardCode = recon.card.board.code;
    const cardTypeCode = recon.card.type;
    await this.router.navigateByUrl(`/board/${boardCode}?card=${recon.card.uuid}&type=${cardTypeCode}`);
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
