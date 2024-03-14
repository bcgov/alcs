import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { InquiryDocumentDto } from '../../alcs/inquiry/inquiry-document/inquiry-document.dto';
import { InquiryDocument } from '../../alcs/inquiry/inquiry-document/inquiry-document.entity';
import { InquiryType } from '../../alcs/inquiry/inquiry-type.entity';
import { InquiryDto, InquiryTypeDto } from '../../alcs/inquiry/inquiry.dto';
import { Inquiry } from '../../alcs/inquiry/inquiry.entity';
import { DocumentCode } from '../../document/document-code.entity';
import { DocumentTypeDto } from '../../document/document.dto';

@Injectable()
export class InquiryProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, InquiryType, InquiryTypeDto);

      createMap(
        mapper,
        Inquiry,
        InquiryDto,
        forMember(
          (a) => a.dateSubmittedToAlc,
          mapFrom((ad) => ad.dateSubmittedToAlc?.getTime()),
        ),
      );

      createMap(
        mapper,
        InquiryDocument,
        InquiryDocumentDto,
        forMember(
          (a) => a.mimeType,
          mapFrom((ad) => ad.document.mimeType),
        ),
        forMember(
          (a) => a.fileName,
          mapFrom((ad) => ad.document.fileName),
        ),
        forMember(
          (a) => a.fileSize,
          mapFrom((ad) => ad.document.fileSize),
        ),
        forMember(
          (a) => a.uploadedBy,
          mapFrom((ad) => ad.document.uploadedBy?.name),
        ),
        forMember(
          (a) => a.uploadedAt,
          mapFrom((ad) => ad.document.uploadedAt.getTime()),
        ),
        forMember(
          (a) => a.documentUuid,
          mapFrom((ad) => ad.document.uuid),
        ),
        forMember(
          (a) => a.source,
          mapFrom((ad) => ad.document.source),
        ),
        forMember(
          (a) => a.system,
          mapFrom((ad) => ad.document.system),
        ),
      );
      createMap(mapper, DocumentCode, DocumentTypeDto);
    };
  }
}
