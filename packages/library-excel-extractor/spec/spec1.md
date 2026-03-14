This subpackage is responsible for extracting data from Excel files.
It provides functions to read Excel files and convert them into a format that can be easily processed by other parts of
the application.
It developed using Bun.js with TypeScript, and it uses Bun.js features to keep it tidy organized and maintainable,
like "monorepo," "workspaces" and "Re-map import paths".
It should have high test coverage and code quality and good documentation and best practices, be easy to read and
understand.

At the moment, there is a feature missing to extract data from a specific sheet.
I would like to extract book stock from the input excel file example are:

1. [](../FBP-DB.xlsx)
2. [](../FBP-DB-2.xlsx)

The book stock information is currently hold in the input Excel file at columns C, H, I:

1. Column C, Title="Estante", is the bookshelf in the bookStock table
2. Column H, Title="Copias existentes", is the numberOfCopies in the bookStock table
3. Column I, Title="Copias vendidas" is the numberOfSoldCopies in the bookStock table 

Give this information, enhance the packages/library-excel-extractor/src/extractBook.ts to extract the book stock information.
Additionally, add tests to verify the functionality of the new feature. 


