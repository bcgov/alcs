import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, startWith } from 'rxjs';
import { ApplicationDocumentDto } from '../../services/application/application.dto';
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
  applicationType = '';
  documents: ApplicationDocumentDto[] = [];

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
    this.localGovernments = codes.localGovernments.sort((a, b) => (a.name > b.name ? 1 : -1));
  }

  async onSaveAndExit() {
    if (this.firstForm.dirty) {
      const localGovernment = this.validateAndGetLocalGovernment();
      const applicantName = this.applicantName.getRawValue();
      await this.applicationService.updatePending(this.fileId, {
        applicant: applicantName,
        localGovernmentUuid: localGovernment?.uuid,
      });
    }
    await this.router.navigateByUrl(`/application/${this.fileId}`);
  }

  async onSubmit() {
    this.applicantName.setValidators([Validators.required]);
    this.applicantName.updateValueAndValidity();

    this.localGovernment.setValidators([Validators.required]);
    this.localGovernment.updateValueAndValidity();

    if (this.firstForm.valid) {
      const localGovernment = this.validateAndGetLocalGovernment();

      await this.applicationService.submitToAlcs(this.fileId, {
        applicant: this.applicantName.getRawValue(),
        localGovernmentUuid: localGovernment?.uuid,
      });
      await this.router.navigateByUrl('/home');
    }
  }

  private async loadExistingApplication(fileId: string) {
    const application = await this.applicationService.getByFileId(fileId);
    if (application) {
      if (application.applicant) {
        this.applicantName.patchValue(application.applicant);
      }
      this.applicationType = application.type;
      this.documents = application.documents;
      const lg = this.localGovernments.find((lg) => lg.uuid === application.localGovernmentUuid);
      if (lg) {
        this.localGovernment.patchValue(lg.name);
      }
    }
  }

  private validateAndGetLocalGovernment() {
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

    return localGovernment;
  }

  async attachFile(files: FileHandle[]) {
    const mappedFiles = files.map((file) => file.file);
    await this.applicationService.attachExternalFile(this.fileId, mappedFiles);
    await this.loadExistingApplication(this.fileId);
  }

  async deleteFile($event: ApplicationDocumentDto) {
    await this.applicationService.deleteExternalFile($event.uuid);
    await this.loadExistingApplication(this.fileId);
  }

  async openFile(uuid: string) {
    const res = await this.applicationService.openFile(uuid);
    if (res) {
      window.open(res.url, '_blank');
    }
  }
}
