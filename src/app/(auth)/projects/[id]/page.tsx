'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Eye, Share, MoreHorizontal, Building2, Calendar, DollarSign, MapPin, Phone, Mail, User, Plus, FileText, Download, Search, File, ChevronDown, ChevronRight, Edit, X } from 'lucide-react';
import Link from 'next/link';
import { Document, Page, pdfjs } from 'react-pdf';
import Image from 'next/image';
// Set worker URL for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Import directly from documents.ts
import { 
  uploadProjectDocument, 
  getProjectDocuments,
  type ProjectDocument, 
  type UploadMetadata 
} from '@/lib/firebase/documents';

interface Transaction {
  id: string; // Add unique ID
  projectId: string; // Add project ID
  date: string;
  description: string;
  category: string;
  amount: number;
  paymentMethod: string;
  status: 'completed' | 'pending';
  reference: string;
  details?: TransactionDetails; // Add details
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: string;
    url: string;
    uploadedAt: string;
  }[];
  linkedTaskId?: string;
}

interface TransactionDetails {
  taskId?: string;
  taskName?: string;
  contractorName?: string;
  companyName?: string;
  paymentDetails: {
    creditCard?: {
      type: string;
      lastFour: string;
    };
    check?: {
      bankName: string;
      checkNumber: string;
    };
    digital?: {
      platform: string;
      username: string;
    };
  };
}

interface Document {
  id: string;
  name: string;
  category: string;
  mainCategory: 'owner' | 'construction' | 'contractor';
  subCategory: string;
  size: string;
  uploadedDate: string;
  uploadedBy: string;
  url: string;
  description?: string;
}

interface Task {
  id: string;
  name: string;
  category: string;
  status: 'completed' | 'in-progress' | 'pending';
  progress: number;
  contractorName: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  startDate: string;
  duration: string;
  durationUnit: string;
  contractValue: string;
  estimatedCost: string;
}

interface TransactionFormState {
  date: string;
  description: string;
  category: string;
  amount: string;
  paymentMethod: string;
  creditCardType: string;
  lastFourDigits: string;
  bankName: string;
  checkNumber: string;
  digitalPaymentUsername: string;
  status: 'completed' | 'pending';
  reference: string;
  linkedTaskId: string;
  linkedSubcontractorId: string;
  attachments: File[];
}

// Add this interface for document sharing
interface ShareModalState {
  isOpen: boolean;
  documentUrl?: string;
  documentName?: string;
}

// Update the uploadForm state type
interface UploadFormState {
  name: string;
  file: File | null;
  description: string;
}

// Move these helper functions up, before they're used
const getTodayDate = () => new Date().toISOString().split('T')[0];

const generateTransactionReference = () => {
  const prefix = 'TRX';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const projectId = params.id;  // Get projectId from URL params

  // 1. Basic states
  const [activeTab, setActiveTab] = useState('overview');
  
  // 2. Transaction states
  const [transactionForm, setTransactionForm] = useState<TransactionFormState>({
    date: getTodayDate(),
    description: '',
    category: 'Payment',
    amount: '',
    paymentMethod: 'Bank',
    creditCardType: '',
    lastFourDigits: '',
    bankName: '',
    checkNumber: '',
    digitalPaymentUsername: '',
    status: 'completed',
    reference: generateTransactionReference(),
    linkedTaskId: '',
    linkedSubcontractorId: '',
    attachments: []
  });
  const [transactionAttachments, setTransactionAttachments] = useState<File[]>([]);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isViewTransactionModalOpen, setIsViewTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // 3. Transaction functions
  const resetTransactionForm = () => {
    setTransactionForm({
      date: getTodayDate(),
      description: '',
      category: 'Payment',
      amount: '',
      paymentMethod: 'Bank',
      creditCardType: '',
      lastFourDigits: '',
      bankName: '',
      checkNumber: '',
      digitalPaymentUsername: '',
      status: 'completed',
      reference: generateTransactionReference(),
      linkedTaskId: '',
      linkedSubcontractorId: '',
      attachments: []
    });
    setTransactionAttachments([]);
  };

  // 4. Other states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<any>(null);
  const [selectedMainCategory, setSelectedMainCategory] = useState<'owner' | 'construction' | 'contractor' | ''>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [uploadForm, setUploadForm] = useState<UploadFormState>({
    name: '',
    file: null,
    description: '',
  });
  const [taskForm, setTaskForm] = useState({
    category: '',
    contractorName: '',
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    startDate: '',
    duration: '1',
    durationUnit: 'Months',
    contractValue: '',
    estimatedCost: '',
  });
  const [isContractExpanded, setIsContractExpanded] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState<{ [key: string]: boolean }>({
    'foundation': true,
    'plumbing': true,
    'electrical': true,
  });
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'foundation',
      name: 'Foundation Work',
      category: 'Construction',
      status: 'completed',
      progress: 100,
      contractorName: 'John Smith',
      companyName: 'Smith Construction',
      contactEmail: 'john@smith.com',
      contactPhone: '(555) 123-4567',
      startDate: '2024-01-01',
      duration: '2',
      durationUnit: 'Months',
      contractValue: '100000',
      estimatedCost: '80000'
    },
    {
      id: 'plumbing',
      name: 'Plumbing Installation',
      category: 'Plumbing',
      status: 'in-progress',
      progress: 65,
      contractorName: 'Mike Johnson',
      companyName: 'Johnson Plumbing',
      contactEmail: 'mike@johnson.com',
      contactPhone: '(555) 234-5678',
      startDate: '2024-02-01',
      duration: '1',
      durationUnit: 'Months',
      contractValue: '50000',
      estimatedCost: '40000'
    },
    {
      id: 'electrical',
      name: 'Electrical Wiring',
      category: 'Electrical',
      status: 'pending',
      progress: 0,
      contractorName: 'Sarah Wilson',
      companyName: 'Wilson Electric',
      contactEmail: 'sarah@wilson.com',
      contactPhone: '(555) 345-6789',
      startDate: '2024-03-01',
      duration: '1',
      durationUnit: 'Months',
      contractValue: '75000',
      estimatedCost: '60000'
    }
  ]);

  // Change transactions from const to state
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'TRX-001',
      projectId: 'current-project-id',
      date: '2024-02-01',
      description: 'Initial Payment',
      category: 'Payment',
      amount: 500000,
      paymentMethod: 'Bank',
      status: 'completed',
      reference: 'TRX-001',
    },
    {
      id: 'TRX-002',
      projectId: 'current-project-id',
      date: '2024-02-15',
      description: 'Foundation Materials',
      category: 'Materials',
      amount: -75000,
      paymentMethod: 'Credit',
      status: 'completed',
      reference: 'TRX-002',
    },
    {
      id: 'TRX-003',
      projectId: 'current-project-id',
      date: '2024-02-20',
      description: 'Labor Costs',
      category: 'Labor',
      amount: -45000,
      paymentMethod: 'Check',
      status: 'completed',
      reference: 'TRX-003',
    },
    {
      id: 'TRX-004',
      projectId: 'current-project-id',
      date: '2024-03-01',
      description: 'Second Payment',
      category: 'Payment',
      amount: 750000,
      paymentMethod: 'Bank',
      status: 'pending',
      reference: 'TRX-004',
    },
  ]);

  // Update the documents state to use ProjectDocument type
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);

  const documentCategories = {
    owner: [
      'Contract',
      'Change Order',
      'Owner Documents',
      'Payment Records',
    ],
    construction: [
      'Blueprint',
      'Engineering',
      'Structural Observation',
      'Deputy Inspection',
      'Deputy Report',
      'City Permit',
      'Inspection Reports',
      'Survey',
    ],
    contractor: [
      'Subcontractor Contracts',
      'Material Orders',
      'Labor Agreements',
      'Equipment Rentals',
      'Insurance Documents',
    ],
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'financials', label: 'Financials' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'documents', label: 'Documents' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'transactions', label: 'Transactions' },
  ];

  // Add construction categories
  const constructionCategories = [
    'Foundation',
    'Demolition',
    'Plumbing',
    'Electrical',
    'HVAC/AC',
    'Fire Sprinkler',
    'Framing',
    'Drywall',
    'Painting',
    'Flooring',
    'Roofing',
    'Windows & Doors',
    'Concrete',
    'Masonry',
    'Landscaping',
    'Site Work',
    'Carpentry',
    'Tile Work',
    'Insulation',
    'Waterproofing'
  ];

  // Update credit card types to only include credit cards
  const creditCardTypes = [
    'Visa',
    'Mastercard',
    'American Express',
    'Discover'
  ];

  // Add bank list for checks
  const bankList = [
    'Wells Fargo',
    'Chase',
    'Bank of America',
    'Banner Bank',
    'City Bank',
    'US Bank',
    'Other'
  ];

  // Add these state variables at the beginning of ProjectDetailPage component
  const [shareModal, setShareModal] = useState<ShareModalState>({
    isOpen: false,
    documentUrl: '',
    documentName: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm(prev => ({
        ...prev,
        file: e.target.files![0],
        name: e.target.files![0].name,
      }));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.file || !selectedMainCategory || !selectedSubCategory) return;

    try {
      const metadata: UploadMetadata = {
        mainCategory: selectedMainCategory,
        subCategory: selectedSubCategory,
        description: uploadForm.description,
        uploadedBy: 'Current User'
      };

      const newDoc = await uploadProjectDocument(
        params.id,
        uploadForm.file,
        metadata
      );

      setDocuments(prev => [newDoc, ...prev]);
      setIsUploadModalOpen(false);
      resetUploadForm();
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      name: '',
      file: null,
      description: '',
    });
    setSelectedMainCategory('');
    setSelectedSubCategory('');
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new task object
    const newTask: Task = {
      id: Date.now().toString(),
      name: `${taskForm.category} Work`,
      category: taskForm.category,
      status: 'pending',
      progress: 0,
      contractorName: taskForm.contractorName,
      companyName: taskForm.companyName,
      contactEmail: taskForm.contactEmail,
      contactPhone: taskForm.contactPhone,
      startDate: taskForm.startDate,
      duration: taskForm.duration,
      durationUnit: taskForm.durationUnit,
      contractValue: taskForm.contractValue,
      estimatedCost: taskForm.estimatedCost
    };

    // Add new task to tasks array
    setTasks(prevTasks => [...prevTasks, newTask]);
    
    // Close modal and reset form
    setIsAddTaskModalOpen(false);
    resetTaskForm();
  };

  const resetTaskForm = () => {
    setTaskForm({
      category: '',
      contractorName: '',
      companyName: '',
      contactEmail: '',
      contactPhone: '',
      startDate: '',
      duration: '1',
      durationUnit: 'Months',
      contractValue: '',
      estimatedCost: '',
    });
  };

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleAddPayment = (taskId: string, taskName: string) => {
    setIsAddTransactionModalOpen(true);
    setTransactionForm({
      date: getTodayDate(),
      description: `Payment for ${taskName}`,
      category: 'Payment',
      amount: '',
      paymentMethod: 'Bank',
      creditCardType: '',
      lastFourDigits: '',
      bankName: '',
      checkNumber: '',
      digitalPaymentUsername: '',
      status: 'completed',
      reference: generateTransactionReference(),
      linkedTaskId: taskId,
      linkedSubcontractorId: '',
      attachments: []
    });
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsViewTransactionModalOpen(true);
  };

  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setTransactionAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate unique transaction ID
    const transactionId = `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Convert amount to negative if it's an expense (payment)
    const amount = parseFloat(transactionForm.amount);
    const finalAmount = transactionForm.category === 'Payment' ? amount : -amount;
    
    // Get linked task details if available
    let taskDetails: TransactionDetails | undefined;
    if (transactionForm.linkedTaskId) {
      const linkedTask = tasks.find(t => t.id === transactionForm.linkedTaskId);
      if (linkedTask) {
        taskDetails = {
          taskId: linkedTask.id,
          taskName: linkedTask.name,
          contractorName: linkedTask.contractorName,
          companyName: linkedTask.companyName,
          paymentDetails: {}
        };

        // Add payment method specific details
        if (transactionForm.paymentMethod === 'Credit') {
          taskDetails.paymentDetails.creditCard = {
            type: transactionForm.creditCardType,
            lastFour: transactionForm.lastFourDigits
          };
        } else if (transactionForm.paymentMethod === 'Check') {
          taskDetails.paymentDetails.check = {
            bankName: transactionForm.bankName,
            checkNumber: transactionForm.checkNumber
          };
        } else if (['Zelle', 'Venmo'].includes(transactionForm.paymentMethod)) {
          taskDetails.paymentDetails.digital = {
            platform: transactionForm.paymentMethod,
            username: transactionForm.digitalPaymentUsername
          };
        }
      }
    }
    
    // Create new transaction object
    const newTransaction: Transaction = {
      id: transactionId,
      projectId: 'current-project-id', // Replace with actual project ID
      date: transactionForm.date,
      description: transactionForm.description,
      category: transactionForm.category,
      amount: finalAmount,
      paymentMethod: transactionForm.paymentMethod,
      status: transactionForm.status,
      reference: transactionForm.reference,
      details: taskDetails,
      linkedTaskId: transactionForm.linkedTaskId || undefined,
      attachments: transactionAttachments.map((file, index) => ({
        id: `${transactionForm.reference}-${index + 1}`,
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString()
      }))
    };

    // Add new transaction to the list
    setTransactions(prev => [...prev, newTransaction]);
    
    // Update task status if needed
    if (transactionForm.linkedTaskId) {
      updateTaskStatus(transactionForm.linkedTaskId, newTransaction);
    }
    
    // Close modal and reset form
    setIsAddTransactionModalOpen(false);
    resetTransactionForm();
  };

  // Add this helper function to update task status
  const updateTaskStatus = (taskId: string, newTransaction: Transaction) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const taskPayments = [...transactions, newTransaction].filter(t => t.linkedTaskId === task.id);
      const totalPaid = taskPayments.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const paymentProgress = (totalPaid / parseInt(task.contractValue)) * 100;
      
      // Update task status based on payment progress
      if (paymentProgress >= 100 && task.status !== 'completed') {
        setTasks(prev => prev.map(t => 
          t.id === task.id ? { ...t, status: 'completed', progress: 100 } : t
        ));
      } else if (paymentProgress > 0 && task.status === 'pending') {
        setTasks(prev => prev.map(t => 
          t.id === task.id ? { ...t, status: 'in-progress', progress: Math.round(paymentProgress) } : t
        ));
      }
    }
  };

  // Add this new component for viewing attachments
  function AttachmentViewer({ attachment, onClose }: { attachment: any; onClose: () => void }) {
    const isImage = attachment.type.startsWith('image/');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium">{attachment.name}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 max-h-[80vh] overflow-auto">
            {isImage ? (
              <Image 
                src={attachment.url}
                alt={attachment.name}
                width={500}  // adjust based on your needs
                height={300} // adjust based on your needs
                className="w-full h-auto"
              />
            ) : (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="mb-4">View or download this document</p>
                <div className="flex justify-center gap-4">
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </a>
                  <a
                    href={attachment.url}
                    download={attachment.name}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Update the transactions table to show more details
  const renderTransactionDetails = (transaction: Transaction) => {
    if (!transaction.details) return '-';

    const details = [];
    if (transaction.details.taskName) {
      details.push(`Task: ${transaction.details.taskName}`);
    }
    if (transaction.details.contractorName) {
      details.push(`Contractor: ${transaction.details.contractorName}`);
    }
    
    // Add payment method specific details
    const paymentDetails = transaction.details.paymentDetails;
    if (paymentDetails.creditCard) {
      details.push(`${paymentDetails.creditCard.type} ending in ${paymentDetails.creditCard.lastFour}`);
    } else if (paymentDetails.check) {
      details.push(`Check #${paymentDetails.check.checkNumber} from ${paymentDetails.check.bankName}`);
    } else if (paymentDetails.digital) {
      details.push(`${paymentDetails.digital.platform}: ${paymentDetails.digital.username}`);
    }

    return details.join('\n');
  };

  // Add this function to handle document sharing
  const handleShareDocument = (url: string, name: string) => {
    setShareModal({
      isOpen: true,
      documentUrl: url,
      documentName: name
    });
  };

  // Add this component for the Share Modal
  function ShareModal({ isOpen, onClose, documentUrl, documentName }: {
    isOpen: boolean;
    onClose: () => void;
    documentUrl?: string;
    documentName?: string;
  }) {
    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopyLink = async () => {
      try {
        await navigator.clipboard.writeText(documentUrl || '');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    };

    const handleEmailShare = () => {
      const subject = `Shared Document: ${documentName}`;
      const body = `Please find the shared document "${documentName}" at the following link:\n\n${documentUrl}`;
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium">Share Document</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleEmailShare}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                Share via Email
              </button>
              <div className="relative">
                <input
                  type="text"
                  value={documentUrl}
                  readOnly
                  className="w-full pr-20 pl-3 py-2 border rounded-lg bg-gray-50"
                />
                <button
                  onClick={handleCopyLink}
                  className="absolute right-1 top-1 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add this state for document viewer
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Add DocumentViewer component
  function DocumentViewer({ document, onClose }: { document: Document; onClose: () => void }) {
    const isPDF = document.name.toLowerCase().endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(document.name);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 h-[90vh] flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="text-lg font-medium">{document.name}</h3>
              <span className="ml-2 text-sm text-gray-500">({document.size})</span>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-auto bg-gray-50">
            {isPDF ? (
              <object
                data={document.url}
                type="application/pdf"
                className="w-full h-full"
              >
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(document.url)}&embedded=true`}
                  className="w-full h-full"
                  title={document.name}
                />
              </object>
            ) : isImage ? (
              <div className="flex items-center justify-center h-full">
                <Image 
                  src={document.url}
                  alt={document.name}
                  width={500}  // adjust based on your needs
                  height={300} // adjust based on your needs
                  className="w-full h-auto"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Preview not available for this file type</p>
                  <a
                    href={document.url}
                    download={document.name}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </a>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => handleShareDocument(document.url, document.name)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </button>
            <a
              href={document.url}
              download={document.name}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Add this near the top of your component
  useEffect(() => {
    async function loadDocuments() {
      try {
        const docs = await getProjectDocuments(projectId);
        setDocuments(docs);
      } catch (error) {
        console.error('Error loading documents:', error);
      }
    }
    
    if (projectId) {
      loadDocuments();
    }
  }, [projectId]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Project Management</h1>
        <p className="text-gray-600">Manage your construction projects and track progress</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-8 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 px-1 ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } font-medium text-sm`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Details Card - Takes up 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-4">Project Details</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <h3 className="text-lg font-medium">Luxury Villa Construction</h3>
                  <p className="text-gray-600">123 Main Street, Beverly Hills</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Overall Progress</p>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">65%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Start Date</p>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span>Jan 15, 2024</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Expected Completion</p>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span>Dec 31, 2024</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Budget</p>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                    <span>$2,500,000</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Location</p>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span>Beverly Hills, CA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information Card - Takes up 1 column */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-4">Customer Information</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-600">JD</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium">John Doe</h3>
                  <p className="text-gray-600">Property Owner</p>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <span>john.doe@example.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <span>456 Park Avenue, Beverly Hills, CA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions tab content */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Transactions</h2>
            <button
              onClick={() => setIsAddTransactionModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Transaction
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Linked Task</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => {
                  const linkedTask = tasks.find(t => t.id === transaction.linkedTaskId);
                  const hasAttachments = transaction.attachments && transaction.attachments.length > 0;
                  
                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-pre-line text-sm text-gray-500">
                        {renderTransactionDetails(transaction)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.category}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {linkedTask ? (
                          <span className="inline-flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              linkedTask.status === 'completed' ? 'bg-green-400' :
                              linkedTask.status === 'in-progress' ? 'bg-blue-400' :
                              'bg-yellow-400'
                            }`} />
                            {linkedTask.name}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewTransaction(transaction)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {hasAttachments && (
                            <button 
                              onClick={() => {
                                if (transaction.attachments?.[0]) {
                                  setSelectedAttachment(transaction.attachments[0]);
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 relative group"
                            >
                              <FileText className="w-4 h-4" />
                              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                {transaction.attachments?.length}
                              </span>
                              <span className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                                View Documents
                              </span>
                            </button>
                          )}
                          {hasAttachments && (
                            <button 
                              onClick={() => {
                                if (transaction.attachments?.[0]) {
                                  handleShareDocument(transaction.attachments[0].url, transaction.attachments[0].name);
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Share className="w-4 h-4" />
                            </button>
                          )}
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {isAddTransactionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Transaction</h2>
            </div>
            <form onSubmit={handleAddTransaction} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={transactionForm.date}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={transactionForm.category}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Payment">Payment</option>
                    <option value="Materials">Materials</option>
                    <option value="Labor">Labor</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <div className="mt-1 relative rounded-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={transactionForm.amount}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <select
                        value={transactionForm.paymentMethod}
                        onChange={(e) => {
                          setTransactionForm(prev => ({
                            ...prev,
                            paymentMethod: e.target.value,
                            creditCardType: '',
                            lastFourDigits: '',
                            bankName: '',
                            checkNumber: '',
                            digitalPaymentUsername: ''
                          }))
                        }}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="Bank">Bank Transfer</option>
                        <option value="Credit">Credit Card</option>
                        <option value="Check">Check</option>
                        <option value="Cash">Cash</option>
                        <option value="Zelle">Zelle</option>
                        <option value="Venmo">Venmo</option>
                      </select>
                    </div>
                    
                    {/* Credit Card Details */}
                    {transactionForm.paymentMethod === 'Credit' && (
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={transactionForm.creditCardType}
                          onChange={(e) => setTransactionForm(prev => ({ ...prev, creditCardType: e.target.value }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                          required
                        >
                          <option value="">Select Card Type</option>
                          {creditCardTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={transactionForm.lastFourDigits}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setTransactionForm(prev => ({ ...prev, lastFourDigits: value }))
                          }}
                          placeholder="Last 4 digits"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                          required
                          maxLength={4}
                          pattern="\d{4}"
                        />
                      </div>
                    )}

                    {/* Check Details */}
                    {transactionForm.paymentMethod === 'Check' && (
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={transactionForm.bankName}
                          onChange={(e) => setTransactionForm(prev => ({ ...prev, bankName: e.target.value }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                          required
                        >
                          <option value="">Select Bank</option>
                          {bankList.map((bank) => (
                            <option key={bank} value={bank}>{bank}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={transactionForm.checkNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setTransactionForm(prev => ({ ...prev, checkNumber: value }))
                          }}
                          placeholder="Check Number"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                          required
                        />
                      </div>
                    )}

                    {/* Digital Payment Details */}
                    {(transactionForm.paymentMethod === 'Zelle' || transactionForm.paymentMethod === 'Venmo') && (
                      <div>
                        <input
                          type="text"
                          value={transactionForm.digitalPaymentUsername}
                          onChange={(e) => setTransactionForm(prev => ({ ...prev, digitalPaymentUsername: e.target.value }))}
                          placeholder={`${transactionForm.paymentMethod} Username`}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={transactionForm.status}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, status: e.target.value as 'completed' | 'pending' }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reference Number</label>
                  <input
                    type="text"
                    value={transactionForm.reference}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, reference: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="TRX-001"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Link to Task (Optional)</label>
                  <select
                    value={transactionForm.linkedTaskId}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, linkedTaskId: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select a task</option>
                    {tasks.map((task) => (
                      <option key={task.id} value={task.id}>{task.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Link to Subcontractor (Optional)</label>
                  <select
                    value={transactionForm.linkedSubcontractorId}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, linkedSubcontractorId: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select a subcontractor</option>
                    {/* Add subcontractor options here */}
                  </select>
                </div>
              </div>

              {/* Document Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Attachments</label>
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
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          accept="image/*,.pdf"
                          onChange={handleFileAttachment}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  </div>
                </div>
                {transactionAttachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {transactionAttachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTransactionAttachments(prev => prev.filter((_, i) => i !== index));
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

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddTransactionModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Transaction Modal */}
      {isViewTransactionModalOpen && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4"
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Transaction Details</h2>
              <button
                onClick={() => setIsViewTransactionModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Transaction details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="mt-1">{selectedTransaction.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Reference</p>
                  <p className="mt-1">{selectedTransaction.reference}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="mt-1">{selectedTransaction.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="mt-1">{selectedTransaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="mt-1">{selectedTransaction.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedTransaction.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedTransaction.status}
                  </span>
                </div>
              </div>

              {/* Attachments section */}
              {selectedTransaction.attachments && selectedTransaction.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Attachments</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTransaction.attachments.map((attachment: any) => (
                      <div
                        key={attachment.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer"
                        onClick={() => {
                          setSelectedAttachment(attachment);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                            <p className="text-xs text-gray-500">{attachment.size}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Attachment Viewer Modal */}
      {selectedAttachment && (
        <AttachmentViewer
          attachment={selectedAttachment}
          onClose={() => setSelectedAttachment(null)}
        />
      )}

      {/* Other tabs content will be added here */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Budget</h3>
              <p className="text-2xl font-bold text-gray-900">$2,500,000</p>
              <p className="text-sm text-gray-500 mt-1">Project total budget</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Paid</h3>
              <p className="text-2xl font-bold text-gray-900">$1,625,000</p>
              <p className="text-sm text-gray-500 mt-1">65% of total budget</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Outstanding</h3>
              <p className="text-2xl font-bold text-gray-900">$875,000</p>
              <p className="text-sm text-gray-500 mt-1">35% remaining</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Net Profit</h3>
              <p className="text-2xl font-bold text-gray-900">$375,000</p>
              <p className="text-sm text-gray-500 mt-1">15% margin</p>
            </div>
          </div>

          {/* Payment Progress */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Progress</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Overall Payment Progress</span>
                  <span className="text-sm font-medium text-gray-900">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Payment Methods</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm text-gray-600">Bank Transfer</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">$1,000,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                        <span className="text-sm text-gray-600">Credit Card</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">$625,000</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Recent Payments</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm text-gray-600">Foundation Work</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">$250,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-sm text-gray-600">Material Purchase</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">$175,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mortgage Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Mortgage Details</h2>
            
            <div className="grid grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Mortgage Amount</h3>
                <p className="text-2xl font-bold text-gray-900">$1,875,000</p>
                <p className="text-sm text-gray-500 mt-1">75% of total budget</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Interest Rate</h3>
                <p className="text-2xl font-bold text-gray-900">4.5%</p>
                <p className="text-sm text-gray-500 mt-1">Fixed rate</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Monthly Payment</h3>
                <p className="text-2xl font-bold text-gray-900">$9,500</p>
                <p className="text-sm text-gray-500 mt-1">30-year term</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">Project Tasks</h2>
            <button 
              onClick={() => setIsAddTaskModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Task
            </button>
          </div>

          {/* Task List */}
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskCard 
                key={task.id}
                taskId={task.id}
                name={task.name}
                category={task.category}
                status={task.status}
                progress={task.progress}
                tasks={tasks}
                transactions={transactions}
                onAddPayment={(taskId, taskName) => {
                  handleAddPayment(taskId, taskName);
                }}
              />
            ))}
          </div>

          {/* Add Task Modal */}
          {isAddTaskModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-lg w-full max-w-lg flex flex-col max-h-[90vh]"
              >
                {/* Header - Fixed */}
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold">Add New Task!</h2>
                </div>

                {/* Form - Scrollable */}
                <div className="p-6 overflow-y-auto flex-1">
                  <form onSubmit={handleTaskSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category *</label>
                      <select
                        required
                        value={taskForm.category}
                        onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a category</option>
                        {constructionCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contractor Name *</label>
                      <input
                        type="text"
                        required
                        value={taskForm.contractorName}
                        onChange={(e) => setTaskForm({ ...taskForm, contractorName: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Name</label>
                      <input
                        type="text"
                        value={taskForm.companyName}
                        onChange={(e) => setTaskForm({ ...taskForm, companyName: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Email *</label>
                      <input
                        type="email"
                        required
                        value={taskForm.contactEmail}
                        onChange={(e) => setTaskForm({ ...taskForm, contactEmail: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Phone *</label>
                      <input
                        type="tel"
                        required
                        value={taskForm.contactPhone}
                        onChange={(e) => setTaskForm({ ...taskForm, contactPhone: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date *</label>
                      <input
                        type="date"
                        required
                        value={taskForm.startDate}
                        onChange={(e) => setTaskForm({ ...taskForm, startDate: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Duration *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={taskForm.duration}
                          onChange={(e) => setTaskForm({ ...taskForm, duration: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Unit</label>
                        <select
                          value={taskForm.durationUnit}
                          onChange={(e) => setTaskForm({ ...taskForm, durationUnit: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="Days">Days</option>
                          <option value="Weeks">Weeks</option>
                          <option value="Months">Months</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contract Value ($) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={taskForm.contractValue}
                        onChange={(e) => setTaskForm({ ...taskForm, contractValue: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estimated Cost ($) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={taskForm.estimatedCost}
                        onChange={(e) => setTaskForm({ ...taskForm, estimatedCost: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </form>
                </div>

                {/* Action Buttons - Fixed */}
                <div className="p-6 border-t bg-gray-50 rounded-b-lg">
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddTaskModalOpen(false);
                        resetTaskForm();
                      }}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleTaskSubmit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">Project Documents</h2>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Upload Document
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                             focus:ring-blue-500 focus:border-blue-500 w-64"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Size</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Uploaded By</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <File className="w-5 h-5 text-gray-400 mr-3" />
                            <span className="text-sm text-gray-900">{doc.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-500">{doc.category}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-500">{doc.size}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-500">
                            {new Date(doc.uploadedDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-500">{doc.uploadedBy}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <button 
                              onClick={() => setSelectedDocument(doc)}
                              className="text-gray-400 hover:text-gray-600"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleShareDocument(doc.url, doc.name)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Share"
                            >
                              <Share className="w-4 h-4" />
                            </button>
                            <button 
                              className="text-gray-400 hover:text-gray-600"
                              title="More Options"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Upload Modal */}
          {isUploadModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Upload Document</h3>
                  <button
                    onClick={() => {
                      setIsUploadModalOpen(false);
                      resetUploadForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleUploadSubmit} className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Document File</label>
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
                            <span>Upload a file</span>
                            <input
                              type="file"
                              className="sr-only"
                              onChange={handleFileChange}
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, JPEG, PNG up to 10MB</p>
                      </div>
                    </div>
                    {uploadForm.file && (
                      <p className="mt-2 text-sm text-gray-600">Selected file: {uploadForm.file.name}</p>
                    )}
                  </div>

                  {/* Main Category Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Main Category</label>
                    <select
                      value={selectedMainCategory}
                      onChange={(e) => {
                        setSelectedMainCategory(e.target.value as 'owner' | 'construction' | 'contractor');
                        setSelectedSubCategory('');
                      }}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="owner">Owner Documents</option>
                      <option value="construction">Construction Documents</option>
                      <option value="contractor">Contractor Documents</option>
                    </select>
                  </div>

                  {/* Sub Category Selection */}
                  {selectedMainCategory && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category</label>
                      <select
                        value={selectedSubCategory}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                        required
                      >
                        <option value="">Select a sub-category</option>
                        {documentCategories[selectedMainCategory].map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter document description"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUploadModalOpen(false);
                        resetUploadForm();
                      }}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      disabled={!uploadForm.file || !selectedMainCategory || !selectedSubCategory}
                    >
                      Upload Document
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'timeline' && (
        <div>Timeline content</div>
      )}

      {/* Add the ShareModal component to the JSX */}
      {shareModal.isOpen && (
        <ShareModal
          isOpen={shareModal.isOpen}
          onClose={() => setShareModal({ isOpen: false })}
          documentUrl={shareModal.documentUrl}
          documentName={shareModal.documentName}
        />
      )}

      {/* Add the DocumentViewer to the JSX */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
}

function PaymentHistoryItem({ amount, paidTo, date, method }: {
  amount: number;
  paidTo: string;
  date: string;
  method: string;
}) {
  return (
    <div className="flex justify-between items-center p-4 border rounded-lg">
      <div>
        <p className="text-lg font-medium">${amount.toLocaleString()}</p>
        <p className="text-sm text-gray-600">Paid to: {paidTo}</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600">{date}</p>
        <p className="text-sm text-gray-600">{method}</p>
      </div>
    </div>
  );
}

function TaskCard({ 
  taskId, 
  name, 
  category, 
  status, 
  progress, 
  tasks,
  transactions,
  onAddPayment
}: {
  taskId: string;
  name: string;
  category: string;
  status: 'completed' | 'in-progress' | 'pending';
  progress: number;
  tasks: Task[];
  transactions: Transaction[];
  onAddPayment: (taskId: string, taskName: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Find the task data
  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;

  // Calculate payment totals
  const taskPayments = transactions.filter(t => t.linkedTaskId === taskId);
  const totalPaid = taskPayments.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const contractValue = parseInt(task.contractValue);
  const remainingBalance = contractValue - totalPaid;
  const paymentProgress = (totalPaid / contractValue) * 100;

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <div>
            <h3 className="text-lg font-medium">{name}</h3>
            <p className="text-sm text-gray-600">{task.contractorName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-blue-600 hover:text-blue-700">
            <Mail className="w-5 h-5" />
          </button>
          <button className="text-blue-600 hover:text-blue-700">
            <Phone className="w-5 h-5" />
          </button>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            status === 'completed' ? 'bg-green-100 text-green-800' :
            status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {status}
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-4 pt-2">
          {/* Contract Values */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Contract Value</p>
              <p className="text-lg font-medium">${contractValue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-lg font-medium text-green-600">${totalPaid.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Remaining Balance</p>
              <p className="text-lg font-medium text-blue-600">${remainingBalance.toLocaleString()}</p>
            </div>
          </div>

          {/* Payment Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Payment Progress</span>
              <span>{paymentProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${paymentProgress}%` }}
              />
            </div>
          </div>

          {/* Payment History */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Payment History</h4>
              <span className="text-xs text-gray-500">{taskPayments.length} payments</span>
            </div>
            {taskPayments.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {taskPayments.map((payment, index) => (
                  <div key={payment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm">
                    <div>
                      <span className="font-medium">${Math.abs(payment.amount).toLocaleString()}</span>
                      <span className="text-gray-600 ml-2">via {payment.paymentMethod}</span>
                    </div>
                    <div className="text-gray-600 text-right">
                      <div>{new Date(payment.date).toLocaleDateString()}</div>
                      <div className="text-xs">{payment.reference}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">
                No payments recorded yet
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onAddPayment(taskId, name)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
            >
              <DollarSign className="w-4 h-4" />
              Add Payment
            </button>
            <button
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              <Plus className="w-4 h-4" />
              Change Order
            </button>
            <button
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              <FileText className="w-4 h-4" />
              Documents
            </button>
            <button
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              <Edit className="w-4 h-4" />
              Edit Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 