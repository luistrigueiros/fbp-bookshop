import {Book} from "library-excel-extractor";
import {TRPCClient} from "library-cli/utils";

export async function uploadBooks(
    client: TRPCClient,
    books: Book[],
    genreMap: Map<string, number>,
    publisherMap: Map<string, number>
) {
    console.log('Uploading books...');
    let bookCount = 0;
    for (let i = 0; i < books.length; i++) {
        const book = books[i];
        try {
            const genreIds = book.genres
                .map((g: { name: string }) => genreMap.get(g.name.toLowerCase()))
                .filter((id: number | undefined): id is number => id !== undefined);

            const publisherId = book.publisher
                ? publisherMap.get(book.publisher.name.toLowerCase())
                : undefined;

            await client.books.upsert.mutate({
                title: book.title,
                author: book.author,
                isbn: book.isbn,
                barcode: book.barcode,
                price: book.price,
                language: book.language,
                genreIds,
                publisherId: publisherId ?? null,
            });
            bookCount++;
            if (bookCount % 10 === 0) {
                console.log(`Uploaded ${bookCount}/${books.length} books...`);
            }
        } catch (err) {
            console.error(`Error uploading book #${i + 1}:`);
            console.error('Book object:', JSON.stringify(book, null, 2));
            console.error('Error response:', err);
            throw err;
        }
    }
    return bookCount;
}