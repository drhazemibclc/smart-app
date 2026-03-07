'use client';

import { format } from 'date-fns';
import { Calendar, Edit, Mail, Phone, Star, Stethoscope, TrendingUp, User, Wallet } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WorkingDay {
  day: string;
  startTime: string;
  endTime: string;
}

interface Appointment {
  id: string;
  date: Date;
  status: string | null;
  patient: {
    firstName: string;
    lastName: string;
  };
}

interface Doctor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  specialty: string;
  licenseNumber: string | null;
  isActive: boolean | null;
  img: string | null;
  colorCode: string | null;
  appointmentPrice: number;
  workingDays: WorkingDay[];
  _count?: {
    appointments: number;
  };
  appointments?: Appointment[];
  ratings?: Array<{
    rating: number;
  }>;
}

interface DoctorDetailClientProps {
  doctor: Doctor;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function calculateAverageRating(ratings?: Array<{ rating: number }>): number {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
  return sum / ratings.length;
}

export function DoctorDetailClient({ doctor }: DoctorDetailClientProps) {
  // const id = useId();
  const averageRating = calculateAverageRating(doctor.ratings);

  const formatDay = (day: string) => {
    return day.charAt(0) + day.slice(1).toLowerCase();
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between'>
            <div className='flex items-start gap-4'>
              <Avatar className='h-20 w-20'>
                <AvatarImage
                  alt={doctor.name}
                  src={doctor.img ?? undefined}
                />
                <AvatarFallback
                  className='text-white text-xl'
                  style={{
                    backgroundColor: doctor.colorCode ?? '#4ECDC4'
                  }}
                >
                  {getInitials(doctor.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className='font-semibold text-2xl'>{doctor.name}</h2>
                <p className='text-muted-foreground'>{doctor.specialty}</p>
                <div className='mt-2 flex items-center gap-2'>
                  <Badge variant={doctor.isActive ? 'default' : 'secondary'}>
                    {doctor.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {doctor.licenseNumber && <Badge variant='outline'>License: {doctor.licenseNumber}</Badge>}
                </div>
              </div>
            </div>
            <Button
              asChild
              size='sm'
            >
              <Link href={`/dashboard/doctors/${doctor.id}/edit`}>
                <Edit className='mr-2 h-4 w-4' />
                Edit Doctor
              </Link>
            </Button>
          </div>

          <Separator className='my-6' />

          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            <div className='flex items-start gap-3'>
              <Mail className='mt-0.5 h-4 w-4 text-muted-foreground' />
              <div>
                <p className='font-medium text-sm'>Email</p>
                <p className='text-muted-foreground text-sm'>{doctor.email || 'Not provided'}</p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <Phone className='mt-0.5 h-4 w-4 text-muted-foreground' />
              <div>
                <p className='font-medium text-sm'>Phone</p>
                <p className='text-muted-foreground text-sm'>{doctor.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <Wallet className='mt-0.5 h-4 w-4 text-muted-foreground' />
              <div>
                <p className='font-medium text-sm'>Appointment Price</p>
                <p className='text-muted-foreground text-sm'>${doctor.appointmentPrice.toFixed(2)}</p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <Stethoscope className='mt-0.5 h-4 w-4 text-muted-foreground' />
              <div>
                <p className='font-medium text-sm'>Specialty</p>
                <p className='text-muted-foreground text-sm'>{doctor.specialty}</p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <Star className='mt-0.5 h-4 w-4 text-muted-foreground' />
              <div>
                <p className='font-medium text-sm'>Rating</p>
                <p className='text-muted-foreground text-sm'>
                  {averageRating > 0 ? averageRating.toFixed(1) : 'No ratings yet'}
                  {doctor.ratings && doctor.ratings.length > 0 && ` (${doctor.ratings.length} reviews)`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='grid gap-6 lg:grid-cols-3'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <Calendar className='h-4 w-4' />
              Total Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='font-bold text-3xl'>{doctor._count?.appointments ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <TrendingUp className='h-4 w-4' />
              Working Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='font-bold text-3xl'>{doctor.workingDays?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <User className='h-4 w-4' />
              Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='font-bold text-3xl'>—</p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        className='w-full'
        defaultValue='schedule'
      >
        <TabsList>
          <TabsTrigger value='schedule'>Schedule</TabsTrigger>
          <TabsTrigger value='appointments'>Recent Appointments</TabsTrigger>
        </TabsList>

        <TabsContent
          className='space-y-4'
          value='schedule'
        >
          <Card>
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
              <CardDescription>Weekly schedule for Dr. {doctor.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {doctor.workingDays && doctor.workingDays.length > 0 ? (
                <div className='space-y-3'>
                  {doctor.workingDays.map(day => (
                    <div
                      className='flex items-center justify-between rounded-lg border p-3'
                      key={`${doctor.id}-${day.day}`}
                    >
                      <p className='font-medium'>{formatDay(day.day)}</p>
                      <p className='text-muted-foreground'>
                        {day.startTime} - {day.endTime}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground text-sm'>No working hours configured</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          className='space-y-4'
          value='appointments'
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>View recent appointments for this doctor</CardDescription>
            </CardHeader>
            <CardContent>
              {doctor.appointments && doctor.appointments.length > 0 ? (
                <div className='space-y-3'>
                  {doctor.appointments.slice(0, 5).map(appointment => (
                    <div
                      className='flex items-center justify-between rounded-lg border p-3'
                      key={appointment.id}
                    >
                      <div>
                        <p className='font-medium text-sm'>
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </p>
                        <Badge
                          className='mt-1'
                          variant='outline'
                        >
                          {String(appointment.status)}
                        </Badge>
                      </div>
                      <p className='text-muted-foreground text-sm'>
                        {format(new Date(appointment.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground text-sm'>No appointments found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
