import classNames from "classnames";
import { useEffect, useMemo, useRef, useState } from "react";
import { generateRandomId } from "../../utils";
import { Icon } from "../Icon";
import { SelectOption, SelectProps } from "./Select.types";

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
  const selectRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);

  const selectValue = value || internalValue;

  const optionsAsObject = useMemo(
    () =>
      options.reduce((acc, option) => {
        acc[option.value] = option;
        return acc;
      }, {} as { [key: string]: SelectOption }),
    [options]
  );

  useEffect(() => {
    // add event listener to handle click outside the dropdown
    const handleClickOutside = (e: MouseEvent) => {
      if (e.target instanceof Element) {
        if (selectRef.current && !selectRef.current.contains(e.target)) {
          setSelectActive(false);
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
        }
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [rest.searchable, multiSelect, selectValue, optionsAsObject]);

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
  }, []);

  const handleSelectClick = () => {
    if (disabled) {
      return;
    } else {
      if (!rest.searchable) {
        setSelectActive((prev) => !prev);
      } else {
        setSelectActive(true);
        if (searchBoxRef.current) {
          searchBoxRef.current.focus();
        }
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

  const onItemClick = (option: SelectOption) => {
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
    }
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
    setSearchValue(e.target.value);

    if (rest.searchable && !multiSelect) {
      if (onChange) onChange("");
      setInternalValue("");
    }
  };

  const getOptions = () => {
    if (!searchValue) {
      return options;
    }

    return options.filter(
      (option) =>
        option.label.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0
    );
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
        aria-activedescendant={
          selectValue && typeof selectValue === "string"
            ? `${componentId}-option-${selectValue}`
            : undefined
        }
        onClick={handleSelectClick}
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
              value={searchValue}
              onChange={onSearch}
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
            getOptions().map((option) => (
              <li
                key={option.value}
                id={`${componentId}-option-${option.value}`}
                title={option.label}
                role="option"
                className={classNames({
                  "stc-select__option": true,
                  "stc-select__display-text": true,
                  "stc-select__option--selected": isSelected(option),
                })}
                aria-selected={isSelected(option)}
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
