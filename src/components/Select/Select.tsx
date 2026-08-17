import classNames from "classnames";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generateRandomId } from "../../utils";
import { Icon } from "../Icon";
import { SelectOption, SelectProps } from "./Select.types";

const TYPEAHEAD_TIMEOUT_MS = 500;

type ActiveIndexFallback = "first" | "last";

const Select = (props: SelectProps) => {
  const {
    options,
    onChange,
    className,
    size,
    disabled,
    placeholder,
    loading,
    multiSelect,
    value = multiSelect ? [] : "",
    allowClear = false,
    ...rest
  } = props;
  const generatedClasses = classNames({
    "stc-select": true,
    [`stc-select-size--${size}`]: size !== "medium" && size,
    "stc-select--disabled": disabled,
    "stc-select--loading": loading,
    ...(className && { [className]: true }),
  });

  const generatedId = useMemo(() => generateRandomId("select-"), []);
  const componentId = rest.id || generatedId;

  // State variables using React hooks
  const [selectActive, setSelectActive] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const [searchValue, setSearchValue] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const typeaheadRef = useRef<{
    buffer: string;
    timer: ReturnType<typeof setTimeout> | null;
  }>({ buffer: "", timer: null });

  const selectValue = value || internalValue;

  const optionsAsObject = useMemo(
    () =>
      options.reduce((acc, option) => {
        acc[option.value] = option;
        return acc;
      }, {} as { [key: string]: SelectOption }),
    [options]
  );

  const getOptions = useCallback(
    (search: string = searchValue) => {
      if (!search) {
        return options;
      }

      return options.filter(
        (option) =>
          option.label.toLowerCase().indexOf(search.toLowerCase()) >= 0
      );
    },
    [options, searchValue]
  );

  const computeInitialActiveIndex = useCallback(
    (list: SelectOption[], fallback: ActiveIndexFallback = "first") => {
      if (list.length === 0) {
        return -1;
      }

      if (multiSelect) {
        if (Array.isArray(selectValue) && selectValue.length > 0) {
          const index = list.findIndex((option) =>
            (selectValue as string[]).includes(option.value)
          );
          if (index >= 0) {
            return index;
          }
        }
      } else if (typeof selectValue === "string" && selectValue) {
        const index = list.findIndex((option) => option.value === selectValue);
        if (index >= 0) {
          return index;
        }
      }

      return fallback === "last" ? list.length - 1 : 0;
    },
    [multiSelect, selectValue]
  );

  const restoreSearchDisplay = useCallback(() => {
    // For single select with search and a selected value, keep showing the label
    if (
      rest.searchable &&
      !multiSelect &&
      selectValue &&
      typeof selectValue === "string"
    ) {
      setSearchValue(optionsAsObject[selectValue]?.label || "");
    } else {
      setSearchValue("");
    }
  }, [rest.searchable, multiSelect, selectValue, optionsAsObject]);

  useEffect(() => {
    // add event listener to handle click outside the dropdown
    const handleClickOutside = (e: MouseEvent) => {
      if (e.target instanceof Element) {
        if (selectRef.current && !selectRef.current.contains(e.target)) {
          setSelectActive(false);
          restoreSearchDisplay();
          setActiveIndex(-1);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [restoreSearchDisplay]);

  // Sync search value with selected option label for single select with search
  useEffect(() => {
    if (
      rest.searchable &&
      !multiSelect &&
      selectValue &&
      typeof selectValue === "string"
    ) {
      setSearchValue(optionsAsObject[selectValue]?.label || "");
    } else if (!rest.searchable || multiSelect || !selectValue) {
      setSearchValue("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDropdown = (fallback: ActiveIndexFallback = "first") => {
    if (disabled) {
      return;
    }

    setSelectActive(true);
    setActiveIndex(computeInitialActiveIndex(getOptions(), fallback));

    if (rest.searchable && searchBoxRef.current) {
      searchBoxRef.current.focus();
    }
  };

  const closeDropdown = ({
    restoreFocus = false,
  }: { restoreFocus?: boolean } = {}) => {
    setSelectActive(false);
    restoreSearchDisplay();
    setActiveIndex(-1);

    if (restoreFocus) {
      const target = rest.searchable ? searchBoxRef.current : triggerRef.current;
      target?.focus();
    }
  };

  const handleSelectClick = () => {
    if (disabled) {
      return;
    } else {
      if (!rest.searchable) {
        if (selectActive) {
          closeDropdown();
        } else {
          openDropdown();
        }
      } else {
        openDropdown();
      }
    }
  };

  const getDisplayValue = () => {
    return (
      <span className="stc-select__display-text">
        {optionsAsObject[selectValue as string]?.label}
      </span>
    );
  };

  const getMultiDisplayValue = () => {
    const multiValue = selectValue as string[];
    return multiValue.map((option, index) => (
      <div
        key={`${optionsAsObject[option]?.value}-${index}`}
        className="stc-select__multi-item"
      >
        {optionsAsObject[option]?.label}
        <button
          onClick={(e) => onTagRemove(e, option)}
          className="stc-select__multi-item-close"
        >
          <span className="stc-off-screen">
            Deselect {optionsAsObject[option]?.label}
          </span>
          <Icon
            name="close"
            size="small"
          />
        </button>
      </div>
    ));
  };

  const handleDisplayValue = () => {
    if (searchValue?.length > 0 && selectValue.length === 0) {
      return undefined;
    }

    if (selectValue.length === 0) {
      return (
        <span className="stc-select__placeholder stc-select__display-text">
          {placeholder}
        </span>
      );
    }

    if (rest.searchable && !multiSelect) {
      return null;
    }

    if (multiSelect) {
      return getMultiDisplayValue();
    }

    return getDisplayValue();
  };

  const removeOption = (option: string) => {
    const multiValue = selectValue as string[];
    return multiValue.filter((o) => o !== option);
  };

  const onTagRemove = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    option: string
  ) => {
    e.stopPropagation();

    const newValue = removeOption(option);

    if (onChange) onChange(newValue);
    setInternalValue(newValue);
  };

  const selectOption = (option: SelectOption) => {
    let newValue: string | string[];

    if (multiSelect) {
      let tempValue = selectValue;

      if (!Array.isArray(selectValue)) {
        tempValue = [];
      }
      const multiTempValue = tempValue as string[];
      if (multiTempValue.findIndex((o) => o === option.value) >= 0) {
        newValue = removeOption(option.value);
      } else {
        newValue = [...multiTempValue, option.value];
      }
    } else {
      newValue = option.value;
    }

    if (onChange) onChange(newValue);
    setInternalValue(newValue);

    if (rest.searchable && !multiSelect) {
      setSearchValue(option.label);
    } else {
      setSearchValue("");
    }

    if (!multiSelect) {
      setSelectActive(false);
      setActiveIndex(-1);
    }
  };

  const onItemClick = (option: SelectOption) => {
    selectOption(option);
  };

  const selectActiveOption = () => {
    const list = getOptions();
    const option = list[activeIndex];

    if (!option) {
      return;
    }

    selectOption(option);
  };

  const isSelected = (option: SelectOption) => {
    if (!selectValue || selectValue?.length === 0) {
      return false;
    }

    if (multiSelect && Array.isArray(selectValue)) {
      const multiValue = selectValue as string[];
      return multiValue.includes(option.value);
    }

    return (selectValue as string) === option.value;
  };

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextSearchValue = e.target.value;
    setSearchValue(nextSearchValue);

    if (rest.searchable && !multiSelect) {
      if (onChange) onChange("");
      setInternalValue("");
    }

    if (selectActive) {
      const filtered = getOptions(nextSearchValue);
      setActiveIndex(filtered.length > 0 ? 0 : -1);
    }
  };

  const handleClear = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    e.stopPropagation();
    if (rest.searchable) {
      setSearchValue("");
    }

    if (multiSelect) {
      if (onChange) onChange([]);

      setInternalValue([]);
    } else {
      if (onChange) onChange("");

      setInternalValue("");
    }
  };

  const navigate = (key: "ArrowDown" | "ArrowUp" | "Home" | "End") => {
    const list = getOptions();

    if (list.length === 0) {
      return;
    }

    setActiveIndex((prevIndex) => {
      switch (key) {
        case "ArrowDown":
          if (prevIndex < 0) {
            return computeInitialActiveIndex(list, "first");
          }
          return Math.min(prevIndex + 1, list.length - 1);
        case "ArrowUp":
          if (prevIndex < 0) {
            return computeInitialActiveIndex(list, "last");
          }
          return Math.max(prevIndex - 1, 0);
        case "Home":
          return 0;
        case "End":
          return list.length - 1;
        default:
          return prevIndex;
      }
    });
  };

  const resetTypeaheadBuffer = () => {
    typeaheadRef.current.buffer = "";
    typeaheadRef.current.timer = null;
  };

  const handleTypeahead = (char: string) => {
    const state = typeaheadRef.current;

    if (state.timer) {
      clearTimeout(state.timer);
    }

    const buffer = (state.buffer + char).toLowerCase();
    state.buffer = buffer;
    state.timer = setTimeout(resetTypeaheadBuffer, TYPEAHEAD_TIMEOUT_MS);

    const list = getOptions();
    const matchIndex = list.findIndex((option) =>
      option.label.toLowerCase().startsWith(buffer)
    );

    if (matchIndex < 0) {
      return;
    }

    if (!selectActive) {
      setSelectActive(true);
    }
    setActiveIndex(matchIndex);
  };

  const isPrintableKey = (e: React.KeyboardEvent) =>
    e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    // The search input is nested inside the trigger; its keydown events
    // bubble up here too. It has its own dedicated handler, so ignore
    // anything that didn't originate on the trigger itself.
    if (e.target !== e.currentTarget) {
      return;
    }

    const { key } = e;

    if (!selectActive) {
      if (key === "Enter" || key === " " || key === "Spacebar") {
        e.preventDefault();
        openDropdown();
        return;
      }
      if (key === "ArrowDown") {
        e.preventDefault();
        openDropdown("first");
        return;
      }
      if (key === "ArrowUp") {
        e.preventDefault();
        openDropdown("last");
        return;
      }
      if (!rest.searchable && isPrintableKey(e)) {
        handleTypeahead(key);
      }
      return;
    }

    switch (key) {
      case "Escape":
        e.preventDefault();
        closeDropdown({ restoreFocus: true });
        return;
      case "ArrowDown":
        e.preventDefault();
        navigate("ArrowDown");
        return;
      case "ArrowUp":
        e.preventDefault();
        navigate("ArrowUp");
        return;
      case "Home":
        e.preventDefault();
        navigate("Home");
        return;
      case "End":
        e.preventDefault();
        navigate("End");
        return;
      case "Enter":
      case " ":
      case "Spacebar":
        e.preventDefault();
        selectActiveOption();
        return;
      default:
        if (!rest.searchable && isPrintableKey(e)) {
          handleTypeahead(key);
        }
        return;
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    const { key } = e;

    if (
      key === "Backspace" &&
      multiSelect &&
      searchValue === "" &&
      Array.isArray(selectValue) &&
      selectValue.length > 0
    ) {
      e.preventDefault();
      const lastValue = selectValue[selectValue.length - 1];
      const newValue = removeOption(lastValue);
      if (onChange) onChange(newValue);
      setInternalValue(newValue);
      return;
    }

    if (!selectActive) {
      if (key === "ArrowDown" || key === "Enter") {
        e.preventDefault();
        openDropdown("first");
      } else if (key === "ArrowUp") {
        e.preventDefault();
        openDropdown("last");
      }
      return;
    }

    switch (key) {
      case "Escape":
        e.preventDefault();
        closeDropdown({ restoreFocus: true });
        return;
      case "ArrowDown":
        e.preventDefault();
        navigate("ArrowDown");
        return;
      case "ArrowUp":
        e.preventDefault();
        navigate("ArrowUp");
        return;
      case "Home":
        e.preventDefault();
        navigate("Home");
        return;
      case "End":
        e.preventDefault();
        navigate("End");
        return;
      case "Enter":
        e.preventDefault();
        selectActiveOption();
        return;
      default:
        return;
    }
  };

  // Attached to the trigger (combobox) and the search input — the only two
  // elements that ever hold real DOM focus while the dropdown is open — so
  // that tabbing (or otherwise moving focus) away from the widget closes it
  // and `aria-expanded` doesn't get left stuck `true`.
  const handleFocusOut = (
    e: React.FocusEvent<HTMLDivElement | HTMLInputElement>
  ) => {
    const nextFocusTarget = e.relatedTarget as Node | null;

    if (
      nextFocusTarget &&
      selectRef.current &&
      selectRef.current.contains(nextFocusTarget)
    ) {
      return;
    }

    if (selectActive) {
      setSelectActive(false);
      restoreSearchDisplay();
      setActiveIndex(-1);
    }
  };

  const activeOptionId = () => {
    const list = getOptions();

    if (selectActive && activeIndex >= 0 && list[activeIndex]) {
      return `${componentId}-option-${list[activeIndex].value}`;
    }

    if (
      !selectActive &&
      !multiSelect &&
      selectValue &&
      typeof selectValue === "string"
    ) {
      return `${componentId}-option-${selectValue}`;
    }

    return undefined;
  };

  return (
    <div
      className={generatedClasses}
      ref={selectRef}
    >
      <div
        role="combobox"
        id={componentId}
        aria-controls={`listbox-${componentId}`}
        aria-haspopup="listbox"
        className={classNames({
          "stc-select__trigger": true,
          "stc-select__trigger--active": selectActive,
        })}
        tabIndex={0}
        aria-expanded={selectActive}
        aria-disabled={disabled}
        aria-activedescendant={activeOptionId()}
        ref={triggerRef}
        onClick={handleSelectClick}
        onKeyDown={handleTriggerKeyDown}
        onBlur={handleFocusOut}
      >
        <div
          className={classNames({
            "stc-select__display": true,
            "stc-select__display--multi":
              multiSelect &&
              Array.isArray(selectValue) &&
              selectValue.length > 0,
          })}
        >
          {handleDisplayValue()}
          {rest.searchable && (
            <input
              className={classNames({
                "stc-select__search": true,
                "stc-select__search--flow":
                  searchValue || (selectValue.length > 0 && multiSelect),
                "stc-select__display-text":
                  searchValue && selectValue.length > 0 && !multiSelect,
              })}
              placeholder={
                searchValue || (selectValue.length > 0 && multiSelect)
                  ? "Search..."
                  : ""
              }
              ref={searchBoxRef}
              type="text"
              role="searchbox"
              disabled={disabled}
              aria-disabled={disabled}
              aria-controls={`listbox-${componentId}`}
              aria-activedescendant={activeOptionId()}
              value={searchValue}
              onChange={onSearch}
              onKeyDown={handleSearchKeyDown}
              onBlur={handleFocusOut}
            />
          )}
        </div>
        <span className="stc-select__icon">
          {allowClear && selectValue?.length > 0 ? (
            <button
              className="stc-select__clear"
              onClick={handleClear}
            >
              <Icon
                name="close"
                size={size}
              />
              <span className="stc-off-screen">Clear selection</span>
            </button>
          ) : (
            <Icon
              name="caretdown"
              size={size}
            />
          )}
        </span>
      </div>
      <div className="stc-select__dropdown-container">
        <ul
          role="listbox"
          id={`listbox-${componentId}`}
          className={classNames({
            "stc-select__dropdown": true,
            "stc-select__dropdown--visible": selectActive,
          })}
          aria-multiselectable={multiSelect}
          aria-hidden={!selectActive}
        >
          {getOptions().length > 0 ? (
            getOptions().map((option, index) => (
              <li
                key={option.value}
                id={`${componentId}-option-${option.value}`}
                title={option.label}
                role="option"
                className={classNames({
                  "stc-select__option": true,
                  "stc-select__display-text": true,
                  "stc-select__option--selected": isSelected(option),
                  "stc-select__option--active":
                    selectActive && index === activeIndex,
                })}
                aria-selected={isSelected(option)}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => onItemClick(option)}
              >
                {option.label}
                {multiSelect && isSelected(option) && (
                  <span className="stc-select__icon">
                    <Icon
                      name="check"
                      size={size}
                    />
                  </span>
                )}
              </li>
            ))
          ) : (
            <li className="stc-select__option stc-select__display-text">
              No options available
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Select;
