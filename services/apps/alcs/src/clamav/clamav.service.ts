import { CONFIG_TOKEN, IConfig } from '@app/common/config/config.module';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as NodeClam from 'clamscan';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ClamAVService {
  private logger = new Logger(ClamAVService.name);
  private scanner: NodeClam;
  private readonly isEnabled = false;

  constructor(
    @Inject(CONFIG_TOKEN) private config: IConfig,
    private httpService: HttpService,
  ) {
    this.isEnabled = this.config.get('CLAMAV.ENABLED');
    if (this.isEnabled) {
      this.initClam();
    }
  }

  private async initClam() {
    this.scanner = await new NodeClam().init({
      clamdscan: {
        host: this.config.get('CLAMAV.HOST'),
        port: this.config.get('CLAMAV.PORT'),
      },
    });
  }

  async scanFile(fileUrl: string) {
    if (!this.isEnabled) {
      return true;
    }

    const response = await this.downloadFileAsStream(fileUrl);

    try {
      const { isInfected } = await this.scanner.scanStream(response.data);
      return isInfected;
    } catch (err) {
      //TODO: What do we do if ClamAV is down?
      this.logger.error(err);
    }
  }

  private async downloadFileAsStream(url) {
    const response = await this.httpService.get(url, {
      responseType: 'stream',
    });
    return firstValueFrom(response);
  }
}
