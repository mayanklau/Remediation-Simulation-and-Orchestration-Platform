import type { Metadata } from "next";
import {
  Activity,
  Boxes,
  CheckCircle2,
  FileCheck,
  GitPullRequestArrow,
  LayoutDashboard,
  Network,
  Settings,
  ShieldAlert
} from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Remediation Twin",
  description: "Enterprise remediation simulation and orchestration platform"
};

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/findings", label: "Findings", icon: ShieldAlert },
  { href: "/assets", label: "Assets", icon: Boxes },
  { href: "/remediation", label: "Remediation Queue", icon: GitPullRequestArrow },
  { href: "/simulations", label: "Simulations", icon: Network },
  { href: "/workflows", label: "Approvals", icon: CheckCircle2 },
  { href: "/evidence", label: "Evidence", icon: FileCheck },
  { href: "/integrations", label: "Integrations", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <div className="brand">
              <div className="brand-mark">R</div>
              <span>Remediation Twin</span>
            </div>
            <nav className="nav">
              {nav.map((item) => {
                const Icon = item.icon;
                return (
                  <a key={item.href} href={item.href}>
                    <Icon size={18} />
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </aside>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
