import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, startWith, map } from 'rxjs';
import { ApplicationService } from '../../services/application/application.service';
import { LocalGovernmentDto } from '../../services/code/code.dto';
import { CodeService } from '../../services/code/code.service';
import { FileHandle } from '../../shared/file-drag-drop/drag-drop.directive';

@Component({
  selector: 'app-create-application',
  templateUrl: './create-application.component.html',
  styleUrls: ['./create-application.component.scss'],
})
export class CreateApplicationComponent implements OnInit {
  applicantName = new FormControl<string | any>('', [Validators.required]);
  localGovernment = new FormControl<string | any>('', [Validators.required]);

  localGovernments: LocalGovernmentDto[] = [];
  filteredLocalGovernments!: Observable<LocalGovernmentDto[]>;

  firstForm = new FormGroup({
    applicantName: this.applicantName,
    localGovernment: this.localGovernment,
  });

  files: FileHandle[] = [];

  constructor(
    private applicationService: ApplicationService,
    private codeService: CodeService,
    private router: Router
  ) {}

  filesDropped(files: FileHandle[]): void {
    this.files = files;
  }

  ngOnInit(): void {
    this.loadCodes();
    this.filteredLocalGovernments = this.localGovernment.valueChanges.pipe(
      startWith(''),
      map((value) => this.filter(value || ''))
    );
  }

  private filter(value: string): LocalGovernmentDto[] {
    if (this.localGovernments) {
      const filterValue = value.toLowerCase();
      return this.localGovernments.filter((localGovernment) =>
        localGovernment.name.toLowerCase().includes(filterValue)
      );
    }
    return [];
  }

  private async loadCodes() {
    const codes = await this.codeService.loadCodes();
    this.localGovernments = codes.localGovernments;
  }

  async onSaveAndExit() {
    const localGovernmentName = this.localGovernment.getRawValue();
    const localGovernmentUuid = this.localGovernments.find((lg) => lg.name == localGovernmentName);

    if (!localGovernmentUuid) {
      this.localGovernment.setErrors({
        invalid: true,
      });
      return;
    }

    await this.applicationService.createPendingApplication({
      applicant: this.applicantName.getRawValue(),
      localGovernmentUuid: localGovernmentUuid!.uuid,
      documents: this.files.map((file) => file.file),
    });
    await this.router.navigateByUrl('/home');
  }
}
