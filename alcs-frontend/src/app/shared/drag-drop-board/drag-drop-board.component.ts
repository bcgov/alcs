import { CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToastService } from '../../services/toast/toast.service';
import { CardData, CardSelectedEvent } from '../card/card.component';
import { DragDropColumn } from './drag-drop-column.interface';

@Component({
  selector: 'app-drag-drop-board',
  templateUrl: './drag-drop-board.component.html',
  styleUrls: ['./drag-drop-board.component.scss'],
})
export class DragDropBoardComponent {
  @Input() cards: CardData[] = [];
  @Input() columns: DragDropColumn[] = [];

  @Output() cardDropped = new EventEmitter<{
    id: string;
    status: string;
  }>();
  @Output() cardSelected = new EventEmitter<CardSelectedEvent>();

  constructor(private toastService: ToastService) {}

  predicateGenerator(column: DragDropColumn) {
    return (item: CdkDrag<CardData>) => {
      return column.allowedTransitions.includes(item.data.status);
    };
  }

  drop(event: CdkDragDrop<CardData>, targetColumn: DragDropColumn) {
    const selectedCard = this.cards.find((card) => card.id === event.item.data.id);

    if (!selectedCard) {
      this.toastService.showErrorToast('Something went wrong, please refresh the page and try again.');
      console.error(`Failed to find card with id ${event.item.data.id}`);
      return;
    }

    if (targetColumn.status === 'RELE' && selectedCard.paused) {
      this.toastService.showErrorToast(
        "Paused cards cannot be moved to the 'Decision Released' column. Please unpause the card first and try again"
      );
      return;
    }

    selectedCard.status = targetColumn.status;
    this.cardDropped.emit({ id: selectedCard.id, status: targetColumn.status });
  }

  cardClicked(card: CardSelectedEvent) {
    console.log('app-drag-drop-board cardClicked 1', card);
    this.cardSelected.emit({ uuid: card.uuid, cardType: card.cardType });
  }
}
