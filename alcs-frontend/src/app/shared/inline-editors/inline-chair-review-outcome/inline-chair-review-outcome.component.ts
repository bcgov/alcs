import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-inline-chair-review-outcome',
  templateUrl: './inline-chair-review-outcome.component.html',
  styleUrls: ['./inline-chair-review-outcome.component.scss']
})
export class InlineChairReviewOutcomeComponent  implements OnInit {
  @Input() selectedValue?: string | null;

  @Output() save = new EventEmitter<string>();

  form!: FormGroup;
  isEditing = false;
  pendingChairReviewOutcome?: string | null;
  formattedAnswer = '';

  constructor(private fb: FormBuilder) {
    this.pendingChairReviewOutcome = this.selectedValue;
  }

  ngOnInit(): void {
    if(this.selectedValue !== null) {
      this.formattedAnswer = this.selectedValue === 'REC' ? 'Reconsider' : 'Stay';
    }
    this.form = this.fb.group({
      chairReviewOutcome: this.selectedValue,
    });

  }

  startEdit() {
    this.isEditing = true;
    this.pendingChairReviewOutcome = this.selectedValue;
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.form = this.fb.group({
      chairReviewOutcome: this.selectedValue,
    });
  }
  
  onSave() {
    this.save.emit(this.form.get('chairReviewOutcome')!.value);
    this.isEditing = false;
  }
}
