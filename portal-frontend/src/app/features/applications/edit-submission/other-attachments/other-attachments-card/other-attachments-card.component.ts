import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import {MatCardModule} from '@angular/material/card'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { ApplicationDocumentDto } from "src/app/services/application-document/application-document.dto";

@Component({
    selector: 'app-other-attachments-card',
    templateUrl: './other-attachments-card.component.html',
    styleUrl: './other-attachments-card.component.scss',
})
export class OtherAttachmentsCardComponent implements OnInit {
    @Input() file!: ApplicationDocumentDto;
    @Output() editClicked = new EventEmitter<ApplicationDocumentDto>();
    @Output() removeClicked = new EventEmitter<ApplicationDocumentDto>();
    @Output() fileClicked = new EventEmitter<ApplicationDocumentDto>();

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
