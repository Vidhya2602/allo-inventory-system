import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create products
  const iphone = await prisma.product.create({
    data: {
      name: "iPhone 15",
    },
  });

  const airpods = await prisma.product.create({
    data: {
      name: "AirPods Pro",
    },
  });

  const macbook = await prisma.product.create({
    data: {
      name: "MacBook Air",
    },
  });

  // Create warehouses
  const chennai = await prisma.warehouse.create({
    data: {
      name: "Chennai Warehouse",
    },
  });

  const bangalore = await prisma.warehouse.create({
    data: {
      name: "Bangalore Warehouse",
    },
  });

  // Create inventory
  await prisma.inventory.createMany({
    data: [
      {
        productId: iphone.id,
        warehouseId: chennai.id,
        totalStock: 10,
        reservedStock: 0,
      },
      {
        productId: iphone.id,
        warehouseId: bangalore.id,
        totalStock: 5,
        reservedStock: 0,
      },
      {
        productId: airpods.id,
        warehouseId: chennai.id,
        totalStock: 20,
        reservedStock: 0,
      },
      {
        productId: macbook.id,
        warehouseId: bangalore.id,
        totalStock: 7,
        reservedStock: 0,
      },
    ],
  });

  console.log("Seed data inserted!");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });