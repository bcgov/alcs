import { Injectable } from '@nestjs/common';
import { createMap, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { Document } from './document.entity';
import { DocumentDto } from './document.dto';

@Injectable()
export class DocumentProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, Document, DocumentDto);
    };
  }
}
