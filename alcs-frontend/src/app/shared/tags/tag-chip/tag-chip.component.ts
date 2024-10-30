import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TagDto } from 'src/app/services/tag/tag.dto';

@Component({
  selector: 'app-tag-chip',
  templateUrl: './tag-chip.component.html',
  styleUrl: './tag-chip.component.scss',
})
export class TagChipComponent {
  @Input() tag!: TagDto;
  @Output() removeClicked = new EventEmitter<TagDto>();

  onRemove() {
    this.removeClicked.emit(this.tag);
  }
}
