import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoticeOfIntentSubtype } from '../../notice-of-intent/notice-of-intent-subtype.entity';
import { NoticeOfIntentSubtypeDto } from '../../notice-of-intent/notice-of-intent.dto';

@Injectable()
export class NoiSubtypeService {
  constructor(
    @InjectRepository(NoticeOfIntentSubtype)
    private noticeOfIntentSubtypeRepository: Repository<NoticeOfIntentSubtype>,
  ) {}

  async fetch() {
    return await this.noticeOfIntentSubtypeRepository.find({
      order: { label: 'ASC' },
    });
  }

  async getOneOrFail(code: string) {
    return await this.noticeOfIntentSubtypeRepository.findOneOrFail({
      where: { code },
    });
  }

  async update(code: string, updateDto: NoticeOfIntentSubtypeDto) {
    const subtype = await this.getOneOrFail(code);

    subtype.description = updateDto.description;
    subtype.label = updateDto.label;
    subtype.isActive = updateDto.isActive;

    return await this.noticeOfIntentSubtypeRepository.save(subtype);
  }

  async create(createDto: NoticeOfIntentSubtypeDto) {
    const subtype = new NoticeOfIntentSubtype();

    subtype.code = createDto.code;
    subtype.description = createDto.description;
    subtype.label = createDto.label;
    subtype.isActive = createDto.isActive;

    return await this.noticeOfIntentSubtypeRepository.save(subtype);
  }
}
