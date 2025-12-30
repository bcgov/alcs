import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { ApplicationDocumentDto } from "src/app/services/application-document/application-document.dto";
import { NoticeOfIntentDocumentDto } from "src/app/services/notice-of-intent-document/notice-of-intent-document.dto";
import { NotificationDocumentDto } from "src/app/services/notification-document/notification-document.dto";

@Component({
    selector: 'app-other-attachment-mobile-card',
    templateUrl: './other-attachment-mobile-card.component.html',
    styleUrl: './other-attachment-mobile-card.component.scss',
    standalone: false
})
export class OtherAttachmentMobileCardComponent implements OnInit {
    @Input() file!: ApplicationDocumentDto | NoticeOfIntentDocumentDto | NotificationDocumentDto;
    @Input() isLast: boolean = false;
    @Output() editClicked = new EventEmitter<ApplicationDocumentDto | NoticeOfIntentDocumentDto | NotificationDocumentDto>();
    @Output() removeClicked = new EventEmitter<ApplicationDocumentDto | NoticeOfIntentDocumentDto | NotificationDocumentDto>();
    @Output() fileClicked = new EventEmitter<ApplicationDocumentDto | NoticeOfIntentDocumentDto | NotificationDocumentDto>();

    ngOnInit(): void { }

    onEdit() {
        this.editClicked.emit(this.file);
    }

    onRemove() {
        this.removeClicked.emit(this.file);
    }

    onClick() {
        this.fileClicked.emit(this.file);
    }

}
