/**
 * Local storage helper to prevent duplicate likes per user/device
 */

const LIKES_KEY = 'cipa_liked_posts_v1';

export function getLikedPosts(): string[] {
  try {
    const data = localStorage.getItem(LIKES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function isPostLiked(id: string): boolean {
  return getLikedPosts().includes(id);
}

export function markPostAsLiked(id: string): void {
  try {
    const liked = getLikedPosts();
    if (!liked.includes(id)) {
      liked.push(id);
      localStorage.setItem(LIKES_KEY, JSON.stringify(liked));
    }
  } catch (e) {
    console.error(e);
  }
}
