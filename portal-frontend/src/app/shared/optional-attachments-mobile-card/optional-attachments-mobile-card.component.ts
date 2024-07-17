import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ApplicationDocumentDto } from "../../services/application-document/application-document.dto";
import { NoticeOfIntentDocumentDto } from "../../services/notice-of-intent-document/notice-of-intent-document.dto";
import { NotificationDocumentDto } from "../../services/notification-document/notification-document.dto";

@Component({
    selector: 'app-optional-attachments-mobile-card',
    templateUrl: './optional-attachments-mobile-card.component.html',
    styleUrl: './optional-attachments-mobile-card.component.scss',
})
export class OptionalAttachmentsMobileCardComponent {
    @Input() file!: ApplicationDocumentDto | NoticeOfIntentDocumentDto | NotificationDocumentDto;
    @Output() fileClicked = new EventEmitter<ApplicationDocumentDto | NoticeOfIntentDocumentDto | NoticeOfIntentDocumentDto>();
    onClick() {
        this.fileClicked.emit(this.file);
    }
}
