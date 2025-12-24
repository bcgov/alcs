import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-application-legacy-id',
    templateUrl: './application-legacy-id.component.html',
    styleUrls: ['./application-legacy-id.component.scss'],
    standalone: false
})
export class ApplicationLegacyIdComponent {
  @Input() legacyId?: string;
}
