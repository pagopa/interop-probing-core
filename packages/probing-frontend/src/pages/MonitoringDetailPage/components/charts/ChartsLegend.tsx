import { Box, List, ListItem, Typography } from '@mui/material'

type ChartsLegendProps = {
  legendElements: { label: string; color: string }[]
}

export const ChartsLegend: React.FC<ChartsLegendProps> = ({ legendElements }) => {
  return (
    <List sx={{ minWidth: 400 }}>
      {legendElements.map((item) => (
        <ListItem key={item.label} sx={{ height: '30px' }}>
          <Box sx={{ width: 15, height: 15, backgroundColor: item.color }}></Box>
          <Typography sx={{ ml: 2 }}>{item.label}</Typography>
        </ListItem>
      ))}
    </List>
  )
}
