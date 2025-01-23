import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApplicationDecisionMeetingDto } from '../../services/application/application.dto';
import { AssigneeDto } from '../../services/user/user.dto';
import { ApplicationPill } from '../application-type-pill/application-type-pill.component';
import {
  DECISION_CONDITION_EXPIRED_LABEL,
  DECISION_CONDITION_PASTDUE_LABEL,
} from '../application-type-pill/application-type-pill.constants';

export interface CardData {
  id: string;
  typeLabel: string;
  title: string;
  titleTooltip: string;
  cssClasses?: string[];
  labels: ApplicationPill[];
  status: string;
  assignee?: AssigneeDto;
  activeDays?: number;
  pausedDays?: number;
  paused: boolean;
  highPriority: boolean;
  decisionMeetings?: ApplicationDecisionMeetingDto[];
  latestDecisionDate?: Date;
  cardUuid: string;
  cardType: CardType;
  dateReceived: number;
  verticalOutBound?: boolean;
  dueDate?: Date;
  maxActiveDays?: number;
  legacyId?: string;
  showDueDate?: boolean;
  decisionIsFlagged?: boolean;
}

export interface ConditionCardData extends CardData {
  isExpired: boolean;
  isPastDue: boolean;
}

export interface CardSelectedEvent {
  uuid: string;
  cardType: CardType;
}

export enum CardType {
  APP = 'APP',
  RECON = 'RECON',
  PLAN = 'PLAN',
  MODI = 'MODI',
  NOI = 'NOI',
  NOI_MODI = 'NOIM',
  NOTIFICATION = 'NOTI',
  INQUIRY = 'INQR',
  APP_CON = 'APPCON',
}

const lineHeight = 24;

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  CardType = CardType;

  @Input() cardData!: CardData | ConditionCardData;
  @Output() cardSelected = new EventEmitter<CardSelectedEvent>();

  isConditionCard = false;
  isExpired = false;
  isPastDue = false;

  constructor() {}

  onClick(uuid: string, cardType: CardType) {
    this.cardSelected.emit({ uuid, cardType });
  }

  private getLatestDecisionDate() {
    const meetings = this.cardData.decisionMeetings ?? [];
    return new Date(
      Math.max(
        ...meetings.map((element) => {
          return new Date(element.date).valueOf();
        }),
      ),
    );
  }

  ngOnInit(): void {
    this.cardData.latestDecisionDate = undefined;

    if (this.cardData.status === 'READ') {
      if (this.cardData.decisionMeetings && this.cardData.decisionMeetings.length > 0) {
        this.cardData.latestDecisionDate = this.getLatestDecisionDate();
      }
    }

    this.isConditionCard = this.cardData.cardType === CardType.APP_CON;
    this.isExpired = this.isConditionCard ? (this.cardData as ConditionCardData).isExpired : false;
    this.isPastDue = this.isConditionCard ? (this.cardData as ConditionCardData).isPastDue : false;
  }

  onMouseHover(e: any) {
    const el = document.getElementById(e);

    if (el) {
      this.cardData.verticalOutBound = el.offsetHeight - lineHeight > 0;
    }

    return;
  }

  getStatusPill(status: string) {
    if (status === 'PASTDUE') {
      return DECISION_CONDITION_PASTDUE_LABEL;
    } else {
      return DECISION_CONDITION_EXPIRED_LABEL;
    }
  }
}
