import {
    checkServerConnection,
    createClient,
    extractDataFromExcel
} from "./utils";
import {readFileSync} from "fs";
import {uploadGenres} from "./uploadGenres";
import {uploadPublishers} from "./uploadPublishers";
import {uploadBooks} from "./uploadBooks";

export async function processExcelFile(file: string, options: { url: string }) {
    try {
        // 1. Setup tRPC client and check connection
        const client = createClient(options.url);
        console.log(`Checking connection to server: ${options.url}`);
        const isConnected = await checkServerConnection(client);

        if (!isConnected) {
            console.error(`Error: Could not connect to the server at ${options.url}. Please ensure the server is running and reachable.`);
            process.exit(1);
        }
        console.log('Server is reachable.');

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
        const bookCount = await uploadBooks(client, books, genreMap, publisherMap);

        console.log(`Successfully uploaded ${bookCount} books.`);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}