// QAR — Qatari Riyal
export const QAR = (n) =>
  `QAR ${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// Course fees per programme (in QAR)
export const COURSE_FEES = {
  'Web Development':    4500,
  'Data Science':       5500,
  'Cybersecurity':      5000,
  'Cloud Computing':    6000,
  'UI/UX Design':       4000,
  'Mobile Development': 5000,
};

// Payment records — one per student (studentId matches STUDENTS in mockData.js)
export const STUDENT_PAYMENTS = [
  { studentId: 1,  status: 'Paid',    amountPaid: 4500, paymentDate: '2024-01-15', method: 'Bank Transfer' },
  { studentId: 2,  status: 'Partial', amountPaid: 2750, paymentDate: '2024-02-20', method: 'Cash'          },
  { studentId: 3,  status: 'Paid',    amountPaid: 4000, paymentDate: '2024-01-22', method: 'Bank Transfer' },
  { studentId: 4,  status: 'Partial', amountPaid: 2500, paymentDate: '2024-03-10', method: 'Cash'          },
  { studentId: 5,  status: 'Unpaid',  amountPaid: 0,    paymentDate: null,         method: null            },
  { studentId: 6,  status: 'Paid',    amountPaid: 5000, paymentDate: '2024-01-30', method: 'Bank Transfer' },
  { studentId: 7,  status: 'Partial', amountPaid: 2250, paymentDate: '2024-03-15', method: 'Cash'          },
  { studentId: 8,  status: 'Paid',    amountPaid: 5500, paymentDate: '2023-11-10', method: 'Bank Transfer' },
  { studentId: 9,  status: 'Unpaid',  amountPaid: 0,    paymentDate: null,         method: null            },
  { studentId: 10, status: 'Paid',    amountPaid: 5000, paymentDate: '2023-10-25', method: 'Bank Transfer' },
  { studentId: 11, status: 'Unpaid',  amountPaid: 0,    paymentDate: null,         method: null            },
  { studentId: 12, status: 'Partial', amountPaid: 3000, paymentDate: '2024-03-05', method: 'Cash'          },
  { studentId: 13, status: 'Paid',    amountPaid: 5000, paymentDate: '2024-03-25', method: 'Bank Transfer' },
  { studentId: 14, status: 'Paid',    amountPaid: 5500, paymentDate: '2024-01-12', method: 'Bank Transfer' },
  { studentId: 15, status: 'Unpaid',  amountPaid: 0,    paymentDate: null,         method: null            },
  { studentId: 16, status: 'Paid',    amountPaid: 5000, paymentDate: '2023-12-15', method: 'Bank Transfer' },
  { studentId: 17, status: 'Partial', amountPaid: 3000, paymentDate: '2024-04-15', method: 'Cash'          },
  { studentId: 18, status: 'Unpaid',  amountPaid: 0,    paymentDate: null,         method: null            },
  { studentId: 19, status: 'Paid',    amountPaid: 5000, paymentDate: '2024-02-05', method: 'Bank Transfer' },
  { studentId: 20, status: 'Partial', amountPaid: 2750, paymentDate: '2024-03-10', method: 'Cash'          },
  { studentId: 21, status: 'Paid',    amountPaid: 4500, paymentDate: '2023-09-20', method: 'Bank Transfer' },
  { studentId: 22, status: 'Paid',    amountPaid: 4000, paymentDate: '2024-04-25', method: 'Bank Transfer' },
  { studentId: 23, status: 'Partial', amountPaid: 2500, paymentDate: '2024-05-15', method: 'Cash'          },
  { studentId: 24, status: 'Unpaid',  amountPaid: 0,    paymentDate: null,         method: null            },
];

export const EXPENSE_CATEGORIES = [
  'Salaries', 'Rent', 'Utilities', 'Software', 'Marketing', 'Equipment', 'Miscellaneous'
];

export const INITIAL_EXPENSES = [
  { id: 1,  category: 'Salaries',       description: 'Lead Instructor — Sarah Kamau',   amount: 10000, date: '2024-05-01', recurring: true  },
  { id: 2,  category: 'Salaries',       description: 'Instructor — James Omondi',        amount: 9000,  date: '2024-05-01', recurring: true  },
  { id: 3,  category: 'Salaries',       description: 'Admin Assistant',                  amount: 6000,  date: '2024-05-01', recurring: true  },
  { id: 4,  category: 'Rent',           description: 'Office Space — Al Waab, Doha',     amount: 15000, date: '2024-05-01', recurring: true  },
  { id: 5,  category: 'Utilities',      description: 'Electricity & Water — May 2024',   amount: 1800,  date: '2024-05-05', recurring: true  },
  { id: 6,  category: 'Software',       description: 'Adobe Creative Cloud',              amount: 450,   date: '2024-05-01', recurring: true  },
  { id: 7,  category: 'Software',       description: 'GitHub Teams',                     amount: 280,   date: '2024-05-01', recurring: true  },
  { id: 8,  category: 'Marketing',      description: 'Social Media Ads — May 2024',      amount: 2500,  date: '2024-05-10', recurring: false },
  { id: 9,  category: 'Equipment',      description: 'Replacement Keyboard & Mouse (x3)',amount: 650,   date: '2024-05-08', recurring: false },
  { id: 10, category: 'Salaries',       description: 'Lead Instructor — Sarah Kamau',   amount: 10000, date: '2024-04-01', recurring: true  },
  { id: 11, category: 'Salaries',       description: 'Instructor — James Omondi',        amount: 9000,  date: '2024-04-01', recurring: true  },
  { id: 12, category: 'Salaries',       description: 'Admin Assistant',                  amount: 6000,  date: '2024-04-01', recurring: true  },
  { id: 13, category: 'Rent',           description: 'Office Space — Al Waab, Doha',     amount: 15000, date: '2024-04-01', recurring: true  },
  { id: 14, category: 'Utilities',      description: 'Electricity & Water — Apr 2024',   amount: 1650,  date: '2024-04-05', recurring: true  },
  { id: 15, category: 'Software',       description: 'Zoom Business Plan',               amount: 620,   date: '2024-04-01', recurring: true  },
  { id: 16, category: 'Marketing',      description: 'Flyer Printing & Distribution',    amount: 1200,  date: '2024-04-15', recurring: false },
  { id: 17, category: 'Miscellaneous',  description: 'Office Supplies — Apr 2024',       amount: 380,   date: '2024-04-20', recurring: false },
  { id: 18, category: 'Salaries',       description: 'Lead Instructor — Sarah Kamau',   amount: 10000, date: '2024-03-01', recurring: true  },
  { id: 19, category: 'Salaries',       description: 'Instructor — James Omondi',        amount: 9000,  date: '2024-03-01', recurring: true  },
  { id: 20, category: 'Salaries',       description: 'Admin Assistant',                  amount: 6000,  date: '2024-03-01', recurring: true  },
  { id: 21, category: 'Rent',           description: 'Office Space — Al Waab, Doha',     amount: 15000, date: '2024-03-01', recurring: true  },
  { id: 22, category: 'Utilities',      description: 'Electricity & Water — Mar 2024',   amount: 1700,  date: '2024-03-05', recurring: true  },
  { id: 23, category: 'Equipment',      description: 'Projector for Training Room',      amount: 3200,  date: '2024-03-18', recurring: false },
  { id: 24, category: 'Marketing',      description: 'Google Ads Campaign — Mar 2024',   amount: 2000,  date: '2024-03-12', recurring: false },
];

// Monthly totals for the revenue vs expenses chart
export const MONTHLY_FINANCE = [
  { month: 'Sep 23', income: 18000, expenses: 36800 },
  { month: 'Oct 23', income: 27500, expenses: 37500 },
  { month: 'Nov 23', income: 22000, expenses: 38200 },
  { month: 'Dec 23', income: 10500, expenses: 35000 },
  { month: 'Jan 24', income: 33500, expenses: 41200 },
  { month: 'Feb 24', income: 41000, expenses: 42000 },
  { month: 'Mar 24', income: 28500, expenses: 47900 },
  { month: 'Apr 24', income: 19000, expenses: 43850 },
  { month: 'May 24', income: 15000, expenses: 45680 },
];

export const PAYMENT_STATUS_COLORS = {
  Paid:    { bg: '#dcfce7', text: '#16a34a' },
  Partial: { bg: '#fef9c3', text: '#ca8a04' },
  Unpaid:  { bg: '#fee2e2', text: '#dc2626' },
};

export const EXPENSE_CATEGORY_COLORS = {
  Salaries:      '#6366f1',
  Rent:          '#0ea5e9',
  Utilities:     '#f59e0b',
  Software:      '#8b5cf6',
  Marketing:     '#10b981',
  Equipment:     '#ef4444',
  Miscellaneous: '#94a3b8',
};
