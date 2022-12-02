export class HealthCheckDbDto {
  read?: boolean;
  write?: boolean;
}

export class HealthCheckDto {
  alive: boolean;
  db: HealthCheckDbDto;
}
