Having implemented [](./spec8.md) I have found that I have made and error that I need to be fixed.

1. There was already an error column in the exportJob table
2. Remove this error column leving only it with the errorMessage column
3. Evrey where in the code where error was used now use errorMessage
4. Make sure all the test pass after this change