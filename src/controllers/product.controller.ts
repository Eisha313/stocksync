import { NextRequest } from 'next/server';
import { ProductRepository } from '@/lib/db/repositories';
import { validateProduct, validateProductUpdate } from '@/lib/validators/product';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '@/lib/api/response';
import { ObjectId } from 'mongodb';

export class ProductController {
  static async getAll(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('userId');
      const lowStock = searchParams.get('lowStock');

      let products;

      if (lowStock === 'true' && userId) {
        products = await ProductRepository.findLowStock(userId);
      } else if (userId) {
        products = await ProductRepository.findByUserId(userId);
      } else {
        products = await ProductRepository.findAll();
      }

      return successResponse(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      return errorResponse('Failed to fetch products');
    }
  }

  static async create(request: NextRequest) {
    try {
      const body = await request.json();
      const validation = validateProduct(body);

      if (!validation.success) {
        return validationErrorResponse(validation.error.errors);
      }

      const product = await ProductRepository.create(validation.data);
      return successResponse(product, 201);
    } catch (error) {
      console.error('Error creating product:', error);
      return errorResponse('Failed to create product');
    }
  }

  static async getById(id: string) {
    try {
      if (!ObjectId.isValid(id)) {
        return validationErrorResponse([{ message: 'Invalid product ID format' }]);
      }

      const product = await ProductRepository.findById(id);

      if (!product) {
        return notFoundResponse('Product not found');
      }

      return successResponse(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      return errorResponse('Failed to fetch product');
    }
  }

  static async update(id: string, request: NextRequest) {
    try {
      if (!ObjectId.isValid(id)) {
        return validationErrorResponse([{ message: 'Invalid product ID format' }]);
      }

      const body = await request.json();
      const validation = validateProductUpdate(body);

      if (!validation.success) {
        return validationErrorResponse(validation.error.errors);
      }

      const product = await ProductRepository.update(id, {
        ...validation.data,
        updatedAt: new Date(),
      });

      if (!product) {
        return notFoundResponse('Product not found');
      }

      return successResponse(product);
    } catch (error) {
      console.error('Error updating product:', error);
      return errorResponse('Failed to update product');
    }
  }

  static async delete(id: string) {
    try {
      if (!ObjectId.isValid(id)) {
        return validationErrorResponse([{ message: 'Invalid product ID format' }]);
      }

      const deleted = await ProductRepository.delete(id);

      if (!deleted) {
        return notFoundResponse('Product not found');
      }

      return successResponse({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      return errorResponse('Failed to delete product');
    }
  }
}
