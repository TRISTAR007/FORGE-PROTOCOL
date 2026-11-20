import { brandIconResponse } from '@/lib/brand-icon';

export const dynamic = 'force-static';

export function GET() {
  return brandIconResponse(512, 'any');
}
