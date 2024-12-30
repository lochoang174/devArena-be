import { IsBoolean, IsNotEmpty, IsObject, IsOptional } from "class-validator";

export class TestcaseDto {
  @IsObject() // Input is a flexible object (e.g., Map-like key-value pairs)
  @IsNotEmpty()
  input: Record<string, any>; // Use `Record` for dynamic key-value pairs

  @IsNotEmpty()
  output: any; // Output can be any type

  @IsBoolean()
  status: boolean;
}
