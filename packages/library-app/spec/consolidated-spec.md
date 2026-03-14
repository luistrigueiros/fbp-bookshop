In this subpackage create the API layer for the library app.
This API will expose the necessary endpoints to interact with the library.
It will leverage the subpackage library-data-layer to interact with the database.
This will be deployed as Cloudflare worker with a similar setup as the library-data-loader subpackage.
Again, Bun.js will be used for development and deployment using TypeScript.
Use https://trpc.io/ for the api layer take the openapi.yaml as reference for the endpoints, discard the implementaion of the /api/scan openapi endpoint for now.
Create tests for the API layer, follow the similar pattern of the library-data-loader subpackage for the tests setup leaveraging the subpackage library-test-utils for the test setup.

### CI/CD and Configuration

Add the following:
Support for CI/CD using GitHub Actions the same way as in the [library-data-loader](./../library-data-loader/spec/spec1.md) subpackage.
Equally, create the similar wrangler.toml.template file for the library-app subpackage for and incorporate it into the CI/CD pipeline for the library-app subpackage; in this case the worker will not need a queue, nor upload bucket yet.
Do not use a shared drizzle migrations_dir = "../library-data-layer/drizzle" directory, but create a new one for this subpackage as was done for the [library-data-loader](./../library-data-loader) subpackage.

### Frontend Development

Create a frontend for the library-app subpackage using SolidJS and TypeScript with the Bun.js support.
I am looking for a clean, modern, and responsive design that is easy to navigate and use.
Mount the frontend at the index landing page for the worker.

Add to the frontend a new option in the top view and edit both Publisher and Genre

Additionally, for the book view, I would like table display with pagination and have the ability filter by title, author, publisher, and genre.
At the moment, when a book detail is opened for viewing or editing, the way the genres are displayed is not very good.
- Improve the way the genres are displayed, to make it very clear to the user what genres are associated with the book, easy to add and remove genres to the book.
- Create new components for displaying the genres.
- The new genre component should have in edit mode a small typeahead dropdown that allows to select once genre and add it to the list of genres the book belongs to.
- Additionally, this component should have a way to remove the genre from the list of genres.
- The list of genres should be displayed with a small icon or checkbox that allows deselecting a genre previously selected, and by doing this removes the book association with the genre.

### Language Filter and Mobile Fixes

Add the ability to filter books by language in the library app frontend when the user clicks the Filter/Search button.
- By selecting the language from a dropdown menu, the user can filter the displayed books by language in the books list page.
- At the moment, in mobile view, the book filter popup is not displaying well. The left side of the popup is cut off not able read the working in the being of filter options and input or selection, fix this issue.

### Publisher Selection and Display

Improve the display and edit of the publisher in the book details.
Similar to what was done for Genre, now to Publisher.
I am looking for:

1. Create a PublisherSelector component to handle the selection of publishers associated with a book.
2. PublisherSelector should be able to display the selected publisher and allow selection of a new publisher.
3. In should be possible to select only one publisher; once a new one is selected the previous one should be deselected.
4. They should be a confirmation dialog to confirm the selection of a new publisher, saying that the current book will be associated with the new publisher and it moving from the previous publisher to the new one, clearly displaying the change.
5. A book can be left without a publisher, since it is not mandatory.
6. There should be a typeahead search box to search for publishers allowing to narrow down to just one publisher be selected.
7. Make the visualization of the publisher look like the one for Genre, removing the simpler dropdown.


### Reference Data Table (Publisher and Genre) Improvements

1. Improve the display of the Publisher and Genre tables.
2. The display should now be changed to be a table-like view where in the first tab allows viewing the list and filter to select one record to edit or delete.
3. In the second tab it will allow drill down into the data.
    3.1. Display the aggregate grouping of a book per genre or publisher.
    3.2. Each line should have a genre or publisher and the number of books under this category.
    3.3 This view should be paginated by 10 records to avoid displaying all the data immediately.
    3.4. This view should allow filter and select a genre or publisher to display.
    3.5. This view should then allow clicking one row and then display the books list under this genre or publisher.
4. Because both the Publisher and Genre are reference data table essential key value pairs,this functionality should be implemented in a generic way.
5. Create new components to support this functionality for both Publisher and Genre and reuse them to make the code more readable and maintainable.
6. Implementing this functionality will require changes to [](../src/frontend/routes/genres.tsx) and [](../src/frontend/routes/publishers.tsx)

### Drill-down Enhancements

1 – The display in the drill-down view should sort descendent by books count.
2 – Clicking one item in the drill-down view should display the books in that category.
    At the moment this is done displaying the books in this category bellow but I would like to move the view to book-list view the filter select that category of genre or publisher.


### Reference Data Component Refactoring

1- Split the [](../src/frontend/components/ReferenceDataView.tsx) in 2 other components:
   1.1 – One for the list(ReferenceDataList.tsx), another for the drill-down(ReferenceDataDrillDown.tsx).
2- Make the list display paginated and display only 10 items per page.

### Filter Component Extraction and Bug Fixes

1 - Extract from the [books.tsx](../src/frontend/routes/books.tsx) the functionality to do with displaying the and handling of the filtering of book into it's own component
    to make the page more maintainable and easier to understand as it is reasonably big now
2 - At the moment when a from requirements when from the drill-down of genre or publisher a category is selected it is navigating to the books list page but
    it is not rending a book list restrited to the category of genre or publisher selected
3 - Create test to verify that the above passes

### Dynamic Language Selection

1 - In the [](../src/frontend/components/BookFilters.tsx) the language selection filter should not be a hardcode list
    but it should be driven from the actual data of the language column in the book table
2 - Build the drop-down to select the language to filter on book base of the list of all available languages existing in
    book table
3 - Leaverage the [](../../library-data-layer) via the [](../../library-trpc) to get the list of all available languages.

### Mobile Filter Bug Fix

The image ![bugfix1](filter-display-in-mobile.png) should show the way the Filter selection dialog is currently displayed in mobile devices.
It's being clipped of the left side of the screen, not allowing the user to view the wording in the dialog, add spacing on the left side of the dialog to allow the user to see the full text.