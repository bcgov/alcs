import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, ViewChild, type OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, Observable, of, startWith, Subject, takeUntil } from 'rxjs';
import { TagDto } from '../../../services/tag/tag.dto';
import { TagService } from 'src/app/services/tag/tag.service';

@Component({
  selector: 'app-tags-header',
  templateUrl: './tags-header.component.html',
  styleUrl: './tags-header.component.scss',
})
export class TagsHeaderComponent implements OnInit {
  destroy = new Subject<void>();
  tags: TagDto[] = [];
  allTags: TagDto[] = [];
  filteredTags: Observable<TagDto[]> = of([]);
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagControl = new FormControl();

  hovered = false;
  showPlaceholder = false;

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement> | undefined;

  constructor(private tagService: TagService) {}

  ngOnInit(): void {
    this.filteredTags = this.tagControl.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => this.filterTags(name || '')),
    );

    this.fetchTags();
    this.tagService.$tags.pipe(takeUntil(this.destroy)).subscribe((result: { data: TagDto[]; total: number }) => {
      this.allTags = result.data;
      console.log(this.allTags);
    });
  }

  async fetchTags() {
    this.tagService.fetch(0, 0);
  }
  private filterTags(value: string): TagDto[] {
    const filterValue = value.toLowerCase();
    return this.allTags.filter(
      (tag) =>
        tag.name.toLowerCase().startsWith(filterValue) &&
        !this.tags.some((selectedTag) => selectedTag.uuid === tag.uuid),
    );
  }

  addTag(event: { input: HTMLInputElement; value: string }): void {
    const value = event.value.trim().toLowerCase();
    const tagToAdd = this.allTags.find((tag) => tag.name.toLowerCase() === value);
    if (tagToAdd && !this.tags.find((tag) => tag.uuid === tagToAdd.uuid)) {
      this.tags.push(tagToAdd);
      this.tagControl.setValue('');
    }
    event.input.value = '';
  }

  removeTag(tag: TagDto): void {
    const index = this.tags.findIndex((t) => t.uuid === tag.uuid);
    if (index >= 0) {
      this.tags.splice(index, 1);
      this.tagControl.setValue('');
    }
  }

  selectTag(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value as TagDto;
    if (!this.tags.find((tag) => tag.uuid === value.uuid)) {
      this.tags.push(value);
      this.tagInput!.nativeElement.value = '';
      this.tagControl.setValue('');
    }
  }
}
