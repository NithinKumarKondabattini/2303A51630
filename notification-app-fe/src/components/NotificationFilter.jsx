import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const filters = ["All", "Placement", "Result", "Event"];

export function NotificationFilter({ value, onChange }) {
  return (
    <ToggleButtonGroup
      value={value}
      onChange={(_, nextValue) => onChange(nextValue ?? "All")}
      exclusive
      size="small"
      sx={{
        flexWrap: "wrap",
        gap: 0.75,
        "& .MuiToggleButtonGroup-grouped": {
          border: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      {filters.map((type) => (
        <ToggleButton key={type} value={type} sx={{ px: 2.25 }}>
          {type}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
