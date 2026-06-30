import { GraduationCap, Music2, Presentation } from "lucide-react";

const audienceCards = [
  {
    title: "Conference",
    description: "Campus talks, summits, and professional sessions",
    image: "/hero-bg-1.jpg",
    className: "md:col-span-2",
  },
  {
    title: "Concerts",
    description: "Live performances, showcases, and music nights",
    image: "/booking.jpg",
    className: "md:col-span-4",
  },
  {
    title: "Concert-Party",
    description: "High-energy campus parties and headline events",
    image: "/hero-bg-2.jpg",
    className: "md:col-span-3",
  },
];

const compactCards = [
  { title: "Club Jams", icon: Music2 },
  { title: "Workshop", icon: Presentation },
];

export function StatsSection() {
  return (
    <section className="bg-[#121827] py-20 text-white">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Built for Every Type of Organization
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Whether you host conferences, concerts, parties, club jams, or
              workshops, QuickGates keeps ticketing organized.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-rose-200">
            <GraduationCap className="h-4 w-4" />
            Kumasi with USTED ready
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-6">
          {audienceCards.map((card) => (
            <div
              key={card.title}
              className={`group relative min-h-56 overflow-hidden rounded-xl ${card.className}`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${card.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-5 left-5">
                <h3 className="text-xl font-extrabold">{card.title}</h3>
                <p className="mt-1 text-sm text-slate-200">{card.description}</p>
              </div>
            </div>
          ))}

          {compactCards.map((card) => (
            <div
              key={card.title}
              className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 p-5 text-center"
            >
              <card.icon className="mb-4 h-9 w-9 text-rose-200" />
              <h3 className="font-extrabold">{card.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
