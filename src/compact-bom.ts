export interface QuoteItem {
  partNumber: string;
  quantity: number;
  purpose: string;
  url: string;
  profile?: string;
  lengthMm?: number;
}

const profile3030Url = "https://us.misumi-ec.com/vona2/detail/110302686450/";

export const compactPurchaseItems: QuoteItem[] = [
  {
    partNumber: "GFS6-3030-1280",
    quantity: 4,
    purpose: "Corner posts",
    url: profile3030Url,
    profile: "3030",
    lengthMm: 1280,
  },
  {
    partNumber: "GFS6-3030-1310",
    quantity: 2,
    purpose: "Rear rails between posts",
    url: profile3030Url,
    profile: "3030",
    lengthMm: 1310,
  },
  {
    partNumber: "GFS6-3030-875",
    quantity: 4,
    purpose: "Side rails between posts",
    url: profile3030Url,
    profile: "3030",
    lengthMm: 875,
  },
  {
    partNumber: "GFS6-3030-1000",
    quantity: 1,
    purpose: "Adjustable camera mast",
    url: profile3030Url,
    profile: "3030",
    lengthMm: 1000,
  },
  {
    partNumber: "GFS6-3030-300",
    quantity: 1,
    purpose: "Camera mast foot",
    url: profile3030Url,
    profile: "3030",
    lengthMm: 300,
  },
  {
    partNumber: "GFS6-3030-100",
    quantity: 1,
    purpose: "Camera offset",
    url: profile3030Url,
    profile: "3030",
    lengthMm: 100,
  },

  {
    partNumber: "HFS6-3090-1300",
    quantity: 1,
    purpose: "Shared arm-support beam",
    url: "https://us.misumi-ec.com/vona2/detail/110302687670/",
    profile: "3090",
    lengthMm: 1300,
  },
  {
    partNumber: "HBLFSN6",
    quantity: 18,
    purpose:
      "12 frame brackets + 6 camera-support brackets; bare brackets, no screw/nut SET",
    url: "https://us.misumi-ec.com/vona2/detail/110300442340/?HissuCode=HBLFSN6",
  },
];

export const compactOptionalSlotNuts: QuoteItem[] = [
  {
    partNumber: "HNTT6-6",
    quantity: 48,
    purpose:
      "36 bracket + 12 wall nuts; no spares or arm/camera adapter allowance. Reuse only compatible Series 6 slot nuts. Adapter nuts remain to be determined.",
    url: "https://us.misumi-ec.com/vona2/detail/110302251050?HissuCode=HNTT6-6",
  },
];

export const compactOptionalEndCaps: QuoteItem[] = [
  {
    partNumber: "HFC6-3030-B",
    quantity: 7,
    purpose:
      "Four post tops, mast top, exposed foot end and camera offset end; optional, not shown in model. Do not cap butt joints or table-bearing ends.",
    url: "https://us.misumi-ec.com/vona2/detail/110300446540/?HissuCode=HFC6-3030-B",
  },
  {
    partNumber: "HFC6-3090-B",
    quantity: 2,
    purpose: "Both arm-beam ends; optional, not shown in model.",
    url: "https://us.misumi-ec.com/vona2/detail/110300446540/?Tab=codeList",
  },
];
