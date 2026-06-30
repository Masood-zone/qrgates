"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicEventCard } from "@/components/events/public-event-card";
import { useFeaturedEvents } from "@/lib/api/events";

export function EventsSection() {
  const { data: events = [], isLoading } = useFeaturedEvents();

  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
              Picks for you
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
              Explore Trending Events
            </h2>
          </div>
          <Button asChild variant="ghost" className="self-start text-primary">
            <Link href="/events">
              See All Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-xl border bg-card p-4">
                <Skeleton className="aspect-[4/3] rounded-lg" />
                <Skeleton className="mt-5 h-5 w-2/3" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-6 h-10 w-full" />
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {events.slice(0, 3).map((event) => (
              <PublicEventCard key={event.id} event={event} compact />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-card p-10 text-center">
            <h3 className="text-xl font-bold">No public events yet</h3>
            <p className="mt-2 text-muted-foreground">
              Upcoming events will appear here as soon as organizers publish them.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
