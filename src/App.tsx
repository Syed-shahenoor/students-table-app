import { useState, useMemo } from 'react';
import { Download, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { StudentTable } from './components/StudentTable';
import { StudentModal } from './components/StudentModal';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { delay } from './lib/utils';

export interface Student {
  id: string;
  name: string;
  email: string;
  age: number;
}

// Initial dummy data
const initialStudents: Student[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', age: 20 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 22 },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', age: 19 },
];

function App() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Delete dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleOpenDeleteDialog = (id: string) => {
    setStudentToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (studentData: Omit<Student, 'id'>, isEdit: boolean) => {
    // Simulate loading
    await delay(800);
    
    if (isEdit && editingStudent) {
      setStudents(students.map((s) => (s.id === editingStudent.id ? { ...s, ...studentData } : s)));
    } else {
      const newStudent: Student = {
        ...studentData,
        id: crypto.randomUUID(),
      };
      setStudents([newStudent, ...students]);
    }
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    // Simulate loading
    await delay(800);
    setStudents(students.filter((s) => s.id !== studentToDelete));
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  const handleExportExcel = async () => {
    setIsTableLoading(true);
    await delay(500); // Simulate processing time
    
    // Prepare data for export
    const exportData = filteredStudents.map(({ name, email, age }) => ({
      FullName: name,
      EmailAddress: email,
      Age: age
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    
    // Generate buffer and trigger download
    XLSX.writeFile(workbook, "Students_List.xlsx");
    setIsTableLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Students Directory</h1>
            <p className="mt-1 text-sm text-gray-500">Manage student information and export records.</p>
          </div>
          
          <div className="flex w-full sm:w-auto gap-3">
            <button
              onClick={handleExportExcel}
              disabled={students.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleOpenAddModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-indigo-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </button>
          </div>
        </div>

        {/* Filters/Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-md px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm outline-none transition-all"
          />
        </div>

        {/* Table Component */}
        <StudentTable
          students={filteredStudents}
          isLoading={isTableLoading}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteDialog}
        />

        {/* Modals */}
        <StudentModal
          isOpen={isModalOpen}
          initialData={editingStudent}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />

        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          title="Delete Student"
          message="Are you sure you want to delete this student? This action cannot be undone."
          isConfirming={isDeleting}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
}

export default App;
