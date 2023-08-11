import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentTypeDto } from '../../shared/dto/document.dto';
import { NaruSubtypeDto } from '../application-submission/application-submission.dto';
import { ApplicationTypeDto, LocalGovernmentDto, NoticeOfIntentTypeDto, SubmissionTypeDto } from './code.dto';

@Injectable({
  providedIn: 'root',
})
export class CodeService {
  private baseUrl = `${environment.apiUrl}/code`;

  constructor(private httpClient: HttpClient) {}

  loadCodes() {
    return firstValueFrom(
      this.httpClient.get<{
        localGovernments: LocalGovernmentDto[];
        applicationTypes: ApplicationTypeDto[];
        noticeOfIntentTypes: NoticeOfIntentTypeDto[];
        documentTypes: DocumentTypeDto[];
        submissionTypes: SubmissionTypeDto[];
        naruSubtypes: NaruSubtypeDto[];
      }>(`${this.baseUrl}`)
    );
  }
}
