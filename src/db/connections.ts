import { db } from "./schema";
import type { Connection, CreateConnectionInput } from "../types";
import { generateId } from "../lib/utils";

export async function createConnection(
  input: CreateConnectionInput
): Promise<Connection> {
  const connection: Connection = {
    ...input,
    id: generateId(),
    createdAt: new Date(),
  };
  await db.connections.add(connection);
  return connection;
}

export async function getConnection(id: string): Promise<Connection | undefined> {
  return db.connections.get(id);
}

export async function deleteConnection(id: string): Promise<void> {
  await db.connections.delete(id);
}

export async function getConnectionsForResource(
  resourceId: string
): Promise<Connection[]> {
  const outgoing = await db.connections
    .where("sourceId")
    .equals(resourceId)
    .toArray();
  const incoming = await db.connections
    .where("targetId")
    .equals(resourceId)
    .toArray();
  return [...outgoing, ...incoming];
}

export async function getAllConnections(): Promise<Connection[]> {
  return db.connections.toArray();
}

export async function getConnectionCount(): Promise<number> {
  return db.connections.count();
}
