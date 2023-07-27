import { Component, Input, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LotsTableFormComponent } from '../../../../../../../../shared/lots-table/lots-table-form.component';

@Component({
  selector: 'app-subd-input',
  templateUrl: './subd-input.component.html',
  styleUrls: ['./subd-input.component.scss'],
})
export class SubdInputComponent {
  @Input() form!: FormGroup;
  @ViewChild(LotsTableFormComponent) lotsTableFormComponent?: LotsTableFormComponent;

  markAllAsTouched() {
    this.lotsTableFormComponent?.markTouched();
  }
}
