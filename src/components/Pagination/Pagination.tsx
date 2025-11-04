import classNames from "classnames";
import { Button } from "../Button";
import { PaginationProps } from "./Pagination.types";

// Logic based on https://www.freecodecamp.org/news/build-a-custom-pagination-component-in-react/

const range = (start: number, end: number) => {
  const length = end - start + 1;
  /*
  	Create an array of certain length and set the elements within it from
    start value to end value.
  */
  return Array.from({ length }, (_, idx) => idx + start);
};

const Pagination = (props: PaginationProps) => {
  const {
    totalItems,
    itemsPerPage,
    currentPage,
    onChange,
    className,
    size,
    showTotalItems,
    showTotalPosition = "left",
    borderless,
    nextButtonContent,
    previousButtonContent,
    disabled,
    ...rest
  } = props;

  const DOTS = "...";

  const totalPageCount = Math.ceil(totalItems / itemsPerPage);

  let pages: (string | number)[] = [];

  const siblingCount = 2;

  // Pages count is determined as siblingCount + firstPage + lastPage + currentPage + 2*DOTS
  const totalPageNumbers = siblingCount + 5;

  /*
      Case 1:
      If the number of pages is less than the page numbers we want to show in our
      paginationComponent, we return the range [1..totalPageCount]
    */
  if (totalPageNumbers >= totalPageCount) {
    pages = range(1, totalPageCount);
  }

  /*
    	Calculate left and right sibling index and make sure they are within range 1 and totalPageCount
    */
  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(
    currentPage + siblingCount,
    totalPageCount
  );

  /*
      We do not show dots just when there is just one page number to be inserted between the extremes of sibling and the page limits i.e 1 and totalPageCount. Hence we are using leftSiblingIndex > 2 and rightSiblingIndex < totalPageCount - 2
    */
  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

  const firstPageIndex = 1;
  const lastPageIndex = totalPageCount;

  /*
    	Case 2: No left dots to show, but rights dots to be shown
    */
  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = range(1, leftItemCount);

    pages = [...leftRange, DOTS, totalPageCount];
  }

  /*
    	Case 3: No right dots to show, but left dots to be shown
    */
  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = range(
      totalPageCount - rightItemCount + 1,
      totalPageCount
    );
    pages = [firstPageIndex, DOTS, ...rightRange];
  }

  /*
    	Case 4: Both left and right dots to be shown
    */
  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = range(leftSiblingIndex, rightSiblingIndex);
    pages = [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
  }

  const start = itemsPerPage * currentPage - itemsPerPage + 1;
  const end = Math.min(itemsPerPage * currentPage, totalItems);

  const totalToShow = showTotalItems
    ? showTotalItems(totalItems, [start, end])
    : undefined;

  const generatedClasses = classNames({
    "stc-pagination": true,
    "stc-pagination-size--small": size === "small",
    "stc-pagination-size--large": size === "large",
    "stc-pagination--disabled": disabled,
    ...(className && { [className]: true }),
  });

  const PageButton = ({ page }: { page: number }) => (
    <li
      aria-setsize={totalPageCount}
      aria-posinset={page}
    >
      <Button
        onClick={() => onChange(page)}
        variant={page === currentPage ? "link" : "text"}
        aria-current={page === currentPage ? "page" : undefined}
        size={size}
        aria-label={`Go to page ${page}`}
        disabled={disabled}
      >
        {page}
      </Button>
    </li>
  );

  const Ellipsis = () => (
    <li>
      <span
        aria-label="Ellipsis"
        className="stc-pagination-ellipsis"
      >
        •••
      </span>
    </li>
  );

  const TotalItems = () => (
    <li>
      <p
        aria-description="Total items."
        className={classNames({
          "stc-pagination-total": true,
          [`stc-pagination-total--${showTotalPosition}`]: true,
        })}
      >
        {totalToShow}
      </p>
    </li>
  );

  return (
    <nav
      aria-label="Pagination"
      {...rest}
    >
      <ul className={generatedClasses}>
        {showTotalPosition === "left" && totalToShow && <TotalItems />}
        <li>
          <Button
            disabled={currentPage === 1 || disabled}
            onClick={() => onChange(currentPage - 1)}
            size={size}
            variant={borderless ? "text" : undefined}
            aria-label="Previous page"
          >
            {previousButtonContent ?? "Previous"}
          </Button>
        </li>
        {pages.map((page, index) => {
          if (page === DOTS) {
            return <Ellipsis key={index} />;
          }

          return (
            <PageButton
              key={index}
              page={page as number}
            />
          );
        })}
        <li>
          <Button
            disabled={currentPage === pages[pages.length - 1] || disabled}
            onClick={() => onChange(currentPage + 1)}
            size={size}
            variant={borderless ? "text" : undefined}
            aria-label="Next page"
          >
            {nextButtonContent ?? "Next"}
          </Button>
        </li>
        {showTotalPosition === "right" && totalToShow && <TotalItems />}
      </ul>
    </nav>
  );
};

export default Pagination;
