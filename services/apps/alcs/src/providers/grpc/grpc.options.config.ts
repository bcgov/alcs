import { ServerCredentials } from '@grpc/grpc-js';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import * as config from 'config';
import * as fs from 'fs';
import { addReflectionToGrpcConfig } from 'nestjs-grpc-reflection';
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

export const grpcOptions: GrpcOptions = addReflectionToGrpcConfig({
  transport: Transport.GRPC,
  options: {
    package: grpcPackagesNames,
    url: config.get('GRPC.URL'),
    credentials: ServerCredentials.createSsl(
      root,
      [
        {
          cert_chain: cert,
          private_key: key,
        },
      ],
      true,
    ),
    protoPath: config.get('GRPC.PROTO'),
  },
});
