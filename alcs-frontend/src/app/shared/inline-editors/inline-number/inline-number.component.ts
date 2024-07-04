import { AfterContentChecked, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-inline-number[value]',
  templateUrl: './inline-number.component.html',
  styleUrls: ['./inline-number.component.scss'],
})
export class InlineNumberComponent implements AfterContentChecked {
  @Input() value?: string | null;
  @Input() placeholder: string = 'Enter a value';
  @Input() decimals = 2;
  @Input() disableSaveOnZero: boolean = false;
  @Input() disableSaveOnEmpty: boolean = false;
  @Output() save = new EventEmitter<string | null>();

  @ViewChild('editInput') textInput!: ElementRef;

  isEditing = false;
  pendingValue: null | string | undefined;

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
      this.value = this.pendingValue;
    }

    this.isEditing = false;
  }

  cancelEdit() {
    this.isEditing = false;
    this.pendingValue = this.value;
  }

  get isSaveDisabledOnZero(): boolean {
    const valueAsNumber = this.pendingValue !== '' ? parseFloat(this.pendingValue!) : null;
    return this.disableSaveOnZero && valueAsNumber === 0;
  }

  get isSaveDisabledOnEmpty(): boolean {
    return this.disableSaveOnEmpty && this.pendingValue === '';
  }
}
