export const publicUserSelect = {
  id: true,
  email: true,
  username: true,
  status: true,
  isAdmin: true,
  createdAt: true,
  profile: {
    select: {
      id: true,
      displayName: true,
      avatarUrl: true
    }
  }
} as const
