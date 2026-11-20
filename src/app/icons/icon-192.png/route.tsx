import { brandIconResponse } from '@/lib/brand-icon';

export const dynamic = 'force-static';

export function GET() {
  return brandIconResponse(192, 'any');
}
