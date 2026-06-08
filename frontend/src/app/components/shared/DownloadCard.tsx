"use client";
import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import { Card, CardHeader, Tooltip, Divider, IconButton } from "@mui/material";
import { useSelector } from "react-redux";
import { IconDownload } from "@tabler/icons-react";
import AddIcon from "@mui/icons-material/Add";

const DownloadCard = ({
  title,
  children,
  onDownload,
  handleOpenModal,
}: {
  title?: string;
  children: React.ReactNode;
  onDownload: () => void;
  handleOpenModal?: () => void;
}) => {
  const customizer = useSelector((state: any) => state.customizer);

  const theme = useTheme();
  const borderColor = theme.palette.divider;

  return (
    <Card
      sx={{
        padding: 0,
        border: !customizer.isCardShadow ? `1px solid ${borderColor}` : "none",
      }}
      elevation={customizer.isCardShadow ? 9 : 0}
      variant={!customizer.isCardShadow ? "outlined" : undefined}
    >
      <CardHeader
        sx={{
          padding: "16px",
        }}
        title={title}
        action={
          <>
            <Tooltip title="Download" placement="left">
              <IconButton onClick={onDownload}>
                <IconDownload />
              </IconButton>
            </Tooltip>
            <IconButton
              color="primary"
              onClick={handleOpenModal}
              sx={{ ml: 2 }}
            >
              <AddIcon />
            </IconButton>
          </>
        }
      />
      <Divider />
      {children}
    </Card>
  );
};
DownloadCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  onDownload: PropTypes.func,
};
export default DownloadCard;
