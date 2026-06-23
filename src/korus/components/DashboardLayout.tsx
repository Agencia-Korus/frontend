import { type ReactNode, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "@/src/korus/router-adapter";
import { KorusLogo, KorusSymbol } from "./KorusLogo";
import { ChevronDown, LogOut, Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../auth-context";

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  children?: { label: string; href: string }[];
}

interface DashboardLayoutProps {
  items: NavItem[];
  userName: string;
  userRole: string;
  userAvatar?: string;
  children?: ReactNode;
}

interface SidebarContentProps {
  items: NavItem[];
  collapsed: boolean;
  expandedItems: string[];
  onToggleExpand: (label: string) => void;
  onCloseMobile: () => void;
}

function SidebarContent({
  items,
  collapsed,
  expandedItems,
  onToggleExpand,
  onCloseMobile,
}: SidebarContentProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const allHrefs = [
    ...items.map((i) => i.href),
    ...items.flatMap((i) => i.children?.map((c) => c.href) ?? []),
  ];
  const bestMatch = allHrefs
    .filter((h) => location.pathname === h || location.pathname.startsWith(h + "/"))
    .sort((a, b) => b.length - a.length)[0];
  const isActive = (href: string) => href === bestMatch;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center justify-between">
        {collapsed ? <KorusSymbol variant="light" className="h-9 w-9 mx-auto" /> : <KorusLogo variant="light" size="md" />}
        <button className="hidden lg:block text-white/60 hover:text-white" onClick={() => onToggleExpand("__collapse__")}>
          <Menu size={18} />
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const hasChildren = item.children && item.children.length > 0;
          const expanded = expandedItems.includes(item.label);

          return (
            <div key={item.label}>
              <button
                onClick={() => {
                  if (hasChildren) onToggleExpand(item.label);
                  else {
                    navigate(item.href);
                    onCloseMobile();
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  active ? "bg-[#39228C] text-white" : "text-white/70 hover:bg-[rgba(103,68,170,0.15)] hover:text-white"
                }`}
              >
                <Icon size={20} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left" style={{ fontSize: 14 }}>{item.label}</span>
                    {hasChildren && <ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />}
                  </>
                )}
              </button>
              {hasChildren && expanded && !collapsed && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children!.map((child) => (
                    <Link
                      key={child.href}
                      to={child.href}
                      onClick={onCloseMobile}
                      className={`block px-3 py-1.5 rounded-lg transition-colors ${
                        isActive(child.href) ? "text-white bg-[#39228C]/50" : "text-white/50 hover:text-white"
                      }`}
                      style={{ fontSize: 13 }}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[rgba(103,68,170,0.2)]">
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white rounded-lg hover:bg-[rgba(103,68,170,0.15)] transition-colors"
        >
          <LogOut size={20} />
          {!collapsed && <span style={{ fontSize: 14 }}>Sair</span>}
        </button>
      </div>
    </div>
  );
}

export function DashboardLayout({ items, userName, userRole, userAvatar, children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#0C0819]">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-[#0C0819] border-r border-[rgba(103,68,170,0.2)] transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
        <SidebarContent
          items={items}
          collapsed={collapsed}
          expandedItems={expandedItems}
          onToggleExpand={(label) => {
            if (label === "__collapse__") {
              setCollapsed(!collapsed);
              return;
            }
            toggleExpand(label);
          }}
          onCloseMobile={() => setMobileOpen(false)}
        />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-[#0C0819]">
            <SidebarContent
              items={items}
              collapsed={false}
              expandedItems={expandedItems}
              onToggleExpand={toggleExpand}
              onCloseMobile={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-[#130D22] border-b border-[rgba(103,68,170,0.1)] dark:border-[rgba(103,68,170,0.3)] flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-[#000] dark:text-white" onClick={() => setMobileOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#39228C] flex items-center justify-center text-white" style={{ fontSize: 13 }}>
                  {userName.charAt(0)}
                </div>
              )}
              <div className="hidden sm:block">
                <p style={{ fontSize: 14, fontWeight: 500 }} className="text-[#000] dark:text-white">{userName}</p>
                <p style={{ fontSize: 12 }} className="text-[#6B7280] dark:text-white/60">{userRole}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-[#F9FAFB] dark:bg-[#0C0819] dark:text-white p-4 sm:p-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}