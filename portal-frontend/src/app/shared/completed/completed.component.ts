import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-completed',
  templateUrl: './completed.component.html',
  styleUrls: ['./completed.component.scss'],
})
export class CompletedComponent {
  @Input() text = 'Completed';

  constructor() {}
}
