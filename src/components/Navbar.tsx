import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/DarkModeToggle";
import { useEffect, useState } from "react";
import logoUrl from "@/assets/qikparcel-logo.png";

const sections = ["senders", "travelers", "business"] as const;

const scrollTo = (id: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const NavLink = ({ id, active }: { id: string; active: boolean }) => (
  <a
    href={`#${id}`}
    onClick={scrollTo(id)}
    className={`relative transition-colors pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:bg-primary after:transition-transform after:duration-300 after:origin-bottom-left ${active ? "text-primary font-semibold after:w-full after:scale-x-100" : "text-muted-foreground hover:text-foreground after:w-full after:scale-x-0 hover:after:scale-x-100"}`}
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
        <Link to="/" className="flex items-center">
          <img
            src={logoUrl}
            alt="QikParcel"
            className="h-8 w-auto object-contain"
          />
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm">
          {sections.map((id) => (
            <NavLink key={id} id={id} active={activeSection === id} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          {/* Hidden on the narrowest screens so the Join CTA keeps its space. */}
          <Button variant="heroOutline" size="sm" className="hidden sm:inline-flex" asChild>
            <a href="https://app.qikparcel.com/" target="_blank" rel="noopener noreferrer">
              Access Platform
            </a>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/onboarding">Join</Link>
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
