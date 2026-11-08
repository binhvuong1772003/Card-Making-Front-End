import { describe, expect, it, vi } from "vitest";
import { API_URL } from "@/lib/api/config";
import { isClosed, submitRsvp, validateRsvp, type RsvpConfig, type RsvpValues } from "./rsvp";

const config = (overrides: Partial<RsvpConfig> = {}): RsvpConfig => ({
  askGuests: true,
  askPhone: false,
  askNote: true,
  askMaybe: true,
  maxGuests: 4,
  ...overrides,
});

const values = (overrides: Partial<RsvpValues> = {}): RsvpValues => ({
  name: "Nguyễn An",
  attending: "YES",
  guests: 2,
  note: "Hẹn gặp",
  ...overrides,
});

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("isClosed", () => {
  it("has no end when there is no deadline, or the date is not a real one", () => {
    expect(isClosed("", new Date("2030-01-01T00:00:00Z"))).toBe(false);
    expect(isClosed("2026-02-30", new Date("2030-01-01T00:00:00Z"))).toBe(false);
  });

  it("stays open through the last millisecond of the day in Vietnam", () => {
    expect(isClosed("2026-11-07", new Date("2026-11-07T16:59:59.999Z"))).toBe(false);
    expect(isClosed("2026-11-07", new Date("2026-11-07T17:00:00.000Z"))).toBe(true);
  });

  it("is open before the day and closed after it", () => {
    expect(isClosed("2026-11-07", new Date("2026-11-06T23:59:59Z"))).toBe(false);
    expect(isClosed("2026-11-07", new Date("2026-11-08T00:00:00Z"))).toBe(true);
  });
});

describe("validateRsvp", () => {
  it("accepts a full answer", () => {
    expect(validateRsvp(values(), config())).toEqual({});
  });

  it("wants a name, and not one longer than the card can keep", () => {
    expect(validateRsvp(values({ name: "  " }), config())).toEqual({ name: "Nhập tên của bạn." });
    expect(validateRsvp(values({ name: "a".repeat(101) }), config())).toHaveProperty("name");
  });

  it("wants exactly one answer, and no MAYBE when that choice is off", () => {
    expect(validateRsvp(values({ attending: null }), config())).toEqual({ attending: "Chọn một câu trả lời." });
    expect(validateRsvp(values({ attending: "MAYBE" }), config({ askMaybe: false }))).toHaveProperty("attending");
    expect(validateRsvp(values({ attending: "MAYBE" }), config())).toEqual({});
  });

  it("keeps guests between one and the block's limit, and only for a YES answer", () => {
    expect(validateRsvp(values({ guests: 0 }), config())).toHaveProperty("guests");
    expect(validateRsvp(values({ guests: 5 }), config())).toHaveProperty("guests");
    expect(validateRsvp(values({ guests: 4 }), config())).toEqual({});
    expect(validateRsvp(values({ attending: "NO", guests: 9 }), config())).toEqual({});
  });

  it("only asks for what the block asks", () => {
    expect(validateRsvp(values({ guests: 9 }), config({ askGuests: false }))).toEqual({});
    expect(validateRsvp(values({ note: "a".repeat(501) }), config({ askNote: false }))).toEqual({});
    expect(validateRsvp(values({ note: "a".repeat(501) }), config())).toHaveProperty("note");
  });

  it("checks the phone number when the block asks for one", () => {
    const asked = config({ askPhone: true });
    expect(validateRsvp(values({ phone: "abc" }), asked)).toHaveProperty("phone");
    expect(validateRsvp(values({ phone: "123" }), asked)).toHaveProperty("phone");
    expect(validateRsvp(values({ phone: "090 123 4567" }), asked)).toEqual({});
    expect(validateRsvp(values({ phone: "abc" }), config())).toEqual({});
  });
});

describe("submitRsvp", () => {
  it("posts to the public page and hides the honeypot", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => json(201, { id: "r1" }));
    await expect(
      submitRsvp(
        { slug: "thiep-cuoi", blockId: "b1", name: "An", attending: "YES", guests: 2, note: "Hẹn gặp" },
        fetchMock as unknown as typeof fetch,
      ),
    ).resolves.toEqual({ id: "r1" });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe(`${API_URL}/api/v1/publications/thiep-cuoi/rsvps`);
    expect(init).toMatchObject({ method: "POST", headers: { "Content-Type": "application/json" } });
    expect(JSON.parse(String(init?.body))).toEqual({
      blockId: "b1",
      name: "An",
      attending: "YES",
      guests: 2,
      note: "Hẹn gặp",
      website: "",
    });
  });

  it("leaves out the answers the guest did not give", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => json(201, { id: "r1" }));
    await submitRsvp({ slug: "s", blockId: "b", name: "An", attending: "NO" }, fetchMock as unknown as typeof fetch);
    const body = JSON.parse(String(fetchMock.mock.calls[0]![1]?.body));
    expect(body).not.toHaveProperty("guests");
    expect(body).not.toHaveProperty("phone");
    expect(body).not.toHaveProperty("note");
  });

  it("turns a dropped connection into the NETWORK code", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => {
      throw new TypeError("Failed to fetch");
    });
    await expect(
      submitRsvp({ slug: "s", blockId: "b", name: "An", attending: "YES" }, fetchMock as unknown as typeof fetch),
    ).rejects.toMatchObject({ code: "NETWORK" });
  });

  it("keeps the server's reason for a closed form", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () =>
      json(409, { error: { code: "CONFLICT", message: "This form is closed", details: { reason: "CLOSED" } } }),
    );
    await expect(
      submitRsvp({ slug: "s", blockId: "b", name: "An", attending: "YES" }, fetchMock as unknown as typeof fetch),
    ).rejects.toMatchObject({ code: "CONFLICT", details: { reason: "CLOSED" } });
  });

  it("keeps a failure that is not JSON as a server error", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response("<html>bad gateway</html>", { status: 502 }));
    await expect(
      submitRsvp({ slug: "s", blockId: "b", name: "An", attending: "YES" }, fetchMock as unknown as typeof fetch),
    ).rejects.toMatchObject({ code: "UNKNOWN" });
  });
});
