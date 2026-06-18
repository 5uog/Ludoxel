/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
declare const process: {
  env: Record<string, string | undefined>;
};

type FeedbackVote = 'yes' | 'no';

type FeedbackRequestBody = {
  pagePath?: unknown;
  vote?: unknown;
  voterId?: unknown;
};

type VercelRequestLike = {
  body?: unknown;
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type VercelResponseLike = {
  end: () => void;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  status: (statusCode: number) => VercelResponseLike;
};

type UpstashRestResult<T> = {
  result?: T;
  error?: string;
};

type FeedbackCounts = {
  yes: number;
  no: number;
};

const VALID_PAGE_PATH_PATTERN = /^\/docs\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/;
const VALID_VOTER_ID_PATTERN = /^[a-zA-Z0-9:_-]{8,96}$/;

const SAVE_FEEDBACK_SCRIPT = `
local current_vote = redis.call("HGET", KEYS[1], ARGV[1])

if current_vote == ARGV[2] then
  local yes_count = redis.call("HGET", KEYS[2], "yes") or "0"
  local no_count = redis.call("HGET", KEYS[2], "no") or "0"
  return { yes_count, no_count, current_vote }
end

if current_vote == "yes" or current_vote == "no" then
  redis.call("HINCRBY", KEYS[2], current_vote, -1)
end

redis.call("HINCRBY", KEYS[2], ARGV[2], 1)
redis.call("HSET", KEYS[1], ARGV[1], ARGV[2])

local yes_count = redis.call("HGET", KEYS[2], "yes") or "0"
local no_count = redis.call("HGET", KEYS[2], "no") or "0"

return { yes_count, no_count, ARGV[2] }
`.trim();

function isFeedbackVote(value: unknown): value is FeedbackVote {
  return value === 'yes' || value === 'no';
}

function getSingleQueryValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function normalizePagePath(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const pagePath = value.trim();

  if (pagePath.length < '/docs/a'.length || pagePath.length > 240) {
    return null;
  }

  return VALID_PAGE_PATH_PATTERN.test(pagePath) ? pagePath : null;
}

function normalizeVoterId(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const voterId = value.trim();

  return VALID_VOTER_ID_PATTERN.test(voterId) ? voterId : null;
}

function getRequestBody(request: VercelRequestLike): FeedbackRequestBody {
  if (typeof request.body === 'string') {
    try {
      return JSON.parse(request.body) as FeedbackRequestBody;
    } catch {
      return {};
    }
  }

  if (request.body !== null && typeof request.body === 'object') {
    return request.body as FeedbackRequestBody;
  }

  return {};
}

function getUpstashRestUrl(): string | null {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL;

  if (restUrl === undefined || restUrl.trim().length === 0) {
    return null;
  }

  return restUrl.replace(/\/+$/g, '');
}

function getUpstashRestToken(): string | null {
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (restToken === undefined || restToken.trim().length === 0) {
    return null;
  }

  return restToken;
}

function getFeedbackVoteKey(pagePath: string): string {
  return `docs:feedback:votes:${pagePath}`;
}

function getFeedbackCountKey(pagePath: string): string {
  return `docs:feedback:counts:${pagePath}`;
}

function parseCount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value));
  }

  if (typeof value === 'string') {
    const parsedValue = Number.parseInt(value, 10);

    return Number.isFinite(parsedValue) ? Math.max(0, parsedValue) : 0;
  }

  return 0;
}

function parseCounts(values: unknown): FeedbackCounts {
  if (!Array.isArray(values)) {
    return {
      yes: 0,
      no: 0,
    };
  }

  return {
    yes: parseCount(values[0]),
    no: parseCount(values[1]),
  };
}

async function runUpstashCommand<T>(command: unknown[]): Promise<T> {
  const restUrl = getUpstashRestUrl();
  const restToken = getUpstashRestToken();

  if (restUrl === null || restToken === null) {
    throw new Error('Upstash Redis REST environment variables are missing.');
  }

  const response = await fetch(restUrl, {
    body: JSON.stringify(command),
    headers: {
      Authorization: `Bearer ${restToken}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const payload = (await response.json()) as UpstashRestResult<T>;

  if (!response.ok || payload.error !== undefined) {
    throw new Error(payload.error ?? 'Upstash Redis REST request failed.');
  }

  return payload.result as T;
}

async function readFeedbackCounts(pagePath: string): Promise<FeedbackCounts> {
  const result = await runUpstashCommand<unknown[]>(['HMGET', getFeedbackCountKey(pagePath), 'yes', 'no']);

  return parseCounts(result);
}

async function saveFeedbackVote(pagePath: string, voterId: string, vote: FeedbackVote): Promise<FeedbackCounts> {
  const result = await runUpstashCommand<unknown[]>(['EVAL', SAVE_FEEDBACK_SCRIPT, 2, getFeedbackVoteKey(pagePath), getFeedbackCountKey(pagePath), voterId, vote]);

  return parseCounts(result);
}

function setCommonHeaders(response: VercelResponseLike): void {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
}

async function handleGet(request: VercelRequestLike, response: VercelResponseLike): Promise<void> {
  const pagePath = normalizePagePath(getSingleQueryValue(request.query?.pagePath));

  if (pagePath === null) {
    response.status(400).json({ error: 'Invalid pagePath.' });
    return;
  }

  const counts = await readFeedbackCounts(pagePath);

  response.status(200).json({ counts, pagePath });
}

async function handlePost(request: VercelRequestLike, response: VercelResponseLike): Promise<void> {
  const body = getRequestBody(request);
  const pagePath = normalizePagePath(body.pagePath);
  const voterId = normalizeVoterId(body.voterId);
  const vote = body.vote;

  if (pagePath === null) {
    response.status(400).json({ error: 'Invalid pagePath.' });
    return;
  }

  if (voterId === null) {
    response.status(400).json({ error: 'Invalid voterId.' });
    return;
  }

  if (!isFeedbackVote(vote)) {
    response.status(400).json({ error: 'Invalid vote.' });
    return;
  }

  const counts = await saveFeedbackVote(pagePath, voterId, vote);

  response.status(200).json({ counts, pagePath, vote });
}

export default async function handler(request: VercelRequestLike, response: VercelResponseLike): Promise<void> {
  setCommonHeaders(response);

  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }

  try {
    if (request.method === 'GET') {
      await handleGet(request, response);
      return;
    }

    if (request.method === 'POST') {
      await handlePost(request, response);
      return;
    }

    response.status(405).json({ error: 'Method not allowed.' });
  } catch {
    response.status(503).json({ error: 'Feedback storage is unavailable.' });
  }
}
