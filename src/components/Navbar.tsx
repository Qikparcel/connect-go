import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/DarkModeToggle";
import { useEffect, useState } from "react";

const sections = ["senders", "travelers", "business"] as const;

const scrollTo = (id: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const NavLink = ({ id, active }: { id: string; active: boolean }) => (
  <a
    href={`#${id}`}
    onClick={scrollTo(id)}
    className={`transition-colors ${active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}
  >
    {id.charAt(0).toUpperCase() + id.slice(1)}
  </a>
);

const Navbar = () => {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight text-foreground">
            Qik<span className="text-primary">Parcel</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm">
          {sections.map((id) => (
            <NavLink key={id} id={id} active={activeSection === id} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <Button variant="hero" size="sm" asChild>
            <a href="https://app.qikparcel.com/" target="_blank" rel="noopener noreferrer">
              Access Platform
            </a>
          </Button>
        </div>
      </div>
      {/* Mobile nav links banner */}
      <div className="flex md:hidden items-center justify-center gap-6 border-t border-border/30 py-2 text-sm">
        {sections.map((id) => (
          <NavLink key={id} id={id} active={activeSection === id} />
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
