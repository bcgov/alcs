import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApplicationTypeDto } from '../../services/application/application-code.dto';
import { ApplicationDecisionMeetingDto } from '../../services/application/application.dto';

export interface CardData {
  id: string;
  title: string;
  type: ApplicationTypeDto;
  status: string;
  assigneeInitials?: string;
  activeDays?: number;
  paused: boolean;
  highPriority: boolean;
  decisionMeetings?: ApplicationDecisionMeetingDto[];
  latestDecisionDate?: Date;
  cardType: string;
}

export interface CardSelectedEvent {
  uuid: string;
  cardType: string;
}
@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() cardData!: CardData;

  @Output() cardSelected = new EventEmitter<CardSelectedEvent>();

  constructor() {}

  onClick(uuid: string, cardType: string) {
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
}
