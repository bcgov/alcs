import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { NotificationTransfereeDto } from '../../../services/notification-transferee/notification-transferee.dto';

@Component({
  selector: 'app-transferee-mobile-card',
  templateUrl: './transferee-mobile-card.component.html',
  styleUrl: './transferee-mobile-card.component.scss',
})
export class TransfereeMobileCardComponent implements OnInit {
  @Input() transferee!: NotificationTransfereeDto;
  @Input() isLast: boolean = false;
  @Input() isReviewStep: boolean = false;
  @Output() editClicked = new EventEmitter<NotificationTransfereeDto>();
  @Output() removeClicked = new EventEmitter<NotificationTransfereeDto>();

  ngOnInit(): void {}

  onEdit() {
    this.editClicked.emit(this.transferee);
  }

  onRemove() {
    this.removeClicked.emit(this.transferee);
  }
}
