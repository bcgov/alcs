import { ServiceNotFoundException } from '@app/common/exceptions/base.exception';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  IsNull,
  Like,
  Not,
  Repository,
} from 'typeorm';
import { FileNumberService } from '../../file-number/file-number.service';
import { User } from '../../user/user.entity';
import { formatIncomingDate } from '../../utils/incoming-date.formatter';
import { filterUndefined } from '../../utils/undefined';
import { Board } from '../board/board.entity';
import { CARD_TYPE } from '../card/card-type/card-type.entity';
import { CardService } from '../card/card.service';
import { CodeService } from '../code/code.service';
import { LocalGovernmentService } from '../local-government/local-government.service';
import { InquiryParcel } from './inquiry-parcel/inquiry-parcel.entity';
import { InquiryType } from './inquiry-type.entity';
import {
  CreateInquiryServiceDto,
  InquiryDto,
  UpdateInquiryDto,
} from './inquiry.dto';
import { Inquiry } from './inquiry.entity';

@Injectable()
export class InquiryService {
  private logger = new Logger(InquiryService.name);

  private CARD_RELATIONS = {
    board: true,
    type: true,
    status: true,
    assignee: true,
  };

  private DEFAULT_RELATIONS: FindOptionsRelations<Inquiry> = {
    card: this.CARD_RELATIONS,
    localGovernment: true,
    region: true,
    type: true,
    parcels: true,
  };

  constructor(
    private cardService: CardService,
    @InjectRepository(Inquiry)
    private repository: Repository<Inquiry>,
    @InjectRepository(InquiryType)
    private typeRepository: Repository<InquiryType>,
    @InjectMapper() private mapper: Mapper,
    private fileNumberService: FileNumberService,
    private localGovernmentService: LocalGovernmentService,
    private codeService: CodeService,
  ) {}

  async create(createDto: CreateInquiryServiceDto, board?: Board) {
    const fileNumber = await this.fileNumberService.generateNextFileNumber();

    const type = await this.typeRepository.findOneOrFail({
      where: {
        code: createDto.typeCode,
      },
    });

    const inquiry = new Inquiry({
      fileNumber: fileNumber,
      summary: createDto.summary,
      dateSubmittedToAlc: createDto.dateSubmittedToAlc,
      inquirerFirstName: createDto.inquirerFirstName,
      inquirerLastName: createDto.inquirerLastName,
      inquirerOrganization: createDto.inquirerOrganization,
      inquirerPhone: createDto.inquirerPhone,
      inquirerEmail: createDto.inquirerEmail,
      localGovernmentUuid: createDto.localGovernmentUuid,
      regionCode: createDto.regionCode,
      type,
    });

    if (board) {
      inquiry.card = await this.cardService.create(
        CARD_TYPE.INQUIRY,
        board,
        false,
      );
    }

    if (createDto.parcels) {
      inquiry.parcels = createDto.parcels.map(
        (parcel) =>
          new InquiryParcel({
            pid: parcel.pid,
            pin: parcel.pin,
            civicAddress: parcel.civicAddress,
          }),
      );
    }

    const savedInquiry = await this.repository.save(inquiry);
    return await this.getOrFailByUuid(savedInquiry.uuid);
  }

  async getOrFailByUuid(uuid: string) {
    const inquiry = await this.get(uuid);
    if (!inquiry) {
      throw new ServiceNotFoundException(
        `Failed to find inquiry with uuid ${uuid}`,
      );
    }

    return inquiry;
  }

  async mapToDtos(inquiries: Inquiry[]) {
    return this.mapper.mapArray(inquiries, Inquiry, InquiryDto);
  }

  async getByCardUuid(cardUuid: string) {
    const inquiry = await this.repository.findOne({
      where: { cardUuid },
      relations: this.DEFAULT_RELATIONS,
    });

    if (!inquiry) {
      throw new ServiceNotFoundException(
        `Failed to find inquiry with card uuid ${cardUuid}`,
      );
    }

    return inquiry;
  }

  getBy(findOptions: FindOptionsWhere<Inquiry>) {
    return this.repository.find({
      where: findOptions,
      relations: this.DEFAULT_RELATIONS,
    });
  }

  getDeletedCards(fileNumber: string) {
    return this.repository.find({
      where: {
        fileNumber,
        card: {
          auditDeletedDateAt: Not(IsNull()),
        },
      },
      withDeleted: true,
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getByBoard(boardUuid: string) {
    return this.repository.find({
      where: { card: { boardUuid } },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async getWithIncompleteSubtaskByType(subtaskType: string) {
    return this.repository.find({
      where: {
        card: {
          subtasks: {
            completedAt: IsNull(),
            type: {
              code: subtaskType,
            },
          },
        },
      },
      relations: {
        type: true,
        card: {
          status: true,
          board: true,
          type: true,
          subtasks: { type: true, assignee: true },
        },
      },
    });
  }

  async getByFileNumber(fileNumber: string) {
    return this.repository.findOneOrFail({
      where: { fileNumber },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async update(fileNumber: string, updateDto: UpdateInquiryDto, user?: User) {
    const inquiry = await this.getByFileNumber(fileNumber);

    inquiry.summary = filterUndefined(updateDto.summary, inquiry.summary);

    if (updateDto.typeCode) {
      const newType = await this.typeRepository.findOneByOrFail({
        code: updateDto.typeCode,
      });
      inquiry.typeCode = filterUndefined(updateDto.typeCode, inquiry.typeCode);
      inquiry.type = newType;
    }

    if (updateDto.localGovernmentUuid) {
      const newGovernment = await this.localGovernmentService.getByUuid(
        updateDto.localGovernmentUuid,
      );
      inquiry.localGovernment = newGovernment;
      inquiry.localGovernmentUuid = newGovernment.uuid;
    }

    if (updateDto.regionCode) {
      const newRegion = await this.codeService.fetchRegion(
        updateDto.regionCode,
      );
      inquiry.regionCode = newRegion.code;
      inquiry.region = newRegion;
    }

    inquiry.dateSubmittedToAlc = filterUndefined(
      formatIncomingDate(updateDto.dateSubmittedToAlc),
      inquiry.dateSubmittedToAlc,
    );

    inquiry.inquirerFirstName = filterUndefined(
      updateDto.inquirerFirstName,
      inquiry.inquirerFirstName,
    );

    inquiry.inquirerLastName = filterUndefined(
      updateDto.inquirerLastName,
      inquiry.inquirerLastName,
    );

    inquiry.inquirerOrganization = filterUndefined(
      updateDto.inquirerOrganization,
      inquiry.inquirerOrganization,
    );

    inquiry.inquirerPhone = filterUndefined(
      updateDto.inquirerPhone,
      inquiry.inquirerPhone,
    );

    inquiry.inquirerEmail = filterUndefined(
      updateDto.inquirerEmail,
      inquiry.inquirerEmail,
    );

    if (updateDto.open === false && inquiry.open && user) {
      inquiry.open = false;
      inquiry.closedDate = new Date();
      inquiry.closedBy = user;
    }

    if (updateDto.open === true && !inquiry.open) {
      inquiry.open = true;
      inquiry.closedDate = null;
      inquiry.closedBy = null;
    }

    if (updateDto.parcels) {
      inquiry.parcels = updateDto.parcels.map(
        (parcelDto) =>
          new InquiryParcel({
            uuid: parcelDto.uuid,
            pin: parcelDto.pin,
            pid: parcelDto.pid,
            civicAddress: parcelDto.civicAddress,
          }),
      );
    }

    await this.repository.save(inquiry);

    return this.getByFileNumber(inquiry.fileNumber);
  }

  async listTypes() {
    return this.typeRepository.find();
  }

  async searchByFileNumber(fileNumber: string) {
    return this.repository.find({
      where: {
        fileNumber: Like(`${fileNumber}%`),
      },
      order: {
        fileNumber: 'ASC',
      },
      relations: {
        region: true,
        localGovernment: true,
      },
    });
  }

  async getFileNumber(uuid: string) {
    const inquiry = await this.repository.findOneOrFail({
      where: {
        uuid,
      },
      select: {
        fileNumber: true,
      },
    });
    return inquiry.fileNumber;
  }

  async getUuid(fileNumber: string) {
    const inquiry = await this.repository.findOneOrFail({
      where: {
        fileNumber,
      },
      select: {
        uuid: true,
      },
    });
    return inquiry.uuid;
  }

  private get(uuid: string) {
    return this.repository.findOne({
      where: {
        uuid,
      },
      relations: {
        ...this.DEFAULT_RELATIONS,
        card: { ...this.CARD_RELATIONS, board: false },
      },
    });
  }
}
