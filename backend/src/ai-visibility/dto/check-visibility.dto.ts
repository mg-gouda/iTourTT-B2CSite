import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export const AI_ENGINES = ['perplexity', 'openai', 'google'] as const;

export class CheckVisibilityDto {
  @IsString()
  @IsNotEmpty()
  query!: string;

  @IsOptional()
  @IsArray()
  @IsIn(AI_ENGINES as unknown as string[], { each: true })
  engines?: string[];
}
