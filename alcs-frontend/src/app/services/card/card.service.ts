import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationMasterCodesDto } from '../application/application-code.dto';
import { ToastService } from '../toast/toast.service';
import { CardCreateDto, CardPartialDto, ReconsiderationDto, ReconsiderationTypeDto } from './card.dto';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  constructor(private http: HttpClient, private toastService: ToastService) {}

  public $cardReconTypes = new BehaviorSubject<ReconsiderationTypeDto[]>([]);
  private cardReconTypes: ReconsiderationTypeDto[] = [];

  async fetchCodes() {
    const codes = await firstValueFrom(this.http.get<ApplicationMasterCodesDto>(`${environment.apiUrl}/code`));
    this.cardReconTypes = codes.reconsiderationType;
    this.$cardReconTypes.next(this.cardReconTypes);
  }

  async fetchReconsiderationCard(uuid: string) {
    return await firstValueFrom(this.http.get<ReconsiderationDto>(`${environment.apiUrl}/board/card/${uuid}`));
  }

  async createCard(card: CardCreateDto) {
    console.log('createCard()', card);
    return await firstValueFrom(this.http.post<CardCreateDto>(`${environment.apiUrl}/board/card`, card));
  }

  async updateCard(card: CardPartialDto) {
    try {
      return await firstValueFrom(this.http.patch<ReconsiderationDto>(`${environment.apiUrl}/card/updateCard`, card));
    } catch (e) {
      this.toastService.showErrorToast('Failed to update card');
    }
    return;
  }
}
