# Requirements Document

## Introduction

Extract the duplicated pagination controls from `ReferenceDataDrillDown` and `ReferenceDataList` into a single reusable SolidJS component called `ReferenceDataPagination`. The two source components differ in how they compute total pages: `ReferenceDataDrillDown` derives total pages from a remote resource's `total` count and a fixed page size, while `ReferenceDataList` uses a pre-computed `totalPages` memo. The new component must accommodate both patterns through a flexible props interface.

## Glossary

- **ReferenceDataPagination**: The new reusable SolidJS pagination component being created.
- **ReferenceDataDrillDown**: Existing SolidJS component that displays a drill-down table with server-side pagination driven by a resource `total` count.
- **ReferenceDataList**: Existing SolidJS component that displays a CRUD list with client-side pagination driven by a computed `totalPages` memo.
- **Page**: A zero-based index representing the current page of data being displayed.
- **totalPages**: The total number of pages available, computed as `Math.ceil(total / pageSize)` or provided directly.
- **pageSize**: The fixed number of items displayed per page (currently 10 in both components).

## Requirements

### Requirement 1: ReferenceDataPagination Component Interface

**User Story:** As a developer, I want a `ReferenceDataPagination` component with a clear props interface, so that I can reuse it in components that compute total pages differently.

#### Acceptance Criteria

1. THE `ReferenceDataPagination` SHALL accept a `page` prop of type `Accessor<number>` representing the current zero-based page index.
2. THE `ReferenceDataPagination` SHALL accept a `totalPages` prop of type `Accessor<number>` representing the total number of pages.
3. THE `ReferenceDataPagination` SHALL accept an `onPrevious` prop of type `() => void` called when the Previous button is clicked.
4. THE `ReferenceDataPagination` SHALL accept an `onNext` prop of type `() => void` called when the Next button is clicked.

### Requirement 2: Pagination UI Rendering

**User Story:** As a user, I want the pagination controls to look and behave identically to the existing controls, so that the refactor introduces no visible changes.

#### Acceptance Criteria

1. THE `ReferenceDataPagination` SHALL render a Previous button, a "Page X of Y" label, and a Next button inside a flex container matching the existing layout (`justify-content: space-between`, `align-items: center`, `padding: 1rem`, `background: var(--secondary-bg)`).
2. WHEN `page()` equals `0`, THE `ReferenceDataPagination` SHALL disable the Previous button.
3. WHEN `page()` is greater than or equal to `totalPages() - 1`, THE `ReferenceDataPagination` SHALL disable the Next button.
4. THE `ReferenceDataPagination` SHALL display the label `Page {page() + 1} of {totalPages()}`.
5. WHEN the Previous button is disabled, THE `ReferenceDataPagination` SHALL apply `cursor: not-allowed` to the Previous button.
6. WHEN the Next button is disabled, THE `ReferenceDataPagination` SHALL apply `cursor: not-allowed` to the Next button.

### Requirement 3: Integration with ReferenceDataDrillDown

**User Story:** As a developer, I want `ReferenceDataDrillDown` to use `ReferenceDataPagination`, so that pagination logic is not duplicated.

#### Acceptance Criteria

1. THE `ReferenceDataDrillDown` SHALL replace its inline pagination `div` with a `ReferenceDataPagination` component.
2. WHEN integrating, THE `ReferenceDataDrillDown` SHALL derive `totalPages` as `Math.ceil((drillData()?.total || 0) / pageSize) || 1` and pass it as an `Accessor<number>` to `ReferenceDataPagination`.
3. THE `ReferenceDataDrillDown` SHALL pass its existing `page` signal accessor and `setPage` callbacks as `page`, `onPrevious`, and `onNext` props to `ReferenceDataPagination`.

### Requirement 4: Integration with ReferenceDataList

**User Story:** As a developer, I want `ReferenceDataList` to use `ReferenceDataPagination`, so that pagination logic is not duplicated.

#### Acceptance Criteria

1. THE `ReferenceDataList` SHALL replace its inline pagination `div` with a `ReferenceDataPagination` component.
2. THE `ReferenceDataList` SHALL pass its existing `totalPages` memo accessor and `page` signal accessor directly to `ReferenceDataPagination`.
3. THE `ReferenceDataList` SHALL pass its existing `setPage` callbacks as `onPrevious` and `onNext` props to `ReferenceDataPagination`.

### Requirement 5: No Behavioral Regression

**User Story:** As a user, I want pagination to work exactly as before after the refactor, so that no functionality is lost.

#### Acceptance Criteria

1. WHEN a user clicks Previous on any page greater than 0, THE `ReferenceDataPagination` SHALL invoke `onPrevious`, decrementing the page by 1.
2. WHEN a user clicks Next on any page less than `totalPages() - 1`, THE `ReferenceDataPagination` SHALL invoke `onNext`, incrementing the page by 1.
3. IF `totalPages()` returns `1`, THEN THE `ReferenceDataPagination` SHALL disable both the Previous and Next buttons simultaneously.
