import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { DragDropItem } from './drag-drop-item.interface';
import { DragDropColumn } from './drag-drop-column.interface';

@Component({
  selector: 'app-drag-drop-board',
  templateUrl: './drag-drop-board.component.html',
  styleUrls: ['./drag-drop-board.component.scss'],
})
export class DragDropBoardComponent {
  @Input() cards: DragDropItem[] = [];
  @Input() columns: DragDropColumn[] = [];

  @Output() cardDropped = new EventEmitter<{
    id: string;
    status: string;
  }>();
  @Output() cardSelected = new EventEmitter<string>();

  predicateGenerator(column: DragDropColumn) {
    return (item: CdkDrag<DragDropItem>) => {
      return column.allowedTransitions.includes(item.data.status);
    };
  }

  drop(event: CdkDragDrop<DragDropItem>, targetColumn: DragDropColumn) {
    const selectedCard = this.cards.find((card) => card.id === event.item.data.id);

    if (!selectedCard) {
      console.error(`Failed to find card with id ${event.item.data.id}`);
      return;
    }

    selectedCard.status = targetColumn.status;
    this.cardDropped.emit({ id: selectedCard.id, status: targetColumn.status });
  }

  click(id: string) {
    this.cardSelected.emit(id);
  }
}
