import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-decision-meeting-dialog',
  templateUrl: './create-decision-meeting-dialog.component.html',
  styleUrls: ['./create-decision-meeting-dialog.component.scss'],
})
export class CreateDecisionMeetingDialogComponent implements OnInit {
  createForm = new FormGroup({
    date: new FormControl('', [Validators.required]),
  });

  constructor() {}

  ngOnInit(): void {}

  async onSubmit() {
    const formValues = this.createForm.getRawValue();
    console.log('onSubmit', formValues);
  }
}
