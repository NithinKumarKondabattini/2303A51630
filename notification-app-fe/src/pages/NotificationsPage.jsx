import { useEffect, useState } from "react";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import {
  Alert,
  Badge,
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
import { useNotifications } from "../hooks/useNotifications";
import { frontendLogger } from "../middleware/logger";
import { formatTimestamp } from "../utils/time";

const PAGE_SIZE_OPTIONS = [9, 18, 27];

export function NotificationsPage({ isSeen, markSeen }) {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZE_OPTIONS[0]);
  const { notifications, hasMore, fetchedAt, loading, error, retry } = useNotifications({
    page,
    limit,
    notificationType: filter,
  });

  useEffect(() => {
    void frontendLogger.info("page", "all notifications page mounted");
  }, []);

  const unreadCount = notifications.filter((notification) => !isSeen(notification.ID)).length;

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
    void frontendLogger.info("component", `all notifications filter changed to ${newFilter}`);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Badge badgeContent={unreadCount} color="primary" max={99}>
                <NotificationsRoundedIcon sx={{ fontSize: 30 }} />
              </Badge>
              <Box>
                <Typography variant="h4" sx={{ fontSize: { xs: "1.6rem", md: "2rem" } }}>
                  All Notifications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Use filters and pagination to browse the live notification stream.
                </Typography>
              </Box>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} width={{ xs: "100%", md: "auto" }}>
              <NotificationFilter value={filter} onChange={handleFilterChange} />
              <ToggleButtonGroup
                exclusive
                value={limit}
                onChange={(_, nextLimit) => {
                  if (nextLimit) {
                    setLimit(nextLimit);
                    setPage(1);
                    void frontendLogger.info("state", `all notifications page size changed to ${nextLimit}`);
                  }
                }}
                size="small"
                sx={{ flexWrap: "wrap", gap: 0.5 }}
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <ToggleButton key={option} value={option} sx={{ textTransform: "none", px: 1.75 }}>
                    {option}/page
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <Button
                variant="outlined"
                startIcon={<RefreshRoundedIcon />}
                onClick={retry}
                sx={{ textTransform: "none", borderRadius: 999 }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Chip
              label={`Page ${page}`}
              variant="outlined"
              sx={{ alignSelf: "flex-start", borderRadius: 999 }}
            />
            <Chip
              label={`Visible new items ${unreadCount}`}
              variant="outlined"
              sx={{ alignSelf: "flex-start", borderRadius: 999 }}
            />
            <Chip
              label={`Last fetched ${fetchedAt ? formatTimestamp(fetchedAt) : "Pending"}`}
              variant="outlined"
              sx={{ alignSelf: "flex-start", borderRadius: 999 }}
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
          title="No notifications matched this view"
          description="Try widening the filter or refresh again after new items arrive."
        />
      ) : null}

      <Stack spacing={1.5}>
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.ID}
            notification={notification}
            seen={isSeen(notification.ID)}
            onViewed={markSeen}
          />
        ))}
      </Stack>

      {!loading && !error && notifications.length > 0 ? (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            px: { xs: 2, md: 2.5 },
            py: 1.5,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Typography variant="body2" color="text.secondary">
              The upstream API returns pages without a total count, so navigation moves page by
              page using the current `limit`.
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<ChevronLeftRoundedIcon />}
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
                sx={{ textTransform: "none", borderRadius: 999 }}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                endIcon={<ChevronRightRoundedIcon />}
                onClick={() => handlePageChange(page + 1)}
                disabled={!hasMore || loading}
                sx={{ textTransform: "none", borderRadius: 999 }}
              >
                Next
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}
