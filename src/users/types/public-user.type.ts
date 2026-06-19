export type PublicUser = {
  id: string
  email: string
  username: string
  status: string
  isAdmin: boolean
  createdAt: Date
  profile: {
    id: string
    displayName: string
    avatarUrl: string | null
  } | null
}
