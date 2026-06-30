"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin, ShoppingCart, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TicketTypeSelector } from "@/components/ui/ticket-type-selector";
import { formatDate } from "@/lib/date-utils";
import { getEventCategoryLabel } from "@/lib/event-categories";
import { isPastDate } from "@/lib/cart-utils";
import { useCartStore } from "@/lib/store/cart-store";
import type { Event, TicketType } from "@/lib/types/api";

function getTicketTypes(event: Event): TicketType[] {
  if (event.ticketTypes && event.ticketTypes.length > 0) {
    return event.ticketTypes;
  }

  return [
    {
      id: "standard",
      name: "Standard",
      price: event.price,
      quantity: event.totalTickets,
      soldCount: event.soldTickets,
      description: "Standard admission ticket",
      eventId: event.id,
    },
  ];
}

function formatPrice(price: number) {
  if (price <= 0) return "Free";
  return `Ghc${price.toFixed(2)}`;
}

interface PublicEventCardProps {
  event: Event;
  compact?: boolean;
  action?: "book" | "view";
}

export function PublicEventCard({
  event,
  compact = false,
  action = "book",
}: PublicEventCardProps) {
  const ticketTypes = useMemo(() => getTicketTypes(event), [event]);
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState(
    ticketTypes[0]?.id || "standard"
  );
  const [quantity, setQuantity] = useState(1);
  const { addItem, items } = useCartStore();

  const selectedTicketType =
    ticketTypes.find((type) => type.id === selectedTicketTypeId) ||
    ticketTypes[0];
  const availableTickets = selectedTicketType
    ? selectedTicketType.quantity - selectedTicketType.soldCount
    : 0;
  const isInCart = items.some(
    (item) =>
      item.eventId === event.id && item.ticketTypeId === selectedTicketType?.id
  );
  const startDate = new Date(event.startDate);
  const isPastEvent = isPastDate(event.endDate);
  const categoryLabel = getEventCategoryLabel(event.category);

  const handleTicketSelect = (typeId: string, qty: number) => {
    setSelectedTicketTypeId(typeId);
    setQuantity(qty);
  };

  const handleAddToCart = () => {
    if (!selectedTicketType || availableTickets <= 0 || isPastEvent) return;

    addItem({
      id: `${event.id}-${selectedTicketType.id}-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      eventImage: event.mainImage || undefined,
      eventDate: event.startDate.toString(),
      eventEndDate: event.endDate.toString(),
      eventLocation: event.location,
      ticketType: selectedTicketType.name,
      ticketTypeId: selectedTicketType.id,
      price: selectedTicketType.price,
      quantity,
      maxQuantity: Math.min(10, availableTickets),
      title: event.title,
      image: event.mainImage || "",
      startDate: event.startDate.toString(),
    });

    toast.success("Added to cart", {
      description: `${quantity} ${selectedTicketType.name} ticket${
        quantity > 1 ? "s" : ""
      } for ${event.title}`,
    });
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={`/events/${event.id}`}
        className={`relative block overflow-hidden ${compact ? "h-48" : "aspect-[4/3]"}`}
      >
        <Image
          src={event.mainImage || "/booking.jpg"}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
        <div className="absolute left-4 top-4 rounded-md bg-white/95 px-3 py-2 text-center shadow-sm backdrop-blur">
          <p className="text-lg font-extrabold leading-none text-primary">
            {startDate.getDate().toString().padStart(2, "0")}
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-foreground">
            {startDate.toLocaleString("default", { month: "short" })}
          </p>
        </div>
        <Badge className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-white">
          {event.status === "ONGOING" ? "Live now" : categoryLabel}
        </Badge>
      </Link>

      <CardContent className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              {categoryLabel}
            </p>
            <Link href={`/events/${event.id}`}>
              <h3 className="mt-1 line-clamp-2 text-xl font-bold leading-tight text-foreground hover:text-primary">
                {event.title}
              </h3>
            </Link>
          </div>
          <p className="shrink-0 text-right text-lg font-extrabold text-foreground">
            {formatPrice(selectedTicketType?.price ?? event.price)}
          </p>
        </div>

        {!compact && event.description && (
          <p className="mb-4 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {event.description}
          </p>
        )}

        <div className="mb-4 space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {formatDate(event.startDate)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="line-clamp-1">{event.location}</span>
          </p>
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            {Math.max(availableTickets, 0)} tickets left
          </p>
        </div>

        {!compact && ticketTypes.length > 0 && action === "book" && (
          <div className="mb-4 rounded-lg bg-secondary/50 p-3">
            <TicketTypeSelector
              ticketTypes={ticketTypes}
              onSelect={handleTicketSelect}
              initialTypeId={selectedTicketTypeId}
            />
          </div>
        )}

        <div className="mt-auto flex gap-2 border-t border-border/60 pt-4">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/events/${event.id}`}>
              View
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          {action === "book" && (
            <Button
              className="flex-1"
              onClick={handleAddToCart}
              disabled={availableTickets <= 0 || isInCart || isPastEvent}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isPastEvent ? "Event Ended" : isInCart ? "In Cart" : "Book"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
