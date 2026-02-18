import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await clientPromise;
    await client.db().command({ ping: 1 });
    res.status(200).json({ message: "MongoDB connection successful!" });
  } catch (error) {
    res.status(500).json({ message: "MongoDB connection failed.", error: error instanceof Error ? error.message : error });
  }
}