Having implemented [](./spec8.md) I have found that I have made an error that I need to be fixed.

1. There was already an error column in the exportJob table
2. Remove this error column leaving only it with the errorMessage column
3. Evrey where in the code where the error was used now use errorMessage
4. Make sure all the tests pass after this change