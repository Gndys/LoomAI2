import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@libs/auth';
import {
  evolinkCreateImageGenerationTask,
  evolinkGetTaskDetail,
  type EvolinkImageQuality,
  type EvolinkImageSize,
} from '@libs/ai';

export const maxDuration = 60;

type PatternGoal = 'multi' | 'material' | 'comfort' | 'structure';

const BASE_PROMPT = `
You are a garment pattern assistant. Convert the provided garment image into a cutting-plan inspiration sheet.

Output requirements:
- Clean technical line drawing on a white background
- Include pattern pieces such as front, back, sleeves, collar, cuffs, pockets when relevant
- Show seam allowance lines, grainline arrows, notches, and alignment marks
- Flat layout view with clear piece spacing
- Crisp vector-like lines, minimal shading, no text labels, no dimensions
`.trim();

const MULTI_VARIANT_PROMPT = `
Create three distinct cutting-plan variants arranged in a 3-column layout:
- Material-saving
- Comfort-first
- Structure-clarity
Use subtle panel separation or spacing, but no text labels.
`.trim();

const GOAL_FOCUS: Record<Exclude<PatternGoal, 'multi'>, string> = {
  material: 'Focus on minimal fabric waste and efficient piece nesting.',
  comfort: 'Focus on ease, comfort, and smoother fit lines.',
  structure: 'Focus on clear structure, stable seam placement, and balanced proportions.',
};

function buildPrompt(goal: PatternGoal) {
  const focusPrompt = goal === 'multi' ? MULTI_VARIANT_PROMPT : GOAL_FOCUS[goal];
  return `${BASE_PROMPT}\n\n${focusPrompt}\n\nStyle: Technical fashion drafting line art, pattern-making aesthetic.`;
}

function toOptionalSize(value: unknown): EvolinkImageSize | undefined {
  const allowed: EvolinkImageSize[] = [
    'auto',
    '1:1',
    '2:3',
    '3:2',
    '3:4',
    '4:3',
    '9:16',
    '16:9',
  ];
  return typeof value === 'string' && (allowed as string[]).includes(value) ? (value as EvolinkImageSize) : undefined;
}

function toOptionalQuality(value: unknown): EvolinkImageQuality | undefined {
  const allowed: EvolinkImageQuality[] = ['1K', '2K', '4K'];
  return typeof value === 'string' && (allowed as string[]).includes(value) ? (value as EvolinkImageQuality) : undefined;
}

function toOptionalGoal(value: unknown): PatternGoal | undefined {
  const allowed: PatternGoal[] = ['multi', 'material', 'comfort', 'structure'];
  return typeof value === 'string' && (allowed as string[]).includes(value) ? (value as PatternGoal) : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const imageUrl = body?.imageUrl;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }

    const size = toOptionalSize(body?.size) ?? 'auto';
    const quality = toOptionalQuality(body?.quality) ?? '2K';
    const goal = toOptionalGoal(body?.goal) ?? 'multi';

    const task = await evolinkCreateImageGenerationTask({
      model: 'gemini-2.5-flash-image',
      prompt: buildPrompt(goal),
      size,
      quality,
      image_urls: [imageUrl],
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    console.error('Pattern making create task error:', error);
    return NextResponse.json(
      { error: 'create_task_failed', message: error?.message || 'Unknown error' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = request.nextUrl.searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const detail = await evolinkGetTaskDetail(taskId);
    return NextResponse.json({ success: true, data: detail });
  } catch (error: any) {
    console.error('Pattern making get task error:', error);
    return NextResponse.json(
      { error: 'get_task_failed', message: error?.message || 'Unknown error' },
      { status: 500 },
    );
  }
}
