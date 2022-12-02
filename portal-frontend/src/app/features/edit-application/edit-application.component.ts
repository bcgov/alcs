import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, startWith } from 'rxjs';
import { ApplicationService } from '../../services/application/application.service';
import { LocalGovernmentDto } from '../../services/code/code.dto';
import { CodeService } from '../../services/code/code.service';
import { FileHandle } from '../../shared/file-drag-drop/drag-drop.directive';

@Component({
  selector: 'app-create-application',
  templateUrl: './edit-application.component.html',
  styleUrls: ['./edit-application.component.scss'],
})
export class EditApplicationComponent implements OnInit {
  applicantName = new FormControl<string | any>('');
  localGovernment = new FormControl<string | any>('');
  fileId = '';

  localGovernments: LocalGovernmentDto[] = [];
  filteredLocalGovernments!: Observable<LocalGovernmentDto[]>;

  firstForm = new FormGroup({
    applicantName: this.applicantName,
    localGovernment: this.localGovernment,
  });

  constructor(
    private applicationService: ApplicationService,
    private codeService: CodeService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  filesDropped(files: FileHandle[]): void {
    const mappedFiles = files.map((file) => file.file);
    this.applicationService.attachFile(this.fileId, mappedFiles);
  }

  ngOnInit(): void {
    this.loadCodes().then(() => {
      this.activatedRoute.paramMap.subscribe((params) => {
        const fileId = params.get('fileId');
        if (fileId) {
          this.fileId = fileId;
          this.loadExistingApplication(fileId);
        }
      });
    });

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
    if (this.firstForm.dirty) {
      let localGovernment;
      const localGovernmentName = this.localGovernment.getRawValue();
      if (localGovernmentName) {
        localGovernment = this.localGovernments.find((lg) => lg.name == localGovernmentName);

        if (!localGovernment) {
          this.localGovernment.setErrors({
            invalid: true,
          });
          return;
        }
      }

      await this.applicationService.updatePending(this.fileId, {
        applicant: this.applicantName.getRawValue(),
        localGovernmentUuid: localGovernment?.uuid,
      });
    }
    await this.router.navigateByUrl('/home');
  }

  async onSubmit() {
    this.applicantName.setValidators([Validators.required]);
    this.applicantName.updateValueAndValidity();

    this.localGovernment.setValidators([Validators.required]);
    this.localGovernment.updateValueAndValidity();

    if (this.firstForm.valid) {
      alert('App Submitted');
    }
  }

  private async loadExistingApplication(fileId: string) {
    const application = await this.applicationService.getByFileId(fileId);
    if (application) {
      this.applicantName.patchValue(application.applicant);
      const lg = this.localGovernments.find((lg) => lg.uuid === application.localGovernmentUuid);
      if (lg) {
        this.localGovernment.patchValue(lg.name);
      }
    }
  }
}
