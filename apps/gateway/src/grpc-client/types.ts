import type { Observable } from 'rxjs';

export interface GetOwnedProfileResponse {
  owned: boolean;
  id: string;
  name: string;
  hasAvatar: boolean;
  avatarKey: string;
  avatarPurpose: string;
}

export interface ProfilesInternalClient {
  getOwnedProfile(request: {
    profileId: string;
    userId: string;
  }): Observable<GetOwnedProfileResponse>;
}

export interface EpisodeExistsResponse {
  exists: boolean;
}

export interface EpisodesInternalClient {
  episodeExists(request: {
    episodeId: string;
  }): Observable<EpisodeExistsResponse>;
}
