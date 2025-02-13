import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  type OnInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { map, Observable, of, startWith, Subject, takeUntil, tap } from 'rxjs';
import { TagDto } from '../../../services/tag/tag.dto';
import { TagService } from '../../../services/tag/tag.service';
import { ApplicationDto } from '../../../services/application/application.dto';
import { NoticeOfIntentDto } from '../../../services/notice-of-intent/notice-of-intent.dto';
import { CommissionerApplicationDto } from '../../../services/commissioner/commissioner.dto';
import { NotificationDto } from '../../../services/notification/notification.dto';
import { ApplicationTagDto } from '../../../services/application/application-tag/application-tag.dto';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { ToastService } from '../../../services/toast/toast.service';
import { FileTagService } from '../../../services/common/file-tag.service';

@Component({
  selector: 'app-tags-header',
  templateUrl: './tags-header.component.html',
  styleUrl: './tags-header.component.scss',
})
export class TagsHeaderComponent implements OnInit, OnChanges {
  destroy = new Subject<void>();
  tags: TagDto[] = [];
  allTags: TagDto[] = [];
  filteredTags: Observable<TagDto[]> = of([]);
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagControl = new FormControl();
  allTagsReceived: boolean = false;

  hovered = false;
  clicked = false;
  firstClicked = false;
  selectClicked = false;
  selectTyped = false;
  addTyped = false;
  showPlaceholder = false;

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement> | undefined;
  @ViewChild(MatAutocompleteTrigger) autoCompleteTrigger!: MatAutocompleteTrigger;

  @Input() application: ApplicationDto | CommissionerApplicationDto | NoticeOfIntentDto | NotificationDto | undefined;
  @Input() isHidden: boolean = false;

  constructor(
    private tagService: TagService,
    private fileTagService: FileTagService,
    private confirmationDialogService: ConfirmationDialogService,
    private toastService: ToastService,
    private elementRef: ElementRef,
  ) {}

  ngOnInit(): void {
    this.filteredTags = this.tagControl.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => this.filterTags(name || '')),
    );

    this.fetchTags();
    this.tagService.$tags.pipe(takeUntil(this.destroy)).subscribe((result: { data: TagDto[]; total: number }) => {
      this.allTags = result.data.filter((tag) => tag.isActive);
      this.allTagsReceived = true;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['application'] && changes['application'].currentValue !== undefined) {
      this.initFileTags();
    }
  }

  onClick(): void {
    this.clicked = true;
    if (!this.firstClicked) {
      this.firstClicked = true;
      this.tagControl.setValue('');
    }
  }

  async fetchTags() {
    await this.tagService.fetch(0, 0);
  }

  async initFileTags() {
    const res = await this.fileTagService.getTags(this.application?.fileNumber!);
    this.tags = res!;
  }

  private filterTags(value: string): TagDto[] {
    const filterValue = value.toLowerCase();
    return this.allTags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(filterValue) && !this.tags.some((selectedTag) => selectedTag.uuid === tag.uuid),
    );
  }

  async add(appTagDto: ApplicationTagDto) {
    const res = await this.fileTagService.addTag(this.application?.fileNumber!, appTagDto);
    this.tags = res ? res : this.tags;
    this.tagControl.setValue('');
  }

  async remove(tagName: string) {
    const res = await this.fileTagService.deleteTag(this.application?.fileNumber!, tagName);
    this.tags = res ? res : this.tags;
  }

  addTag(event: { input: HTMLInputElement; value: string }) {
    const value = event.value.trim().toLowerCase();
    const tagToAdd = this.allTags.find((tag) => tag.name.toLowerCase() === value);

    if (tagToAdd) {
      const appTagDto: ApplicationTagDto = {
        tagName: tagToAdd.name,
      };

      this.add(appTagDto);
      this.addTyped = true;
    }
  }

  removeTag(tag: TagDto): void {
    const index = this.tags.findIndex((t) => t.uuid === tag.uuid);

    if (index >= 0) {
      const tagName = this.tags[index].name;
      this.confirmationDialogService
        .openDialog({
          body: `Are you sure you want to remove the tag <b> ${tagName} </b>?`,
        })
        .subscribe(async (confirmed) => {
          if (confirmed) {
            this.remove(tagName);
            this.toastService.showSuccessToast(`Tag ${tagName} successfully removed`);
          }
        });
    }
  }

  selectTag(event: MatAutocompleteSelectedEvent) {
    const selectedTag = event.option.value as TagDto;

    if (!this.tags.find((tag) => tag.uuid === selectedTag.uuid)) {
      const appTagDto: ApplicationTagDto = {
        tagName: selectedTag.name,
      };

      this.add(appTagDto);
      this.tagInput!.nativeElement.value = '';
      if (!this.selectClicked) {
        this.selectTyped = true;
      }
    }
  }

  @HostListener('document:click', ['$event.target'])
  public onDocumentClick(targetElement: HTMLElement): void {
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);

    if (!clickedInside) {
      if (!this.selectClicked || this.selectTyped || this.addTyped) {
        this.clicked = false;
      }
    }

    if (this.selectClicked) {
      this.selectClicked = false;
    }

    if (this.selectTyped) {
      this.selectTyped = false;
    }

    if (this.addTyped) {
      this.addTyped = false;
    }
  }

  markClicked() {
    this.selectClicked = true;
  }
}
