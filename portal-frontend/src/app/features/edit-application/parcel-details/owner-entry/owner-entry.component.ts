import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-owner-entry',
  templateUrl: './owner-entry.component.html',
  styleUrls: ['./owner-entry.component.scss'],
})
export class OwnerEntryComponent implements OnInit {
  firstName = new FormControl<string>('');
  lastName = new FormControl<string>('');
  phoneNumber = new FormControl<string>('');
  email = new FormControl<string>('');

  ownerForm = new FormGroup({
    firstName: this.firstName,
    lastName: this.lastName,
    phoneNumber: this.phoneNumber,
    email: this.email,
  });

  constructor() {}

  ngOnInit(): void {}

  onSave(): void {
    alert('save owner');
  }
}
