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

export const grpcClientOptions: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    package: grpcPackagesNames,
    url: config.get('GRPC.URL'),
    credentials: grpc.credentials.createSsl(root, key, cert),
    protoPath: config.get('GRPC.PROTO'),
  },
};
