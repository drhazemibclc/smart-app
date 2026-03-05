import { z } from 'zod';

const AcademicInfoSchema = z.object({
  year: z.uuid(),
  class: z.uuid(),
  branch: z.uuid()
});

export default AcademicInfoSchema;
