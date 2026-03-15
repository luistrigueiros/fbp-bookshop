Given the context of what this application is and how was implemented as per [](./consolidated-spec.md)

Now I am looking to add support to have media files associated with the book to display in the site and the media would be like images for example for cover page, back cover, promotional images, videos of events or author interviews I am considering to extend the application with R2 for object storage and have bookMedia table that would keep the pointers to the location where the media content for the book cat be found is this a good design are there any downsides like having to many files in one R2 folder how would I have able to pickup all the media files associated to a book from the R2 folder ? Should I use zip files ? how can the image be optimised to save storage space.

I have some more detail desing ideas in [](media-support.md) 

Add support for book media considering that the data access layer library is in [data-access-library](../../library-data-layer) and for the API is using this [tRpcLibrary](../../library-trpc/)
Additional I would like to have in the root of the book r2 folder a json file with the book table content as json to allow rebuild the linkage of book table to the R2 media folder in case the database is rebuilt