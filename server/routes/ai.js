import { Router } from "express";
import { z } from "zod";
import { getOpenAIClient, isAiAvailable } from "../utils/openai.js";

const router = Router();

const ENABLE_MOCK_DATA =
  (process.env.ENABLE_MOCK_DATA || "true").toLowerCase() === "true";

const carInfoSchema = z.object({
  make: z.string(),
  model: z.string(),
  year: z.number(),
  batteryCapacityKwh: z.number().optional(),
  rangeKm: z.number().optional(),
  connectorTypes: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
});

const vinBody = z.object({
  vin: z.string().length(17, "VIN must be 17 characters"),
});
const modelBody = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce
    .number()
    .int()
    .min(1990)
    .max(new Date().getFullYear() + 1),
});

const defaultImageUrl = "/assets/ev-image.jpg"; // frontend can serve a placeholder; swap to CDN if needed

function mockCarInfoFromVin(_vin) {
  return {
    make: "Tesla",
    model: "Model 3",
    year: 2022,
    batteryCapacityKwh: 60,
    rangeKm: 430,
    connectorTypes: ["CCS", "Type 2"],
    imageUrl: defaultImageUrl,
  };
}

function mockCarInfoFromModel({ make, model, year }) {
  return {
    make,
    model,
    year,
    batteryCapacityKwh: 77,
    rangeKm: 520,
    connectorTypes: ["CCS", "Type 2"],
    imageUrl: defaultImageUrl,
  };
}

router.post("/car-recognition/vin", async (req, res) => {
  const parse = vinBody.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({
      success: false,
      message: parse.error.issues[0]?.message || "Invalid body",
    });
  }
  const { vin } = parse.data;

  if (ENABLE_MOCK_DATA || !isAiAvailable()) {
    return res.json({ success: true, data: mockCarInfoFromVin(vin) });
  }

  try {
    const openai = getOpenAIClient();
    const prompt = `Given the VIN ${vin}, infer a plausible electric vehicle (make, model, year). If not sure, choose a common EV. Respond strictly as JSON with keys make, model, year, batteryCapacityKwh, rangeKm, connectorTypes (array of strings).`;
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });
    const content = response.choices?.[0]?.message?.content || "{}";
    const parsed = carInfoSchema.safeParse(JSON.parse(content));
    if (!parsed.success) {
      return res.json({ success: true, data: mockCarInfoFromVin(vin) });
    }
    return res.json({ success: true, data: parsed.data });
  } catch {
    return res.json({ success: true, data: mockCarInfoFromVin(vin) });
  }
});

router.post("/car-recognition/model", async (req, res) => {
  const parse = modelBody.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({
      success: false,
      message: parse.error.issues[0]?.message || "Invalid body",
    });
  }
  const { make, model, year } = parse.data;

  if (ENABLE_MOCK_DATA || !isAiAvailable()) {
    return res.json({
      success: true,
      data: mockCarInfoFromModel({ make, model, year }),
    });
  }

  try {
    const openai = getOpenAIClient();
    const prompt = `Given EV make ${make}, model ${model}, and year ${year}, return a concise JSON with fields make, model, year, batteryCapacityKwh, rangeKm, connectorTypes (array).`;
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });
    const content = response.choices?.[0]?.message?.content || "{}";
    const parsed = carInfoSchema.safeParse(JSON.parse(content));
    if (!parsed.success) {
      return res.json({
        success: true,
        data: mockCarInfoFromModel({ make, model, year }),
      });
    }
    return res.json({ success: true, data: parsed.data });
  } catch {
    return res.json({
      success: true,
      data: mockCarInfoFromModel({ make, model, year }),
    });
  }
});

router.post("/car-image", async (req, res) => {
  // For now, return a placeholder; replace with image-gen if desired
  return res.json({ imageUrl: defaultImageUrl });
});

export default router;
