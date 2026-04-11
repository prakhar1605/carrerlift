export interface Job {
  Company: string; Role: string; Location: string; Stipend: string;
  ApplyLink: string; Email: string; WhatsApp?: string; JobType: string;
  PostedDate: string; Description: string;
}
export interface GlobalJob {
  company: string; role: string; location: string; salary: string;
  applyLink: string; jobType: string; source: string; postedAt: number;
}
export interface MixedJob {
  _type: 'india' | 'global'; _postedAt: number;
  company: string; role: string; location: string; stipend: string;
  jobType: string; description: string; email: string; applyLink: string;
  _raw: Job | GlobalJob;
}
export interface Professor {
  Name: string; 'College Name': string; 'College Type': string;
  Department: string; 'Area of Interest': string; 'Mail id': string;
}
export interface HRContact {
  Name: string; 'Job Title': string; 'Linkedin URL': string;
  'Company Name': string; 'Company Website': string;
  Location: string; 'Company Niche': string;
}
