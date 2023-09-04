import { Select } from "@mantine/core";

function FlakeFilterElement(props) {
  return (
    <Select
      placeholder={props.placeholder}
      label={props.name}
      value={props.value[props.filterKey]}
      onChange={(event) => props.onFilter(event, props.filterKey)}
      data={props.options}
      clearable={props.clearable}
    />
  );
}

export default FlakeFilterElement;
