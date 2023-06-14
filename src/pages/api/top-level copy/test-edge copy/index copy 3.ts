import { getData } from '@/service';
import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge",
  regions: ['fra1'],
};

export default async function handler() {
  const data = await getData()
  return NextResponse.json({ result: data });
}
