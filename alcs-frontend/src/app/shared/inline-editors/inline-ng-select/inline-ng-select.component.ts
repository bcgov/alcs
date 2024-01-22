import { AfterContentChecked, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-inline-ng-select[options][value]',
  templateUrl: './inline-ng-select.component.html',
  styleUrls: ['./inline-ng-select.component.scss'],
})
export class InlineNgSelectComponent implements AfterContentChecked {
  @Input() value?: string | string[] | undefined;
  @Input() placeholder: string = 'Enter a value';
  @Input() options: { label: string; value: string }[] = [];
  @Input() multiple = false;

  @Output() save = new EventEmitter<string | string[] | null>();

  @ViewChild('editInput') textInput!: ElementRef;

  isEditing = false;
  pendingValue: undefined | string | string[];

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
      this.save.emit(this.pendingValue ?? null);
      this.value = this.pendingValue;
    }

    this.isEditing = false;
  }

  cancelEdit() {
    this.isEditing = false;
    this.pendingValue = this.value;
  }

  coerceArray(value: string | string[] | undefined) {
    if (value instanceof Array) {
      return value;
    }
    return undefined;
  }
}
