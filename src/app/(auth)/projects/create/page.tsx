'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createProject, type Project } from '@/lib/firebase/firebaseUtils';
import { useAuth } from '@/lib/hooks/useAuth';

type Step = 'details' | 'timeline' | 'financial' | 'documents' | 'review';

interface ProjectForm {
  // Details
  name: string;
  customerName: string;
  companyName: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  
  // Timeline
  startDate: string;
  expectedEndDate: string;
  
  // Financial
  totalBudget: number;
  contingencyBudget: number;
  paymentTerms: string;
  
  // Documents
  documents: File[];
}

export default function CreateProject() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [formData, setFormData] = useState<ProjectForm>({
    name: '',
    customerName: '',
    companyName: '',
    address: '',
    contactPhone: '',
    contactEmail: '',
    startDate: '',
    expectedEndDate: '',
    totalBudget: 0,
    contingencyBudget: 0,
    paymentTerms: '',
    documents: []
  });

  const steps: Step[] = ['details', 'timeline', 'financial', 'documents', 'review'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        documents: [...Array.from(e.target.files!)]
      }));
    }
  };

  const handleNext = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to create a project');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const projectData: Omit<Project, 'id'> = {
        name: formData.name,
        customerName: formData.customerName,
        companyName: formData.companyName,
        address: formData.address,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        startDate: new Date(formData.startDate),
        expectedEndDate: new Date(formData.expectedEndDate),
        totalBudget: formData.totalBudget,
        contingencyBudget: formData.contingencyBudget,
        paymentTerms: formData.paymentTerms,
        documents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: user.uid,
        status: 'active'
      };

      const projectId = await createProject(projectData);
      router.push(`/projects/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`flex items-center ${
                steps.indexOf(currentStep) >= index ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                ${steps.indexOf(currentStep) >= index ? 'border-blue-600' : 'border-gray-400'}`}
              >
                {index + 1}
              </div>
              <span className="ml-2 capitalize">{step}</span>
              {index < steps.length - 1 && (
                <div className="w-full h-0.5 mx-4 bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 'details' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Project Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter project name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Customer Name *</label>
              <input
                type="text"
                name="customerName"
                required
                value={formData.customerName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter company name (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address *</label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Phone *</label>
              <input
                type="tel"
                name="contactPhone"
                required
                value={formData.contactPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter contact phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Email *</label>
              <input
                type="email"
                name="contactEmail"
                required
                value={formData.contactEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter contact email"
              />
            </div>
          </motion.div>
        )}

        {currentStep === 'timeline' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Start Date *</label>
              <input
                type="date"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expected End Date *</label>
              <input
                type="date"
                name="expectedEndDate"
                required
                value={formData.expectedEndDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </motion.div>
        )}

        {currentStep === 'financial' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Total Budget *</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="totalBudget"
                  required
                  min="0"
                  step="0.01"
                  value={formData.totalBudget}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-3 py-2 border rounded-lg"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contingency Budget *</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="contingencyBudget"
                  required
                  min="0"
                  step="0.01"
                  value={formData.contingencyBudget}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-3 py-2 border rounded-lg"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Payment Terms *</label>
              <textarea
                name="paymentTerms"
                required
                value={formData.paymentTerms}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
                placeholder="Enter payment terms and conditions"
              />
            </div>
          </motion.div>
        )}

        {currentStep === 'documents' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Project Documents</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload files</span>
                      <input
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG up to 10MB each
                  </p>
                </div>
              </div>
              {formData.documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.documents.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            documents: prev.documents.filter((_, i) => i !== index)
                          }));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {currentStep === 'review' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h3 className="text-lg font-medium">Project Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Project Name</p>
                  <p className="font-medium">{formData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer Name</p>
                  <p className="font-medium">{formData.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Company Name</p>
                  <p className="font-medium">{formData.companyName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{formData.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Phone</p>
                  <p className="font-medium">{formData.contactPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Email</p>
                  <p className="font-medium">{formData.contactEmail}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h3 className="text-lg font-medium">Timeline</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{formData.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expected End Date</p>
                  <p className="font-medium">{formData.expectedEndDate}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h3 className="text-lg font-medium">Financial Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Budget</p>
                  <p className="font-medium">
                    ${formData.totalBudget.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contingency Budget</p>
                  <p className="font-medium">
                    ${formData.contingencyBudget.toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Terms</p>
                <p className="font-medium whitespace-pre-wrap">{formData.paymentTerms}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h3 className="text-lg font-medium">Documents</h3>
              {formData.documents.length > 0 ? (
                <ul className="space-y-2">
                  {formData.documents.map((file, index) => (
                    <li key={index} className="text-sm">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No documents attached</p>
              )}
            </div>
          </motion.div>
        )}

        <div className="flex justify-between pt-6">
          {currentStep !== 'details' && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
          )}
          {currentStep !== 'review' ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
} 