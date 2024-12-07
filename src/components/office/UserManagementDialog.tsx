import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useUsers } from '@/lib/hooks/useUsers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Trash2, Shield } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';
import { deleteUser } from '@/lib/services/userService';

interface UserManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserManagementDialog({ open, onOpenChange }: UserManagementDialogProps) {
  const { users, loading } = useUsers();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { toast } = useToast();
  const [gridApi, setGridApi] = useState(null);

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete);
      toast({
        title: "User deleted",
        description: "The user has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedUsers.map(userId => deleteUser(userId)));
      
      toast({
        title: "Users deleted",
        description: `Successfully deleted ${selectedUsers.length} users.`,
      });
      
      if (gridApi) {
        gridApi.deselectAll();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const onGridReady = (params: any) => {
    setGridApi(params.api);
  };

  const onSelectionChanged = () => {
    if (gridApi) {
      const selectedRows = gridApi.getSelectedRows();
      setSelectedUsers(selectedRows.map(row => row.id));
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return '';
    return name.split(' ')
      .map(n => n[0])
      .filter(Boolean)
      .join('')
      .toUpperCase();
  };

  const columnDefs = [
    {
      headerName: '',
      field: 'selection',
      width: 50,
      headerCheckboxSelection: true,
      checkboxSelection: true,
      showDisabledCheckboxes: true,
      checkboxSelectable: (params: any) => !params.data.isAdmin,
    },
    {
      headerName: '',
      field: 'avatar',
      width: 60,
      cellRenderer: (params: any) => (
        <Avatar className="h-8 w-8">
          <AvatarImage src={params.data.avatar} alt={params.data.name || ''} />
          <AvatarFallback>
            {getInitials(params.data.name)}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      headerName: '',
      field: 'isAdmin',
      width: 40,
      cellRenderer: (params: any) => (
        params.value ? (
          <div className="flex justify-center">
            <Shield className="h-4 w-4 text-primary" title="Admin User" />
          </div>
        ) : null
      ),
    },
    {
      headerName: 'Name',
      field: 'name',
      flex: 1,
      filter: true,
      sortable: true,
      valueGetter: (params: any) => params.data.name || 'Unnamed User',
    },
    {
      headerName: 'Email',
      field: 'email',
      flex: 1,
      filter: true,
      valueGetter: (params: any) => params.data.email || '',
    },
    {
      headerName: 'Role',
      field: 'role',
      width: 150,
      filter: true,
      valueGetter: (params: any) => params.data.role || '',
    },
    {
      headerName: 'Department',
      field: 'department',
      width: 150,
      filter: true,
      valueGetter: (params: any) => params.data.department || '',
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 120,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${
            params.value === 'online' ? 'bg-green-500' :
            params.value === 'busy' ? 'bg-red-500' :
            params.value === 'away' ? 'bg-yellow-500' :
            'bg-gray-500'
          }`} />
          <span className="capitalize">{params.value || 'offline'}</span>
        </div>
      ),
    },
    {
      headerName: 'Last Active',
      field: 'lastActive',
      width: 160,
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        return format(params.value.toDate(), 'MMM d, yyyy HH:mm');
      },
    },
    {
      headerName: 'Actions',
      field: 'id',
      width: 100,
      cellRenderer: (params: any) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive/90"
          onClick={() => handleDeleteClick(params.value)}
          disabled={params.data.isAdmin}
          title={params.data.isAdmin ? "Admin users cannot be deleted" : "Delete user"}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const defaultColDef = {
    resizable: true,
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-5xl"
          aria-describedby="user-management-description"
        >
          <DialogHeader>
            <DialogTitle>Manage Users</DialogTitle>
            <p id="user-management-description" className="sr-only">
              Interface to manage office users and their permissions
            </p>
          </DialogHeader>
          
          <div className="h-[600px] w-full ag-theme-alpine-dark">
            <AgGridReact
              rowData={users}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
              rowSelection="multiple"
              suppressRowClickSelection={true}
              pagination={true}
              paginationPageSize={10}
              onGridReady={onGridReady}
              onSelectionChanged={onSelectionChanged}
            />
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-muted-foreground">
                {selectedUsers.length} user{selectedUsers.length === 1 ? '' : 's'} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteDialogOpen(true)}
              >
                Delete Selected
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Single User Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Users</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete {selectedUsers.length} users. This action cannot be undone.
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedUsers.length} Users
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}