import { Inject, Injectable } from '@nestjs/common';
import { and, asc, desc, eq, gt, isNull, lt, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import type {
  CursorPaginatedRequest,
  CursorPaginatedResponse,
} from '@/common/types/pagination.types';
import type { DrizzleDB } from '@/infra/database/database.module';
import { DRIZZLE } from '@/infra/database/database.module';
import { avatars } from '@/modules/admin/avatars/avatar.entity';
import { media } from '@/modules/media/media.entity';
import { profiles } from '@/modules/profiles/profile.entity';

import {
  type EpisodeComment,
  episodeComments,
  type NewEpisodeComment,
} from './episode-comment.entity';

export type EpisodeCommentWithProfile = EpisodeComment & {
  profile: {
    id: string;
    name: string;
    avatar: { key: string; purpose: string } | null;
  };
};

export type TopLevelComment = EpisodeCommentWithProfile & {
  replyCount: number;
};

export type ReplyComment = EpisodeCommentWithProfile & {
  replyTo: { id: string; profileName: string } | null;
};

@Injectable()
export class EpisodeCommentsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(data: NewEpisodeComment): Promise<EpisodeComment> {
    const result = await this.db
      .insert(episodeComments)
      .values(data)
      .returning();
    return result[0];
  }

  async update(id: string, data: { text: string }): Promise<EpisodeComment> {
    const result = await this.db
      .update(episodeComments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(episodeComments.id, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(episodeComments).where(eq(episodeComments.id, id));
  }

  async findById(id: string): Promise<EpisodeComment | undefined> {
    const rows = await this.db
      .select()
      .from(episodeComments)
      .where(eq(episodeComments.id, id));
    return rows[0];
  }

  async findByEpisodeCursor(
    episodeId: string,
    { cursor, limit = 20 }: CursorPaginatedRequest,
  ): Promise<CursorPaginatedResponse<TopLevelComment>> {
    const baseCondition = and(
      eq(episodeComments.episodeId, episodeId),
      isNull(episodeComments.parentId),
    );
    const conditions = cursor
      ? and(baseCondition, lt(episodeComments.createdAt, new Date(cursor)))
      : baseCondition;

    const replyCountSql = sql<number>`(
      SELECT count(*)::int FROM episode_comments ec
      WHERE ec.parent_id = ${episodeComments.id}
    )`.as('reply_count');

    const rows = await this.db
      .select({
        comment: episodeComments,
        profileId: profiles.id,
        profileName: profiles.name,
        avatarKey: media.key,
        avatarPurpose: media.purpose,
        replyCount: replyCountSql,
      })
      .from(episodeComments)
      .innerJoin(profiles, eq(episodeComments.profileId, profiles.id))
      .leftJoin(avatars, eq(profiles.avatarId, avatars.id))
      .leftJoin(media, eq(avatars.pictureId, media.id))
      .where(conditions)
      .orderBy(desc(episodeComments.createdAt))
      .limit(limit + 1);

    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;

    return {
      items: items.map((row) => ({
        ...row.comment,
        profile: {
          id: row.profileId,
          name: row.profileName,
          avatar:
            row.avatarKey && row.avatarPurpose
              ? { key: row.avatarKey, purpose: row.avatarPurpose }
              : null,
        },
        replyCount: row.replyCount,
      })),
      nextCursor: hasNextPage
        ? (items[items.length - 1]?.comment.createdAt.toISOString() ?? null)
        : null,
    };
  }

  async findRepliesCursor(
    parentId: string,
    { cursor, limit = 20 }: CursorPaginatedRequest,
  ): Promise<CursorPaginatedResponse<ReplyComment>> {
    const baseCondition = eq(episodeComments.parentId, parentId);
    const conditions = cursor
      ? and(baseCondition, gt(episodeComments.createdAt, new Date(cursor)))
      : baseCondition;

    const replyToComment = alias(episodeComments, 'reply_to_comment');
    const replyToProfile = alias(profiles, 'reply_to_profile');

    const rows = await this.db
      .select({
        comment: episodeComments,
        profileId: profiles.id,
        profileName: profiles.name,
        avatarKey: media.key,
        avatarPurpose: media.purpose,
        replyToId: replyToComment.id,
        replyToProfileName: replyToProfile.name,
      })
      .from(episodeComments)
      .innerJoin(profiles, eq(episodeComments.profileId, profiles.id))
      .leftJoin(avatars, eq(profiles.avatarId, avatars.id))
      .leftJoin(media, eq(avatars.pictureId, media.id))
      .leftJoin(
        replyToComment,
        eq(episodeComments.replyToId, replyToComment.id),
      )
      .leftJoin(replyToProfile, eq(replyToComment.profileId, replyToProfile.id))
      .where(conditions)
      .orderBy(asc(episodeComments.createdAt))
      .limit(limit + 1);

    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;

    return {
      items: items.map((row) => ({
        ...row.comment,
        profile: {
          id: row.profileId,
          name: row.profileName,
          avatar:
            row.avatarKey && row.avatarPurpose
              ? { key: row.avatarKey, purpose: row.avatarPurpose }
              : null,
        },
        replyTo:
          row.replyToId && row.replyToProfileName
            ? { id: row.replyToId, profileName: row.replyToProfileName }
            : null,
      })),
      nextCursor: hasNextPage
        ? (items[items.length - 1]?.comment.createdAt.toISOString() ?? null)
        : null,
    };
  }
}
