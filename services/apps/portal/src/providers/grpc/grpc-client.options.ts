import * as grpc from '@grpc/grpc-js';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import * as config from 'config';
import * as fs from 'fs';
import { join } from 'path';
import { grpcPackagesNames } from './grpc.packages';

const key = fs.readFileSync(
  join(config.get('GRPC.CERT_FOLDER'), config.get('GRPC.KEY')),
);

const cert = fs.readFileSync(
  join(config.get('GRPC.CERT_FOLDER'), config.get('GRPC.CERT')),
);

const root = fs.readFileSync(
  join(config.get('GRPC.CERT_FOLDER'), config.get('GRPC.ROOT_CERT')),
);

const findFilesInDir = (startPath, filter): string[] => {
  let result: string[] = [];

  if (!fs.existsSync(startPath)) {
    console.error(
      'Error: ALCS -> grpc.options.config -> proto directory not specified ',
      startPath,
    );
    return [];
  }

  const files = fs.readdirSync(startPath);
  for (let i = 0; i < files.length; i++) {
    const filename = join(startPath, files[i]);
    const stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      result = result.concat(findFilesInDir(filename, filter) || ''); //recurse
    } else if (filename.indexOf(filter) >= 0) {
      result.push(filename);
    }
  }

  return result;
};

const protoFilesPath = findFilesInDir(__dirname, '.proto');
console.debug('Proto files:', protoFilesPath);

export const grpcClientOptions: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    package: grpcPackagesNames,
    url: config.get('PORTAL.ALCS_GRPC_URL'),
    credentials: grpc.credentials.createSsl(root, key, cert),
    protoPath: findFilesInDir(__dirname, '.proto'),
  },
};
