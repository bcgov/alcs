import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CardDto } from '../../../services/card/card.dto';
import { PlanningReviewDetailedDto, PlanningReviewDto } from '../../../services/planning-review/planning-review.dto';
import { CLOSED_PR_LABEL, OPEN_PR_LABEL } from '../../../shared/application-type-pill/application-type-pill.constants';

@Component({
  selector: 'app-header[planningReview]',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  destroy = new Subject<void>();

  @Input() planningReview!: PlanningReviewDetailedDto;

  legacyId?: string;
  applicant?: string;
  linkedCards: (CardDto & { displayName: string })[] = [];
  statusPill = OPEN_PR_LABEL;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.setupLinkedCards();
    if (!this.planningReview.open) {
      this.statusPill = CLOSED_PR_LABEL;
    }
  }

  async onGoToCard(card: CardDto) {
    const boardCode = card.boardCode;
    const cardUuid = card.uuid;
    const cardTypeCode = card.type;
    await this.router.navigateByUrl(`/board/${boardCode}?card=${cardUuid}&type=${cardTypeCode}`);
  }

  async setupLinkedCards() {
    for (const [index, referral] of this.planningReview.referrals.entries()) {
      this.linkedCards.push({
        ...referral.card,
        displayName: `Referral ${index}`,
      });
    }
  }
}
