import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface CardData {
  id: string;
  title: string;
  typeLabel: string;
  status: string;
  assigneeInitials?: string;
  activeDays: number;
  paused: boolean;
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
