"use client";

import { Code2, Mail, MapPin, Phone, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAbout } from "@/lib/api/about";

const fallbackBuilders = [
  { id: "1", name: "Resford Gyasi Appiah", role: "Builder", bio: "Student ID: 5221040153" },
  { id: "2", name: "Twumasi Solomon", role: "Builder", bio: "Student ID: 5221040150" },
  { id: "3", name: "Asamoah Evans", role: "Builder", bio: "Student ID: 5221040149" },
  { id: "4", name: "Allotey Ernest", role: "Builder", bio: "Student ID: 5221040192" },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function AboutPage() {
  const { data: aboutData, isLoading, error } = useAbout();
  const teamMembers =
    aboutData?.teamMembers && aboutData.teamMembers.length > 0
      ? aboutData.teamMembers
      : fallbackBuilders;
  const contact = aboutData?.contact || {
    email: "info@quickgates.me",
    phone: "+233 59 834 6928",
    website: "https://quickgates.vercel.app",
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-16">
        <Skeleton className="h-72 rounded-2xl" />
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="text-3xl font-extrabold text-destructive">
          Error Loading About Information
        </h1>
        <p className="mt-3 text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <section className="relative overflow-hidden bg-[#121827] px-5 py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(190,1,53,0.35),transparent_35%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_420px] md:items-center">
          <div>
            <Badge className="mb-6 rounded-full bg-primary/20 px-4 py-2 text-rose-100">
              Student-built ticketing platform
            </Badge>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
              Built by the team behind QuickGates
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">
              {aboutData?.story ||
                "QuickGates brings event discovery, booking, and QR verification into one simple system for organizers and attendees."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <a href={`mailto:${contact.email}`}>
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Builders
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <a href="/events">Browse Events</a>
              </Button>
            </div>
          </div>

          <Card className="border-white/10 bg-white/10 text-white shadow-2xl backdrop-blur">
            <CardContent className="p-7">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Builders", value: teamMembers.length, icon: Users },
                  { label: "Founded", value: aboutData?.founded || 2026, icon: Sparkles },
                  { label: "Focus", value: "QR", icon: ShieldCheck },
                  { label: "Stack", value: "Next", icon: Code2 },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-white/10 p-4">
                    <item.icon className="mb-4 h-6 w-6 text-rose-200" />
                    <p className="text-2xl font-extrabold">{item.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-300">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
            Meet the builders
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
            The individuals shaping the platform
          </h2>
          <p className="mt-3 text-muted-foreground">
            No profile images are required here. Each member is represented with
            a clean initials placeholder and their student ID.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member) => (
            <Card
              key={member.id}
              className="overflow-hidden rounded-xl border-border/70 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <CardContent className="p-6">
                <Avatar className="mb-6 h-20 w-20 rounded-2xl">
                  <AvatarFallback className="rounded-2xl bg-rose-100 text-2xl font-extrabold text-primary">
                    {initials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <Badge variant="secondary" className="mb-4">
                  {member.role || "Builder"}
                </Badge>
                <h3 className="text-xl font-extrabold leading-tight">
                  {member.name}
                </h3>
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  {member.bio}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60 px-5 py-16">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          <Card className="rounded-xl">
            <CardContent className="flex items-center gap-4 p-6">
              <Mail className="h-8 w-8 text-primary" />
              <div>
                <p className="font-bold">Email</p>
                <a className="text-sm text-muted-foreground" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="flex items-center gap-4 p-6">
              <Phone className="h-8 w-8 text-primary" />
              <div>
                <p className="font-bold">Phone</p>
                <a className="text-sm text-muted-foreground" href={`tel:${contact.phone}`}>
                  {contact.phone}
                </a>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="flex items-center gap-4 p-6">
              <MapPin className="h-8 w-8 text-primary" />
              <div>
                <p className="font-bold">Location</p>
                <p className="text-sm text-muted-foreground">
                  {aboutData?.location || "University of Cape Coast, Ghana"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
