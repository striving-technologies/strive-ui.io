import classNames from "classnames";
import { generateRandomId } from "../../utils";
import { Button } from "../Button";
import { Input } from "../Input";
import { SearchProps } from "./Search.types";

const Search = ({
  size,
  className,
  onSearch,
  searchButton,
  primary,
  hideDivider,
  ...rest
}: SearchProps) => {
  const generatedClasses = classNames({
    "stc-search": true,
    "stc-search--hide-divider": hideDivider,
    ...(className && { [className]: true }),
  });

  // auto-generate an id for the input
  const inputId = generateRandomId("search-input-");

  const id = rest.id || inputId;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const input = (e.target as HTMLFormElement).querySelector("input");

    if (input?.value) {
      onSearch(input.value);
    }
  };

  const SearchInput = (
    <form
      role="search"
      className={generatedClasses}
      onSubmit={handleSubmit}
    >
      <label htmlFor={id}>
        <span className="stc-off-screen">Search:</span>
      </label>
      <Input
        {...rest}
        id={id}
        type="text"
        size={size}
      />
      <Button
        type="submit"
        size={size}
        variant={primary ? "primary" : undefined}
      >
        {searchButton || "Search"}
      </Button>
    </form>
  );

  return SearchInput;
};

export default Search;
