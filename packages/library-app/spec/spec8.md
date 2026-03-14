Having implemented [](./spec7.md) I am now looking to implement the following:

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