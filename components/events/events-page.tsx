"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Search, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { PublicEventCard } from "@/components/events/public-event-card";
import { useEvents, useFeaturedEvents } from "@/lib/api/events";
import { EVENT_CATEGORIES } from "@/lib/event-categories";

const categories = [{ value: "All", label: "All" }, ...EVENT_CATEGORIES];

const statusOptions = ["All", "UPCOMING", "ONGOING"];

export function EventsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [dateRange, setDateRange] = useState("any");

  const filters = useMemo(
    () => ({
      page: currentPage,
      limit: 9,
      dateFilter: "active-upcoming",
      search: searchTerm || undefined,
      location: locationTerm || undefined,
      category: selectedCategory !== "All" ? selectedCategory : undefined,
      status: selectedStatus !== "All" ? selectedStatus : undefined,
    }),
    [currentPage, searchTerm, locationTerm, selectedCategory, selectedStatus]
  );

  const { data: eventsData, isLoading, error } = useEvents(filters);
  const { data: recommendedEvents = [] } = useFeaturedEvents();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLocationTerm("");
    setSelectedCategory("All");
    setSelectedStatus("All");
    setDateRange("any");
    setCurrentPage(1);
  };

  return (
    <div className="bg-background">
      <section className="relative flex min-h-[360px] items-center justify-center overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-bg-3.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950/10" />
        <div className="relative z-10 w-full max-w-4xl px-5 text-center">
          <h1 className="mb-5 text-3xl font-extrabold text-white md:text-4xl">
            Discover Extraordinary Events
          </h1>
          <form
            onSubmit={handleSearch}
            className="rounded-xl bg-white/95 p-2 shadow-2xl backdrop-blur md:flex md:items-center md:gap-2"
          >
            <div className="flex flex-1 items-center gap-3 border-b border-border px-3 py-2 md:border-b-0 md:border-r">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by event name, artist..."
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="flex flex-1 items-center gap-3 px-3 py-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Input
                value={locationTerm}
                onChange={(event) => setLocationTerm(event.target.value)}
                placeholder="Location"
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
            </div>
            <Button type="submit" className="w-full rounded-lg md:w-auto">
              Search
            </Button>
          </form>
        </div>
      </section>

      <section className="overflow-hidden bg-secondary/60 py-10">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
                Picks for you
              </p>
              <h2 className="mt-1 text-2xl font-extrabold">Recommended Events</h2>
            </div>
            <div className="hidden gap-2 sm:flex">
              <Button variant="outline" size="icon" aria-label="Scroll left">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Scroll right">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex snap-x gap-6 overflow-x-auto pb-4">
            {recommendedEvents.slice(0, 6).map((event) => (
              <div key={event.id} className="min-w-[310px] snap-start">
                <PublicEventCard event={event} compact action="view" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside>
            <div className="sticky top-24 space-y-7 rounded-xl border border-border/70 bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Search className="h-5 w-5 text-primary" />
                Filters
              </h3>

              <div>
                <label className="mb-3 block text-sm font-bold text-muted-foreground">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.value}
                      type="button"
                      size="sm"
                      variant={selectedCategory === category.value ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => {
                        setSelectedCategory(category.value);
                        setCurrentPage(1);
                      }}
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-muted-foreground">
                  Event Status
                </label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => {
                    setSelectedStatus(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "All" ? "All active events" : status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-muted-foreground">
                  Date Range
                </label>
                <Select
                  value={dateRange}
                  onValueChange={(value) => {
                    setDateRange(value);
                    setSelectedStatus(
                      value === "future"
                        ? "UPCOMING"
                        : value === "live"
                          ? "ONGOING"
                          : "All"
                    );
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Date</SelectItem>
                    <SelectItem value="future">Upcoming</SelectItem>
                    <SelectItem value="live">Happening Now</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Online Events</span>
                <Switch disabled />
              </div>

              <Button variant="secondary" className="w-full" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </aside>

          <div>
            {error ? (
              <div className="rounded-xl border bg-card p-10 text-center">
                <h2 className="text-2xl font-bold text-destructive">
                  Error Loading Events
                </h2>
                <p className="mt-2 text-muted-foreground">Please try again later.</p>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 9 }).map((_, index) => (
                  <div key={index} className="rounded-xl border bg-card p-4">
                    <Skeleton className="aspect-[4/3] rounded-lg" />
                    <Skeleton className="mt-5 h-5 w-2/3" />
                    <Skeleton className="mt-3 h-4 w-full" />
                    <Skeleton className="mt-6 h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : eventsData?.events?.length ? (
              <>
                <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-2xl font-extrabold">Browse Events</h2>
                    <p className="text-sm text-muted-foreground">
                      Showing active and upcoming events only.
                    </p>
                  </div>
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Verified QR tickets
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-primary" />
                      Fast booking
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {eventsData.events.map((event) => (
                    <PublicEventCard key={event.id} event={event} />
                  ))}
                </div>

                {eventsData.pagination.pages > 1 && (
                  <div className="mt-10 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: eventsData.pagination.pages }, (_, index) => index + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(page + 1, eventsData.pagination.pages)
                        )
                      }
                      disabled={currentPage === eventsData.pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-dashed bg-card p-12 text-center">
                <CalendarDays className="mx-auto h-12 w-12 text-primary" />
                <h2 className="mt-4 text-2xl font-extrabold">No events found</h2>
                <p className="mt-2 text-muted-foreground">
                  Try another search or category. Completed and cancelled events
                  are hidden from public booking.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
