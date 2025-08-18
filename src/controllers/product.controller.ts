import { NextRequest } from 'next/server';
import { ProductRepository } from '@/lib/db/repositories';
import { ApiResponse } from '@/lib/api/response';
import { validateProduct, validateProductUpdate } from '@/lib/validators/product';
import { InventoryMonitorService } from '@/services';

export class ProductController {
  private productRepository: ProductRepository;
  private inventoryMonitor: InventoryMonitorService;

  constructor() {
    this.productRepository = new ProductRepository();
    this.inventoryMonitor = new InventoryMonitorService();
  }

  async getAll(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('userId');
      const lowStock = searchParams.get('lowStock') === 'true';

      if (!userId) {
        return ApiResponse.badRequest('userId is required');
      }

      let products;
      if (lowStock) {
        products = await this.productRepository.findLowStock(userId);
      } else {
        products = await this.productRepository.findByUserId(userId);
      }

      return ApiResponse.success(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      return ApiResponse.error('Failed to fetch products');
    }
  }

  async create(request: NextRequest) {
    try {
      const body = await request.json();
      const validation = validateProduct(body);

      if (!validation.success) {
        return ApiResponse.badRequest(validation.error.errors[0].message);
      }

      const product = await this.productRepository.create(validation.data);
      
      // Check if the new product is already below threshold
      await this.inventoryMonitor.checkProductThreshold(product);

      return ApiResponse.created(product);
    } catch (error) {
      console.error('Error creating product:', error);
      return ApiResponse.error('Failed to create product');
    }
  }

  async getById(id: string) {
    try {
      const product = await this.productRepository.findById(id);

      if (!product) {
        return ApiResponse.notFound('Product not found');
      }

      return ApiResponse.success(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      return ApiResponse.error('Failed to fetch product');
    }
  }

  async update(id: string, request: NextRequest) {
    try {
      const body = await request.json();
      const validation = validateProductUpdate(body);

      if (!validation.success) {
        return ApiResponse.badRequest(validation.error.errors[0].message);
      }

      const product = await this.productRepository.update(id, validation.data);

      if (!product) {
        return ApiResponse.notFound('Product not found');
      }

      // Check threshold after update
      await this.inventoryMonitor.checkProductThreshold(product);

      return ApiResponse.success(product);
    } catch (error) {
      console.error('Error updating product:', error);
      return ApiResponse.error('Failed to update product');
    }
  }

  async updateStock(id: string, request: NextRequest) {
    try {
      const body = await request.json();
      const { quantity } = body;

      if (typeof quantity !== 'number') {
        return ApiResponse.badRequest('quantity must be a number');
      }

      const product = await this.productRepository.updateStock(id, quantity);

      if (!product) {
        return ApiResponse.notFound('Product not found');
      }

      // Check threshold after stock update
      await this.inventoryMonitor.checkProductThreshold(product);

      return ApiResponse.success(product);
    } catch (error) {
      console.error('Error updating stock:', error);
      return ApiResponse.error('Failed to update stock');
    }
  }

  async delete(id: string) {
    try {
      const deleted = await this.productRepository.delete(id);

      if (!deleted) {
        return ApiResponse.notFound('Product not found');
      }

      return ApiResponse.success({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      return ApiResponse.error('Failed to delete product');
    }
  }
}

export const productController = new ProductController();
