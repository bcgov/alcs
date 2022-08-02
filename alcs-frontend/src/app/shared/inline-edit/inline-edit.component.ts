import {
  AfterContentChecked,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-inline-edit',
  templateUrl: './inline-edit.component.html',
  styleUrls: ['./inline-edit.component.scss'],
})
export class InlineEditComponent implements OnInit, AfterContentChecked {
  @Input() value: string = '';
  @Output() save = new EventEmitter<string>();

  @ViewChild('editInput') someInput!: ElementRef;

  isEditing = false;
  pendingValue = '';

  constructor() {}

  ngOnInit(): void {}

  startEdit() {
    this.isEditing = true;
    this.pendingValue = this.value;
  }

  ngAfterContentChecked(): void {
    if (this.someInput) {
      this.someInput.nativeElement.focus();
    }
  }

  confirmEdit() {
    if (this.pendingValue !== this.value) {
      this.save.emit(this.pendingValue);
      this.value = this.pendingValue;
    }

    this.isEditing = false;
  }

  cancelEdit() {
    this.isEditing = false;
  }
}
