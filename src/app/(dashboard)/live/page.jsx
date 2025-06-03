'use client'

import Link from 'next/link'

import { Button, Typography, Box, Card, Grid } from '@mui/material'

// SEO Component
import SEO from '@/components/SEO'
import ReportCard from '@/components/ReportCard'

export default function Page() {
  // Dummy data for report cards
  const dummyReports = [
    {
      id: 1,
      name: 'ناشناس',
      time: '۱۰:۲۰AM',
      status: 'مجاز',
      imageUrl: '../../../../public/images/avatars/1.png'
    },
    {
      id: 2,
      name: 'ناشناس',
      time: '۱۰:۲۰AM',
      status: 'مجاز',
      imageUrl: '../../../../public/images/avatars/1.png'
    },
    {
      id: 3,
      name: 'ناشناس',
      time: '۱۰:۲۰AM',
      status: 'غیر مجاز',
      imageUrl: '../../../../public/images/avatars/1.png'
    },
    {
      id: 4,
      name: 'ناشناس',
      time: '۱۰:۲۰AM',
      status: 'مجاز',
      imageUrl: '../../../../public/images/avatars/1.png'
    },
    {
      id: 5,
      name: 'ناشناس',
      time: '۱۰:۲۰AM',
      status: 'غیر مجاز',
      imageUrl: '../../../../public/images/avatars/1.png'
    },
    {
      id: 6,
      name: 'ناشناس',
      time: '۱۰:۲۰AM',
      status: 'مجاز',
      imageUrl: '../../../../public/images/avatars/1.png'
    },
    {
      id: 7,
      name: 'ناشناس',
      time: '۱۰:۲۰AM',
      status: 'غیر مجاز',
      imageUrl: '../../../../public/images/avatars/1.png'
    },
    {
      id: 8,
      name: 'ناشناس',
      time: '۱۰:۲۰AM',
      status: 'مجاز',
      imageUrl: '../../../../public/images/avatars/1.png'
    },
    {
      id: 9,
      name: 'ناشناس',
      time: '۱۰:۲۰AM',
      status: 'غیر مجاز',
      imageUrl: '../../../../public/images/avatars/1.png'
    },
    {
      id: 10,
      name: 'ناشناس',
      time: '۱۰:۲۰AM',
      status: 'غیر مجاز',
      imageUrl: '../../../../public/images/avatars/1.png'
    },
    {
      id: 11,
      name: 'ناشناس',
      time: '۱۰:۲۰AM',
      status: 'غیر مجاز',
      imageUrl: '../../../../public/images/avatars/1.png'
    },
    {
      id: 12,
      name: 'ناشناس',
      time: '۱۰:۲۰AM',
      status: 'غیر مجاز',
      imageUrl: '../../../../public/images/avatars/1.png'
    },
    {
      id: 13,
      name: 'ناشناس',
      time: '۱۰:۲۰AM',
      status: 'غیر مجاز',
      imageUrl: '../../../../public/images/avatars/1.png'
    }
  ]

  return (
    <Box sx={{ p: 4 }}>
      <SEO
        title='داشبورد | سیستم تشخیص چهره دیانا'
        description='داشبورد اصلی سیستم تشخیص چهره دیانا'
        keywords='داشبورد, صفحه اصلی, تشخیص چهره دیانا'
      />

      {/* Live Stream Section - Full Width */}
      <Card sx={{ mb: 4, backgroundColor: 'rgb(47 51 73 / 0)' }}>
        <Box sx={{ p: 2 }}>
          <Typography textAlign={'center'} variant='h6' gutterBottom>
            پخش زنده
          </Typography>
          {/* Placeholder for live video feed */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              paddingTop: '56.25%', // 16:9 Aspect Ratio
              backgroundColor: '#000',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 1
            }}
          >
            {/* Replace with actual video component or stream */}
            <img
              src='/placeholder-video.jpg'
              alt='Live Stream Placeholder'
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 'inherit'
              }}
            />
          </Box>
        </Box>
      </Card>

      {/* Reports Section - 3x3 Grid */}
      <Card sx={{ backgroundColor: 'rgb(47 51 73 / 0)' }}>
        <Box sx={{ p: 2 }}>
          <Typography textAlign={'center'} variant='h6' gutterBottom>
            گزارش ها
          </Typography>
          <Grid sx={{ overflowY: 'auto', maxHeight: '430px' }} container spacing={2}>
            {dummyReports.map(report => (
              <Grid sx={{ display: 'flex', flexGrow: 1 }} item xs={12} sm={6} md={4} key={report.id}>
                <ReportCard report={report} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Card>
    </Box>
  )
}
