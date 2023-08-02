import { AfterContentChecked, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-inline-textarea[value]',
  templateUrl: './inline-textarea.component.html',
  styleUrls: ['./inline-textarea.component.scss'],
})
export class InlineTextareaComponent {
  @Input() value?: string | undefined;
  @Input() placeholder: string = 'Enter a value';
  @Output() save = new EventEmitter<string | null>();

  @ViewChild('editInput') textInput!: ElementRef;

  isEditing = false;
  hasFocused = false;
  pendingValue: undefined | string;

  constructor() {}

  startEdit() {
    this.isEditing = true;
    this.hasFocused = false;
    this.pendingValue = this.value;
    setTimeout(() => {
      if (this.textInput) {
        this.textInput.nativeElement.focus();
      }
    }, 300);
  }

  confirmEdit() {
    if (this.pendingValue !== this.value) {
      this.save.emit(this.pendingValue?.toString() ?? null);
      this.value = this.pendingValue;
    }

    this.isEditing = false;
  }

  cancelEdit() {
    this.isEditing = false;
    this.pendingValue = this.value;
  }
}
