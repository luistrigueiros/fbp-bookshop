# Implementation Plan: Reference Data Pagination

## Overview

Extract the duplicated inline pagination controls from `ReferenceDataDrillDown` and `ReferenceDataList` into a new reusable `ReferenceDataPagination` SolidJS component, then wire both existing components to use it.

## Tasks

- [x] 1. Create ReferenceDataPagination component
  - Create `packages/library-app/src/frontend/components/ReferenceDataPagination.tsx`
  - Define `ReferenceDataPaginationProps` interface with `page: Accessor<number>`, `totalPages: Accessor<number>`, `onPrevious: () => void`, `onNext: () => void`
  - Render the flex container with Previous button, "Page X of Y" label, and Next button matching the existing layout exactly (`justify-content: space-between`, `align-items: center`, `padding: 1rem`, `background: var(--secondary-bg)`)
  - Disable Previous button and apply `cursor: not-allowed` when `page() === 0`
  - Disable Next button and apply `cursor: not-allowed` when `page() >= totalPages() - 1`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 1.1 Write unit tests for ReferenceDataPagination
    - Test Previous button is disabled when `page() === 0`
    - Test Next button is disabled when `page() >= totalPages() - 1`
    - Test both buttons disabled when `totalPages()` returns `1`
    - Test label renders "Page X of Y" correctly
    - _Requirements: 2.2, 2.3, 2.4, 5.3_

- [x] 2. Integrate ReferenceDataPagination into ReferenceDataList
  - In `packages/library-app/src/frontend/components/ReferenceDataList.tsx`, import `ReferenceDataPagination`
  - Replace the inline pagination `div` with `<ReferenceDataPagination page={page} totalPages={totalPages} onPrevious={() => setPage(p => p - 1)} onNext={() => setPage(p => p + 1)} />`
  - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 2.1 Write unit tests for ReferenceDataList pagination integration
    - Test that clicking Previous decrements the page
    - Test that clicking Next increments the page
    - _Requirements: 5.1, 5.2_

- [x] 3. Integrate ReferenceDataPagination into ReferenceDataDrillDown
  - In `packages/library-app/src/frontend/components/ReferenceDataDrillDown.tsx`, import `ReferenceDataPagination`
  - Replace the inline pagination `div` with `<ReferenceDataPagination page={page} totalPages={() => Math.ceil((drillData()?.total || 0) / pageSize) || 1} onPrevious={() => setPage(p => p - 1)} onNext={() => setPage(p => p + 1)} />`
  - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 3.1 Write unit tests for ReferenceDataDrillDown pagination integration
    - Test that `totalPages` is derived correctly from `drillData()?.total`
    - Test that clicking Previous and Next update the page signal
    - _Requirements: 3.2, 5.1, 5.2_

- [x] 4. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The design uses TypeScript with SolidJS — use `Accessor<number>` from `solid-js` for prop types
