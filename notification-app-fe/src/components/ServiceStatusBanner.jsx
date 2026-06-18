import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  Alert,
  AlertTitle,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

export function ServiceStatusBanner({ loading, error, status, onRetry }) {
  if (loading) {
    return (
      <Alert
        icon={<ConstructionRoundedIcon />}
        severity="info"
        sx={{ borderRadius: 4, alignItems: "center" }}
      >
        <AlertTitle>Checking local service setup</AlertTitle>
        <Typography variant="body2" color="text.secondary" mb={1.5}>
          Reading the backend status so the app can explain any missing protected API
          configuration.
        </Typography>
        <LinearProgress sx={{ borderRadius: 999, height: 8 }} />
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert
        severity="warning"
        icon={<WarningAmberRoundedIcon />}
        action={
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        }
        sx={{ borderRadius: 4 }}
      >
        <AlertTitle>Unable to read local backend status</AlertTitle>
        {error}
      </Alert>
    );
  }

  if (!status?.setup) {
    return null;
  }

  const { setup } = status;
  const missingFields = Array.from(
    new Set([...(setup.missingRegistrationFields ?? []), ...(setup.missingAuthFields ?? [])])
  );

  if (setup.canFetchNotifications) {
    return (
      <Alert
        severity="success"
        icon={<CheckCircleRoundedIcon />}
        sx={{ borderRadius: 4, alignItems: "center" }}
      >
        <AlertTitle>Protected API setup is ready</AlertTitle>
        <Typography variant="body2" color="text.secondary">
          The backend has enough configuration to fetch notifications. The app will use
          `limit`, `page`, and `notification_type` against the protected route.
        </Typography>
      </Alert>
    );
  }

  return (
    <Alert
      severity="warning"
      icon={<ConstructionRoundedIcon />}
      action={
        <Button
          color="inherit"
          size="small"
          startIcon={<RefreshRoundedIcon />}
          onClick={onRetry}
        >
          Recheck
        </Button>
      }
      sx={{ borderRadius: 4 }}
    >
      <AlertTitle>Local backend setup is incomplete</AlertTitle>
      <Typography variant="body2" color="text.secondary" mb={1.5}>
        The UI is ready, but the protected upstream API still needs a few backend `.env`
        values before live notifications can load. `SERVICE_BASE_URL` can be either the
        base service URL or the full `/notifications` URL and the backend will normalize it.
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {missingFields.map((field) => (
          <Chip key={field} label={field} size="small" variant="outlined" />
        ))}
      </Stack>
    </Alert>
  );
}
