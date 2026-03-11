import {Genre} from "library-excel-extractor";
import {TRPCClient} from "library-cli/utils";

export async function uploadGenres(client: TRPCClient, genres: Genre[]) {
    const genreMap = new Map<string, number>();
    console.log('Uploading genres...');
    for (const genre of genres) {
        try {
            const existingGenres = await client.genres.list.query();
            const existing = existingGenres.find((g: any) => g.name.toLowerCase() === genre.name.toLowerCase());

            if (existing) {
                genreMap.set(genre.name.toLowerCase(), existing.id);
            } else {
                const created = await client.genres.create.mutate({name: genre.name});
                genreMap.set(genre.name.toLowerCase(), created.id);
            }
        } catch (err) {
            console.error(`Failed to upload genre ${genre.name}:`, err);
        }
    }
    return genreMap;
}