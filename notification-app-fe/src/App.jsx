import { useEffect } from "react";
import {
  Box,
  Chip,
  Container,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
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

function SummaryCard({ label, value, tone }) {
  return (
    <Paper
      elevation={0}
      sx={{
        minWidth: 150,
        flex: 1,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        background:
          tone === "gold"
            ? "linear-gradient(135deg, rgba(255,244,214,0.95), rgba(255,255,255,0.92))"
            : "linear-gradient(135deg, rgba(225,244,255,0.9), rgba(255,255,255,0.92))",
        px: 2.5,
        py: 2,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={700} mt={0.5}>
        {value}
      </Typography>
    </Paper>
  );
}

export default function App() {
  const { route, navigate } = useHashRoute();
  const { seenIds, markSeen, isSeen } = useSeenNotifications();
  const serviceStatus = useServiceStatus();

  useEffect(() => {
    void frontendLogger.info("page", "application shell mounted");
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", py: { xs: 3, md: 5 } }}>
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            overflow: "hidden",
            borderRadius: { xs: 4, md: 6 },
            border: "1px solid",
            borderColor: "divider",
            background:
              "radial-gradient(circle at top left, rgba(9,98,132,0.16), transparent 40%), linear-gradient(180deg, rgba(255,255,255,0.96), rgba(245,249,252,0.98))",
          }}
        >
          <Box sx={{ px: { xs: 2.5, md: 4 }, pt: { xs: 3, md: 4 }, pb: 2.5 }}>
            <Stack spacing={2.5}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                spacing={2}
              >
                <Stack spacing={1.25}>
                  <Chip
                    icon={<DashboardRoundedIcon />}
                    label="Realtime campus updates"
                    color="primary"
                    sx={{ alignSelf: "flex-start", borderRadius: 999 }}
                  />
                  <Typography variant="h3" sx={{ fontSize: { xs: "2rem", md: "2.8rem" } }}>
                    Campus Notification Desk
                  </Typography>
                  <Typography variant="body1" color="text.secondary" maxWidth={700}>
                    Browse the complete notification stream, surface the highest priority
                    updates first, and keep track of which items have already been viewed.
                  </Typography>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} width={{ xs: "100%", md: "auto" }}>
                  <SummaryCard label="Viewed items" value={seenIds.length} tone="blue" />
                  <SummaryCard
                    label="Live API"
                    value={serviceStatus.data?.setup?.canFetchNotifications ? "Ready" : "Setup"}
                    tone="blue"
                  />
                  <SummaryCard label="Priority mode" value="Weighted" tone="gold" />
                </Stack>
              </Stack>

              <Tabs
                value={route}
                onChange={(_, nextRoute) => navigate(nextRoute)}
                variant="scrollable"
                allowScrollButtonsMobile
                sx={{
                  "& .MuiTabs-indicator": {
                    height: 4,
                    borderRadius: 999,
                  },
                }}
              >
                <Tab
                  icon={<NotificationsActiveRoundedIcon />}
                  iconPosition="start"
                  label="All Notifications"
                  value="all"
                  sx={{ textTransform: "none", minHeight: 56 }}
                />
                <Tab
                  icon={<StarRoundedIcon />}
                  iconPosition="start"
                  label="Priority Inbox"
                  value="priority"
                  sx={{ textTransform: "none", minHeight: 56 }}
                />
              </Tabs>

              <ServiceStatusBanner
                loading={serviceStatus.loading}
                error={serviceStatus.error}
                status={serviceStatus.data}
                onRetry={serviceStatus.retry}
              />
            </Stack>
          </Box>

          <Box sx={{ px: { xs: 2.5, md: 4 }, pb: { xs: 3, md: 4 } }}>
            {route === "priority" ? (
              <PriorityInboxPage isSeen={isSeen} markSeen={markSeen} />
            ) : (
              <NotificationsPage isSeen={isSeen} markSeen={markSeen} />
            )}
          </Box>

          <Box
            sx={{
              px: { xs: 2.5, md: 4 },
              py: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "rgba(247,250,252,0.92)",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <Typography variant="body2" color="text.secondary">
                Built with a local proxy so credentials stay off the browser.
              </Typography>
              <Chip
                icon={<VisibilityRoundedIcon />}
                label={`${seenIds.length} notifications marked as viewed`}
                variant="outlined"
                sx={{ borderRadius: 999 }}
              />
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
