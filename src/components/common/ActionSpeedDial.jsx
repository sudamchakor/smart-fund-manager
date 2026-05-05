import React from 'react';
import { SpeedDial, SpeedDialIcon, SpeedDialAction } from '@mui/material';

export default function ActionSpeedDial({ actions, sx, ...props }) {
  return (
    <SpeedDial
      ariaLabel="Floating Action Menu"
      sx={{
        position: 'fixed',
        bottom: { xs: 80, sm: 100 },
        right: { xs: 16, sm: 24 },
        zIndex: 1400,
        ...sx,
      }}
      icon={<SpeedDialIcon />}
      {...props}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={action.handler}
          tooltipOpen={action.tooltipOpen}
        />
      ))}
    </SpeedDial>
  );
}
