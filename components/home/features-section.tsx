import { BarChart3, CreditCard, FilePenLine, QrCode } from "lucide-react";

const features = [
  {
    icon: FilePenLine,
    title: "Publish",
    description: "Create events in minutes with ticket types, dates, and venue details.",
  },
  {
    icon: CreditCard,
    title: "Sell",
    description: "Let attendees choose tickets and move through a simple cart flow.",
  },
  {
    icon: QrCode,
    title: "Verify",
    description: "Issue QR tickets and support fast entry checks at the gate.",
  },
  {
    icon: BarChart3,
    title: "Report",
    description: "Track sales, attendees, and event performance from one dashboard.",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Seamless Experience for Organizers
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            From the first draft to entry verification, QuickGates keeps every
            event workflow clear and quick.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border/70 bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-rose-100 text-primary transition-transform group-hover:scale-105">
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
