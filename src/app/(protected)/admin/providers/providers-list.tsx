'use client';

import { Calendar, Mail, MoreVertical, Phone, Plus, Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Provider {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  status: 'active' | 'on-leave' | 'pending';
  appointmentsThisWeek: number;
  satisfactionRate: number;
  joinedDate: string;
}

export function ProvidersList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

  const providers: Provider[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Pediatrician',
      email: 'sarah.johnson@smartclinic.com',
      phone: '(555) 123-4567',
      status: 'active',
      appointmentsThisWeek: 28,
      satisfactionRate: 96,
      joinedDate: '2023-01-15'
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialty: 'Pediatric Cardiologist',
      email: 'michael.chen@smartclinic.com',
      phone: '(555) 234-5678',
      status: 'active',
      appointmentsThisWeek: 42,
      satisfactionRate: 94,
      joinedDate: '2023-02-20'
    },
    {
      id: '3',
      name: 'Dr. Maria Rodriguez',
      specialty: 'Neonatologist',
      email: 'maria.rodriguez@smartclinic.com',
      phone: '(555) 345-6789',
      status: 'pending',
      appointmentsThisWeek: 0,
      satisfactionRate: 0,
      joinedDate: '2024-01-10'
    },
    {
      id: '4',
      name: 'Dr. James Wilson',
      specialty: 'Pediatric Surgeon',
      email: 'james.wilson@smartclinic.com',
      phone: '(555) 456-7890',
      status: 'on-leave',
      appointmentsThisWeek: 15,
      satisfactionRate: 98,
      joinedDate: '2022-11-05'
    },
    {
      id: '5',
      name: 'Dr. Lisa Kim',
      specialty: 'Pediatrician',
      email: 'lisa.kim@smartclinic.com',
      phone: '(555) 567-8901',
      status: 'active',
      appointmentsThisWeek: 35,
      satisfactionRate: 95,
      joinedDate: '2023-03-12'
    }
  ];

  const filteredProviders = providers.filter(provider => {
    const matchesSearch =
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || provider.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const specialties = Array.from(new Set(providers.map(p => p.specialty)));

  const getStatusBadge = (status: Provider['status']) => {
    switch (status) {
      case 'active':
        return <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>Active</Badge>;
      case 'on-leave':
        return (
          <Badge
            className='bg-amber-100 text-amber-800'
            variant='secondary'
          >
            On Leave
          </Badge>
        );
      case 'pending':
        return (
          <Badge
            className='border-blue-200 text-blue-700'
            variant='outline'
          >
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-bold text-3xl tracking-tight'>Providers</h1>
          <p className='text-muted-foreground'>Manage medical staff and provider information</p>
        </div>
        <Button asChild>
          <Link href='/admin/providers'>
            <Plus className='mr-2 h-4 w-4' />
            Add Provider
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='flex items-center gap-4'>
              <Input
                className='w-full md:w-64'
                onChange={e => setSearchQuery(e.target.value)}
                placeholder='Search providers...'
                value={searchQuery}
              />
              <select
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-48'
                onChange={e => setSelectedSpecialty(e.target.value)}
                value={selectedSpecialty}
              >
                <option value='all'>All Specialties</option>
                {specialties.map(specialty => (
                  <option
                    key={specialty}
                    value={specialty}
                  >
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex items-center gap-2'>
              <Badge
                className='px-3 py-1'
                variant='outline'
              >
                Total: {providers.length}
              </Badge>
              <Badge
                className='bg-green-100 px-3 py-1 text-green-800'
                variant='secondary'
              >
                Active: {providers.filter(p => p.status === 'active').length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Providers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Providers</CardTitle>
          <CardDescription>List of all medical providers in the clinic</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProviders.map(provider => (
                <TableRow key={provider.id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10'>
                        <span className='font-semibold'>
                          {provider.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </span>
                      </div>
                      <div>
                        <div className='font-medium'>{provider.name}</div>
                        <div className='text-muted-foreground text-sm'>
                          Joined {new Date(provider.joinedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant='secondary'>{provider.specialty}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2 text-sm'>
                        <Mail className='h-3 w-3' />
                        {provider.email}
                      </div>
                      <div className='flex items-center gap-2 text-sm'>
                        <Phone className='h-3 w-3' />
                        {provider.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(provider.status)}</TableCell>
                  <TableCell>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <Calendar className='h-3 w-3 text-muted-foreground' />
                        <span className='text-sm'>{provider.appointmentsThisWeek} appointments</span>
                      </div>
                      {provider.satisfactionRate > 0 && (
                        <div className='flex items-center gap-2'>
                          <Star className='h-3 w-3 text-amber-500' />
                          <span className='text-sm'>{provider.satisfactionRate}% satisfaction</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className='h-8 w-8 p-0'
                          variant='ghost'
                        >
                          <span className='sr-only'>Open menu</span>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/providers/${provider.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Information</DropdownMenuItem>
                        <DropdownMenuItem>Schedule</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='text-red-600'>
                          {provider.status === 'active' ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
