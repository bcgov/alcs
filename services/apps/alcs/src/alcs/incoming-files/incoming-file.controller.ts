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
    const mappedReconsiderations =
      await this.getMappedIncomingReconsiderations();

    const boardCodeToFiles: IncomingFileBoardMapDto = {};
    [...mappedApps, ...mappedReconsiderations].forEach((mappedFile) => {
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
      user.name = incomingFile.name;
      user.givenName = incomingFile.given_name;
      user.familyName = incomingFile.family_name;
      return {
        fileNumber: incomingFile.file_number,
        applicant: incomingFile.applicant,
        boardCode: incomingFile.code,
        type: CARD_TYPE.APP,
        assignee: this.mapper.map(user, User, UserDto),
      };
    });
  }

  private async getMappedIncomingReconsiderations() {
    const incomingReconsiderations =
      await this.applicationService.getIncomingReconsiderationFiles();
    return incomingReconsiderations.map((incomingFile): IncomingFileDto => {
      const user = new User();
      user.name = incomingFile.name;
      user.givenName = incomingFile.given_name;
      user.familyName = incomingFile.family_name;
      return {
        fileNumber: incomingFile.file_number,
        applicant: incomingFile.applicant,
        boardCode: incomingFile.code,
        type: CARD_TYPE.APP,
        assignee: this.mapper.map(user, User, UserDto),
      };
    });
  }
}
