import { IsArray, IsBoolean, IsNotEmpty, IsObject, IsOptional } from "class-validator";

export class TestcaseDto {
  @IsArray() // Input is a flexible object (e.g., Map-like key-value pairs)
  @IsNotEmpty()
  input: [Record<string, any>]; // Use `Record` for dynamic key-value pairs

  @IsNotEmpty()
  outputExpected: any; // Output can be any type

  @IsBoolean()
  hidden: boolean;
}
