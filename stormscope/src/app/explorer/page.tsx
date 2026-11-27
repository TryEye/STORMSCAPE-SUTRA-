import ExplorerClient from "@/components/explorer/ExplorerClient";
import { loadStormScopeGeoData } from "@/data/geo.server";

export default function ExplorerPage() {
  const geoData = loadStormScopeGeoData();
  return <ExplorerClient geoData={geoData} />;
}
