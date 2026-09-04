export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RequiredFieldsResult {
  required: string[];
  optional: string[];
}
