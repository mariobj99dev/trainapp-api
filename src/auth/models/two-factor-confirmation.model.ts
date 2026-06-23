import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'Result of enabling two-factor authentication.' })
export class TwoFactorConfirmationModel {
  @Field({ description: 'True once the TOTP configuration has been enabled.' })
  enabled: boolean

  @Field(() => [String], { description: 'One-time recovery codes. Display and store them securely; they are not returned again.' })
  recoveryCodes: string[]
}
