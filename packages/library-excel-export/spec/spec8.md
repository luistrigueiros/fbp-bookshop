Having implemented all the specs and bugs fixed, in this folder from 1 to 7 I am now looking to:

1. Add support for better error handling, it the export request.
2. Add a new column in the exportJob table to hold any error messages that may result from the export.
3. When rending the export job in the landing page, render the error messages; it should be rendered trimmed to a few characters first with a link to the full error message in a modal dialog. 