import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApplicationService } from '../../services/application/application.service';
import { ApplicationTypeDto } from '../../services/code/code.dto';
import { CodeService } from '../../services/code/code.service';

@Component({
  selector: 'app-create-application-dialog',
  templateUrl: './create-application-dialog.component.html',
  styleUrls: ['./create-application-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateApplicationDialogComponent implements OnInit {
  applicationTypes: ApplicationTypeDto[] = [];
  applicationType: string = '';

  constructor(
    private dialogRef: MatDialogRef<CreateApplicationDialogComponent>,
    private codeService: CodeService,
    private applicationService: ApplicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCodes();
  }

  private async loadCodes() {
    const codes = await this.codeService.loadCodes();
    this.applicationTypes = codes.applicationTypes.filter((type) => !!type.portalLabel);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  async onSubmit() {
    const res = await this.applicationService.create(this.applicationType);
    if (res) {
      await this.router.navigateByUrl(`/application/${res.fileId}`);
      this.dialogRef.close(true);
    }
  }
}
