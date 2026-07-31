import { identityService } from './identity.service';
import type { PublicUserProfileView } from './identity.types';

/**
 * The identity domain's published contract.
 *
 * Other domains import *this* — never `identity.service`, never
 * `identity.repository`, never `identity.model`. It exposes exactly one
 * capability: turning user ids into the small public profile the catalog and
 * learning domains need in order to render an instructor or reviewer byline.
 */
export interface IdentityDomainInterface {
  /** Resolves a batch of user ids to public profiles, keyed by id. Missing ids are simply absent. */
  getPublicProfilesByIds(
    userIds: readonly string[]
  ): Promise<ReadonlyMap<string, PublicUserProfileView>>;
}

export const identityDomainInterface: IdentityDomainInterface = {
  getPublicProfilesByIds: (userIds) => identityService.getPublicProfilesByIds(userIds),
};

export type { PublicUserProfileView };
