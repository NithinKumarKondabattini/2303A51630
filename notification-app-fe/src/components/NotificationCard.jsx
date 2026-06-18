import { useState } from "react";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import FiberNewRoundedIcon from "@mui/icons-material/FiberNewRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import { frontendLogger } from "../middleware/logger";
import { getPriorityWeight, normalizeNotificationType } from "../utils/priority";
import { formatTimestamp, getRelativeTimeLabel } from "../utils/time";

const toneByType = {
  Placement: "success",
  Result: "warning",
  Event: "primary",
};

const accentByType = {
  Placement: "linear-gradient(180deg, rgba(47,125,50,0.16), rgba(47,125,50,0.03))",
  Result: "linear-gradient(180deg, rgba(199,119,0,0.16), rgba(199,119,0,0.03))",
  Event: "linear-gradient(180deg, rgba(13,108,140,0.16), rgba(13,108,140,0.03))",
};

export function NotificationCard({ notification, seen, onViewed, showPriority = false }) {
  const [expanded, setExpanded] = useState(false);
  const type = normalizeNotificationType(notification.Type);
  const priorityWeight = getPriorityWeight(type);

  const handleChange = (_, nextExpanded) => {
    setExpanded(nextExpanded);

    if (nextExpanded) {
      onViewed?.(notification.ID);
      void frontendLogger.debug("component", `notification expanded ${notification.ID}`);
    }
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={handleChange}
      elevation={0}
      sx={{
        borderRadius: "20px !important",
        border: "1px solid",
        borderColor: seen ? "divider" : "primary.light",
        background: seen
          ? "linear-gradient(180deg, rgba(255,255,255,0.97), rgba(249,250,252,0.98))"
          : accentByType[type],
        "&::before": {
          display: "none",
        },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
        <Stack spacing={1.2} width="100%">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={type}
                color={toneByType[type]}
                size="small"
                sx={{ borderRadius: 999 }}
              />
              {seen ? (
                <Chip
                  icon={<VisibilityRoundedIcon />}
                  label="Viewed"
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 999 }}
                />
              ) : (
                <Chip
                  icon={<FiberNewRoundedIcon />}
                  label="New"
                  size="small"
                  color="primary"
                  sx={{ borderRadius: 999 }}
                />
              )}
              {showPriority ? (
                <Chip
                  icon={<BoltRoundedIcon />}
                  label={`Priority ${priorityWeight}`}
                  size="small"
                  color="secondary"
                  sx={{ borderRadius: 999 }}
                />
              ) : null}
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {getRelativeTimeLabel(notification.Timestamp)}
            </Typography>
          </Stack>

          <Typography variant="h6" sx={{ fontSize: "1.05rem" }}>
            {notification.Message || "Untitled notification"}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<FlagRoundedIcon />}
              label={notification.ID ? `ID ${notification.ID.slice(0, 8)}` : "Missing ID"}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 999 }}
            />
            <Chip
              label={formatTimestamp(notification.Timestamp)}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 999 }}
            />
          </Stack>
        </Stack>
      </AccordionSummary>

      <AccordionDetails>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={1.25}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Notification ID
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: '"Consolas", "Courier New", monospace' }}>
              {notification.ID || "Unavailable"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Timestamp
            </Typography>
            <Typography variant="body1">{formatTimestamp(notification.Timestamp)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Viewer state
            </Typography>
            <Typography variant="body1">
              {seen ? "This item has already been opened on this device." : "This item is still new on this device."}
            </Typography>
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
