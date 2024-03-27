import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CardDto } from '../../../services/card/card.dto';
import { CommissionerPlanningReviewDto } from '../../../services/commissioner/commissioner.dto';
import { InquiryDto } from '../../../services/inquiry/inquiry.dto';
import { PlanningReviewDetailedDto } from '../../../services/planning-review/planning-review.dto';
import { CLOSED_PR_LABEL, OPEN_PR_LABEL } from '../../../shared/application-type-pill/application-type-pill.constants';

@Component({
  selector: 'app-inquiry-header[inquiry]',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnChanges {
  destroy = new Subject<void>();

  @Input() inquiry!: InquiryDto;

  linkedCards: (CardDto & { displayName: string })[] = [];
  statusPill = OPEN_PR_LABEL;

  constructor(private router: Router) {}

  async onGoToCard(card: CardDto) {
    const boardCode = card.boardCode;
    const cardUuid = card.uuid;
    const cardTypeCode = card.type;
    await this.router.navigateByUrl(`/board/${boardCode}?card=${cardUuid}&type=${cardTypeCode}`);
  }

  async setupLinkedCards() {
    if (this.inquiry.card) {
      this.linkedCards.push({
        ...this.inquiry.card,
        displayName: `Inquiry`,
      });
    }
  }

  ngOnChanges(): void {
    this.setupLinkedCards();
    this.statusPill = this.inquiry.open ? OPEN_PR_LABEL : CLOSED_PR_LABEL;
  }
}
