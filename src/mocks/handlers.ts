import { http, HttpResponse, delay } from "msw";

// Fake in-memory data
const demoUser = { id: "u_123", email: "demo@acme.test", role: "admin" };

export const handlers = [
  // Auth: sign-in
  http.post("/api/auth/sign-in", async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    if (body?.email === "fail@example.com") {
      return HttpResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }
    return HttpResponse.json({ accessToken: "mock.token.value" });
  }),

  // Current user
  http.get("/api/me", async () => {
    await delay(250);
    return HttpResponse.json(demoUser);
  }),

  // Demo endpoints for testing toasts
  http.get("/api/demo/random-fail", async () => {
    await delay(300);
    const fail = Math.random() < 0.5;
    if (fail) {
      return HttpResponse.json(
        { message: "Random failure occurred" },
        { status: 500 }
      );
    }
    return HttpResponse.json({ ok: true });
  }),

  http.post("/api/demo/echo", async ({ request }) => {
    await delay(300);
    const body = await request.json();
    return HttpResponse.json({ received: body, message: "Echo successful" });
  }),

  // Transactions
  http.get("/api/transactions", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 10);
    const total = 42;
    const start = (page - 1) * pageSize;
    const data = Array.from({ length: pageSize }).map((_, i) => {
      const idNum = start + i + 1;
      return {
        id: `txn_${idNum}`,
        amount: Math.round(Math.random() * 10000) / 100,
        currency: "USD",
        status: ["success", "failed", "pending"][idNum % 3],
        createdAt: new Date(Date.now() - idNum * 86400000).toISOString(),
      };
    });
    return HttpResponse.json({ data, page, pageSize, total });
  }),

  // Invoices
  http.get("/api/invoices", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 10);
    const total = 18;
    const start = (page - 1) * pageSize;
    const data = Array.from({ length: pageSize }).map((_, i) => {
      const idNum = start + i + 1;
      return {
        id: `inv_${idNum}`,
        amount: Math.round(Math.random() * 20000) / 100,
        currency: "USD",
        status: ["paid", "unpaid", "overdue"][idNum % 3],
        issuedAt: new Date(Date.now() - idNum * 86400000).toISOString(),
        dueAt: new Date(Date.now() + idNum * 86400000).toISOString(),
      };
    });
    return HttpResponse.json({ data, page, pageSize, total });
  }),

  // Settlements
  http.get("/api/settlements", async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 10);
    const total = 25;
    const start = (page - 1) * pageSize;
    const data = Array.from({ length: pageSize }).map((_, i) => {
      const idNum = start + i + 1;
      return {
        id: `set_${idNum}`,
        amount: Math.round(Math.random() * 50000) / 100,
        currency: "USD",
        period: new Date(Date.now() - idNum * 86400000)
          .toISOString()
          .slice(0, 10),
        status: ["processing", "completed", "failed"][idNum % 3],
      };
    });
    return HttpResponse.json({ data, page, pageSize, total });
  }),

  // Devices
  http.get("/api/devices", async ({ request }) => {
    await delay(250);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 10);
    const total = 16;
    const start = (page - 1) * pageSize;
    const data = Array.from({ length: pageSize }).map((_, i) => {
      const idNum = start + i + 1;
      return {
        id: `dev_${idNum}`,
        name: `Terminal ${idNum}`,
        status: ["online", "offline", "error"][idNum % 3],
        lastSeenAt: new Date(Date.now() - idNum * 3600000).toISOString(),
      };
    });
    return HttpResponse.json({ data, page, pageSize, total });
  }),

  // Billing summary
  http.get("/api/billing/summary", async () => {
    await delay(200);
    return HttpResponse.json({
      currentBalance: 1234.56,
      nextInvoiceDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      currency: "USD",
    });
  }),

  // Classifiers
  http.get("/api/classifiers", async () => {
    await delay(150);
    return HttpResponse.json([
      { id: "1", key: "mcc", label: "Merchant Category Code" },
      { id: "2", key: "country", label: "Country" },
      { id: "3", key: "currency", label: "Currency" },
    ]);
  }),

  // Pricing plans
  http.get("/api/pricing/plans", async () => {
    await delay(180);
    return HttpResponse.json([
      {
        id: "basic",
        name: "Basic",
        ratePercent: 2.9,
        monthlyFee: 0,
        currency: "USD",
      },
      {
        id: "pro",
        name: "Pro",
        ratePercent: 2.5,
        monthlyFee: 29,
        currency: "USD",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        ratePercent: 2.1,
        monthlyFee: 99,
        currency: "USD",
      },
    ]);
  }),

  // Activity log
  http.get("/api/activity", async ({ request }) => {
    await delay(220);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 10);
    const total = 50;
    const start = (page - 1) * pageSize;
    const data = Array.from({ length: pageSize }).map((_, i) => {
      const idNum = start + i + 1;
      return {
        id: `act_${idNum}`,
        actor: ["system", "admin", "merchant"][idNum % 3],
        action: ["updated settings", "created invoice", "refunded transaction"][
          idNum % 3
        ],
        createdAt: new Date(Date.now() - idNum * 1800000).toISOString(),
      };
    });
    return HttpResponse.json({ data, page, pageSize, total });
  }),

  // Company profile
  http.get("/api/company/profile", async () => {
    await delay(120);
    return HttpResponse.json({
      id: "co_1",
      name: "Acme, Inc.",
      email: "billing@acme.test",
      address: "123 Market St, SF",
    });
  }),

  // AI Car Recognition: by VIN
  http.post("/api/ai/car-recognition/vin", async ({ request }) => {
    await delay(350);
    const body = (await request.json()) as { vin?: string; apiKey?: string };

    if (!body?.vin || String(body.vin).length !== 17) {
      return HttpResponse.json(
        { success: false, message: "VIN must be 17 characters" },
        { status: 400 }
      );
    }

    // Return a plausible mocked car info
    return HttpResponse.json({
      success: true,
      data: {
        make: "Tesla",
        model: "Model 3",
        year: 2022,
        batteryCapacityKwh: 60,
        rangeKm: 430,
        connectorTypes: ["CCS", "Type 2"],
        imageUrl: "/assets/ev-image.jpg",
      },
    });
  }),

  // AI Car Recognition: by make/model/year
  http.post("/api/ai/car-recognition/model", async ({ request }) => {
    await delay(350);
    const body = (await request.json()) as {
      make?: string;
      model?: string;
      year?: number;
      apiKey?: string;
    };

    if (!body?.make || !body?.model || !body?.year) {
      return HttpResponse.json(
        { success: false, message: "make, model and year are required" },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        make: body.make,
        model: body.model,
        year: body.year,
        batteryCapacityKwh: 77,
        rangeKm: 520,
        connectorTypes: ["CCS", "Type 2"],
        imageUrl: "/assets/ev-image.jpg",
      },
    });
  }),

  // AI Car Image generation (mocked)
  http.post("/api/ai/car-image", async () => {
    await delay(300);
    // We don't use request body for the mock; just return a stock image path
    return HttpResponse.json({ imageUrl: "/assets/ev-image.jpg" });
  }),
];
