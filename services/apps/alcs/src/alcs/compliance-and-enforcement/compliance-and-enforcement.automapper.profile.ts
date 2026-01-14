import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom, Mapper } from 'automapper-core';
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs';
import { AllegedActivity, ComplianceAndEnforcement, InitialSubmissionType } from './compliance-and-enforcement.entity';
import { ComplianceAndEnforcementDto, UpdateComplianceAndEnforcementDto } from './compliance-and-enforcement.dto';
import { In } from 'typeorm';
import { ComplianceAndEnforcementSubmitter } from './submitter/submitter.entity';
import {
  ComplianceAndEnforcementSubmitterDto,
  UpdateComplianceAndEnforcementSubmitterDto,
} from './submitter/submitter.dto';
import { ComplianceAndEnforcementProperty } from './property/property.entity';
import { ComplianceAndEnforcementPropertyDto } from './property/property.dto';
import { User } from '../../user/user.entity';
import { UserDto } from '../../user/user.dto';

@Injectable()
export class ComplianceAndEnforcementProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        ComplianceAndEnforcement,
        ComplianceAndEnforcementDto,
        forMember(
          (dto) => dto.dateSubmitted,
          mapFrom((entity) => entity.dateSubmitted?.getTime()),
        ),
        forMember(
          (dto) => dto.dateOpened,
          mapFrom((entity) => entity.dateOpened?.getTime()),
        ),
        forMember(
          (dto) => dto.dateClosed,
          mapFrom((entity) => entity.dateClosed?.getTime()),
        ),
        forMember(
          (dto) => dto.initialSubmissionType,
          mapFrom((entity) =>
            entity.initialSubmissionType !== null ? (entity.initialSubmissionType as string) : null,
          ),
        ),
        forMember(
          (dto) => dto.allegedActivity,
          mapFrom((entity) =>
            entity.allegedActivity ? entity.allegedActivity.map((activity) => activity as string) : [],
          ),
        ),
        forMember(
          (dto) => dto.submitters,
          mapFrom((entity) =>
            entity.submitters !== undefined
              ? this.mapper.mapArray(
                  entity.submitters,
                  ComplianceAndEnforcementSubmitter,
                  ComplianceAndEnforcementSubmitterDto,
                )
              : entity.submitters,
          ),
        ),
        forMember(
          (dto) => dto.property,
          mapFrom((entity) =>
            entity.properties !== undefined
              ? this.mapper.map(
                  entity.properties[0],
                  ComplianceAndEnforcementProperty,
                  ComplianceAndEnforcementPropertyDto,
                )
              : entity.properties,
          ),
        ),
        forMember(
          (dto) => dto.chronologyClosedAt,
          mapFrom((entity) => entity.chronologyClosedAt?.getTime()),
        ),
        forMember(
          (dto) => dto.chronologyClosedBy,
          mapFrom((entity) => {
            return entity.chronologyClosedBy
              ? this.mapper.map(entity.chronologyClosedBy, User, UserDto)
              : entity.chronologyClosedBy;
          }),
        ),
        forMember(
          (dto) => dto.assignee,
          mapFrom((entity) => {
            return entity.assignee ? this.mapper.map(entity.assignee, User, UserDto) : entity.assignee;
          }),
        ),
      );

      createMap(
        mapper,
        UpdateComplianceAndEnforcementDto,
        ComplianceAndEnforcement,
        forMember(
          (entity) => entity.dateSubmitted,
          mapFrom((dto) =>
            dto.dateSubmitted !== undefined && dto.dateSubmitted !== null
              ? new Date(dto.dateSubmitted)
              : dto.dateSubmitted,
          ),
        ),
        forMember(
          (entity) => entity.dateOpened,
          mapFrom((dto) =>
            dto.dateOpened !== undefined && dto.dateOpened !== null ? new Date(dto.dateOpened) : dto.dateOpened,
          ),
        ),
        forMember(
          (entity) => entity.dateClosed,
          mapFrom((dto) =>
            dto.dateClosed !== undefined && dto.dateClosed !== null ? new Date(dto.dateClosed) : dto.dateClosed,
          ),
        ),
        forMember(
          (entity) => entity.initialSubmissionType,
          mapFrom((dto) =>
            dto.initialSubmissionType !== null && dto.initialSubmissionType !== undefined
              ? (dto.initialSubmissionType as InitialSubmissionType)
              : dto.initialSubmissionType,
          ),
        ),
        forMember(
          (entity) => entity.allegedActivity,
          mapFrom((dto) =>
            dto.allegedActivity !== undefined
              ? dto.allegedActivity.map((activity) => activity as AllegedActivity)
              : dto.allegedActivity,
          ),
        ),
        forMember(
          (entity) => entity.submitters,
          mapFrom((dto) =>
            dto.submitters !== undefined
              ? this.mapper.mapArray(
                  dto.submitters,
                  UpdateComplianceAndEnforcementSubmitterDto,
                  ComplianceAndEnforcementSubmitter,
                )
              : undefined,
          ),
        ),
        forMember(
          (entity) => entity.chronologyClosedAt,
          mapFrom((dto) =>
            dto.chronologyClosedAt !== undefined && dto.chronologyClosedAt !== null
              ? new Date(dto.chronologyClosedAt)
              : dto.chronologyClosedAt,
          ),
        ),
      );
    };
  }
}
