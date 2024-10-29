import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TagDto } from './tag.dto';
import { ToastService } from '../toast/toast.service';

export interface PaginatedTagResponse {
  data: TagDto[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private url = `${environment.apiUrl}/tag`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  public $tags = new BehaviorSubject<PaginatedTagResponse>({ data: [], total: 0 });

  async fetch(pageIndex: number, itemsPerPage: number, search?: string) {
    const result = await this.search(pageIndex, itemsPerPage, search);
    if (result) {
      this.$tags.next(result);
    }
  }

  async search(pageIndex: number, itemsPerPage: number, search?: string) {
    const pageQuery = `?pageIndex=${pageIndex}`;
    const itemsQuery = `&itemsPerPage=${itemsPerPage}`;
    const searchQuery = search ? `&search=${search}` : '';
    try {
      return await firstValueFrom(
        this.http.get<PaginatedTagResponse>(`${this.url}${pageQuery}${itemsQuery}${searchQuery}`)
      );
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch tags');
    }
    return;
  }

  async create(createDto: TagDto) {
    try {
      return await firstValueFrom(this.http.post<TagDto>(`${this.url}`, createDto));
    } catch (e) {
      const res = e as HttpErrorResponse;
      if (res.error.statusCode === HttpStatusCode.Conflict && res.error.message.includes('duplicate key')) {
        throw e as HttpErrorResponse;
      } else {
        console.error(e);
        this.toastService.showErrorToast('Failed to create tag');
      }
    }
    return;
  }

  async update(uuid: string, updateDto: TagDto) {
    try {
      return await firstValueFrom(this.http.patch<TagDto>(`${this.url}/${uuid}`, updateDto));
    } catch (e) {
      const res = e as HttpErrorResponse;
      if (res.error.statusCode === HttpStatusCode.Conflict && res.error.message.includes('duplicate key')) {
        throw e as HttpErrorResponse;
      } else {
        console.error(e);
        this.toastService.showErrorToast('Failed to update tag');
      }
    }
    return;
  }

  async delete(uuid: string) {
    try {
      return await firstValueFrom(this.http.delete<TagDto>(`${this.url}/${uuid}`));
    } catch (e) {
      const res = e as HttpErrorResponse;
      if (res.error.statusCode === HttpStatusCode.Conflict && res.error.message.includes('update or delete on table')) {
        throw e as HttpErrorResponse;
      } else {
        console.error(e);
        this.toastService.showErrorToast('Failed to delete tag');
      }
    }
    return;
  }
}
