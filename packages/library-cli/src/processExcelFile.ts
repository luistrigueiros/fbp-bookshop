import {extractDataFromExcel} from "library-cli/utils";
import {readFileSync} from "fs";
import {uploadGenres} from "library-cli/uploadGenres";
import {uploadPublishers} from "library-cli/uploadPublishers";
import {uploadBooks} from "library-cli/uploadBooks";
import {createAndCheckClient} from "library-cli/createAndCheckClient";

export async function processExcelFile(file: string, options: { url: string; startRow?: number }) {
    try {
        const client = await createAndCheckClient(options);

        console.log(`Reading file: ${file}`);
        const buffer = readFileSync(file);

        // 2. Extract data from Excel
        console.log('Extracting data from Excel...');
        const {books, genres, publishers} = extractDataFromExcel(buffer);

        console.log(`Extracted ${books.length} books, ${genres.length} genres, ${publishers.length} publishers.`);

        // 3. Upload data
        console.log('Uploading to server...');

        // Upload Genres
        const genreMap = await uploadGenres(client, genres);

        // Upload Publishers
        const publisherMap = await uploadPublishers(client, publishers);

        // Upload Books
        const bookCount = await uploadBooks(client, books, genreMap, publisherMap, options.startRow);

        console.log(`Successfully uploaded ${bookCount} books.`);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}