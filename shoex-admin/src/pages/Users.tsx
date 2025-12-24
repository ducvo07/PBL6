import React, { useState, useEffect, useMemo } from 'react'
import '../styles/inputStyles.css'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Alert,
} from '@mui/material'
import { Search as SearchIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material'
import { useQuery, useMutation, useLazyQuery, gql } from '@apollo/client'
import type { User } from '../contexts/AuthContext'

interface UserWithDate extends User {
  dateJoined: string
}

const GET_USERS = gql`
  query GetUsers($search: String) {
    users(search: $search) {
      id
      username
      email
      fullName
      role
      isActive
      dateJoined
    }
  }
`

const CREATE_USER = gql`
  mutation CreateUser($input: UserCreateInput!) {
    userCreate(input: $input) {
      success
      user {
        id
        username
        email
        fullName
        role
        isActive
        dateJoined
      }
      errors
    }
  }
`

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UserUpdateInput!) {
    userUpdate(id: $id, input: $input) {
      success
      user {
        id
        username
        email
        fullName
        role
        isActive
        dateJoined
      }
      errors
    }
  }
`

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const queryVariables = useMemo(() => ({
    search: debouncedSearchTerm.trim() ? debouncedSearchTerm.trim() : null
  }), [debouncedSearchTerm])

  const { loading, error, data } = useQuery(GET_USERS, {
    variables: queryVariables,
    onCompleted: (data) => {
      console.log('Query completed with search:', debouncedSearchTerm, 'Results:', data?.users?.length || 0)
    }
  })
  const [createUser] = useMutation(CREATE_USER)
  const [updateUser] = useMutation(UPDATE_USER)

  // Modal state
  const [openModal, setOpenModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'buyer',
    isActive: true,
  })
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [submitLoading, setSubmitLoading] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      console.log('Search term updated:', searchTerm)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleOpenModal = () => {
    setOpenModal(true)
    setFormErrors([])
    setIsEditMode(false)
    setEditingUserId(null)
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      phone: '',
      role: 'buyer',
      isActive: true,
    })
  }

  const handleEditUser = (user: UserWithDate) => {
    setIsEditMode(true)
    setEditingUserId(user.id)
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Don't populate password for security
      fullName: user.fullName || '',
      phone: '', // Assuming phone not in user data
      role: user.role,
      isActive: user.isActive,
    })
    setFormErrors([])
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setFormErrors([])
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    setSubmitLoading(true)
    setFormErrors([])

    try {
      let result
      if (isEditMode && editingUserId) {
        result = await updateUser({
          variables: {
            id: editingUserId,
            input: {
              username: formData.username,
              email: formData.email,
              fullName: formData.fullName,
              role: formData.role,
              isActive: formData.isActive,
              // Password only if provided
              ...(formData.password && { password: formData.password })
            }
          }
        })
        if (result.data?.userUpdate?.success) {
          setOpenModal(false)
          refetch()
        } else {
          setFormErrors(result.data?.userUpdate?.errors || ['Unknown error occurred'])
        }
      } else {
        result = await createUser({
          variables: {
            input: formData
          }
        })
        if (result.data?.userCreate?.success) {
          setOpenModal(false)
          refetch()
        } else {
          setFormErrors(result.data?.userCreate?.errors || ['Unknown error occurred'])
        }
      }
    } catch (err: any) {
      setFormErrors([err.message || 'Failed to save user'])
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) return <Typography>Loading...</Typography>
  if (error) return <Typography>Error: {error.message}</Typography>

  const users = data?.users || []

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'error'
      case 'seller':
        return 'primary'
      case 'buyer':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <Box className="custom-mui">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Users Management</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<PersonAddIcon />}
          onClick={handleOpenModal}
        >
          Add User
        </Button>
      </Box>

      <Box mb={3}>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => {
            console.log('onChange fired:', e.target.value)
            setSearchTerm(e.target.value)
          }}
          className="custom-input"
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user: UserWithDate) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={getRoleColor(user.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? 'Active' : 'Inactive'}
                    color={user.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(user.dateJoined).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => handleEditUser(user)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add User Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            label="Username"
            fullWidth
            variant="outlined"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            required
          />

          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />

          {!isEditMode && (
            <TextField
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required={!isEditMode}
            />
          )}

          <TextField
            margin="dense"
            label="Full Name"
            fullWidth
            variant="outlined"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
          />

          <TextField
            margin="dense"
            label="Phone"
            fullWidth
            variant="outlined"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />

          <TextField
            margin="dense"
            label="Role"
            select
            fullWidth
            variant="outlined"
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
          >
            <MenuItem value="buyer">Buyer</MenuItem>
            <MenuItem value="seller">Seller</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>

          <TextField
            margin="dense"
            label="Status"
            select
            fullWidth
            variant="outlined"
            value={formData.isActive ? 'true' : 'false'}
            onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
          >
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} disabled={submitLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={submitLoading}
          >
            {submitLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update User' : 'Create User')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Users
