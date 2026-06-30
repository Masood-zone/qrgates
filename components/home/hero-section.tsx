import Link from "next/link";
import { ArrowRight, CirclePlus, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "500k+", label: "Tickets sold" },
  { value: "1.2k+", label: "Organizers" },
  { value: "99.9%", label: "Uptime" },
  { value: "0.5s", label: "Verification" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[760px] overflow-hidden bg-slate-950 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-bg-4.jpg')" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,25,44,0.70),rgba(18,25,44,0.92))]" />

      <div className="relative z-10 mx-auto flex min-h-[620px] max-w-5xl flex-col items-center justify-center px-5 pt-20 text-center">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/20 px-4 py-2 text-xs font-bold uppercase tracking-wide text-rose-100">
          <QrCode className="h-4 w-4" />
          The future of event entry
        </div>
        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">
          Buy, Sell & Verify Event Tickets{" "}
          <span className="text-rose-200">Effortlessly</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
          Launch events, sell tickets, and verify entry with secure QR codes and
          a checkout flow built for fast bookings.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-14 rounded-xl px-7 text-base">
            <Link href="/events">
              Discover Events
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-14 rounded-xl border-white/25 bg-white/10 px-7 text-base text-white hover:bg-white/20 hover:text-white"
          >
            <Link href="/organizer/events/create">
              Create Your Event
              <CirclePlus className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/20 bg-white/95 py-7 text-foreground shadow-xl backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold leading-none text-primary md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
