import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Paper, Stack, Typography } from "@mui/material";

export function NotificationEmptyState({ title, description, action = null }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 1,
        border: "1px dashed",
        borderColor: "divider",
        px: 3,
        py: 5,
        textAlign: "center",
        background: "rgba(255,255,255,0.88)",
      }}
    >
      <Stack spacing={1.25} alignItems="center">
        <InfoOutlinedIcon color="primary" />
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={420}>
          {description}
        </Typography>
        {action}
      </Stack>
    </Paper>
  );
}
