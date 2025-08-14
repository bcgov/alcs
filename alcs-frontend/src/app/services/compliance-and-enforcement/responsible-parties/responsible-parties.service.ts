import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ResponsiblePartyDto,
  CreateResponsiblePartyDto,
  UpdateResponsiblePartyDto,
  FOIPPACategory,
} from './responsible-parties.dto';
import { OwnerDto, SubmissionOwnersDto } from '../../../shared/document-upload-dialog/document-upload-dialog.dto';

@Injectable({
  providedIn: 'root',
})
export class ResponsiblePartiesService {
  private readonly url = `${environment.apiUrl}/compliance-and-enforcement/responsible-parties`;

  constructor(private readonly http: HttpClient) {}

  async fetchByFileUuid(fileUuid: string): Promise<ResponsiblePartyDto[]> {
    return await firstValueFrom(this.http.get<ResponsiblePartyDto[]>(`${this.url}/file/${fileUuid}`));
  }

  async fetchSubmission(fileNumber: string): Promise<SubmissionOwnersDto> {
    const responsibleParties = await this.fetchByFileNumber(fileNumber);
    const responsiblePartiesOwners: OwnerDto[] = responsibleParties.map((party) => ({
      ...party,
      displayName: '',
      type: {
        label: '',
        code: party.foippaCategory === FOIPPACategory.ORGANIZATION ? 'ORGZ' : '',
        description: '',
      },
    }));

    return {
      owners: responsiblePartiesOwners,
    };
  }

  async fetchByFileNumber(fileNumber: string): Promise<ResponsiblePartyDto[]> {
    return await firstValueFrom(
      this.http.get<ResponsiblePartyDto[]>(`${this.url}/file/${fileNumber}?idType=fileNumber`),
    );
  }

  create(createDto: CreateResponsiblePartyDto): Observable<ResponsiblePartyDto> {
    return this.http.post<ResponsiblePartyDto>(this.url, createDto);
  }

  update(uuid: string, updateDto: UpdateResponsiblePartyDto): Observable<ResponsiblePartyDto> {
    return this.http.patch<ResponsiblePartyDto>(`${this.url}/${uuid}`, updateDto);
  }

  async delete(uuid: string): Promise<void> {
    return await firstValueFrom(this.http.delete<void>(`${this.url}/${uuid}`));
  }
}
