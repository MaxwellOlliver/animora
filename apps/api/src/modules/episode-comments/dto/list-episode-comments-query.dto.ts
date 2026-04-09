import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import { CursorPaginationQueryDto } from '@/common/dto/cursor-pagination-query.dto';

export class ListEpisodeCommentsQueryDto extends CursorPaginationQueryDto {
  @ApiPropertyOptional({ description: 'Parent comment ID to list replies for' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
