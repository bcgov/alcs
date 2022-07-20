import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ApplicationDto {
  @IsNotEmpty()
  @IsString()
  fileNumber: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  body: string;

  @IsNotEmpty()
  @IsString()
  status: string;
}

export class ApplicationPartialDto {
  @IsNotEmpty()
  @IsString()
  fileNumber: string;

  @IsOptional()
  title?: string;

  @IsOptional()
  body?: string;

  @IsOptional()
  status?: string;
}
