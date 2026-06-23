import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'One-time setup material used to enroll a TOTP authenticator.' })
export class TwoFactorSetupModel {
  @Field({ description: 'otpauth URI that can be opened by a compatible authenticator app.' })
  otpauthUri: string

  @Field({ description: 'Data URL containing a QR code for the otpauth URI.' })
  qrCodeDataUrl: string

  @Field({ description: 'Manual TOTP secret for authenticators that cannot scan the QR code.' })
  manualEntryKey: string
}
