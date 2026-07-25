'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

interface BookingCalendarProps {
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  availableSlots?: string[];
  onSelectSlot?: (slot: string) => void;
}

export function BookingCalendar({ selectedDate, onSelectDate, availableSlots = [], onSelectSlot }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  return (
    <Box>
      <Stack direction="row" sx={{ gap: 2, alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Button onClick={prevMonth} size="small">← Prev</Button>
        <Typography variant="h6">
          {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
        </Typography>
        <Button onClick={nextMonth} size="small">Next →</Button>
      </Stack>

      <Grid container spacing={1}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <Grid item xs={1.4} key={d}>
            <Typography variant="caption" align="center" display="block" fontWeight="bold">{d}</Typography>
          </Grid>
        ))}
        {Array.from({ length: firstDay }, (_, i) => (
          <Grid item xs={1.4} key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

          return (
            <Grid item xs={1.4} key={day}>
              <Paper
                variant={isSelected ? 'elevation' : 'outlined'}
                sx={{
                  p: 1,
                  textAlign: 'center',
                  cursor: isPast ? 'default' : 'pointer',
                  opacity: isPast ? 0.4 : 1,
                  bgcolor: isSelected ? 'primary.light' : 'background.paper',
                  color: isSelected ? 'white' : 'text.primary',
                }}
                onClick={() => { if (!isPast) onSelectDate?.(date); }}
              >
                <Typography variant="body2">{day}</Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {selectedDate && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Available time slots for {selectedDate.toLocaleDateString()}:</Typography>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            {availableSlots.length > 0 ? (
              availableSlots.map((slot) => (
                <Button
                  key={slot}
                  variant="outlined"
                  size="small"
                  onClick={() => onSelectSlot?.(slot)}
                >
                  {slot}
                </Button>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">No slots available</Typography>
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
