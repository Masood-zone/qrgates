"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { ImageGalleryUpload } from "@/components/ui/image-gallery-upload";
import { useEvent, useUpdateEvent } from "@/lib/api/events";
import { ArrowLeft, Save } from "lucide-react";
import { PageLoader } from "@/components/ui/loader";
import Link from "next/link";
import { toast } from "sonner";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  time: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be 0 or greater"),
  totalTickets: z.number().min(1, "Must have at least 1 ticket"),
  image: z.string().optional(),
  gallery: z.array(z.string()).optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EditEventPageProps {
  eventId: string;
}

export function EditEventPage({ eventId }: EditEventPageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: event, isLoading, error } = useEvent(eventId);
  const updateEventMutation = useUpdateEvent();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const watchedImage = watch("image");
  const watchedGallery = watch("gallery");

  // Populate form with existing event data
  useEffect(() => {
    if (event) {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      reset({
        title: event.title,
        description: event.description ?? "",
        date: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        time: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
        location: event.location,
        category: event.category,
        price: event.price,
        totalTickets: event.totalTickets,
        image: event?.mainImage || "",
        gallery: event?.images?.map((img) => img.url) || [],
      });
    }
  }, [event, reset]);

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      // Prepare only valid fields for Prisma
      const { date, endDate, time, endTime, image, gallery, ...rest } = data;

      // Combine date and time for proper DateTime objects
      const startDateTime = new Date(`${data.date}T${data.time}:00`);
      const endDateTime = new Date(`${data.endDate}T${data.endTime}:00`);

      const updateData: any = {
        ...rest,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        mainImage: image,
        images: gallery ? gallery.map((url) => ({ url })) : undefined,
      };
      await updateEventMutation.mutateAsync({ id: eventId, data: updateData });

      toast("Event updated", {
        description: "Your event has been successfully updated.",
      });

      router.push("/organizer/events");
    } catch (error) {
      toast("Error", {
        description: "Failed to update event. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <PageLoader />;

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-destructive mb-2">
          Event Not Found
        </h2>
        <p className="text-muted-foreground mb-4">
          The event you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link href="/organizer/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:p-5">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/organizer/events">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Event</h1>
          <p className="text-muted-foreground">Update your event details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Enter event title"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Describe your event"
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Start Date</Label>
                    <Input id="date" type="date" {...register("date")} />
                    {errors.date && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.date.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="time">Start Time</Label>
                    <Input id="time" type="time" {...register("time")} />
                    {errors.time && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.time.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="date" {...register("endDate")} />
                    {errors.endDate && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.endDate.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input id="endTime" type="time" {...register("endTime")} />
                    {errors.endTime && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.endTime.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...register("location")}
                    placeholder="Event location"
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.location.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    onValueChange={(value) => setValue("category", value)}
                    defaultValue={event.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                      <SelectItem value="networking">Networking</SelectItem>
                      <SelectItem value="concert">Concert</SelectItem>
                      <SelectItem value="festival">Festival</SelectItem>
                      <SelectItem value="exhibition">Exhibition</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="charity">Charity</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing & Tickets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Ticket Price (Ghc)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...register("price", { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="totalTickets">Total Tickets</Label>
                    <Input
                      id="totalTickets"
                      type="number"
                      {...register("totalTickets", { valueAsNumber: true })}
                      placeholder="100"
                    />
                    {errors.totalTickets && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.totalTickets.message}
                      </p>
                    )}
                    {event.soldTickets > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Note: {event.soldTickets} tickets have already been sold
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Media Upload */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Image</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onUpload={(url: string) => setValue("image", url)}
                  defaultImage={event?.mainImage || watchedImage || ""}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Image Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageGalleryUpload
                  onUpload={(urls: string[]) => setValue("gallery", urls)}
                  // Use event.images for preview if available, else watchedGallery
                  defaultImages={
                    event?.images?.map((img) => img.url) || watchedGallery || []
                  }
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Updating Event..." : "Update Event"}
          </Button>
        </div>
      </form>
    </div>
  );
}
