import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Bookings from "@/components/admin/Bookings";

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), order: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: mocks.rpc, from: () => ({ select: () => ({ order: mocks.order }) }) } }));
const pending = { id: "booking-1", lead_id: "lead-1", status: "Pending", created_at: "2026-10-27T12:00:00Z", decided_at: null, leads: { reference: "QP-TEST01", origin: "London", destination: "Harare", lead_type: "sender", details: {}, lead_contacts: { full_name: "Test Sender", phone: "+447700900123" } } };
describe("Booking decisions", () => {
  beforeEach(() => { mocks.rpc.mockReset().mockResolvedValue({ error: null }); mocks.order.mockReset().mockResolvedValue({ data: [pending], error: null }); });
  it("submits Approved only after admin confirmation", async () => {
    render(<Bookings revision={0} onDecision={() => {}} />);
    fireEvent.click(await screen.findByRole("button", { name: "Approve" }));
    expect(mocks.rpc).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirm decision" }));
    await waitFor(() => expect(mocks.rpc).toHaveBeenCalledWith("decide_booking", { p_booking_id: "booking-1", p_status: "Approved" }));
  });
  it("submits Rejected and does not submit an approval", async () => {
    render(<Bookings revision={0} onDecision={() => {}} />);
    fireEvent.click(await screen.findByRole("button", { name: "Reject" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm decision" }));
    await waitFor(() => expect(mocks.rpc).toHaveBeenCalledWith("decide_booking", { p_booking_id: "booking-1", p_status: "Rejected" }));
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });
  it("keeps the decision unsuccessful when the server denies access", async () => {
    mocks.rpc.mockResolvedValue({ error: { message: "Admin access required" } });
    const onDecision = vi.fn();
    render(<Bookings revision={0} onDecision={onDecision} />);
    fireEvent.click(await screen.findByRole("button", { name: "Approve" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm decision" }));
    await screen.findByRole("alert");
    expect(onDecision).not.toHaveBeenCalled();
  });
});