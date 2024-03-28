import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import {
  ANY_AUTH_ROLE,
  ROLES_ALLOWED_BOARDS,
} from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { formatIncomingDate } from '../../utils/incoming-date.formatter';
import { BoardService } from '../board/board.service';
import { InquiryType } from './inquiry-type.entity';
import {
  CreateInquiryDto,
  InquiryDto,
  InquiryTypeDto,
  UpdateInquiryDto,
} from './inquiry.dto';
import { Inquiry } from './inquiry.entity';
import { InquiryService } from './inquiry.service';

@Controller('inquiry')
@UseGuards(RolesGuard)
export class InquiryController {
  constructor(
    private inquiryService: InquiryService,
    private boardService: BoardService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('types')
  @UserRoles(...ANY_AUTH_ROLE)
  async getTypes() {
    const types = await this.inquiryService.listTypes();
    return this.mapper.mapArray(types, InquiryType, InquiryTypeDto);
  }

  @Post()
  @UserRoles(...ANY_AUTH_ROLE)
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

  @Patch(':fileNumber')
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Param('fileNumber') fileNumber: string,
    @Body() updateDto: UpdateInquiryDto,
    @Req() req,
  ) {
    const updatedInquiry = await this.inquiryService.update(
      fileNumber,
      updateDto,
      req.user.entity,
    );
    return this.mapper.map(updatedInquiry, Inquiry, InquiryDto);
  }

  @Get(':fileNumber')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async get(@Param('fileNumber') fileNumber: string) {
    const notification = await this.inquiryService.getByFileNumber(fileNumber);
    const mapped = await this.inquiryService.mapToDtos([notification]);
    return mapped[0];
  }

  @Get('/card/:uuid')
  @UserRoles(...ROLES_ALLOWED_BOARDS)
  async getByCard(@Param('uuid') cardUuid: string) {
    const notification = await this.inquiryService.getByCardUuid(cardUuid);
    const mapped = await this.inquiryService.mapToDtos([notification]);
    return mapped[0];
  }
}
