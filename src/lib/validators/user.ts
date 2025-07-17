import { CreateUserInput, UpdateUserInput } from '@/models/User';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function validatePhone(phone: string): boolean {
  return PHONE_REGEX.test(phone.replace(/[\s\-()]/g, ''));
}

export function validateCreateUserInput(input: CreateUserInput): ValidationResult {
  const errors: string[] = [];

  if (!input.email || typeof input.email !== 'string') {
    errors.push('Email is required');
  } else if (!validateEmail(input.email)) {
    errors.push('Invalid email format');
  }

  if (!input.name || typeof input.name !== 'string') {
    errors.push('Name is required');
  } else if (input.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (input.name.trim().length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  if (!input.passwordHash || typeof input.passwordHash !== 'string') {
    errors.push('Password hash is required');
  }

  if (input.phone !== undefined && input.phone !== null && input.phone !== '') {
    if (!validatePhone(input.phone)) {
      errors.push('Invalid phone number format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateUpdateUserInput(input: UpdateUserInput): ValidationResult {
  const errors: string[] = [];

  if (input.name !== undefined) {
    if (typeof input.name !== 'string') {
      errors.push('Name must be a string');
    } else if (input.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    } else if (input.name.trim().length > 100) {
      errors.push('Name must be less than 100 characters');
    }
  }

  if (input.phone !== undefined && input.phone !== null && input.phone !== '') {
    if (!validatePhone(input.phone)) {
      errors.push('Invalid phone number format');
    }
  }

  if (input.smsNotificationsEnabled !== undefined) {
    if (typeof input.smsNotificationsEnabled !== 'boolean') {
      errors.push('SMS notifications setting must be a boolean');
    }
  }

  if (input.emailNotificationsEnabled !== undefined) {
    if (typeof input.emailNotificationsEnabled !== 'boolean') {
      errors.push('Email notifications setting must be a boolean');
    }
  }

  if (input.alertPreferences !== undefined) {
    const prefs = input.alertPreferences;
    
    if (prefs.emailAlerts !== undefined && typeof prefs.emailAlerts !== 'boolean') {
      errors.push('Email alerts preference must be a boolean');
    }
    
    if (prefs.smsAlerts !== undefined && typeof prefs.smsAlerts !== 'boolean') {
      errors.push('SMS alerts preference must be a boolean');
    }
    
    if (prefs.alertFrequency !== undefined) {
      const validFrequencies = ['instant', 'hourly', 'daily'];
      if (!validFrequencies.includes(prefs.alertFrequency)) {
        errors.push('Alert frequency must be instant, hourly, or daily');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
