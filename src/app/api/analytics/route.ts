import { NextResponse } from 'next/server';
import { getProjectStats } from '@/lib/database';

export async function GET() {
  try {
    const stats = await getProjectStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}