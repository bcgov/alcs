import { GrpcOptions, Transport } from '@nestjs/microservices';

// const key = fs.readFileSync(
//   join(config.get('GRPC.CERT_FOLDER'), config.get('GRPC.KEY')),
// );

// const cert = fs.readFileSync(
//   join(config.get('GRPC.CERT_FOLDER'), config.get('GRPC.CERT')),
// );

// const root = fs.readFileSync(
//   join(config.get('GRPC.CERT_FOLDER'), config.get('GRPC.ROOT_CERT')),
// );

// export const grpcClientOptions: GrpcOptions = {
//   transport: Transport.GRPC,
//   options: {
//     package: grpcPackagesNames,
//     url: config.get('GRPC.URL'),
//     credentials: grpc.credentials.createSsl(root, key, cert),
//     protoPath: config.get('GRPC.PROTO'),
//   },
// };

export const grpcClientOptions: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'mock',
    protoPath: '',
  },
};
