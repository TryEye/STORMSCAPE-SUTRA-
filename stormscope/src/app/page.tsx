import LandingClient from "@/components/landing/LandingClient";
import { loadStormScopeGeoData } from "@/data/geo.server";

export default function HomePage() {
  const geoData = loadStormScopeGeoData();
  return <LandingClient geoData={geoData} />;
}
