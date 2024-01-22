import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-inline-decision-outcome',
  templateUrl: './inline-decision-outcome.component.html',
  styleUrls: ['./inline-decision-outcome.component.scss'],
})
export class InlineDecisionOutcomeComponent implements OnInit {
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
      decisionOutcome: this.selectedValue,
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.selectedValue = 'PEN';
    this.form = this.fb.group({
      decisionOutcome: this.selectedValue,
    });
  }

  onSave() {
    this.save.emit(this.form.get('decisionOutcome')!.value);
    this.isEditing = false;
  }
}
