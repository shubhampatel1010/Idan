import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Building2,
  Menu,
  X,
  LogOut,
  User,
  Settings,
  Users,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: Home, external: false },
  { path: "/dashboard-tenant", label: "Dashboard Tenant", icon: Home, external: false },
  { path: "https://authentica.fillout.com/t/r13RsT7WqVus", label: "Add Tenants", icon: User, external: true },
  { path: "/tenants", label: "Tenants", icon: Users, external: false },
  { path: "https://authentica.fillout.com/t/wSBWN2MMsYus", label: "Add Properties", icon: Building2, external: true },
  { path: "/properties", label: "Properties", icon: Building2, external: false },
  { path: "/settings", label: "Settings", icon: Settings, external: false },
  // add more items to test overflow
];

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // 🔐 Auth check
  useEffect(() => {
    const user = localStorage.getItem("userData");
    if (!user) navigate("/", { replace: true });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/", { replace: true });
  };

  // Split nav items for "More" dropdown if too many
  const maxVisible = 5;
  const visibleItems = navItems.slice(0, maxVisible);
  const moreItems = navItems.slice(maxVisible);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">PropertyMatch</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {visibleItems.map((item) => {
                const isActive = !item.external && location.pathname === item.path;
                const btn = (
                  <Button variant={isActive ? "secondary" : "ghost"} className="gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );

                return item.external ? (
                  <a key={item.label} href={item.path} target="_blank" rel="noopener noreferrer">
                    {btn}
                  </a>
                ) : (
                  <Link key={item.path} to={item.path}>
                    {btn}
                  </Link>
                );
              })}

              {moreItems.length > 0 && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="gap-2"
                    onClick={() => setShowMore(!showMore)}
                  >
                    <MoreHorizontal className="h-4 w-4" /> More
                  </Button>
                  {showMore && (
                    <div className="absolute right-0 mt-2 w-48 bg-background border rounded shadow-md flex flex-col">
                      {moreItems.map((item) => {
                        const isActive = !item.external && location.pathname === item.path;
                        const btn = (
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className="w-full justify-start gap-2"
                          >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Button>
                        );
                        return item.external ? (
                          <a key={item.label} href={item.path} target="_blank" rel="noopener noreferrer">
                            {btn}
                          </a>
                        ) : (
                          <Link key={item.path} to={item.path}>
                            {btn}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Logout */}
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background p-4">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = !item.external && location.pathname === item.path;
                const btn = (
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );

                if (item.external) {
                  return (
                    <a
                      key={item.label}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {btn}
                    </a>
                  );
                }

                return (
                  <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                    {btn}
                  </Link>
                );
              })}

              {/* Logout */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
