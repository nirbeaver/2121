export interface ProjectDetails {
  projectName: string;
  customerName: string;
  companyName?: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
}

export interface ProjectTimeline {
  startDate: Date;
  expectedEndDate: Date;
  milestones?: {
    date: Date;
    description: string;
  }[];
}

export interface ProjectFinancial {
  budget: number;
  paymentTerms: string;
  depositAmount?: number;
}

export interface ProjectDocument {
  id: string;
  name: string;
  url: string;
  uploadedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  budget: number;
  deadline: string;
  status: 'In Progress' | 'Completed' | 'On Hold';
  team?: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// Simplified interface for new project creation
export interface NewProject {
  name: string;
  client: string;
  budget: number;
  deadline: string;
  status: 'In Progress' | 'Completed' | 'On Hold';
  team?: number;
} 