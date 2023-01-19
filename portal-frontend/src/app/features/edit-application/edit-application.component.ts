import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDocumentDto, ApplicationDto } from '../../services/application/application.dto';
import { ApplicationService } from '../../services/application/application.service';
import { ChangeApplicationTypeDialogComponent } from './change-application-type-dialog/change-application-type-dialog.component';

@Component({
  selector: 'app-create-application',
  templateUrl: './edit-application.component.html',
  styleUrls: ['./edit-application.component.scss'],
})
export class EditApplicationComponent implements OnInit {
  fileId = '';
  applicationType = '';
  documents: ApplicationDocumentDto[] = [];

  application!: ApplicationDto;
  $application = new BehaviorSubject<ApplicationDto | undefined>(undefined);

  constructor(
    private applicationService: ApplicationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      const fileId = params.get('fileId');
      if (fileId) {
        this.fileId = fileId;
        this.loadExistingApplication(fileId);
      }
    });
  }

  private async loadExistingApplication(fileId: string) {
    const application = await this.applicationService.getByFileId(fileId);
    if (application) {
      this.application = application;
      this.$application.next(application);
    }
  }

  async onApplicationTypeChangeClicked() {
    this.dialog
      .open(ChangeApplicationTypeDialogComponent, {
        panelClass: 'no-padding',
        disableClose: true,
        data: {
          fileId: this.fileId,
        },
      })
      .beforeClosed()
      .subscribe((result) => {
        if (result) {
          this.loadExistingApplication(this.fileId);
        }
      });
  }
}
