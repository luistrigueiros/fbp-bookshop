import {checkServerConnection, createClient} from "library-cli/utils";

export async function createAndCheckClient(options: { url: string }) {
    // 1. Setup tRPC client and check connection
    const client = createClient(options.url);
    console.log(`Checking connection to server: ${options.url}`);
    const isConnected = await checkServerConnection(client);

    if (!isConnected) {
        console.error(`Error: Could not connect to the server at ${options.url}. Please ensure the server is running and reachable.`);
        process.exit(1);
    }
    console.log('Server is reachable.');
    return client;
}