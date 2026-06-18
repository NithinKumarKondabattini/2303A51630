import { useEffect } from "react";
import {
  Box,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import CloudDoneRoundedIcon from "@mui/icons-material/CloudDoneRounded";
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

import { NotificationsPage } from "./pages/NotificationsPage";
import { PriorityInboxPage } from "./pages/PriorityInboxPage";
import { ServiceStatusBanner } from "./components/ServiceStatusBanner";
import { useHashRoute } from "./hooks/useHashRoute";
import { useSeenNotifications } from "./hooks/useSeenNotifications";
import { useServiceStatus } from "./hooks/useServiceStatus";
import { frontendLogger } from "./middleware/logger";

function SummaryCard({ icon, label, value, caption }) {
  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        px: 2,
        py: 1.75,
        backgroundColor: "background.paper",
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ color: "primary.main", display: "grid", placeItems: "center" }}>{icon}</Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Stack>
        <Typography variant="h5" fontWeight={800}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {caption}
        </Typography>
      </Stack>
    </Paper>
  );
}

export default function App() {
  const { route, navigate } = useHashRoute();
  const { seenIds, markSeen, isSeen } = useSeenNotifications();
  const serviceStatus = useServiceStatus();
  const setup = serviceStatus.data?.setup;
  const serviceReady = Boolean(setup?.canFetchNotifications);
  const liveReady = Boolean(setup?.canFetchLiveNotifications);
  const demoMode = Boolean(setup?.usingDemoData);
  const staticDemo = Boolean(setup?.staticDemo);

  useEffect(() => {
    void frontendLogger.info("page", "application shell mounted");
  }, []);

  const sourceLabel = staticDemo
    ? "Static demo data"
    : demoMode
      ? "Demo backend data"
      : liveReady
        ? "Protected API live"
        : "Backend checking";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: { xs: 2, md: 3 } }}>
      <Container maxWidth="lg">
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Box>
              <Typography variant="h3" sx={{ fontSize: { xs: "2rem", md: "2.45rem" }, letterSpacing: 0 }}>
                Campus Notification Desk
              </Typography>
              <Typography variant="body1" color="text.secondary" maxWidth={720}>
                Live notifications use the protected backend when credentials are ready. Until then,
                the same backend serves demo data so the workflow stays testable.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<CloudDoneRoundedIcon />}
                label={
                  staticDemo
                    ? "Static site"
                    : liveReady
                      ? "Protected API ready"
                      : serviceReady
                        ? "Backend connected"
                        : "Backend offline"
                }
                color={liveReady ? "success" : serviceReady ? "primary" : "warning"}
                variant={liveReady ? "filled" : "outlined"}
              />
              <Chip
                icon={<DataObjectRoundedIcon />}
                label={sourceLabel}
                color={demoMode ? "warning" : "primary"}
                variant="outlined"
              />
            </Stack>
          </Stack>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 4 }}>
              <SummaryCard
                icon={<VisibilityRoundedIcon />}
                label="Viewed items"
                value={seenIds.length}
                caption="Saved locally in this browser."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <SummaryCard
                icon={<CloudDoneRoundedIcon />}
                label="Data source"
                value={staticDemo ? "Static" : demoMode ? "Demo" : liveReady ? "Live" : "Pending"}
                caption={
                  staticDemo
                    ? "Bundled records for GitHub Pages."
                    : demoMode
                      ? "Backend fallback is active."
                      : "Protected route is used when ready."
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <SummaryCard
                icon={<StarRoundedIcon />}
                label="Priority rule"
                value="Weighted"
                caption="Placement > Result > Event, then recency."
              />
            </Grid>
          </Grid>

          <Paper
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
            }}
          >
            <Tabs
              value={route}
              onChange={(_, nextRoute) => navigate(nextRoute)}
              variant="scrollable"
              allowScrollButtonsMobile
              sx={{
                minHeight: 48,
                px: 1,
                "& .MuiTab-root": {
                  minHeight: 48,
                  mr: 0.5,
                  textTransform: "none",
                },
                "& .Mui-selected": {
                  bgcolor: "rgba(13,108,140,0.08)",
                },
              }}
            >
              <Tab
                icon={<NotificationsActiveRoundedIcon />}
                iconPosition="start"
                label="All Notifications"
                value="all"
              />
              <Tab
                icon={<StarRoundedIcon />}
                iconPosition="start"
                label="Priority Inbox"
                value="priority"
              />
            </Tabs>
          </Paper>

          <ServiceStatusBanner
            loading={serviceStatus.loading}
            error={serviceStatus.error}
            status={serviceStatus.data}
            onRetry={serviceStatus.retry}
          />

          <Box>
            {route === "priority" ? (
              <PriorityInboxPage
                isSeen={isSeen}
                markSeen={markSeen}
                serviceReady={serviceReady}
                setup={setup}
              />
            ) : (
              <NotificationsPage
                isSeen={isSeen}
                markSeen={markSeen}
                serviceReady={serviceReady}
                setup={setup}
              />
            )}
          </Box>

          <Divider />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            pb={1.5}
          >
            <Typography variant="body2" color="text.secondary">
              {staticDemo
                ? "GitHub Pages static demo. Run the Express backend locally for protected API data."
                : "Backend proxy: `localhost:3001`, frontend: `localhost:3000`."}
            </Typography>
            <Chip
              icon={<VisibilityRoundedIcon />}
              label={`${seenIds.length} notifications viewed`}
              variant="outlined"
            />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
