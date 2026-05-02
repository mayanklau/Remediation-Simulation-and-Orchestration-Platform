import type { Metadata } from "next";
import {
  Activity,
  Boxes,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  FileCheck,
  GitPullRequestArrow,
  LayoutDashboard,
  Network,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  Settings,
  ShieldAlert,
  Cable,
  ClipboardList,
  Columns3,
  Rocket,
  ServerCog,
  Search,
  Shield,
  Sparkles
} from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "EY Remediation Twin",
  description: "EY-themed enterprise remediation operating system"
};

const navGroups = [
  {
    label: "Command",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/findings", label: "Findings", icon: ShieldAlert },
      { href: "/assets", label: "Assets", icon: Boxes },
      { href: "/asset-graph", label: "Asset Graph", icon: Network },
      { href: "/attack-paths", label: "Attack Paths", icon: Network },
      { href: "/operating-system", label: "Control Plane", icon: Network }
    ]
  },
  {
    label: "Remediate",
    items: [
      { href: "/remediation", label: "Remediation Queue", icon: GitPullRequestArrow },
      { href: "/simulations", label: "Simulations", icon: Network },
      { href: "/workflows", label: "Approvals", icon: CheckCircle2 },
      { href: "/evidence", label: "Evidence", icon: FileCheck },
      { href: "/virtual-patching", label: "Virtual Patch", icon: ShieldCheck },
      { href: "/agentic", label: "Agentic", icon: Bot }
    ]
  },
  {
    label: "Operations",
    items: [
      { href: "/integrations", label: "Integrations", icon: Activity },
      { href: "/connectors", label: "Connectors", icon: Cable },
      { href: "/ingestion-jobs", label: "Ingestion Jobs", icon: ClipboardList },
      { href: "/reports", label: "Reports", icon: TrendingUp },
      { href: "/automation", label: "Automation", icon: SlidersHorizontal },
      { href: "/production-ops", label: "Prod Ops", icon: ServerCog }
    ]
  },
  {
    label: "Govern",
    items: [
      { href: "/policies", label: "Policies", icon: ClipboardCheck },
      { href: "/exceptions", label: "Exceptions", icon: ScrollText },
      { href: "/campaigns", label: "Campaigns", icon: Bot },
      { href: "/campaign-board", label: "Campaign Board", icon: Columns3 },
      { href: "/pilot-control-plane", label: "Pilot Plane", icon: Rocket },
      { href: "/final-production", label: "Final Prod", icon: ShieldCheck },
      { href: "/enterprise-readiness", label: "Readiness", icon: Sparkles },
      { href: "/enterprise-maturity", label: "Maturity", icon: Rocket },
      { href: "/governance", label: "Governance", icon: ShieldCheck },
      { href: "/enterprise", label: "Enterprise", icon: ShieldCheck },
      { href: "/audit", label: "Audit", icon: ScrollText },
      { href: "/settings", label: "Settings", icon: Settings }
    ]
  }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <div className="brand">
              <div className="brand-mark">EY</div>
              <div>
                <span>EY Remediation Twin</span>
                <small>Attack-path command center</small>
              </div>
            </div>
            <div className="side-card">
              <div>
                <Shield size={16} />
                <strong>EY Control Tower</strong>
              </div>
              <p>Tenant guarded, simulation first, evidence always ready.</p>
            </div>
            <nav className="nav">
              {navGroups.map((group) => (
                <div className="nav-group" key={group.label}>
                  <span>{group.label}</span>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a key={item.href} href={item.href}>
                        <Icon size={18} />
                        {item.label}
                      </a>
                    );
                  })}
                </div>
              ))}
            </nav>
          </aside>
          <main className="main">
            <div className="topbar">
              <div className="search-box">
                <Search size={17} />
                <span>Search findings, assets, paths, controls</span>
              </div>
              <div className="topbar-actions">
                <span className="health-dot">Live</span>
                <span className="pill"><Sparkles size={14} /> Agent ready</span>
              </div>
            </div>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
