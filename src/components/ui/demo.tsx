import { TiltedGridHero } from "@/components/ui/tilted-grid-hero";

// Existing Marshalign Dental Care clinic & treatment assets
const MARSHALIGN_IMAGES = [
  {
    src: "/clinic-reception.jpg",
    alt: "Marshalign Dental Care reception and waiting lounge",
  },
  {
    src: "/treatment-room.jpg",
    alt: "Marshalign modern clinical treatment suite",
  },
  {
    src: "/orthodontics-treatment.webp",
    alt: "Orthodontics and braces operatory",
  },
  {
    src: "/prosthodontics-treatment.webp",
    alt: "Prosthodontics and smile restoration operatory",
  },
  {
    src: "/dental-implant-treatment.webp",
    alt: "Dental implant operatory and clinical technology",
  },
  {
    src: "/dr-marshal-antony.jpg",
    alt: "Dr. Marshal Antony M., Specialist Orthodontist",
  },
  {
    src: "/dr-jose-olive.jpg",
    alt: "Dr. Jose Olive A., Specialist Prosthodontist",
  },
  {
    src: "/dentofacial-orthopedics.webp",
    alt: "Dentofacial orthopedics consultation and diagnostic care",
  },
];

export default function TiltedGridHeroDemo() {
  return (
    <TiltedGridHero
      images={MARSHALIGN_IMAGES}
      className="h-[560px] w-full rounded-lg border border-border bg-background"
    >
      <div className="relative z-10 flex h-full flex-col items-center justify-between py-12 text-center">
        <div className="px-6">
          <h1 className="text-balance text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
            Every frame,
            <br />
            brought into focus.
          </h1>
        </div>
        <p className="max-w-md text-balance px-6 text-sm text-muted-foreground">
          Images curve in from one edge, flatten out at the centre, then fade
          away round the other.
        </p>
      </div>
    </TiltedGridHero>
  );
}
