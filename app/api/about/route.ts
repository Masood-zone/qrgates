import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const builders = [
  {
    id: "builder-resford",
    name: "Resford Gyasi Appiah",
    role: "Builder",
    image: "",
    bio: "Student ID: 5221040153",
    order: 1,
    aboutId: "about-placeholder-id",
  },
  {
    id: "builder-solomon",
    name: "Twumasi Solomon",
    role: "Builder",
    image: "",
    bio: "Student ID: 5221040150",
    order: 2,
    aboutId: "about-placeholder-id",
  },
  {
    id: "builder-evans",
    name: "Asamoah Evans",
    role: "Builder",
    image: "",
    bio: "Student ID: 5221040149",
    order: 3,
    aboutId: "about-placeholder-id",
  },
  {
    id: "builder-ernest",
    name: "Allotey Ernest",
    role: "Builder",
    image: "",
    bio: "Student ID: 5221040192",
    order: 4,
    aboutId: "about-placeholder-id",
  },
];

export async function GET(request: NextRequest) {
  try {
    const aboutData = await prisma.about.findFirst({
      include: {
        teamMembers: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!aboutData) {
      const now = new Date();

      const placeholder = {
        id: "about-placeholder-id",
        mission:
          "To make event discovery, booking, and QR verification simple for organizers and attendees.",
        vision:
          "To become a trusted student-built ticketing platform for reliable, secure event access.",
        story:
          "QuickGates was built as a practical event booking system focused on clear public discovery, fast checkout, and dependable QR-based entry.",
        founded: 2026,
        location: "University of Cape Coast, Ghana",
        teamSize: 4,
        eventsHosted: 24,
        happyCustomers: 1200,
        values: [
          "Clarity",
          "Security",
          "Reliability",
          "Teamwork",
          "Accessibility",
          "Execution",
        ],
        contactEmail: "info@quickgates.me",
        contactPhone: "+233 59 834 6928",
        contactWebsite: "https://quickgates.vercel.app",
        createdAt: now,
        updatedAt: now,
        contact: {
          email: "info@quickgates.me",
          phone: "+233 59 834 6928",
          website: "https://quickgates.vercel.app",
        },
        teamMembers: builders,
      };

      return NextResponse.json(placeholder, {
        status: 200,
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }

    const response = {
      id: aboutData.id,
      mission: aboutData.mission,
      vision: aboutData.vision,
      story: aboutData.story,
      founded: aboutData.founded,
      location: aboutData.location,
      teamSize: aboutData.teamSize,
      eventsHosted: aboutData.eventsHosted,
      happyCustomers: aboutData.happyCustomers,
      values: aboutData.values ? JSON.parse(aboutData.values) : [],
      contactEmail: aboutData.contactEmail,
      contactPhone: aboutData.contactPhone,
      contactWebsite: aboutData.contactWebsite,
      contact: {
        email: aboutData.contactEmail,
        phone: aboutData.contactPhone,
        website: aboutData.contactWebsite,
      },
      createdAt: aboutData.createdAt,
      updatedAt: aboutData.updatedAt,
      teamMembers: aboutData.teamMembers.map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        image: member.image,
        bio: member.bio,
        order: member.order,
        aboutId: member.aboutId,
      })),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching about data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
