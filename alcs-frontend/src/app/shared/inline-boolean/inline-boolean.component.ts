import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-inline-boolean',
  templateUrl: './inline-boolean.component.html',
  styleUrls: ['./inline-boolean.component.scss'],
})
export class InlineBooleanComponent implements OnInit, OnChanges {
  @Input() selectedValue: boolean | null = null;
  @Output() save = new EventEmitter<boolean>();

  value: string | undefined = undefined;
  isEditing = false;
  formattedAnswer = '';

  constructor() {}

  ngOnInit(): void {
    if (this.selectedValue !== null) {
      this.value = this.selectedValue ? 'Yes' : 'No';
      this.formattedAnswer = this.selectedValue ? 'Yes' : 'No';
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  onSave() {
    if (this.value !== undefined) {
      const finalValue = this.value === 'Yes';
      this.save.emit(finalValue);
      this.isEditing = false;
    }
  }

  ngOnChanges(): void {
    if (this.selectedValue !== null) {
      this.value = this.selectedValue ? 'Yes' : 'No';
      this.formattedAnswer = this.selectedValue ? 'Yes' : 'No';
    }
  }
}
