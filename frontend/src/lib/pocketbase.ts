import PocketBase, { RecordFullListOptions, RecordModel, RecordOptions } from "pocketbase";
import { CollectionMap, PocketbaseCollection } from "./types/pocketbase";

export const PocketbaseGetAll = async <T extends PocketbaseCollection>(collection: T, options: RecordFullListOptions): Promise<CollectionMap[T][]> => {
  const pb = new PocketBase(process.env.POCKETBASE_URL!);
  await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL!, process.env.POCKETBASE_SUPERUSER_PASSWORD!);
  const data = await pb.collection(collection).getFullList(options);

  return data as CollectionMap[T][];
}

export const PocketbaseGetOne = async <T extends PocketbaseCollection>(collection: T, id: string, options: RecordOptions): Promise<CollectionMap[T]> => {
  const pb = new PocketBase(process.env.POCKETBASE_URL!);
  await pb.collection("_superusers").authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL!, process.env.POCKETBASE_SUPERUSER_PASSWORD!);
  const data = await pb.collection(collection).getOne(id);

  return data as CollectionMap[T];
}