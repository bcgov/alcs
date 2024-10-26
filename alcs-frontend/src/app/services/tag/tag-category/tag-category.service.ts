import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TagCategoryDto } from './tag-category.dto';
import { ToastService } from '../../toast/toast.service';

export interface PaginatedTagCategoryResponse {
  data: TagCategoryDto[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class TagCategoryService {
  private url = `${environment.apiUrl}/tag-category`;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  public $categories = new BehaviorSubject<PaginatedTagCategoryResponse>({ data: [], total: 0 });

  async fetch(pageIndex: number, itemsPerPage: number, search?: string) {
    const result = await this.search(pageIndex, itemsPerPage, search);
    if (result) {
      this.$categories.next(result);
    }
  }

  async search(pageIndex: number, itemsPerPage: number, search?: string) {
    const searchQuery = search ? `?search=${search}` : '';
    try {
      return await firstValueFrom(
        this.http.get<PaginatedTagCategoryResponse>(`${this.url}/${pageIndex}/${itemsPerPage}${searchQuery}`)
      );
    } catch (err) {
      console.error(err);
      this.toastService.showErrorToast('Failed to fetch tag categories');
    }
    return;
  }

  async create(createDto: TagCategoryDto) {
    try {
      return await firstValueFrom(this.http.post<TagCategoryDto>(`${this.url}`, createDto));
    } catch (e) {
      throw e;
    }
  }

  async update(uuid: string, updateDto: TagCategoryDto) {
    try {
      return await firstValueFrom(this.http.patch<TagCategoryDto>(`${this.url}/${uuid}`, updateDto));
    } catch (e) {
      throw e;
    }
  }

  async delete(code: string) {
    try {
      return await firstValueFrom(this.http.delete<TagCategoryDto>(`${this.url}/${code}`));
    } catch (e) {
      throw e;
    }
  }
}
