import { IsString, IsNotEmpty } from 'class-validator';

export class CreateStudyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  difficulty: string;

  @IsString()
  language: string;

  @IsString()
  sampleCode: string;

  @IsString()
  solution: string;
}
