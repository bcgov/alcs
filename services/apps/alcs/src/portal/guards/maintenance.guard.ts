import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FastifyRequest } from 'fastify';
import { Repository } from 'typeorm';
import {
  CONFIG_VALUE,
  Configuration,
} from '../../common/entities/configuration.entity';

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(
    @InjectRepository(Configuration)
    private configurationRepository: Repository<Configuration>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: FastifyRequest = context.switchToHttp().getRequest();

    //Don't fire for CORS requests
    if (req.method === 'OPTIONS') {
      return true;
    }

    const routeUrl = req.routeOptions.url;

    if (
      routeUrl &&
      (routeUrl.startsWith('/portal') ||
        routeUrl.startsWith('/public') ||
        routeUrl.startsWith('/api/portal') ||
        routeUrl.startsWith('/api/public'))
    ) {
      const maintenanceMode = await this.configurationRepository.findOne({
        where: {
          name: CONFIG_VALUE.PORTAL_MAINTENANCE_MODE,
        },
      });

      if (maintenanceMode && maintenanceMode.value === 'true') {
        throw new HttpException(
          'Portal is in Maintenance Mode',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }

    return true;
  }
}
