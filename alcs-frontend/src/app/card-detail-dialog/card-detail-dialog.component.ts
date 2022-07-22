import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApplicationDto } from '../features/application/application.dto';

@Component({
  selector: 'app-card-detail-dialog',
  templateUrl: './card-detail-dialog.component.html',
  styleUrls: ['./card-detail-dialog.component.scss'],
})
export class CardDetailDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ApplicationDto) {}

  ngOnInit(): void {}
}
