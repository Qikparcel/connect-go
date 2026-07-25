import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const insert = vi.fn().mockResolvedValue({ error: null });

vi.mock("@/integrations/supabase/client", () => ({
  isSupabaseConfigured: true,
  supabase: { from: () => ({ insert }) },
}));

import OnboardingForm from "@/components/onboarding/OnboardingForm";

const renderForm = () =>
  render(
    <MemoryRouter initialEntries={["/onboarding?src=zimfest"]}>
      <OnboardingForm />
    </MemoryRouter>,
  );

const clickContinue = async (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole("button", { name: /continue/i }));

beforeEach(() => {
  window.localStorage.clear();
  insert.mockClear();
});

describe("OnboardingForm", () => {
  it("opens on the attribution question", () => {
    renderForm();
    expect(screen.getByRole("heading", { name: /how did you hear about qikparcel/i })).toBeInTheDocument();
    expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument();
  });

  it("will not advance until the question is answered", async () => {
    const user = userEvent.setup();
    renderForm();

    await clickContinue(user);

    expect(await screen.findByText(/please pick one/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /how did you hear/i })).toBeInTheDocument();
  });

  it("routes a multi-role person through every relevant branch, then contact", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("radio", { name: "Zimfest" }));
    await clickContinue(user);

    // The vendor who also flies home monthly — the case that justifies one form.
    expect(await screen.findByRole("heading", { name: /which best describes you/i })).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "Business" }));
    await user.click(screen.getByRole("checkbox", { name: "Traveller" }));

    // Two branches + attribution + roles + contact = 5 steps.
    expect(screen.getByText(/step 2 of 5/i)).toBeInTheDocument();
    await clickContinue(user);

    // Traveller comes before Business regardless of tick order.
    expect(await screen.findByRole("heading", { name: /about your travel/i })).toBeInTheDocument();
    await user.type(screen.getByLabelText(/you travel from/i), "London");
    await user.type(screen.getByLabelText(/you travel to/i), "Harare");
    await user.click(screen.getByRole("radio", { name: "Monthly" }));
    await clickContinue(user);

    expect(await screen.findByRole("heading", { name: /about your business/i })).toBeInTheDocument();
  });

  it("skips branches the user did not tick", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("radio", { name: "Airport" }));
    await clickContinue(user);
    await user.click(await screen.findByRole("checkbox", { name: "Courier" }));
    await clickContinue(user);

    expect(await screen.findByRole("heading", { name: /about your deliveries/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /about your business/i })).not.toBeInTheDocument();
  });

  it("saves a complete submission and confirms it", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("radio", { name: "Zimfest" }));
    await clickContinue(user);
    await user.click(await screen.findByRole("checkbox", { name: "Sender" }));
    await clickContinue(user);

    await screen.findByRole("heading", { name: /about what you send/i });
    await user.type(screen.getByLabelText(/what do you send/i), "Clothes and medication");
    await user.click(screen.getByRole("radio", { name: "Monthly" }));
    await user.type(screen.getByLabelText(/you send from/i), "Leeds");
    await user.type(screen.getByLabelText(/you send to/i), "Bulawayo");
    await clickContinue(user);

    await screen.findByRole("heading", { name: /your details/i });
    await user.type(screen.getByLabelText(/full name/i), "Tanaka Moyo");
    await user.type(screen.getByLabelText(/whatsapp number/i), "+447700900123");
    await user.click(screen.getByRole("button", { name: /join qikparcel/i }));

    expect(await screen.findByText(/you're on the list/i)).toBeInTheDocument();

    await waitFor(() => expect(insert).toHaveBeenCalledTimes(1));
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        heard_about: "Zimfest",
        source: "zimfest",
        roles: ["Sender"],
        sender_route_to: "Bulawayo",
        full_name: "Tanaka Moyo",
        business_name: null,
      }),
    );
  });

  it("keeps the answers when saving fails, so nothing has to be retyped", async () => {
    const user = userEvent.setup();
    insert.mockResolvedValueOnce({ error: { message: "Failed to fetch" } });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    renderForm();

    await user.click(screen.getByRole("radio", { name: "Zimfest" }));
    await clickContinue(user);
    await user.click(await screen.findByRole("checkbox", { name: "Sender" }));
    await clickContinue(user);

    await screen.findByRole("heading", { name: /about what you send/i });
    await user.type(screen.getByLabelText(/what do you send/i), "Clothes");
    await user.click(screen.getByRole("radio", { name: "Monthly" }));
    await user.type(screen.getByLabelText(/you send from/i), "Leeds");
    await user.type(screen.getByLabelText(/you send to/i), "Bulawayo");
    await clickContinue(user);

    await screen.findByRole("heading", { name: /your details/i });
    await user.type(screen.getByLabelText(/full name/i), "Tanaka Moyo");
    await user.type(screen.getByLabelText(/whatsapp number/i), "+447700900123");
    await user.click(screen.getByRole("button", { name: /join qikparcel/i }));

    await waitFor(() => expect(insert).toHaveBeenCalled());
    // No false confirmation, and the draft survives for a retry.
    expect(screen.queryByText(/you're on the list/i)).not.toBeInTheDocument();
    expect(window.localStorage.getItem("qikparcel-onboarding-draft-v1")).toContain("Tanaka Moyo");
    // The real cause is logged rather than swallowed.
    expect(consoleError).toHaveBeenCalledWith("[onboarding] submission failed", expect.anything());
    consoleError.mockRestore();
  });

  it("restores answers after a page reload", async () => {
    const user = userEvent.setup();
    const { unmount } = renderForm();

    await user.click(screen.getByRole("radio", { name: "Referral" }));
    await waitFor(() => expect(window.localStorage.getItem("qikparcel-onboarding-draft-v1")).toContain("Referral"));
    unmount();

    renderForm();
    expect(screen.getByRole("radio", { name: "Referral" })).toHaveAttribute("aria-checked", "true");
  });
});
