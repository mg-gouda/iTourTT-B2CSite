import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/** Yoast-style SEO extras stored on the entity's `seo` JSON column. */
export class SeoMetaDto {
  @IsOptional() @IsString() @MaxLength(120) focusKeyphrase?: string;
  @IsOptional() @IsString() @MaxLength(500) canonicalUrl?: string;
  @IsOptional() @IsBoolean() robotsNoindex?: boolean;
  @IsOptional() @IsBoolean() robotsNofollow?: boolean;
  @IsOptional() @IsString() @MaxLength(200) ogTitle?: string;
  @IsOptional() @IsString() @MaxLength(400) ogDescription?: string;
  @IsOptional() @IsString() ogImage?: string;
  @IsOptional() @IsString() @MaxLength(200) twitterTitle?: string;
  @IsOptional() @IsString() @MaxLength(400) twitterDescription?: string;
  @IsOptional() @IsString() twitterImage?: string;
  @IsOptional() @IsString() @MaxLength(40) schemaType?: string;
  @IsOptional() @IsBoolean() cornerstone?: boolean;
  @IsOptional() @IsString() @MaxLength(200) breadcrumbTitle?: string;
}

export class UpsertBlogPostDto {
  // Required on create; optional on update (service enforces).
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(220) title?: string;
  @IsOptional() @IsString() @MaxLength(220) slug?: string;
  @IsOptional() @IsString() @MaxLength(500) excerpt?: string;
  @IsOptional() @IsString() coverImageUrl?: string;

  // tiptap document JSON (re-editing) + rendered HTML (B2C display).
  @IsOptional() contentJson?: unknown;
  @IsOptional() @IsString() contentHtml?: string;

  @IsOptional() @IsString() @MaxLength(120) author?: string;
  @IsOptional() @IsIn(['DRAFT', 'PUBLISHED']) status?: string;

  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) categoryIds?: string[];

  @IsOptional() @IsString() @MaxLength(180) metaTitle?: string;
  @IsOptional() @IsString() @MaxLength(320) metaDescription?: string;

  @IsOptional() @ValidateNested() @Type(() => SeoMetaDto) seo?: SeoMetaDto;
}

export class UpsertBlogCategoryDto {
  @IsString() @IsNotEmpty() @MaxLength(120) name!: string;
  @IsOptional() @IsString() @MaxLength(140) slug?: string;
}
