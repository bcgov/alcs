import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApplicationTypeDto } from '../../services/application/application-code.dto';

export interface CardData {
  id: string;
  title: string;
  type: ApplicationTypeDto;
  status: string;
  assigneeInitials?: string;
  activeDays: number;
  paused: boolean;
  highPriority: boolean;
}

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() cardData!: CardData;

  @Output() cardSelected = new EventEmitter<string>();

  constructor() {}

  onClick(cardId: string) {
    this.cardSelected.emit(cardId);
  }

  ngOnInit(): void {}
}
