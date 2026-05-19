// Mock directory of Community Health Centers (CHCs) used across the app.
// Coordinates roughly cluster around central Bengaluru for demo purposes.
import type { GeoPoint } from "../utils/geoHelpers";

export interface CommunityHealthCenter extends GeoPoint {
  id: string;
  name: string;
  address: string;
  servingCapacityPerDay: number;
}

const MOCK_CENTERS: CommunityHealthCenter[] = [
  {
    id: "chc-1",
    name: "Jayanagar Community Health Center",
    address: "4th Block, Jayanagar, Bengaluru",
    lat: 12.9255,
    lng: 77.5832,
    servingCapacityPerDay: 220,
  },
  {
    id: "chc-2",
    name: "Indiranagar Family Wellness Hub",
    address: "100ft Road, Indiranagar, Bengaluru",
    lat: 12.9719,
    lng: 77.6412,
    servingCapacityPerDay: 180,
  },
  {
    id: "chc-3",
    name: "Whitefield Primary Care CHC",
    address: "ITPL Main Rd, Whitefield, Bengaluru",
    lat: 12.9698,
    lng: 77.7499,
    servingCapacityPerDay: 260,
  },
  {
    id: "chc-4",
    name: "Yelahanka Maternal Nutrition Center",
    address: "Yelahanka New Town, Bengaluru",
    lat: 13.1007,
    lng: 77.5963,
    servingCapacityPerDay: 150,
  },
  {
    id: "chc-5",
    name: "Electronic City Health Outreach",
    address: "Phase 1, Electronic City, Bengaluru",
    lat: 12.8452,
    lng: 77.6602,
    servingCapacityPerDay: 200,
  },
];

export async function fetchNearbyHealthCenters(): Promise<
  CommunityHealthCenter[]
> {
  return Promise.resolve(MOCK_CENTERS);
}
