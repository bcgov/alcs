import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { NoticeOfIntentDto } from '../../alcs/notice-of-intent/notice-of-intent.dto';
import { NoticeOfIntent } from '../../alcs/notice-of-intent/notice-of-intent.entity';

@Injectable()
export class NoticeOfIntentProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, NoticeOfIntent, NoticeOfIntentDto);
    };
  }
}
