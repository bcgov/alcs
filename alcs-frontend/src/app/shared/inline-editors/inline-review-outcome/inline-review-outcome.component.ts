import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-inline-review-outcome',
  templateUrl: './inline-review-outcome.component.html',
  styleUrls: ['./inline-review-outcome.component.scss'],
})
export class InlineReviewOutcomeComponent implements OnInit {
  @Input() selectedValue?: string | null;
  @Input() isModification = false;

  @Output() save = new EventEmitter<string>();

  form!: FormGroup;
  isEditing = false;
  pendingReviewOutcome?: string | null;

  constructor(private fb: FormBuilder) {
    this.pendingReviewOutcome = this.selectedValue;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      reviewOutcome: this.selectedValue,
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.selectedValue = 'PEN';
    this.form = this.fb.group({
      reviewOutcome: this.selectedValue,
    });
  }

  onSave() {
    this.save.emit(this.form.get('reviewOutcome')!.value);
    this.isEditing = false;
  }
}
