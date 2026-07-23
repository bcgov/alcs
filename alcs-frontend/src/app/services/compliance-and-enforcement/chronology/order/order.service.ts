import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom, map, Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { OrderDto, UpdateOrderDto } from './order.dto';

export interface OrderOptions {
  filterByUuid?: string;
  filterByEntryUuid?: string;
}

export interface DeleteResult {
  raw: any;
  affected?: number | null | undefined;
}

@Injectable({
  providedIn: 'root',
})
export class ComplianceAndEnforcementOrderService {
  private readonly url = `${environment.apiUrl}/compliance-and-enforcement/chronology/order`;

  ordersByUuid = signal<Map<string, OrderDto>>(new Map());

  constructor(private readonly http: HttpClient) {}

  loadOrders(options: OrderOptions = {}): Observable<OrderDto[]> {
    let params = new HttpParams();

    for (const [option, value] of Object.entries(options)) {
      if (options[option as keyof OrderOptions]) {
        params = params.set(option, value);
      }
    }

    return this.http.get<OrderDto[]>(`${this.url}`, { params }).pipe(
      tap((freshOrders) => {
        this.ordersByUuid.update((staleOrdersByUuid) => {
          const freshOrdersByUuid = new Map<string, OrderDto>(staleOrdersByUuid);
          for (const order of freshOrders) {
            freshOrdersByUuid.set(order.uuid, order);
          }
          return freshOrdersByUuid;
        });
      }),
    );
  }

  async createDraft(entryUuid: string): Promise<string> {
    const { uuid } = await firstValueFrom(this.http.post<{ uuid: string }>(`${this.url}/draft`, { entryUuid }));

    return uuid;
  }

  update(uuid: string, updateDto: UpdateOrderDto): Observable<OrderDto> {
    return this.http.patch<OrderDto>(`${this.url}/${uuid}`, updateDto);
  }

  delete(uuid: string): Observable<string> {
    return this.http.delete<{ uuid: string }>(`${this.url}/${uuid}`).pipe(
      map((result) => result.uuid),
      tap((receivedUuid) => {
        this.ordersByUuid.update((staleOrdersByUuid) => {
          const freshOrdersByUuid = new Map<string, OrderDto>(staleOrdersByUuid);
          freshOrdersByUuid.delete(receivedUuid);
          return freshOrdersByUuid;
        });
      }),
    );
  }
}
