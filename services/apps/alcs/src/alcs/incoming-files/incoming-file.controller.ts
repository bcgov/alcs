import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { ApplicationService } from '../application/application.service';
import { InjectMapper } from 'automapper-nestjs';
import { Mapper } from 'automapper-core';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { ANY_AUTH_ROLE } from '../../common/authorization/roles';
import { IncomingFileBoardMapDto, IncomingFileDto } from './incoming-file.dto';
import { UserDto } from '../../user/user.dto';
import { CARD_TYPE } from '../card/card-type/card-type.entity';
import { User } from '../../user/user.entity';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('incoming-files')
@UseGuards(RolesGuard)
export class IncomingFileController {
  constructor(
    private applicationService: ApplicationService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Get('')
  @UserRoles(...ANY_AUTH_ROLE)
  async getIncomingFiles(): Promise<IncomingFileBoardMapDto> {
    const mappedApps = await this.getMappedIncomingApplications();

    const boardCodeToFiles: IncomingFileBoardMapDto = {};
    [...mappedApps].forEach((mappedFile) => {
      const boardFiles = boardCodeToFiles[mappedFile.boardCode] || [];
      boardFiles.push(mappedFile);
      boardCodeToFiles[mappedFile.boardCode] = boardFiles;
    });

    return boardCodeToFiles;
  }

  private async getMappedIncomingApplications() {
    const incomingApplications =
      await this.applicationService.getIncomingApplicationFiles();
    return incomingApplications.map((incomingFile): IncomingFileDto => {
      const user = new User();
      user.name = incomingFile.applicant;
      return {
        fileNumber: incomingFile.fileNumber,
        applicant: incomingFile.applicant,
        boardCode: incomingFile.code,
        type: CARD_TYPE.APP,
        assignee: this.mapper.map(user, User, UserDto),
      };
    });
  }
}
