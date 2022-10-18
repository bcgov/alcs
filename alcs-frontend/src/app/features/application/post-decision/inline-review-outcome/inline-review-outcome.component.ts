import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-inline-review-outcome',
  templateUrl: './inline-review-outcome.component.html',
  styleUrls: ['./inline-review-outcome.component.scss'],
})
export class InlineReviewOutcomeComponent implements OnInit {
  @Input() selectedValue?: boolean | null;

  @Output() save = new EventEmitter<boolean>();

  form!: FormGroup;
  isEditing = false;
  pendingReviewOutcome?: boolean | null;

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
    this.selectedValue = true;
    this.form = this.fb.group({
      reviewOutcome: this.selectedValue.toString(),
    });
  }

  onSave() {
    const selectedValue = this.form.get('reviewOutcome')!.value;
    this.save.emit(JSON.parse(selectedValue));
    this.isEditing = false;
  }

  getReviewOutcomeLabel(reviewOutcome: boolean) {
    return reviewOutcome ? 'Proceed' : 'Refused';
  }

  isReviewOutcomeSet(reviewOutcome?: boolean | null) {
    return typeof reviewOutcome === 'boolean';
  }
}
