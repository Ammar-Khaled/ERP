import { Fab, Tooltip } from "@mui/material";
import { IconMessage2 } from "@tabler/icons-react";
import Link from "next/link";

const AIChatIcon = () => {
  return (
    <Link href="/ai-chat" passHref>
      <Tooltip title="AI Chat">
        <Fab
          color="primary"
          aria-label="AI Chat"
          sx={{ position: "fixed", right: "25px", bottom: "80px" }}
        >
          <IconMessage2 stroke={1.5} />
        </Fab>
      </Tooltip>
    </Link>
  );
};

export default AIChatIcon;
