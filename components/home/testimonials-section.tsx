import Link from "next/link";
import { MessageCircle, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TestimonialsSection() {
  return (
    <section className="bg-background px-5 py-20">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-primary shadow-2xl">
        <div className="grid gap-8 p-8 text-white md:grid-cols-[1fr_auto] md:items-center md:p-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">
              Ready to transform your event ticketing?
            </h2>
            <p className="mt-4 text-sm leading-6 text-rose-100 md:text-base">
              Give attendees a simple way to find, book, and verify tickets
              without slowing down the event experience.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="rounded-xl">
              <Link href="/auth/signup">
                <Rocket className="mr-2 h-5 w-5" />
                Get Started
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-xl border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="/about">
                <MessageCircle className="mr-2 h-5 w-5" />
                Contact Team
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
