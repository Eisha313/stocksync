import { CreateProductInput, UpdateProductInput } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateCreateProduct(input: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'body', message: 'Request body is required' }]
    };
  }

  const data = input as Record<string, unknown>;

  // Name validation
  if (!data.name || typeof data.name !== 'string') {
    errors.push({ field: 'name', message: 'Product name is required' });
  } else if (data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Product name must be at least 2 characters' });
  } else if (data.name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Product name must be less than 100 characters' });
  }

  // SKU validation (optional but must be valid if provided)
  if (data.sku !== undefined) {
    if (typeof data.sku !== 'string') {
      errors.push({ field: 'sku', message: 'SKU must be a string' });
    } else if (data.sku.length > 50) {
      errors.push({ field: 'sku', message: 'SKU must be less than 50 characters' });
    }
  }

  // Current stock validation
  if (data.currentStock !== undefined) {
    if (typeof data.currentStock !== 'number' || !Number.isInteger(data.currentStock)) {
      errors.push({ field: 'currentStock', message: 'Current stock must be an integer' });
    } else if (data.currentStock < 0) {
      errors.push({ field: 'currentStock', message: 'Current stock cannot be negative' });
    }
  }

  // Low stock threshold validation
  if (data.lowStockThreshold !== undefined) {
    if (typeof data.lowStockThreshold !== 'number' || !Number.isInteger(data.lowStockThreshold)) {
      errors.push({ field: 'lowStockThreshold', message: 'Low stock threshold must be an integer' });
    } else if (data.lowStockThreshold < 0) {
      errors.push({ field: 'lowStockThreshold', message: 'Low stock threshold cannot be negative' });
    }
  }

  // Critical stock threshold validation
  if (data.criticalStockThreshold !== undefined) {
    if (typeof data.criticalStockThreshold !== 'number' || !Number.isInteger(data.criticalStockThreshold)) {
      errors.push({ field: 'criticalStockThreshold', message: 'Critical stock threshold must be an integer' });
    } else if (data.criticalStockThreshold < 0) {
      errors.push({ field: 'criticalStockThreshold', message: 'Critical stock threshold cannot be negative' });
    }
  }

  // Validate threshold relationship
  if (
    typeof data.lowStockThreshold === 'number' &&
    typeof data.criticalStockThreshold === 'number' &&
    data.criticalStockThreshold > data.lowStockThreshold
  ) {
    errors.push({ 
      field: 'criticalStockThreshold', 
      message: 'Critical threshold cannot be higher than low stock threshold' 
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateUpdateProduct(input: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'body', message: 'Request body is required' }]
    };
  }

  const data = input as Record<string, unknown>;

  // At least one field should be provided
  const validFields = ['name', 'sku', 'description', 'currentStock', 'lowStockThreshold', 'criticalStockThreshold', 'category'];
  const hasValidField = validFields.some(field => data[field] !== undefined);

  if (!hasValidField) {
    errors.push({ field: 'body', message: 'At least one field must be provided for update' });
  }

  // Reuse create validation for provided fields
  const createValidation = validateCreateProduct({ name: 'placeholder', ...data });
  
  // Filter out name required error if name not provided in update
  const relevantErrors = createValidation.errors.filter(err => {
    if (err.field === 'name' && data.name === undefined) {
      return false;
    }
    return true;
  });

  errors.push(...relevantErrors);

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateStockUpdate(input: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'body', message: 'Request body is required' }]
    };
  }

  const data = input as Record<string, unknown>;

  if (data.quantity === undefined) {
    errors.push({ field: 'quantity', message: 'Quantity is required' });
  } else if (typeof data.quantity !== 'number' || !Number.isInteger(data.quantity)) {
    errors.push({ field: 'quantity', message: 'Quantity must be an integer' });
  } else if (data.quantity < 0) {
    errors.push({ field: 'quantity', message: 'Quantity cannot be negative' });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
