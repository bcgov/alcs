import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar-circle[initials]',
  templateUrl: './avatar-circle.component.html',
  styleUrls: ['./avatar-circle.component.scss'],
})
export class AvatarCircleComponent {
  @Input() initials = '';
  @Input() name = '';
  @Input() large = false;

  constructor() {}
}
