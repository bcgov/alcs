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
  selector: 'app-inline-text[value]',
  templateUrl: './inline-text.component.html',
  styleUrls: ['./inline-text.component.scss'],
})
export class InlineTextComponent implements AfterContentChecked {
  @Input() updateOnSave: boolean = true;
  @Input() value?: string | undefined;
  @Input() placeholder: string = 'Enter a value';
  @Input() required = false;
  @Output() save = new EventEmitter<string | null>();
  @Input() mask?: string | undefined;

  @ViewChild('editInput') textInput!: ElementRef;

  isEditing = false;
  pendingValue: undefined | string;

  constructor() {}

  startEdit() {
    this.isEditing = true;
    this.pendingValue = this.value;
  }

  ngAfterContentChecked(): void {
    if (this.textInput) {
      this.textInput.nativeElement.focus();
    }
  }

  confirmEdit() {
    if (this.pendingValue !== this.value) {
      this.save.emit(this.pendingValue?.toString() ?? null);

      if (this.updateOnSave) {
        this.value = this.pendingValue;
      }
    }

    this.isEditing = false;
  }

  cancelEdit() {
    this.isEditing = false;
  }
}
