import { AfterContentChecked, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AsyncValidatorFn, FormControl, Validators } from '@angular/forms';
import { NonZeroValidator } from '../../validators/value-validator';

@Component({
    selector: 'app-inline-number[value]',
    templateUrl: './inline-number.component.html',
    styleUrls: ['./inline-number.component.scss'],
    standalone: false
})
export class InlineNumberComponent implements AfterContentChecked {
  private _value: number | undefined = undefined;
  @Input() set value(value: string | null | undefined) {
    if (value) {
      this._value = Number.parseFloat(value);
    }
  }
  get value(): string | null | undefined {
    return this._value?.toString();
  }
  @Input() placeholder: string = 'Enter a value';
  @Input() decimals = 2;
  @Input() nonZeroEmptyValidation: boolean = false;
  @Input() hideButtons = false;
  @Input() disableThousandsSeparator = false;
  @Input() asyncValidators: AsyncValidatorFn[] = [];
  @Output() save = new EventEmitter<string | null>();
  @Output() cancel = new EventEmitter<string | null>();

  @ViewChild('editInput') textInput!: ElementRef;

  isEditing = false;

  valueControl = new FormControl<number | null | undefined>(null, []);

  constructor() {}

  ngOnInit() {
    this.valueControl.setAsyncValidators(this.asyncValidators);

    if (this.nonZeroEmptyValidation) {
      this.valueControl.setValidators([NonZeroValidator, Validators.required]);
    }
  }

  startEdit() {
    this.isEditing = true;
    this.valueControl.setValue(this._value);
  }

  ngAfterContentChecked(): void {
    if (this.textInput) {
      this.textInput.nativeElement.focus();
    }
  }

  confirmEdit() {
    if (this.valueControl.value !== this._value) {
      this.save.emit(this.valueControl.value?.toString() ?? '');
      this._value = this.valueControl.value ?? undefined;
    } else {
      this.cancel.emit();
    }

    this.isEditing = false;
  }

  cancelEdit() {
    this.isEditing = false;
    this.valueControl.setValue(this._value);
    this.cancel.emit();
  }

  preventKeydown(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
  }
}
