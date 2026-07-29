import type { Product } from "./types";

// Every product carries the same long description. It exists purely to give the
// over-fetching panel something heavy to leave out of a query.
const DESCRIPTION =
  "Machined from a single billet of 6061 aluminium and finished with a bead-blasted " +
  "anodised coat, this unit is built for daily abuse. The internals are serviceable " +
  "with a single hex key, every wear part is stocked for a decade, and the whole " +
  "assembly is rated for continuous duty between -20°C and 60°C. Ships in recycled " +
  "moulded pulp with no adhesives, so the entire package goes straight into paper " +
  "recycling. Two-year warranty, extendable to five on registration.";

export const PRODUCTS: readonly Product[] = [
  {
    id: "p1",
    name: "Pocket Espresso",
    tagline: "Nine bars of pressure, no electricity",
    priceCents: 12900,
    category: "Kitchen",
    emoji: "☕",
    stock: 42,
    favorite: false,
    description: DESCRIPTION,
    specs: [
      { label: "Weight", value: "480 g" },
      { label: "Pressure", value: "9 bar" },
      { label: "Capacity", value: "80 ml" },
    ],
  },
  {
    id: "p2",
    name: "Trailhead 30L",
    tagline: "A pack that survives the trail and the overhead bin",
    priceCents: 18500,
    category: "Outdoors",
    emoji: "🎒",
    stock: 17,
    favorite: true,
    description: DESCRIPTION,
    specs: [
      { label: "Volume", value: "30 L" },
      { label: "Fabric", value: "420D ripstop" },
      { label: "Weight", value: "1.1 kg" },
    ],
  },
  {
    id: "p3",
    name: "Studio Monitor Mk II",
    tagline: "Flat response, honest mixes",
    priceCents: 42000,
    category: "Audio",
    emoji: "🔊",
    stock: 6,
    favorite: false,
    description: DESCRIPTION,
    specs: [
      { label: "Driver", value: '5" woven' },
      { label: "Response", value: "48 Hz – 22 kHz" },
      { label: "Power", value: "70 W" },
    ],
  },
  {
    id: "p4",
    name: "Desk Lamp Arc",
    tagline: "2700K to 5000K, one continuous sweep",
    priceCents: 8900,
    category: "Home",
    emoji: "💡",
    stock: 88,
    favorite: false,
    description: DESCRIPTION,
    specs: [
      { label: "CRI", value: "97" },
      { label: "Output", value: "800 lm" },
      { label: "Reach", value: "62 cm" },
    ],
  },
  {
    id: "p5",
    name: "Field Notebook",
    tagline: "Writes in the rain, sits flat every time",
    priceCents: 2400,
    category: "Stationery",
    emoji: "📓",
    stock: 240,
    favorite: false,
    description: DESCRIPTION,
    specs: [
      { label: "Pages", value: "192" },
      { label: "Paper", value: "100 gsm" },
      { label: "Binding", value: "Smyth-sewn" },
    ],
  },
  {
    id: "p6",
    name: "Commuter Chain",
    tagline: "Hardened links, no rattle",
    priceCents: 6400,
    category: "Cycling",
    emoji: "🚲",
    stock: 31,
    favorite: false,
    description: DESCRIPTION,
    specs: [
      { label: "Length", value: "90 cm" },
      { label: "Hardness", value: "58 HRC" },
      { label: "Weight", value: "1.4 kg" },
    ],
  },
];
