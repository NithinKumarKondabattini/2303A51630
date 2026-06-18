import { useEffect, useState } from "react";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationEmptyState } from "../components/NotificationEmptyState";
import { NotificationFilter } from "../components/NotificationFilter";
import { usePriorityNotifications } from "../hooks/usePriorityNotifications";
import { frontendLogger } from "../middleware/logger";
import { formatTimestamp } from "../utils/time";

const LIMIT_OPTIONS = [10, 15, 20];

export function PriorityInboxPage({ isSeen, markSeen }) {
  const [filter, setFilter] = useState("All");
  const [limit, setLimit] = useState(10);
  const { notifications, fetchedAt, loading, error, retry } = usePriorityNotifications({
    limit,
    notificationType: filter,
  });

  useEffect(() => {
    void frontendLogger.info("page", "priority inbox page mounted");
  }, []);

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 2.5 },
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1.2}>
                <BoltRoundedIcon color="secondary" />
                <Typography variant="h4" sx={{ fontSize: { xs: "1.6rem", md: "2rem" } }}>
                  Priority Inbox
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" maxWidth={680}>
                Items are ranked by notification type first and recency second, so placement updates stay ahead of
                result updates, which stay ahead of event notices.
              </Typography>
            </Stack>

            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={retry}
              sx={{ textTransform: "none", borderRadius: 999 }}
            >
              Refresh
            </Button>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between">
            <NotificationFilter
              value={filter}
              onChange={(nextFilter) => {
                setFilter(nextFilter);
                void frontendLogger.info("component", `priority filter changed to ${nextFilter}`);
              }}
            />

            <ToggleButtonGroup
              exclusive
              value={limit}
              onChange={(_, nextLimit) => {
                if (nextLimit) {
                  setLimit(nextLimit);
                  void frontendLogger.info("state", `priority list size changed to ${nextLimit}`);
                }
              }}
              size="small"
              sx={{ flexWrap: "wrap", gap: 0.5 }}
            >
              {LIMIT_OPTIONS.map((option) => (
                <ToggleButton key={option} value={option} sx={{ textTransform: "none", px: 2 }}>
                  Top {option}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Last fetched: <strong>{fetchedAt ? formatTimestamp(fetchedAt) : "Pending"}</strong>
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`Top ${limit}`} variant="outlined" sx={{ borderRadius: 999 }} />
            <Chip label={`Filter ${filter}`} variant="outlined" sx={{ borderRadius: 999 }} />
            <Chip
              label={`${notifications.filter((notification) => !isSeen(notification.ID)).length} new in this view`}
              variant="outlined"
              sx={{ borderRadius: 999 }}
            />
          </Stack>
        </Stack>
      </Paper>

      {loading && notifications.length === 0 ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : null}

      {error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={retry}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      ) : null}

      {!loading && !error && notifications.length === 0 ? (
        <NotificationEmptyState
          title="No priority notifications available"
          description="The selected filters did not return any notifications. Try a broader view or refresh the inbox."
        />
      ) : null}

      <Stack spacing={1.5}>
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.ID}
            notification={notification}
            seen={isSeen(notification.ID)}
            onViewed={markSeen}
            showPriority
          />
        ))}
      </Stack>
    </Stack>
  );
}
