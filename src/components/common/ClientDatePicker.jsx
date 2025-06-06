'use client';

import dynamic from 'next/dynamic';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Dynamically import DatePicker with no SSR
const DatePicker = dynamic(
  () => import('@mui/x-date-pickers/DatePicker').then((mod) => mod.DatePicker),
  { ssr: false }
);

export default function ClientDatePicker(props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker {...props} />
    </LocalizationProvider>
  );
} 