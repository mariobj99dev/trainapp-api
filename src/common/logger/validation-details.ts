import { ValidationError } from '@nestjs/common'

export interface ValidationDetail {
  field: string
  constraints: string[]
}

/** Converts class-validator's nested error tree into concise, safe log fields. */
export function formatValidationErrors(errors: ValidationError[], parentPath = ''): ValidationDetail[] {
  return errors.flatMap((error) => {
    const field = parentPath ? `${parentPath}.${error.property}` : error.property
    const detail = error.constraints ? [{ field, constraints: Object.values(error.constraints) }] : []

    return [...detail, ...formatValidationErrors(error.children || [], field)]
  })
}
