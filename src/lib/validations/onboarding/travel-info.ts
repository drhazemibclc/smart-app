import { z } from 'zod';

const TravelInfoSchema = z.object({
  station: z.uuid(),
  preferredConcessionClass: z.uuid(),
  preferredConcessionPeriod: z.uuid()
});

export default TravelInfoSchema;
