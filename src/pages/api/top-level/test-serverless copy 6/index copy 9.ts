import { getData } from '@/service';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from "next/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const data = await getData()
  return res.json({ result: data });
}
