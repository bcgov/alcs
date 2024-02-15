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

  private get(uuid: string) {
    return this.applicationBoundaryAmendmentRepository.findOneOrFail({
      where: {
        uuid,
      },
      relations: this.DEFAULT_RELATIONS,
    });
  }

  async list(fileNumber: string) {
    return this.applicationBoundaryAmendmentRepository.find({
      where: {
        fileNumber,
      },
      relations: this.DEFAULT_RELATIONS,
      order: {
        auditCreatedAt: 'DESC',
      },
    });
  }

  async create(fileNumber: string, dto: CreateApplicationBoundaryAmendmentDto) {
    const components: ApplicationDecisionComponent[] = [];
    for (const uuid of dto.decisionComponentUuids) {
      const component =
        await this.applicationDecisionComponentService.getOneOrFail(uuid);
      components.push(component);
    }

    const savedAmendment =
      await this.applicationBoundaryAmendmentRepository.save(
        new ApplicationBoundaryAmendment({
          ...dto,
          decisionComponents: components,
          fileNumber,
        }),
      );
    return this.get(savedAmendment.uuid);
  }

  async update(uuid: string, dto: UpdateApplicationBoundaryAmendmentDto) {
    const amendment = await this.get(uuid);

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

    await this.applicationBoundaryAmendmentRepository.save(amendment);

    return this.get(amendment.uuid);
  }

  async delete(uuid: string) {
    const amendment = await this.get(uuid);
    await this.applicationBoundaryAmendmentRepository.remove(amendment);
    return amendment;
  }
}
