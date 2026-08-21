import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AnalyzeInspectionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  serialNo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cameraCode?: string;

  @IsOptional()
  @IsBoolean()
  simulateDefect?: boolean;
}
