import { Clock, Mail, MapPin, Phone } from 'lucide-react';

export function ContactInfoBar() {
  return (
    <div className='border-t bg-background py-4'>
      <div className='container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 text-sm'>
        <div className='flex items-center gap-2'>
          <Phone className='h-4 w-4 text-muted-foreground' />
          <span>Emergency: (555) 123-4567</span>
        </div>
        <div className='flex items-center gap-2'>
          <Mail className='h-4 w-4 text-muted-foreground' />
          <span>info@pediatricclinic.com</span>
        </div>
        <div className='flex items-center gap-2'>
          <MapPin className='h-4 w-4 text-muted-foreground' />
          <span>123 Healthcare Ave, Medical District</span>
        </div>
        <div className='flex items-center gap-2'>
          <Clock className='h-4 w-4 text-muted-foreground' />
          <span>Mon-Fri: 8am-6pm | Sat: 9am-2pm</span>
        </div>
      </div>
    </div>
  );
}
