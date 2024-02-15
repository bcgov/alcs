import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { filterUndefined } from '../../../utils/undefined';
import { ApplicationDecisionComponent } from '../application-decision-v2/application-decision/component/application-decision-component.entity';
import { ApplicationDecisionComponentService } from '../application-decision-v2/application-decision/component/application-decision-component.service';
import {
  CreateApplicationBoundaryAmendmentDto,
  UpdateApplicationBoundaryAmendmentDto,
} from './application-boundary-amendment.dto';
import { ApplicationBoundaryAmendment } from './application-boundary-amendment.entity';

@Injectable()
export class ApplicationBoundaryAmendmentService {
  private DEFAULT_RELATIONS: FindOptionsRelations<ApplicationBoundaryAmendment> =
    {
      decisionComponents: {
        applicationDecisionComponentType: true,
        applicationDecision: true,
      },
    };

  constructor(
    @InjectRepository(ApplicationBoundaryAmendment)
    private applicationBoundaryAmendmentRepository: Repository<ApplicationBoundaryAmendment>,
    private applicationDecisionComponentService: ApplicationDecisionComponentService,
  ) {}

  async list(fileNumber: string) {
    return this.applicationBoundaryAmendmentRepository.find({
      where: {
        fileNumber,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async create(fileNumber: string, dto: CreateApplicationBoundaryAmendmentDto) {
    const components: ApplicationDecisionComponent[] = [];
    for (const uuid of dto.decisionComponentUuids) {
      const component =
        await this.applicationDecisionComponentService.getOneOrFail(uuid);
      components.push(component);
    }

    return this.applicationBoundaryAmendmentRepository.save(
      new ApplicationBoundaryAmendment({
        ...dto,
        decisionComponents: components,
        fileNumber,
      }),
    );
  }

  async update(uuid: string, dto: UpdateApplicationBoundaryAmendmentDto) {
    const amendment =
      await this.applicationBoundaryAmendmentRepository.findOneOrFail({
        where: {
          uuid,
        },
      });

    amendment.type = filterUndefined(dto.type, amendment.type);
    amendment.area = filterUndefined(dto.area, amendment.area);
    amendment.year = filterUndefined(dto.year, amendment.year);
    amendment.period = filterUndefined(dto.period, amendment.period);

    if (dto.decisionComponentUuids) {
      const components: ApplicationDecisionComponent[] = [];
      for (const uuid of dto.decisionComponentUuids) {
        const component =
          await this.applicationDecisionComponentService.getOneOrFail(uuid);
        components.push(component);
      }
      amendment.decisionComponents = components;
    }

    return this.applicationBoundaryAmendmentRepository.save(amendment);
  }

  async delete(uuid: string) {
    const amendment =
      await this.applicationBoundaryAmendmentRepository.findOneOrFail({
        where: {
          uuid,
        },
      });
    return this.applicationBoundaryAmendmentRepository.remove(amendment);
  }
}
