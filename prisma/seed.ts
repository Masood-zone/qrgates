import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";

const adminSeed = {
  email: process.env.ADMIN_EMAIL || "admin@quickgates.com",
  password: process.env.ADMIN_PASSWORD || "admin123",
  name: process.env.ADMIN_NAME || "Super Admin",
  phone: process.env.ADMIN_PHONE || "+233200000000",
  address: process.env.ADMIN_ADDRESS || "QuickGates Admin Office, Kumasi, Ghana",
};

const organizerSeed = {
  email: process.env.SEED_ORGANIZER_EMAIL || "organizer@quickgates.com",
  password: process.env.SEED_ORGANIZER_PASSWORD || "organizer123",
  name: process.env.SEED_ORGANIZER_NAME || "QuickGates Demo Organizer",
  phone: process.env.SEED_ORGANIZER_PHONE || "+233598346928",
  address: "Kumasi, Ashanti Region, Ghana",
};

const builders = [
  {
    name: "Resford Gyasi Appiah",
    role: "Builder",
    image: "",
    bio: "Student ID: 5221040153",
    order: 1,
  },
  {
    name: "Twumasi Solomon",
    role: "Builder",
    image: "",
    bio: "Student ID: 5221040150",
    order: 2,
  },
  {
    name: "Asamoah Evans",
    role: "Builder",
    image: "",
    bio: "Student ID: 5221040149",
    order: 3,
  },
  {
    name: "Allotey Ernest",
    role: "Builder",
    image: "",
    bio: "Student ID: 5221040192",
    order: 4,
  },
];

function addDays(days: number, hour = 10) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function addHours(hours: number) {
  const date = new Date();
  date.setHours(date.getHours() + hours, 0, 0, 0);
  return date;
}

async function seedUsers() {
  const [adminPassword, organizerPassword] = await Promise.all([
    bcrypt.hash(adminSeed.password, 12),
    bcrypt.hash(organizerSeed.password, 12),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: adminSeed.email },
    update: {
      name: adminSeed.name,
      phone: adminSeed.phone,
      address: adminSeed.address,
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
      isOrganizer: false,
      emailVerified: new Date(),
    },
    create: {
      email: adminSeed.email,
      name: adminSeed.name,
      phone: adminSeed.phone,
      address: adminSeed.address,
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
      isOrganizer: false,
      emailVerified: new Date(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      isOrganizer: true,
    },
  });

  const organizer = await prisma.user.upsert({
    where: { email: organizerSeed.email },
    update: {
      name: organizerSeed.name,
      phone: organizerSeed.phone,
      address: organizerSeed.address,
      password: organizerPassword,
      role: "ORGANIZER",
      status: "ACTIVE",
      isOrganizer: true,
      emailVerified: new Date(),
    },
    create: {
      email: organizerSeed.email,
      name: organizerSeed.name,
      phone: organizerSeed.phone,
      address: organizerSeed.address,
      password: organizerPassword,
      role: "ORGANIZER",
      status: "ACTIVE",
      isOrganizer: true,
      emailVerified: new Date(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      isOrganizer: true,
    },
  });

  return { admin, organizer };
}

async function seedAbout() {
  const about = await prisma.about.upsert({
    where: { id: "qrgates-about" },
    update: {
      mission:
        "To make club jam and concert party discovery, booking, and QR ticket verification simple for organizers and attendees in Kumasi.",
      vision:
        "To become a trusted student-built ticketing platform for reliable, secure, and fast entry validation for entertainment events in Kumasi.",
      story:
        "QuickGates was built as a practical event booking system focused on club jams and concert parties in Kumasi, helping organizers manage publicity, ticket sales, QR ticket issuance, and entrance validation from one platform.",
      founded: 2026,
      location: "Kumasi, Ashanti Region, Ghana",
      teamSize: builders.length,
      eventsHosted: 24,
      happyCustomers: 1200,
      values: JSON.stringify([
        "Clarity",
        "Security",
        "Reliability",
        "Teamwork",
        "Accessibility",
        "Execution",
      ]),
      contactEmail: "info@quickgates.me",
      contactPhone: "+233 59 834 6928",
      contactWebsite: "https://quickgates.vercel.app",
    },
    create: {
      id: "qrgates-about",
      mission:
        "To make club jam and concert party discovery, booking, and QR ticket verification simple for organizers and attendees in Kumasi.",
      vision:
        "To become a trusted student-built ticketing platform for reliable, secure, and fast entry validation for entertainment events in Kumasi.",
      story:
        "QuickGates was built as a practical event booking system focused on club jams and concert parties in Kumasi, helping organizers manage publicity, ticket sales, QR ticket issuance, and entrance validation from one platform.",
      founded: 2026,
      location: "Kumasi, Ashanti Region, Ghana",
      teamSize: builders.length,
      eventsHosted: 24,
      happyCustomers: 1200,
      values: JSON.stringify([
        "Clarity",
        "Security",
        "Reliability",
        "Teamwork",
        "Accessibility",
        "Execution",
      ]),
      contactEmail: "info@quickgates.me",
      contactPhone: "+233 59 834 6928",
      contactWebsite: "https://quickgates.vercel.app",
    },
    select: { id: true },
  });

  await prisma.teamMember.deleteMany({ where: { aboutId: about.id } });
  await prisma.teamMember.createMany({
    data: builders.map((builder) => ({ ...builder, aboutId: about.id })),
  });

  return about;
}

async function seedEvents(organizerId: string) {
  const eventTitles = [
    "Kumasi Campus Club Jam",
    "KNUST Afrobeat Concert Party",
    "Adum Nightlife Jam",
    "USTED Freshers Concert Party",
    "Completed Kumasi Club Jam Demo",
    "Cancelled Kumasi Concert Party Demo",
  ];

  await prisma.event.deleteMany({
    where: { organizerId, title: { in: eventTitles } },
  });

  const events = [
    {
      title: "Kumasi Campus Club Jam",
      description:
        "A live campus club jam in Kumasi featuring DJs, music performances, social networking, and fast QR-code ticket validation at the entrance.",
      category: "club-jam",
      location: "USTED Campus, Kumasi",
      startDate: addHours(-1),
      endDate: addHours(4),
      mainImage: "/hero-bg-3.jpg",
      status: "ONGOING" as const,
      ticketTypes: [
        {
          name: "Regular",
          price: 20,
          quantity: 120,
          description: "General entry for the campus club jam",
        },
        {
          name: "VIP",
          price: 50,
          quantity: 40,
          description: "Priority entry and reserved VIP access",
        },
      ],
    },
    {
      title: "KNUST Afrobeat Concert Party",
      description:
        "An Afrobeat concert party in Kumasi with artiste performances, DJ sessions, and secure QR-code ticket entry for attendees.",
      category: "concert-party",
      location: "KNUST Area, Kumasi",
      startDate: addDays(10, 19),
      endDate: addDays(10, 23),
      mainImage: "/hero-bg-1.jpg",
      status: "UPCOMING" as const,
      ticketTypes: [
        {
          name: "Early Bird",
          price: 25,
          quantity: 100,
          description: "Discounted advance ticket for early buyers",
        },
        {
          name: "Regular",
          price: 40,
          quantity: 200,
          description: "Standard concert party entry",
        },
        {
          name: "VIP",
          price: 80,
          quantity: 50,
          description: "VIP concert party access",
        },
      ],
    },
    {
      title: "Adum Nightlife Jam",
      description:
        "A nightlife club jam in the heart of Kumasi designed for music lovers, students, and young entertainment fans.",
      category: "club-jam",
      location: "Adum, Kumasi",
      startDate: addDays(18, 20),
      endDate: addDays(19, 1),
      mainImage: "/hero-bg-2.jpg",
      status: "UPCOMING" as const,
      ticketTypes: [
        {
          name: "Regular",
          price: 30,
          quantity: 250,
          description: "General entry for the nightlife jam",
        },
        {
          name: "VVIP",
          price: 120,
          quantity: 30,
          description: "Premium VVIP access for the event",
        },
        {
          name: "Couple",
          price: 50,
          quantity: 60,
          description: "Discounted couple ticket package",
        },
      ],
    },
    {
      title: "USTED Freshers Concert Party",
      description:
        "A freshers-focused concert party in Kumasi with music, comedy, artiste appearances, and smooth digital ticket verification.",
      category: "concert-party",
      location: "USTED Auditorium, Kumasi",
      startDate: addDays(28, 18),
      endDate: addDays(28, 23),
      mainImage: "/booking.jpg",
      status: "UPCOMING" as const,
      ticketTypes: [
        {
          name: "Student",
          price: 20,
          quantity: 300,
          description: "Student access ticket",
        },
        {
          name: "Regular",
          price: 35,
          quantity: 150,
          description: "General concert party entry",
        },
        {
          name: "VIP",
          price: 70,
          quantity: 60,
          description: "VIP seating and priority entry",
        },
      ],
    },
    {
      title: "Completed Kumasi Club Jam Demo",
      description:
        "A completed Kumasi club jam demo event used to verify public filtering, attendance history, and past event status.",
      category: "club-jam",
      location: "Bantama, Kumasi",
      startDate: addDays(-12, 19),
      endDate: addDays(-12, 23),
      mainImage: "/hero-bg-1.jpg",
      status: "COMPLETED" as const,
      ticketTypes: [
        {
          name: "Regular",
          price: 15,
          quantity: 80,
          description: "Past club jam ticket",
        },
      ],
    },
    {
      title: "Cancelled Kumasi Concert Party Demo",
      description:
        "A cancelled Kumasi concert party demo event used to verify cancelled event filtering and system status handling.",
      category: "concert-party",
      location: "Asafo, Kumasi",
      startDate: addDays(15, 18),
      endDate: addDays(15, 23),
      mainImage: "/hero-bg-4.jpg",
      status: "CANCELLED" as const,
      ticketTypes: [
        {
          name: "Regular",
          price: 20,
          quantity: 100,
          description: "Cancelled concert party ticket",
        },
      ],
    },
  ];

  for (const event of events) {
    const totalTickets = event.ticketTypes.reduce(
      (sum, ticketType) => sum + ticketType.quantity,
      0,
    );

    await prisma.event.create({
      data: {
        title: event.title,
        description: event.description,
        category: event.category,
        location: event.location,
        startDate: event.startDate,
        endDate: event.endDate,
        mainImage: event.mainImage,
        price: event.ticketTypes[0].price,
        totalTickets,
        status: event.status,
        organizerId,
        ticketTypes: {
          create: event.ticketTypes,
        },
      },
    });
  }
}

async function main() {
  const { admin, organizer } = await seedUsers();
  await seedAbout();
  await seedEvents(organizer.id);

  console.log("Seed completed:");
  console.log({ admin, organizer });
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
