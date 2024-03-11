import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-inline-button-toggle[selectedValue][options]',
  templateUrl: './inline-button-toggle.component.html',
  styleUrls: ['./inline-button-toggle.component.scss'],
})
export class InlineButtonToggleComponent implements OnInit {
  @Input() selectedValue?: string | null;
  @Input() options: { label: string; value: string }[] = [];

  @Output() save = new EventEmitter<string>();

  selectFormControl = new FormControl();

  form!: FormGroup;
  isEditing = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.selectFormControl.setValue(this.selectedValue);
    this.form = this.fb.group({
      selectFormControl: this.selectFormControl,
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.form = this.fb.group({
      selectedValue: this.selectedValue,
    });
  }

  onSave() {
    this.save.emit(this.selectFormControl.value);
    this.isEditing = false;
  }
}
