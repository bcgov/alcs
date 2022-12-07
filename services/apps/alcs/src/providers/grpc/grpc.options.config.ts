import { GrpcOptions, Transport } from '@nestjs/microservices';
import { addReflectionToGrpcConfig } from 'nestjs-grpc-reflection';

// disable till we get certificates in deployed env

// const key = fs.readFileSync(
//   join(config.get('GRPC.CERT_FOLDER'), config.get('GRPC.KEY')),
// );

// const cert = fs.readFileSync(
//   join(config.get('GRPC.CERT_FOLDER'), config.get('GRPC.CERT')),
// );

// const root = fs.readFileSync(
//   join(config.get('GRPC.CERT_FOLDER'), config.get('GRPC.ROOT_CERT')),
// );

// export const grpcOptions: GrpcOptions = addReflectionToGrpcConfig({
//   transport: Transport.GRPC,
//   options: {
//     package: grpcPackagesNames,
//     url: config.get('GRPC.URL'),
//     credentials: ServerCredentials.createSsl(
//       root,
//       [
//         {
//           cert_chain: cert,
//           private_key: key,
//         },
//       ],
//       true,
//     ),
//     protoPath: config.get('GRPC.PROTO'),
//   },
// });

export const grpcOptions: GrpcOptions = addReflectionToGrpcConfig({
  transport: Transport.GRPC,
  options: {
    package: 'mock',
    protoPath: '',
  },
});
