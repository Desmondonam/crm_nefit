export const COURSES = [
  { id: 1, name: 'Web Development', color: '#6366f1', icon: '💻', duration: '6 months', instructor: 'Sarah Kamau', fee: 45000 },
  { id: 2, name: 'Data Science', color: '#0ea5e9', icon: '📊', duration: '8 months', instructor: 'James Omondi', fee: 55000 },
  { id: 3, name: 'Cybersecurity', color: '#ef4444', icon: '🔐', duration: '5 months', instructor: 'Paul Mutua', fee: 50000 },
  { id: 4, name: 'Cloud Computing', color: '#f59e0b', icon: '☁️', duration: '6 months', instructor: 'Grace Wanjiku', fee: 60000 },
  { id: 5, name: 'UI/UX Design', color: '#10b981', icon: '🎨', duration: '4 months', instructor: 'Linda Achieng', fee: 40000 },
  { id: 6, name: 'Mobile Development', color: '#8b5cf6', icon: '📱', duration: '7 months', instructor: 'Kevin Njoroge', fee: 50000 },
];

export const STATUSES = ['Active', 'Inactive', 'Completed', 'On Hold'];

export const STUDENTS = [
  { id: 1,  name: 'Alice Mwangi',    email: 'alice.mwangi@gmail.com',    phone: '+254 712 001 001', age: 22, gender: 'Female', location: 'Nairobi',   course: 'Web Development',   enrollmentDate: '2024-01-10', status: 'Active',    progress: 78 },
  { id: 2,  name: 'Brian Otieno',    email: 'brian.otieno@gmail.com',    phone: '+254 722 002 002', age: 25, gender: 'Male',   location: 'Mombasa',   course: 'Data Science',      enrollmentDate: '2024-02-05', status: 'Active',    progress: 55 },
  { id: 3,  name: 'Carol Njeri',     email: 'carol.njeri@gmail.com',     phone: '+254 733 003 003', age: 19, gender: 'Female', location: 'Kisumu',    course: 'UI/UX Design',      enrollmentDate: '2024-01-20', status: 'Active',    progress: 90 },
  { id: 4,  name: 'David Kamau',     email: 'david.kamau@gmail.com',     phone: '+254 745 004 004', age: 30, gender: 'Male',   location: 'Nakuru',    course: 'Cybersecurity',     enrollmentDate: '2024-03-01', status: 'Active',    progress: 42 },
  { id: 5,  name: 'Eva Adhiambo',    email: 'eva.adhiambo@gmail.com',    phone: '+254 756 005 005', age: 27, gender: 'Female', location: 'Nairobi',   course: 'Cloud Computing',   enrollmentDate: '2024-02-15', status: 'Inactive',  progress: 30 },
  { id: 6,  name: 'Francis Mutua',   email: 'francis.mutua@gmail.com',   phone: '+254 768 006 006', age: 23, gender: 'Male',   location: 'Eldoret',   course: 'Mobile Development',enrollmentDate: '2024-01-25', status: 'Active',    progress: 65 },
  { id: 7,  name: 'Grace Wairimu',   email: 'grace.wairimu@gmail.com',   phone: '+254 779 007 007', age: 21, gender: 'Female', location: 'Thika',     course: 'Web Development',   enrollmentDate: '2024-03-10', status: 'Active',    progress: 50 },
  { id: 8,  name: 'Henry Odhiambo',  email: 'henry.odhiambo@gmail.com',  phone: '+254 700 008 008', age: 28, gender: 'Male',   location: 'Nairobi',   course: 'Data Science',      enrollmentDate: '2023-11-05', status: 'Completed', progress: 100 },
  { id: 9,  name: 'Irene Chebet',    email: 'irene.chebet@gmail.com',    phone: '+254 711 009 009', age: 24, gender: 'Female', location: 'Kericho',   course: 'UI/UX Design',      enrollmentDate: '2024-04-01', status: 'Active',    progress: 20 },
  { id: 10, name: 'James Nganga',    email: 'james.nganga@gmail.com',    phone: '+254 723 010 010', age: 32, gender: 'Male',   location: 'Nairobi',   course: 'Cybersecurity',     enrollmentDate: '2023-10-20', status: 'Completed', progress: 100 },
  { id: 11, name: 'Karen Wambui',    email: 'karen.wambui@gmail.com',    phone: '+254 734 011 011', age: 20, gender: 'Female', location: 'Nairobi',   course: 'Web Development',   enrollmentDate: '2024-04-15', status: 'Active',    progress: 15 },
  { id: 12, name: 'Liam Kipchoge',   email: 'liam.kipchoge@gmail.com',   phone: '+254 746 012 012', age: 26, gender: 'Male',   location: 'Eldoret',   course: 'Cloud Computing',   enrollmentDate: '2024-02-28', status: 'On Hold',   progress: 45 },
  { id: 13, name: 'Mary Auma',       email: 'mary.auma@gmail.com',       phone: '+254 757 013 013', age: 23, gender: 'Female', location: 'Kisumu',    course: 'Mobile Development',enrollmentDate: '2024-03-20', status: 'Active',    progress: 60 },
  { id: 14, name: 'Nelson Mwenda',   email: 'nelson.mwenda@gmail.com',   phone: '+254 769 014 014', age: 29, gender: 'Male',   location: 'Meru',      course: 'Data Science',      enrollmentDate: '2024-01-08', status: 'Active',    progress: 80 },
  { id: 15, name: 'Olivia Nduta',    email: 'olivia.nduta@gmail.com',    phone: '+254 701 015 015', age: 22, gender: 'Female', location: 'Nairobi',   course: 'UI/UX Design',      enrollmentDate: '2024-05-01', status: 'Active',    progress: 10 },
  { id: 16, name: 'Patrick Ochieng', email: 'patrick.ochieng@gmail.com', phone: '+254 712 016 016', age: 35, gender: 'Male',   location: 'Homa Bay',  course: 'Cybersecurity',     enrollmentDate: '2023-12-10', status: 'Completed', progress: 100 },
  { id: 17, name: 'Quinn Muriuki',   email: 'quinn.muriuki@gmail.com',   phone: '+254 724 017 017', age: 24, gender: 'Male',   location: 'Nairobi',   course: 'Cloud Computing',   enrollmentDate: '2024-04-10', status: 'Active',    progress: 35 },
  { id: 18, name: 'Rose Nyambura',   email: 'rose.nyambura@gmail.com',   phone: '+254 735 018 018', age: 20, gender: 'Female', location: 'Nyeri',     course: 'Web Development',   enrollmentDate: '2024-05-15', status: 'Inactive',  progress: 5  },
  { id: 19, name: 'Samuel Waweru',   email: 'samuel.waweru@gmail.com',   phone: '+254 747 019 019', age: 27, gender: 'Male',   location: 'Nairobi',   course: 'Mobile Development',enrollmentDate: '2024-02-01', status: 'Active',    progress: 72 },
  { id: 20, name: 'Tina Moraa',      email: 'tina.moraa@gmail.com',      phone: '+254 758 020 020', age: 21, gender: 'Female', location: 'Kisii',     course: 'Data Science',      enrollmentDate: '2024-03-05', status: 'On Hold',   progress: 25 },
  { id: 21, name: 'Victor Kariuki',  email: 'victor.kariuki@gmail.com',  phone: '+254 770 021 021', age: 31, gender: 'Male',   location: 'Nairobi',   course: 'Web Development',   enrollmentDate: '2023-09-15', status: 'Completed', progress: 100 },
  { id: 22, name: 'Winnie Akinyi',   email: 'winnie.akinyi@gmail.com',   phone: '+254 702 022 022', age: 23, gender: 'Female', location: 'Nairobi',   course: 'UI/UX Design',      enrollmentDate: '2024-04-20', status: 'Active',    progress: 48 },
  { id: 23, name: 'Xavier Njau',     email: 'xavier.njau@gmail.com',     phone: '+254 713 023 023', age: 26, gender: 'Male',   location: 'Machakos',  course: 'Cybersecurity',     enrollmentDate: '2024-05-10', status: 'Active',    progress: 22 },
  { id: 24, name: 'Yvonne Kerubo',   email: 'yvonne.kerubo@gmail.com',   phone: '+254 725 024 024', age: 19, gender: 'Female', location: 'Nairobi',   course: 'Cloud Computing',   enrollmentDate: '2024-05-20', status: 'Active',    progress: 12 },
];

export const MONTHLY_ENROLLMENTS = [
  { month: 'Sep 23', enrollments: 3 },
  { month: 'Oct 23', enrollments: 5 },
  { month: 'Nov 23', enrollments: 4 },
  { month: 'Dec 23', enrollments: 2 },
  { month: 'Jan 24', enrollments: 6 },
  { month: 'Feb 24', enrollments: 7 },
  { month: 'Mar 24', enrollments: 5 },
  { month: 'Apr 24', enrollments: 8 },
  { month: 'May 24', enrollments: 5 },
];

export function getCourseColor(courseName) {
  const course = COURSES.find(c => c.name === courseName);
  return course ? course.color : '#6366f1';
}

export function getStatusColor(status) {
  switch (status) {
    case 'Active':    return { bg: '#dcfce7', text: '#16a34a' };
    case 'Inactive':  return { bg: '#f1f5f9', text: '#64748b' };
    case 'Completed': return { bg: '#dbeafe', text: '#2563eb' };
    case 'On Hold':   return { bg: '#fef9c3', text: '#ca8a04' };
    default:          return { bg: '#f1f5f9', text: '#64748b' };
  }
}

export function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
