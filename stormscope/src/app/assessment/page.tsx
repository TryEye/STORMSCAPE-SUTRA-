import AssessmentClient from "@/components/assessment/AssessmentClient";
import { loadStormScopeGeoData } from "@/data/geo.server";

export default function AssessmentPage() {
  const geoData = loadStormScopeGeoData();
  return <AssessmentClient geoData={geoData} />;
}
