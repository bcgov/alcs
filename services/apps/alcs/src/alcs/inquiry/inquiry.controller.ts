import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import { ROLES_ALLOWED_BOARDS } from '../../common/authorization/roles';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { formatIncomingDate } from '../../utils/incoming-date.formatter';
import { BoardService } from '../board/board.service';
import { InquiryType } from './inquiry-type.entity';
import { CreateInquiryDto, InquiryDto, InquiryTypeDto } from './inquiry.dto';
import { Inquiry } from './inquiry.entity';
import { InquiryService } from './inquiry.service';

@Controller('inquiry')
export class InquiryController {
  constructor(
    private inquiryService: InquiryService,
    private boardService: BoardService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('types')
  async getTypes() {
    const types = await this.inquiryService.listTypes();
    return this.mapper.mapArray(types, InquiryType, InquiryTypeDto);
  }

  @Post()
  async create(@Body() createDto: CreateInquiryDto) {
    const targetBoard = await this.boardService.getOneOrFail({
      code: createDto.boardCode,
    });

    const createdInquiry = await this.inquiryService.create(
      {
        ...createDto,
        dateSubmittedToAlc: formatIncomingDate(createDto.submittedToAlcDate)!,
      },
      targetBoard,
    );
    return this.mapper.map(createdInquiry, Inquiry, InquiryDto);
  }

  @Get('/card/:uuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async getByCard(@Param('uuid') cardUuid: string) {
    const notification = await this.inquiryService.getByCardUuid(cardUuid);
    const mapped = await this.inquiryService.mapToDtos([notification]);
    return mapped[0];
  }
}
