"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock3, CheckCircle2, XCircle } from "lucide-react";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();

  const [reservation, setReservation] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Fetch reservation
  useEffect(() => {
    fetchReservation();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!reservation?.expiresAt) return;

    const interval = setInterval(() => {
      const expiry = new Date(reservation.expiresAt).getTime();
      const now = Date.now();

      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        return;
      }

      setTimeLeft(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

  async function fetchReservation() {
    try {
      const res = await fetch(`/api/reservations/${params.id}`);
      const data = await res.json();

      console.log("Reservation:", data);

      setReservation(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function confirmReservation() {
    const res = await fetch(
      `/api/reservations/${params.id}/confirm`,
      {
        method: "POST",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Purchase confirmed!");
    fetchReservation();
  }

  async function cancelReservation() {
    const res = await fetch(
      `/api/reservations/${params.id}/release`,
      {
        method: "POST",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Reservation released");
    router.push("/");
  }

  // Loading state
  if (!reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  // Safe timer formatting
  const minutes = Math.floor(timeLeft / 1000 / 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-black text-white">
      <div className="max-w-xl w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">
              Checkout Session
            </h1>

            <p className="text-gray-400 mt-2">
              Reservation secured temporarily
            </p>
          </div>

          <div className="bg-indigo-500/20 p-4 rounded-2xl">
            <Clock3 className="text-indigo-400" />
          </div>
        </div>

        {/* Reservation Info */}
        <div className="space-y-5 mb-8">

          <div className="rounded-2xl bg-black/20 border border-white/10 p-5">
            <p className="text-gray-400 text-sm mb-1">
              Reservation ID
            </p>

            <p className="font-mono text-sm break-all">
              {reservation.id}
            </p>
          </div>

          <div className="rounded-2xl bg-black/20 border border-white/10 p-5">
            <p className="text-gray-400 text-sm mb-2">
              Reservation Status
            </p>

            <span className="px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 font-semibold">
              {reservation.status}
            </span>
          </div>

          {/* Timer */}
          <div className="rounded-2xl bg-black/20 border border-white/10 p-5 text-center">
            <p className="text-gray-400 mb-2">
              Time Remaining
            </p>

            <p className="text-5xl font-bold text-cyan-400 tracking-wider">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={confirmReservation}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 py-4 font-semibold hover:opacity-90 transition"
          >
            <CheckCircle2 size={18} />
            Confirm Purchase
          </button>

          <button
            onClick={cancelReservation}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 py-4 font-semibold hover:opacity-90 transition"
          >
            <XCircle size={18} />
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}