import DashboardClient from "@/components/dashboard/DashboardClient";
import { loadStormScopeGeoData } from "@/data/geo.server";

export default function DashboardPage() {
  const geoData = loadStormScopeGeoData();
  return <DashboardClient geoData={geoData} />;
}
