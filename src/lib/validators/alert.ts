import { AlertType, CreateAlertInput, UpdateAlertInput } from '@/models/Alert';
import { ALERT_TYPES, VALIDATION } from '@/lib/constants';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

const isValidObjectId = (id: string): boolean => {
  return /^[a-fA-F0-9]{24}$/.test(id);
};

const isValidAlertType = (type: string): type is AlertType => {
  return ALERT_TYPES.includes(type as AlertType);
};

export const validateCreateAlert = (input: Partial<CreateAlertInput>): ValidationResult => {
  const errors: string[] = [];

  if (!input.productId) {
    errors.push('Product ID is required');
  } else if (!isValidObjectId(input.productId)) {
    errors.push('Invalid product ID format');
  }

  if (!input.userId) {
    errors.push('User ID is required');
  } else if (input.userId.trim().length === 0) {
    errors.push('User ID cannot be empty');
  }

  if (input.thresholdLevel === undefined || input.thresholdLevel === null) {
    errors.push('Threshold level is required');
  } else if (!Number.isInteger(input.thresholdLevel)) {
    errors.push('Threshold level must be an integer');
  } else if (input.thresholdLevel < VALIDATION.MIN_THRESHOLD) {
    errors.push(`Threshold level must be at least ${VALIDATION.MIN_THRESHOLD}`);
  } else if (input.thresholdLevel > VALIDATION.MAX_THRESHOLD) {
    errors.push(`Threshold level cannot exceed ${VALIDATION.MAX_THRESHOLD}`);
  }

  if (!input.alertType) {
    errors.push('Alert type is required');
  } else if (!isValidAlertType(input.alertType)) {
    errors.push(`Alert type must be one of: ${ALERT_TYPES.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUpdateAlert = (input: UpdateAlertInput): ValidationResult => {
  const errors: string[] = [];

  if (input.thresholdLevel !== undefined) {
    if (!Number.isInteger(input.thresholdLevel)) {
      errors.push('Threshold level must be an integer');
    } else if (input.thresholdLevel < VALIDATION.MIN_THRESHOLD) {
      errors.push(`Threshold level must be at least ${VALIDATION.MIN_THRESHOLD}`);
    } else if (input.thresholdLevel > VALIDATION.MAX_THRESHOLD) {
      errors.push(`Threshold level cannot exceed ${VALIDATION.MAX_THRESHOLD}`);
    }
  }

  if (input.alertType !== undefined && !isValidAlertType(input.alertType)) {
    errors.push(`Alert type must be one of: ${ALERT_TYPES.join(', ')}`);
  }

  if (input.isActive !== undefined && typeof input.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
