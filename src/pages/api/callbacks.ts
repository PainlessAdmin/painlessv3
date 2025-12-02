/**
 * CALLBACKS ENDPOINT
 *
 * Handles callback requests for specialist items or large properties
 */

import type { APIRoute } from 'astro';
import { getCORSHeaders } from '@/lib/utils/cors';
import { logger } from '@/lib/utils/logger';

export const POST: APIRoute = async (context) => {
  const origin = context.request.headers.get('Origin');
  const corsHeaders = getCORSHeaders(origin);

  try {
    const body = await context.request.json();

    logger.info('API', 'Callback request received', {
      reason: body.callbackReason,
      email: body.contact?.email,
    });

    // For now, just log the callback request
    // In production, this would save to database and trigger notifications

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Callback request received',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    logger.error('API', 'Callback request failed', { error });

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to process callback request',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

// CORS preflight
export const OPTIONS: APIRoute = async (context) => {
  const origin = context.request.headers.get('Origin');
  const corsHeaders = getCORSHeaders(origin);

  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};
