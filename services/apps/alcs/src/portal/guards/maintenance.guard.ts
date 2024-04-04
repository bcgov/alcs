import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CONFIG_VALUE,
  Configuration,
} from '../../common/entities/configuration.entity';
import { FastifyRequest } from 'fastify';

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

    if (
      req.routeOptions.url.startsWith('/portal') ||
      req.routeOptions.url.startsWith('/public') ||
      req.routeOptions.url.startsWith('/api/portal') ||
      req.routeOptions.url.startsWith('/api/public')
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

      // TODO: Add ALCS banner
      const maintenanceBanner = await this.configurationRepository.findOne({
        where: {
          name: CONFIG_VALUE.APP_MAINTENANCE_BANNER,
        },
      });

      if (maintenanceBanner && maintenanceBanner.value === 'true') {
        const httpResponse = context.switchToHttp().getResponse();
        httpResponse.status(HttpStatus.OK);
        httpResponse.send({
          status: 'info',
          message: 'Maintenance Banner Displayed',
          showMaintenanceBanner: true,
        });
      }
    }

    return true;
  }
}
