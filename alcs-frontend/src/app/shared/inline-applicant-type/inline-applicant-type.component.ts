import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-inline-applicant-type',
  templateUrl: './inline-applicant-type.component.html',
  styleUrls: ['./inline-applicant-type.component.scss'],
})
export class InlineApplicantTypeComponent implements OnInit {
  @Input() selectedValue?: string | null;
  @Input() value?: string | null;

  @Output() save = new EventEmitter<string>();

  form!: FormGroup;
  isEditing = false;
  pendingApplicantType?: string | null;

  constructor(private fb: FormBuilder) {
    this.pendingApplicantType = this.selectedValue;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      applicantType: this.value || this.selectedValue,
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  onSave() {
    this.save.emit(this.form.get('applicantType')!.value);
    this.isEditing = false;
  }
}
