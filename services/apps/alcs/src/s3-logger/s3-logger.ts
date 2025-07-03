import { Writable } from 'stream';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const MESSAGE_SYMBOL = Symbol.for('message');

interface RotatingS3WritableOptions {
  bucket: string;
  folder?: string;
  rotateEvery?: number;
  s3Client: S3Client;
}

export class RotatingS3Writable extends Writable {
  private buffer: string[] = [];
  private lastRotation: number;
  private currentKey: string;

  constructor(private options: RotatingS3WritableOptions) {
    super({ objectMode: true });

    this.lastRotation = Date.now();
    this.currentKey = this.generateKey(this.lastRotation);
  }

  _write(chunk: any, _encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    const message = chunk?.[MESSAGE_SYMBOL] ?? chunk?.message ?? '';

    if (message) {
      this.buffer.push(message);
    }

    const now = Date.now();

    if (this.options.rotateEvery && now - this.lastRotation >= this.options.rotateEvery) {
      this.flush()
        .then(() => {
          this.lastRotation = now;
          this.currentKey = this.generateKey(now);
          callback();
        })
        .catch(callback);
    } else {
      callback();
    }
  }

  private generateKey(dateMs: number): string {
    const date = new Date(dateMs);
    const year = date.getUTCFullYear();
    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const day = String(date.getUTCDate()).padStart(2, '0');

    const filename = `${year}-${month}-${day}-console.log`;
    const prefix = this.options.folder ? `${this.options.folder}/` : '';

    return `${prefix}${filename}`;
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const body = this.buffer.join('\n') + '\n';
    this.buffer = [];

    await this.options.s3Client.send(
      new PutObjectCommand({
        Bucket: this.options.bucket,
        Key: this.currentKey,
        Body: body,
        ContentType: 'text/plain',
      }),
    );
  }

  _final(callback: (error?: Error | null) => void) {
    this.flush()
      .then(() => callback())
      .catch(callback);
  }
}
