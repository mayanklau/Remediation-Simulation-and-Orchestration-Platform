import { buildGoLiveModel } from "@/domain/go-live";
import { apiHandler } from "@/lib/api";

export const GET = apiHandler(async () => Response.json({ goLive: buildGoLiveModel() }));
