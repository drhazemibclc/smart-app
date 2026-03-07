import Link from 'next/link';

import type { AvailableDoctorProps } from '@/types/data-types';

import { checkRole } from '../../lib/auth-server';
import { daysOfWeek } from '../../utils';
import { ProfileImage } from '../profile-image';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

const getToday = () => {
  const today = new Date().getDay();
  return daysOfWeek[today];
};

const todayDay = getToday();

interface Days {
  day: string;
  startTime: string;
  endTime: string;
}

interface DataProps {
  data: AvailableDoctorProps;
}

export const availableDays = ({ data }: { data: Days[] }) => {
  const isTodayWorkingDay = data?.find(dayObj => dayObj?.day?.toLowerCase() === todayDay);

  return isTodayWorkingDay ? `${isTodayWorkingDay?.startTime} - ${isTodayWorkingDay?.endTime}` : 'Not Available';
};
export const AvailableDoctors = async ({ data }: DataProps) => {
  return (
    <div className='rounded-xl bg-white p-4'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='font-semibold text-lg'>Available Doctors</h1>

        {(await checkRole('admin')) && (
          <Button
            asChild
            className='disabled:cursor-not-allowed disabled:text-gray-200'
            disabled={data?.length === 0}
            variant={'outline'}
          >
            <Link href='/record/doctors'>View all</Link>
          </Button>
        )}
      </div>

      <div className='flex w-full flex-col space-y-5 md:flex-row md:flex-wrap md:gap-6 md:space-y-0'>
        {data?.map(doc => (
          <Card
            className='flex min-h-28 w-full gap-4 border-none p-4 odd:bg-emerald-600/5 even:bg-yellow-600/5 md:w-[300px] xl:w-full'
            key={doc.img}
          >
            <ProfileImage
              bgColor={doc?.colorCode ?? ''}
              className={'min-h-14 min-w-14 md:flex md:min-h-16 md:min-w-16'}
              name={doc?.name}
              textClassName='text-2xl font-semibold text-black'
              url={doc?.img ?? ''}
            />
            {/* <p>{doc.colorCode}</p> */}
            <div>
              <h2 className='font-semibold text-lg md:text-xl'>{doc?.name}</h2>
              <p className='text-base text-gray-600 capitalize'>{doc?.specialty}</p>
              <p className='flex items-center text-sm'>
                <span className='hidden lg:flex'>Available Time:</span>
                {availableDays({ data: doc?.workingDays })}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
