import { Module } from '@nestjs/common';
import { InquiryDocumentController } from './inquiry-document/inquiry-document.controller';
import { InquiryDocumentService } from './inquiry-document/inquiry-document.service';
import { InquiryParcelController } from './inquiry-parcel/inquiry-parcel.controller';
import { InquiryParcelService } from './inquiry-parcel/inquiry-parcel.service';
import { InquiryController } from './inquiry.controller';
import { InquiryService } from './inquiry.service';
import { InquiryProfile } from '../../common/automapper/inquiry.automapper.profile';

@Module({
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
})
export class InquiryModule {}
