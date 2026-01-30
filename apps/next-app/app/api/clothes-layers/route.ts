import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@libs/auth";
import {
  evolinkCreateImageGenerationTask,
  evolinkGetTaskDetail,
} from "@libs/ai/evolink";

export const maxDuration = 120;

type Mode = "auto" | "semi" | "manual";
type Action = "decompose" | "export";

type LayerPayload = {
  id: string;
  labelKey?: string;
  name?: string;
  type: "panel" | "detail" | "seam";
  path?: string;
  strokeDasharray?: string;
  opacity?: number;
  imageUrl?: string;
};

const BASE_LAYERS: LayerPayload[] = [
  {
    id: "front-panel",
    labelKey: "frontPanel",
    name: "Front Panel",
    type: "panel",
    path: "M150 70 L450 70 L500 170 L455 360 L145 360 L100 170 Z",
  },
  {
    id: "back-panel",
    labelKey: "backPanel",
    name: "Back Panel",
    type: "panel",
    path: "M180 95 L420 95 L460 170 L420 330 L180 330 L140 170 Z",
  },
  {
    id: "sleeve",
    labelKey: "sleeve",
    name: "Sleeve",
    type: "detail",
    path: "M480 150 L560 190 L520 270 L445 225 Z",
  },
  {
    id: "collar",
    labelKey: "collar",
    name: "Collar",
    type: "detail",
    path: "M255 70 Q300 120 345 70",
  },
];

const POCKET_LAYER: LayerPayload = {
  id: "pocket",
  labelKey: "pocket",
  name: "Pocket",
  type: "detail",
  path: "M320 210 L390 210 L390 285 L320 285 Z",
};

const SEAM_LAYER: LayerPayload = {
  id: "seam-lines",
  labelKey: "seamLines",
  name: "Seam Lines",
  type: "seam",
  path: "M170 145 L430 145 M210 300 L390 300",
  strokeDasharray: "6 6",
  opacity: 80,
};

const HEM_LAYER: LayerPayload = {
  id: "hem-line",
  name: "Hem Line",
  type: "seam",
  path: "M170 335 L430 335",
  strokeDasharray: "4 5",
  opacity: 70,
};

const NANO_BANANA_LAYERS = [
  {
    id: "front-panel",
    labelKey: "frontPanel",
    name: "Front Panel",
    type: "panel" as const,
    prompt:
      "Isolate only the front panel lines of the garment. Keep the original line style and scale. Remove all other parts. Transparent background. Black line art only.",
  },
  {
    id: "back-panel",
    labelKey: "backPanel",
    name: "Back Panel",
    type: "panel" as const,
    prompt:
      "Isolate only the back panel lines of the garment. Keep the original line style and scale. Remove all other parts. Transparent background. Black line art only.",
  },
  {
    id: "sleeve",
    labelKey: "sleeve",
    name: "Sleeve",
    type: "detail" as const,
    prompt:
      "Isolate only the sleeve lines of the garment. Keep the original line style and scale. Remove all other parts. Transparent background. Black line art only.",
  },
  {
    id: "collar",
    labelKey: "collar",
    name: "Collar",
    type: "detail" as const,
    prompt:
      "Isolate only the collar lines of the garment. Keep the original line style and scale. Remove all other parts. Transparent background. Black line art only.",
  },
  {
    id: "pocket",
    labelKey: "pocket",
    name: "Pocket",
    type: "detail" as const,
    prompt:
      "Isolate only the pocket lines of the garment. Keep the original line style and scale. Remove all other parts. Transparent background. Black line art only.",
  },
  {
    id: "seam-lines",
    labelKey: "seamLines",
    name: "Seam Lines",
    type: "seam" as const,
    prompt:
      "Isolate only the seam or stitching lines of the garment. Keep the original line style and scale. Remove all other parts. Transparent background. Black line art only.",
  },
];

const toMode = (value: unknown): Mode =>
  value === "auto" || value === "semi" || value === "manual" ? value : "auto";

const toAction = (value: unknown): Action =>
  value === "export" ? "export" : "decompose";

const extractImageUrl = (payload: any): string | null => {
  if (!payload) return null;
  if (typeof payload.image === "string") return payload.image;
  if (typeof payload.imageUrl === "string") return payload.imageUrl;
  if (typeof payload.url === "string") return payload.url;
  const image =
    payload?.images?.[0]?.url ||
    payload?.images?.[0]?.image ||
    payload?.images?.[0]?.content ||
    payload?.output?.[0]?.url ||
    payload?.output?.image_url ||
    payload?.data?.[0]?.url;
  return typeof image === "string" ? image : null;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const runNanoBanana = async (imageUrl: string, prompt: string) => {
  const task = await evolinkCreateImageGenerationTask({
    model: "gemini-3-pro-image-preview",
    prompt,
    image_urls: [imageUrl],
    size: "auto",
  });

  const maxAttempts = 60;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const detail = await evolinkGetTaskDetail(task.id);
    if (detail.status === "completed") {
      const resultUrl = detail.results?.[0] ? extractImageUrl({ url: detail.results[0] }) : null;
      if (!resultUrl) {
        throw new Error("No image URL in Evolink response");
      }
      return resultUrl;
    }
    if (detail.status === "failed") {
      throw new Error("Evolink task failed");
    }
    await sleep(1500);
  }

  throw new Error("Evolink task timeout");
};

const buildLayers = (mode: Mode) => {
  const layers = [...BASE_LAYERS];

  if (mode !== "auto") {
    layers.push(POCKET_LAYER);
  }

  layers.push(SEAM_LAYER);

  if (mode === "manual") {
    layers.push(HEM_LAYER);
  }

  return layers;
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const action = toAction(body?.action);

    if (action === "export") {
      const format = typeof body?.format === "string" ? body.format : "svg-json";
      const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl : undefined;
      return NextResponse.json({
        success: true,
        data: {
          format,
          exportId: `mock-${Date.now()}`,
          imageUrl,
        },
      });
    }

    const mode = toMode(body?.mode);
    const imageUrl = body?.imageUrl;
    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }
    const layers = buildLayers(mode);

    const aiLayers: LayerPayload[] = [];
    for (const layer of NANO_BANANA_LAYERS) {
      const layerImageUrl = await runNanoBanana(imageUrl, layer.prompt);
      aiLayers.push({
        id: layer.id,
        labelKey: layer.labelKey,
        name: layer.name,
        type: layer.type,
        imageUrl: layerImageUrl,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        mode,
        layers: aiLayers.length ? aiLayers : layers,
      },
    });
  } catch (error: any) {
    console.error("Clothes layers mock error:", error);
    return NextResponse.json(
      { error: "mock_failed", message: error?.message || "Unknown error" },
      { status: 500 },
    );
  }
}
