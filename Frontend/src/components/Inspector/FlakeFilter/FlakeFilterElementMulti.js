import { MultiSelect } from "@mantine/core";

function FlakeFilterElementMulti(props) {
  return (
    <MultiSelect
      placeholder={props.placeholder}
      label={props.name}
      value={props.value[props.filterKey]}
      onChange={(event) => props.onFilter(event, props.filterKey)}
      data={props.options}
      clearable={props.clearable}
    />
  );
}

export default FlakeFilterElementMulti;
