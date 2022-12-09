import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationMasterCodesDto } from '../application/application-code.dto';
import { ReconsiderationTypeDto } from '../application/application-reconsideration/application-reconsideration.dto';
import { ToastService } from '../toast/toast.service';
import { CardFlatDto, CardUpdateDto } from './card.dto';

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

  async updateCard(card: CardUpdateDto) {
    try {
      return await firstValueFrom(this.http.patch<CardFlatDto>(`${environment.apiUrl}/card/${card.uuid}`, card));
    } catch (e) {
      console.warn(e);
      this.toastService.showErrorToast('Failed to update card');
    }
    return;
  }
}
