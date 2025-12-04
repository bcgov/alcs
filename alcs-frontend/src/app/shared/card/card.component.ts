import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApplicationDecisionMeetingDto } from '../../services/application/application.dto';
import { AssigneeDto } from '../../services/user/user.dto';
import { ApplicationPill } from '../application-type-pill/application-type-pill.component';
import {
  CONDITION_LABEL,
  DECISION_CONDITION_EXPIRED_LABEL,
  DECISION_CONDITION_PASTDUE_LABEL,
  MODIFICATION_TYPE_LABEL,
  RECON_TYPE_LABEL,
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
  isInConditionBoard: boolean;
  isModification: boolean;
  isReconsideration: boolean;
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
  NOI_CON = 'NOICON',
}

const lineHeight = 24;

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
    standalone: false
})
export class CardComponent implements OnInit {
  CardType = CardType;

  @Input() cardData!: CardData | ConditionCardData;
  @Output() cardSelected = new EventEmitter<CardSelectedEvent>();

  // Condition Card
  isConditionCard = false;
  isInConditionBoard = true;
  isExpired = false;
  isPastDue = false;
  isModification = false;
  isReconsideration = false;

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

    this.isConditionCard = this.cardData.cardType === CardType.APP_CON || this.cardData.cardType === CardType.NOI_CON;
    this.isInConditionBoard = this.isConditionCard ? (this.cardData as ConditionCardData).isInConditionBoard : true;
    this.isExpired = this.isConditionCard ? (this.cardData as ConditionCardData).isExpired : false;
    this.isPastDue = this.isConditionCard ? (this.cardData as ConditionCardData).isPastDue : false;
    this.isModification = this.isConditionCard ? (this.cardData as ConditionCardData).isModification : false;
    this.isReconsideration = this.isConditionCard ? (this.cardData as ConditionCardData).isReconsideration : false;

    if (
      this.cardData.status === 'READ' &&
      (!this.isConditionCard || (this.isConditionCard && !this.isInConditionBoard))
    ) {
      if (this.cardData.decisionMeetings && this.cardData.decisionMeetings.length > 0) {
        this.cardData.latestDecisionDate = this.getLatestDecisionDate();
      }
    }
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
    } else if (status === 'EXPIRED') {
      return DECISION_CONDITION_EXPIRED_LABEL;
    } else if (status === 'MODIFICATION') {
      return MODIFICATION_TYPE_LABEL;
    } else if (status === 'RECONSIDERATION') {
      return RECON_TYPE_LABEL;
    } else {
      return CONDITION_LABEL;
    }
  }
}
