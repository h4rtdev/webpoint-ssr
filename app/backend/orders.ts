'use server';
import { Order, OrderItem } from '@/backend/types';
import { readFromDatabase, writeToDatabase, DATABASE } from '@/backend/db';
import { serverGetProducts, serverUpdateProduct } from '@/backend/products';

export async function serverGetOrders(): Promise<Order[]> {
  return readFromDatabase<Order>(DATABASE.ORDERS_FILE);
}

export async function serverGetOrdersByUser(userId: string): Promise<Order[]> {
  const orders = await readFromDatabase<Order>(DATABASE.ORDERS_FILE);
  return orders.filter(o => o.userId === userId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function serverCreateOrder(
  userId: string,
  userName: string,
  items: { productId: string; qty: number }[]
): Promise<Order> {
  const products = await serverGetProducts();
  const orderItems: OrderItem[] = [];
  let total = 0;

  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) throw new Error(`Produto ${item.productId} não encontrado`);
    if (product.stock < item.qty) throw new Error(`Estoque insuficiente para ${product.name}`);
    orderItems.push({
      productId: product.id,
      productName: product.name,
      price: product.price,
      qty: item.qty,
    });
    total += product.price * item.qty;
    await serverUpdateProduct(product.id, { stock: product.stock - item.qty });
  }

  const order: Order = {
    id: Date.now().toString(),
    userId,
    userName,
    items: orderItems,
    total,
    status: 'ABERTO',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const orders = await readFromDatabase<Order>(DATABASE.ORDERS_FILE);
  orders.push(order);
  await writeToDatabase(DATABASE.ORDERS_FILE, orders);
  return order;
}

export async function serverUpdateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<Order | null> {
  const orders = await readFromDatabase<Order>(DATABASE.ORDERS_FILE);
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], status, updatedAt: new Date().toISOString() };
  await writeToDatabase(DATABASE.ORDERS_FILE, orders);
  return orders[idx];
}
