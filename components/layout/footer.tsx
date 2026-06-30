"use client";

import type React from "react";
import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mail, MapPin, Phone, Send, Share2, UsersRound, Globe2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { apiPost } from "@/lib/services";

export function Footer() {
  const [email, setEmail] = useState("");

  const newsletterMutation = useMutation({
    mutationFn: async (value: string) => {
      return apiPost("/newsletter", { email: value });
    },
    onSuccess: () => {
      toast.success("You've subscribed successfully!");
      setEmail("");
    },
    onError: () => {
      toast.error("Subscription failed. Please try again.");
    },
  });

  const handleNewsletterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (email.trim()) newsletterMutation.mutate(email);
  };

  return (
    <footer className="bg-[#121827] text-white">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link href="/" className="mb-5 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-extrabold">
                QR
              </span>
              <span className="text-xl font-extrabold">QRGate</span>
            </Link>
            <p className="text-sm leading-6 text-slate-300">
              Revolutionizing event management with QR technology. Create,
              manage, book, and verify tickets with one focused platform.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <p className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                University of Cape Coast, Ghana
              </p>
              <Link href="tel:+233598346928" className="flex items-center gap-3 hover:text-white">
                <Phone className="h-4 w-4 text-primary" />
                +233 59 834 6928
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-extrabold uppercase tracking-wide">
              Quick Links
            </h3>
            <div className="space-y-3 text-sm text-slate-300">
              <Link href="/about" className="block hover:text-white">
                About Us
              </Link>
              <Link href="/events" className="block hover:text-white">
                Browse Events
              </Link>
              <Link href="/organizer/events/create" className="block hover:text-white">
                Create Event
              </Link>
              <Link href="/auth/signin" className="block hover:text-white">
                Join Us
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-extrabold uppercase tracking-wide">
              Support
            </h3>
            <div className="space-y-3 text-sm text-slate-300">
              <Link href="/dashboard" className="block hover:text-white">
                My Account
              </Link>
              <Link href="/dashboard/tickets" className="block hover:text-white">
                My Tickets
              </Link>
              <Link href="/dashboard/orders" className="block hover:text-white">
                My Orders
              </Link>
              <Link href="/about" className="block hover:text-white">
                Contact Team
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-extrabold uppercase tracking-wide">
              Stay Updated
            </h3>
            <p className="mb-4 text-sm leading-6 text-slate-300">
              Subscribe for event updates and booking announcements.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={newsletterMutation.isPending}
                  required
                  className="border-white/10 bg-white/5 pr-10 text-white placeholder:text-slate-400"
                />
                <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={newsletterMutation.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                {newsletterMutation.isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-10 bg-white/10" />

        <div className="flex flex-col items-center justify-between gap-5 text-sm text-slate-300 md:flex-row">
          <p>Copyright 2026 QRGate. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
          <div className="flex gap-3">
            {[Globe2, Share2, UsersRound].map((Icon, index) => (
              <span
                key={index}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-300"
              >
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
