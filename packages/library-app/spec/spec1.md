Having implemented all of the [](./consolidated-spec.md) I am now looking to implement the following:

In packages/library-app/src/frontend/components/ReferenceDataDrillDown.tsx and packages/library-app/src/frontend/components/ReferenceDataList.tsx both compoments have a pagination controls in the end, extract the pagination controls into a resuable component and make the 2 above ReferenceData componentes referece this new compoment.
The new component name should be ReferenceDataPagination.