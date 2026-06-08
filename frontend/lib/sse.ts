export const clients = new Set<ReadableStreamDefaultController>();

export function addClient(controller: ReadableStreamDefaultController) {
  clients.add(controller);
}

export function removeClient(controller: ReadableStreamDefaultController) {
  clients.delete(controller);
}

export function notifyClients(event: any) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  const encoder = new TextEncoder();
  clients.forEach(client => {
    try {
      client.enqueue(encoder.encode(data));
    } catch (e) {
      clients.delete(client);
    }
  });
}
