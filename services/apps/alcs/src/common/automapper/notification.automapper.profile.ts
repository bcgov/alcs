import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { NotificationDocumentDto } from '../../alcs/notification/notification-document/notification-document.dto';
import { NotificationDocument } from '../../alcs/notification/notification-document/notification-document.entity';
import { NotificationTypeDto } from '../../alcs/notification/notification-type/notification-type.dto';
import { NotificationType } from '../../alcs/notification/notification-type/notification-type.entity';
import { NotificationDto } from '../../alcs/notification/notification.dto';
import { Notification } from '../../alcs/notification/notification.entity';
import { DocumentCode } from '../../document/document-code.entity';
import { DocumentTypeDto } from '../../document/document.dto';

@Injectable()
export class NotificationProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(mapper, NotificationType, NotificationTypeDto);

      createMap(
        mapper,
        Notification,
        NotificationDto,
        forMember(
          (a) => a.dateSubmittedToAlc,
          mapFrom((ad) => ad.dateSubmittedToAlc?.getTime()),
        ),
      );

      createMap(
        mapper,
        NotificationDocument,
        NotificationDocumentDto,
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
