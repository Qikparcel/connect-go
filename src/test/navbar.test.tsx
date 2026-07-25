import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "@/components/Navbar";

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  );

describe("Navbar", () => {
  it("offers a route into the onboarding funnel", () => {
    renderNavbar();
    expect(screen.getByRole("link", { name: /^join$/i })).toHaveAttribute("href", "/onboarding");
  });

  it("keeps the existing platform link pointing offsite", () => {
    renderNavbar();
    expect(screen.getByRole("link", { name: /access platform/i })).toHaveAttribute(
      "href",
      "https://app.qikparcel.com/",
    );
  });
});
