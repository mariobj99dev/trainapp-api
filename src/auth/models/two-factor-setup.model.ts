import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class TwoFactorSetupModel {
  @Field()
  otpauthUri: string

  @Field()
  qrCodeDataUrl: string

  @Field()
  manualEntryKey: string
}
