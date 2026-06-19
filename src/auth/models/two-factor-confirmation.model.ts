import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class TwoFactorConfirmationModel {
  @Field()
  enabled: boolean

  @Field(() => [String])
  recoveryCodes: string[]
}
