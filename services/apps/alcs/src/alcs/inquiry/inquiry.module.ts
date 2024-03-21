import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InquiryProfile } from '../../common/automapper/inquiry.automapper.profile';
import { DocumentModule } from '../../document/document.module';
import { FileNumberModule } from '../../file-number/file-number.module';
import { CardModule } from '../card/card.module';
import { InquiryDocumentController } from './inquiry-document/inquiry-document.controller';
import { InquiryDocument } from './inquiry-document/inquiry-document.entity';
import { InquiryDocumentService } from './inquiry-document/inquiry-document.service';
import { InquiryParcelController } from './inquiry-parcel/inquiry-parcel.controller';
import { InquiryParcel } from './inquiry-parcel/inquiry-parcel.entity';
import { InquiryParcelService } from './inquiry-parcel/inquiry-parcel.service';
import { InquiryType } from './inquiry-type.entity';
import { InquiryController } from './inquiry.controller';
import { Inquiry } from './inquiry.entity';
import { InquiryService } from './inquiry.service';
import { DocumentCode } from '../../document/document-code.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inquiry,
      InquiryType,
      InquiryDocument,
      InquiryParcel,
      DocumentCode,
    ]),
    CardModule,
    FileNumberModule,
    DocumentModule,
  ],
  providers: [
    InquiryService,
    InquiryParcelService,
    InquiryDocumentService,
    InquiryProfile,
  ],
  controllers: [
    InquiryController,
    InquiryParcelController,
    InquiryDocumentController,
  ],
  exports: [InquiryProfile, InquiryService],
})
export class InquiryModule {}
