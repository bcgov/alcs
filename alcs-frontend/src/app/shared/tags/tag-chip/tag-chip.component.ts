import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TagDto } from '../../../services/tag/tag.dto';

@Component({
  selector: 'app-tag-chip',
  templateUrl: './tag-chip.component.html',
  styleUrl: './tag-chip.component.scss',
})
export class TagChipComponent {
  @Input() tag!: TagDto;
  @Input() removable: boolean = true;
  @Input() isCommissioner: boolean = false;
  @Output() removeClicked = new EventEmitter<TagDto>();

  onRemove() {
    this.removeClicked.emit(this.tag);
  }

  handleClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
}
