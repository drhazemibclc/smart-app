import AcademicInfoSchema from './academic-info';
import DocumentSchema from './document';
import PersonalInfoSchema from './personal-info';
import TravelInfoSchema from './travel-info';

const OnboardingSchema = PersonalInfoSchema.merge(AcademicInfoSchema).merge(TravelInfoSchema).merge(DocumentSchema);

export { DocumentSchema, TravelInfoSchema, OnboardingSchema, PersonalInfoSchema, AcademicInfoSchema };
