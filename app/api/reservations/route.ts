import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/reservations
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, warehouseId, quantity } = body;

    const result = await prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId,
          },
        },
      });

      if (!inventory) {
        throw new Error("Inventory not found");
      }

      const available =
        inventory.totalStock - inventory.reservedStock;

      if (available < quantity) {
        return null;
      }

      // update reserved stock
      await tx.inventory.update({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId,
          },
        },
        data: {
          reservedStock: {
            increment: quantity,
          },
        },
      });

      const reservation = await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          status: "PENDING",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
        },
      });

      return reservation;
    });

    if (!result) {
      return NextResponse.json(
        { error: "Not enough stock" },
        { status: 409 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "Reservation failed" },
      { status: 500 }
    );
  }
}