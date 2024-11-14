import { Injectable } from '@angular/core';
import { ApplicationTagDto } from '../application/application-tag/application-tag.dto';
import { TagDto } from '../tag/tag.dto';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export abstract class FileTagService {
  constructor(
    protected http: HttpClient,
    protected toastService: ToastService,
  ) {}

  abstract getTags(filenumber: string): Promise<TagDto[] | undefined>;
  abstract addTag(fileNumber: string, applicationTagDto: ApplicationTagDto): Promise<TagDto[] | undefined>;
  abstract deleteTag(fileNymber: string, tagName: string): Promise<TagDto[] | undefined>;
}
