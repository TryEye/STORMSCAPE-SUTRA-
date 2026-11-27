import Link from "next/link";
import { Radar } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-ocean-surface/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-horizon-blue/10 border border-horizon-blue/20">
                <Radar className="h-4 w-4 text-horizon-blue" />
              </div>
              <span className="font-heading text-base font-semibold text-cloud-white">
                StormScope
              </span>
            </div>
            <p className="text-sm text-mist-gray leading-relaxed max-w-xs">
              Historical Cyclone Exposure Assessment and Infrastructure Planning Platform.
              A research and educational tool for understanding cyclone impacts.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-cloud-white mb-4 uppercase tracking-wider">
              Platform
            </h4>
            <nav className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-mist-gray hover:text-cloud-white transition-colors duration-[150ms]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Context */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-cloud-white mb-4 uppercase tracking-wider">
              Project Context
            </h4>
            <div className="space-y-2 text-sm text-mist-gray">
              <p>Academic Research Project</p>
              <p>Primary Focus: Odisha, India</p>
              <p>Case Study: Cyclone Fani (2019)</p>
              <p className="pt-2 text-storm-gray">
                This platform provides historical analysis only. It does not provide
                forecasting, structural engineering, or emergency response capabilities.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-storm-gray">
            © 2025 StormScope — Historical Analysis Platform
          </p>
          <p className="text-xs text-storm-gray">
            Built for educational and research purposes
          </p>
        </div>
      </div>
    </footer>
  );
}
