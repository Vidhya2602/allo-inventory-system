"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Warehouse, Package } from "lucide-react";
import { useRouter } from "next/navigation";

interface WarehouseData {
  warehouseId: string;
  warehouseName: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
}

interface Product {
  id: string;
  name: string;
  warehouses: WarehouseData[];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  }

  async function reserveProduct(
    productId: string,
    warehouseId: string
  ) {
    try {
      setLoading(true);

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          warehouseId,
          quantity: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Reservation failed");
        return;
      }

      router.push(`/checkout/${data.id}`);
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-7xl mx-auto">

        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
              Allo Inventory Engine
            </h1>

            <p className="text-gray-400 mt-3 text-lg">
              Real-time multi-warehouse reservation system
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-xl">
            <p className="text-sm text-gray-400">System Status</p>
            <p className="text-green-400 font-semibold">
              Operational
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:border-indigo-500/40 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-2xl font-bold">
                    {product.name}
                  </h2>

                  <div className="flex items-center gap-2 mt-2 text-gray-400 text-sm">
                    <Package size={16} />
                    Multi-warehouse inventory
                  </div>
                </div>

                <div className="bg-indigo-500/20 p-3 rounded-2xl">
                  <ShoppingCart className="text-indigo-400" />
                </div>
              </div>

              <div className="space-y-4">
                {product.warehouses.map((warehouse) => (
                  <div
                    key={warehouse.warehouseId}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Warehouse
                          size={16}
                          className="text-cyan-400"
                        />

                        <span className="font-medium">
                          {warehouse.warehouseName}
                        </span>
                      </div>

                      <span className="text-sm px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/20">
                        {warehouse.availableStock} Available
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center mb-4">
                      <div className="bg-white/5 rounded-xl py-3">
                        <p className="text-xs text-gray-400">Total</p>
                        <p className="font-bold text-lg">
                          {warehouse.totalStock}
                        </p>
                      </div>

                      <div className="bg-white/5 rounded-xl py-3">
                        <p className="text-xs text-gray-400">Reserved</p>
                        <p className="font-bold text-lg text-yellow-400">
                          {warehouse.reservedStock}
                        </p>
                      </div>

                      <div className="bg-white/5 rounded-xl py-3">
                        <p className="text-xs text-gray-400">Available</p>
                        <p className="font-bold text-lg text-green-400">
                          {warehouse.availableStock}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        reserveProduct(
                          product.id,
                          warehouse.warehouseId
                        )
                      }
                      disabled={
                        loading ||
                        warehouse.availableStock <= 0
                      }
                      className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 py-3 font-semibold hover:opacity-90 transition disabled:opacity-40"
                    >
                      Reserve Item
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}