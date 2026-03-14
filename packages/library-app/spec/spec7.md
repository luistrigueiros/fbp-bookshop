Inprove the display and edit of the publisher in the book details.
Similar to what was done in [spec5](./spec5.md) for Genre, now to Publisher.
I am looking for:

1. Create a PublisherSelector component to handle the selection of publishers associated with a book.
2. PublisherSelector should be able to display the selected publisher and allow selection of a new publisher.
3. In should be possible to select only one publisher; once a new one is selected the previous one should be deselected.
4. The should be a confirmation dialog to confirm the selection of a new publisher, saying that the current book will be associated with the new publisher and it moving from the previous publisher to the new one, clearly displaying the change.
5. A book can be left without a publisher, since it is not mandatory.
6. There should be a typeahead search box to search for publishers allowing to narrow down to just one publisher be selected.
7. Make the visualization of the publisher look like the one for Genre, removing the simpler dropdown.

