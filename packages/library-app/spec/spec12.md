Having implemented [](./spec11.md) I am now looking to implement the following:

1 - In the [](../src/frontend/components/BookFilters.tsx) the language selection filter should not be a hardcode list
    but it should be driven from the actual data of the language column in the book table
2 - Build the drop-down to select the language to filter on book base of the list of all available languages existing in
    book table
3 - Leaverage the [](../../library-data-layer) via the [](../../library-trpc) to get the list of all available languages