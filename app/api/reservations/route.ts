import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/reservations
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { productId, warehouseId, quantity } = body;

    // Validation
    if (!productId || !warehouseId || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: "Invalid quantity" },
        { status: 400 }
      );
    }

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

      // Reserve stock
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

      // Create reservation
      const reservation = await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          status: "PENDING",

          // 10 minute expiry
          expiresAt: new Date(
            Date.now() + 10 * 60 * 1000
          ),
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
    console.error("Reservation Error:", err);

    return NextResponse.json(
      { error: "Reservation failed" },
      { status: 500 }
    );
  }
}