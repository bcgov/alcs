import { AfterContentChecked, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NonZeroValidator } from '../../validators/value-validator';

@Component({
  selector: 'app-inline-number[value]',
  templateUrl: './inline-number.component.html',
  styleUrls: ['./inline-number.component.scss'],
})
export class InlineNumberComponent implements AfterContentChecked {
  @Input() value?: string | null;
  @Input() placeholder: string = 'Enter a value';
  @Input() decimals = 2;
  @Input() nonZeroEmptyValidation: boolean = false;
  @Output() save = new EventEmitter<string | null>();

  @ViewChild('editInput') textInput!: ElementRef;

  isEditing = false;

  valueControl = new FormControl<string | null | undefined>(null, []);

  constructor() {}

  ngOnInit() {
    if (this.nonZeroEmptyValidation) {
      this.valueControl.setValidators([NonZeroValidator, Validators.required]);
    }
  }

  startEdit() {
    this.isEditing = true;
    this.valueControl.setValue(this.value);
  }

  ngAfterContentChecked(): void {
    if (this.textInput) {
      this.textInput.nativeElement.focus();
    }
  }

  confirmEdit() {
    console.log(this.valueControl.value);
    if (this.valueControl.value !== this.value) {
      this.save.emit(this.valueControl.value?.toString() ?? null);
      this.value = this.valueControl.value;
    }

    this.isEditing = false;
  }

  cancelEdit() {
    this.isEditing = false;
    this.valueControl.setValue(this.value);
  }
}
