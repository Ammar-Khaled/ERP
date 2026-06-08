import Button from "@mui/material/Button";
import Link from "next/link";

const AppDD = () => {
  return (
    <>
      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.secondary }}
        variant="text"
        href="/sales/pos"
        component={Link}
      >
        POS
      </Button>
      <Button
        color="inherit"
        sx={{ color: (theme) => theme.palette.text.secondary }}
        variant="text"
        href="/apps/calendar"
        component={Link}
      >
        Calendar
      </Button>
    </>
  );
};

export default AppDD;
