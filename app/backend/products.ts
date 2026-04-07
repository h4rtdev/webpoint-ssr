'use server';

// SERVER ACTION - Runs only on the server
import { Product, CreateProductInput } from '@/backend/types';
import { readFromDatabase, writeToDatabase, DATABASE } from '@/backend/db';

export async function serverGetProducts(): Promise<Product[]> {
  return readFromDatabase<Product>(DATABASE.PRODUCTS_FILE);
}

export async function serverGetProductById(id: string): Promise<Product | null> {
  const products = await readFromDatabase<Product>(DATABASE.PRODUCTS_FILE);
  return products.find(p => p.id === id) || null;
}

export async function serverCreateProduct(data: CreateProductInput): Promise<Product> {
  const products = await readFromDatabase<Product>(DATABASE.PRODUCTS_FILE);
  
  // Validation on server side
  if (!data.name || !data.name.trim()) {
    throw new Error('Product name is required');
  }
  
  if (data.price < 0) {
    throw new Error('Price must be a positive number');
  }
  
  if (data.stock < 0) {
    throw new Error('Stock must be a positive number');
  }

  const newProduct: Product = {
    id: Date.now().toString(),
    name: data.name.trim(),
    description: data.description.trim(),
    price: Number(data.price),
    stock: Number(data.stock),
    category: data.category.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  products.push(newProduct);
  await writeToDatabase(DATABASE.PRODUCTS_FILE, products);

  return newProduct;
}

export async function serverUpdateProduct(
  id: string,
  data: Partial<CreateProductInput>
): Promise<Product | null> {
  const products = await readFromDatabase<Product>(DATABASE.PRODUCTS_FILE);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return null;
  }

  const product = products[index];
  const updated: Product = {
    ...product,
    ...data,
    id: product.id,
    createdAt: product.createdAt,
    updatedAt: new Date().toISOString(),
  };

  products[index] = updated;
  await writeToDatabase(DATABASE.PRODUCTS_FILE, products);

  return updated;
}

export async function serverDeleteProduct(id: string): Promise<boolean> {
  const products = await readFromDatabase<Product>(DATABASE.PRODUCTS_FILE);
  const filtered = products.filter(p => p.id !== id);

  if (filtered.length === products.length) {
    return false;
  }

  await writeToDatabase(DATABASE.PRODUCTS_FILE, filtered);
  return true;
}
