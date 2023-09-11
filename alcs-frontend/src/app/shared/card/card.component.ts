import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApplicationDecisionMeetingDto } from '../../services/application/application.dto';
import { AssigneeDto } from '../../services/user/user.dto';
import { ApplicationPill } from '../application-type-pill/application-type-pill.component';

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
  COV = 'COV',
  NOI = 'NOI',
  NOI_MODI = 'NOIM',
  NOTIFICATION = 'NOTI',
}

const lineHeight = 24;

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() cardData!: CardData;

  @Output() cardSelected = new EventEmitter<CardSelectedEvent>();

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
        })
      )
    );
  }

  ngOnInit(): void {
    this.cardData.latestDecisionDate = undefined;

    if (this.cardData.status === 'READ') {
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
}
