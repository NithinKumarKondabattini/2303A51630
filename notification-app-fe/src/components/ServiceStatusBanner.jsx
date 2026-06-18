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
        sx={{ borderRadius: 1, alignItems: "center", bgcolor: "rgba(255,255,255,0.74)" }}
      >
        <AlertTitle>Checking local service setup</AlertTitle>
        <Typography variant="body2" color="text.secondary" mb={1.5}>
          Reading the backend status so the app can explain any missing protected API
          configuration.
        </Typography>
        <LinearProgress sx={{ borderRadius: 1, height: 8 }} />
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
        sx={{ borderRadius: 1, bgcolor: "rgba(255,248,240,0.92)" }}
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

  if (setup.staticDemo) {
    return (
      <Alert
        severity="info"
        icon={<ConstructionRoundedIcon />}
        sx={{ borderRadius: 1, alignItems: "center", bgcolor: "rgba(240,247,252,0.96)" }}
      >
        <AlertTitle>Static demo mode</AlertTitle>
        <Typography variant="body2" color="text.secondary">
          This public page is running without the local Express backend. It uses bundled demo
          notifications so the deployed link still opens cleanly.
        </Typography>
      </Alert>
    );
  }

  if (setup.usingDemoData) {
    return (
      <Alert
        severity="info"
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
        sx={{ borderRadius: 1, alignItems: "center", bgcolor: "rgba(240,247,252,0.96)" }}
      >
        <AlertTitle>Backend connected with demo notifications</AlertTitle>
        <Typography variant="body2" color="text.secondary" mb={1.25}>
          The local backend is serving demo notifications because the protected API credentials
          are not ready for live data. Add or correct the `.env` values to switch this same
          route to live data.
        </Typography>
        {setup.liveAuthError ? (
          <Typography variant="body2" color="text.secondary" mb={1.25}>
            Live auth check: {setup.liveAuthError}
          </Typography>
        ) : null}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {missingFields.map((field) => (
            <Chip key={field} label={field} size="small" variant="outlined" />
          ))}
        </Stack>
      </Alert>
    );
  }

  if (setup.canFetchLiveNotifications) {
    return (
      <Alert
        severity="success"
        icon={<CheckCircleRoundedIcon />}
        sx={{ borderRadius: 1, alignItems: "center", bgcolor: "rgba(240,251,244,0.92)" }}
      >
        <AlertTitle>Protected API setup is ready</AlertTitle>
        <Typography variant="body2" color="text.secondary">
          The backend has enough configuration to fetch live notifications through the local
          proxy using `limit`, `page`, and `notification_type`.
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
      sx={{ borderRadius: 1, bgcolor: "rgba(255,248,239,0.96)" }}
    >
      <AlertTitle>Local backend setup is incomplete</AlertTitle>
      <Typography variant="body2" color="text.secondary" mb={1.5}>
        The interface is ready, but the backend still needs a few protected API details in
        `notification-app-be/.env` before live data can load.
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {missingFields.map((field) => (
          <Chip key={field} label={field} size="small" variant="outlined" />
        ))}
      </Stack>
    </Alert>
  );
}
