import {Publisher} from "library-excel-extractor";
import {TRPCClient} from "./utils";

export async function uploadPublishers(client: TRPCClient, publishers: Publisher[]) {
    const publisherMap = new Map<string, number>();
    console.log('Uploading publishers...');
    for (const publisher of publishers) {
        try {
            const existingPublishers = await client.publishers.list.query();
            const existing = existingPublishers.find(p => p.name.toLowerCase() === publisher.name.toLowerCase());

            if (existing) {
                publisherMap.set(publisher.name.toLowerCase(), existing.id);
            } else {
                const created = await client.publishers.create.mutate({name: publisher.name});
                publisherMap.set(publisher.name.toLowerCase(), created.id);
            }
        } catch (err) {
            console.error(`Failed to upload publisher ${publisher.name}:`, err);
        }
    }
    return publisherMap;
}