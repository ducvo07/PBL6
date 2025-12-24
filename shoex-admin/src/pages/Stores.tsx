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
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'
import { useQuery, useMutation, useLazyQuery, gql } from '@apollo/client'
import { STORE_CREATE, STORE_UPDATE } from '../graphql/mutations'

interface Store {
  storeId: string
  name: string
  email?: string
  phone?: string
  location?: string
  isActive: boolean
  status: string
  createdAt: string
}

const GET_STORES = gql`
  query GetStores($search: String) {
    stores(search: $search) {
      storeId
      name
      email
      phone
      location
      isActive
      status
      createdAt
    }
  }
`

const Stores: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const queryVariables = useMemo(() => ({ search: debouncedSearchTerm.trim() ? debouncedSearchTerm.trim() : null }), [debouncedSearchTerm])

  const [getStores, { loading: queryLoading, error, data }] = useLazyQuery(GET_STORES)
  const [createStore] = useMutation(STORE_CREATE)
  const [updateStore] = useMutation(STORE_UPDATE)

  // Modal / form state
  const [openModal, setOpenModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', location: '', isActive: true, province: '', ward: '', hamlet: '', detail: '' })
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [submitLoading, setSubmitLoading] = useState(false)
  const [showRaw, setShowRaw] = useState(false)

  useEffect(() => { getStores({ variables: { search: null } }) }, [getStores])
  useEffect(() => {
    const t = setTimeout(() => {
      const s = searchTerm.trim() ? searchTerm.trim() : null
      setDebouncedSearchTerm(searchTerm)
      getStores({ variables: { search: s } })
    }, 300)
    return () => clearTimeout(t)
  }, [searchTerm, getStores])

  useEffect(() => {
    console.log('Stores query data:', data?.stores)
  }, [data])

  const handleSubmit = async () => {
    setSubmitLoading(true)
    setFormErrors([])
    try {
      if (isEditMode && editingStoreId) {
        const res = await updateStore({ variables: { store_id: editingStoreId, input: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          is_active: formData.isActive
        } } })
          if (res.data?.update_store?.success) {
          setOpenModal(false)
          getStores({ variables: queryVariables })
        } else {
          setFormErrors([res.data?.update_store?.message || 'Update failed'])
        }
      } else {
        const res = await createStore({ variables: { input: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          province: formData.province,
          ward: formData.ward,
          hamlet: formData.hamlet,
          detail: formData.detail
        } } })
        if (res.data?.create_store?.success) {
          setOpenModal(false)
          getStores({ variables: queryVariables })
        } else {
          setFormErrors([res.data?.create_store?.message || 'Create failed'])
        }
      }
    } catch (err: any) {
      setFormErrors([err.message || 'Request failed'])
    } finally {
      setSubmitLoading(false)
    }
  }

  if (queryLoading) return <Typography>Loading...</Typography>
  if (error) return <Typography>Error: {error.message}</Typography>

  const stores = data?.stores || []

  return (
    <Box className="custom-mui">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Stores Management</Typography>
        <Button variant="contained" color="primary" onClick={() => {
          setIsEditMode(false); setEditingStoreId(null); setFormErrors([]); setFormData({ name: '', email: '', phone: '', location: '', isActive: true, province: '', ward: '', hamlet: '', detail: '' }); setOpenModal(true)
        }}>
          Add Store
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => setShowRaw(prev => !prev)} style={{ marginLeft: 8 }}>
          {showRaw ? 'Hide Raw' : 'Show Raw'}
        </Button>
      </Box>
      <Box mb={3}>
        <input
          type="text"
          placeholder="Search stores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="custom-input"
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stores.map((store: Store) => (
              <TableRow key={store.storeId}>
                <TableCell>{store.storeId}</TableCell>
                <TableCell>{store.name}</TableCell>
                <TableCell>{store.email || 'N/A'}</TableCell>
                <TableCell>{store.phone || 'N/A'}</TableCell>
                <TableCell>{store.location || 'N/A'}</TableCell>
                <TableCell>{store.status}</TableCell>
                <TableCell>{new Date(store.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => {
                    setIsEditMode(true)
                    setEditingStoreId(store.storeId)
                    setFormData({ name: store.name, email: store.email || '', phone: store.phone || '', location: store.location || '', isActive: store.isActive })
                    setFormErrors([])
                    setOpenModal(true)
                  }}>
                    Edit
                  </Button>
                  <Button size="small" color="error" style={{ marginLeft: 8 }} onClick={async () => {
                    // Soft-delete: set isActive to false
                      try {
                      await updateStore({ variables: { store_id: store.storeId, input: { is_active: false } } })
                      getStores({ variables: queryVariables })
                    } catch (err) { console.error(err) }
                  }}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {showRaw && (
        <Box mt={2}>
          <Typography variant="subtitle1">Raw stores JSON</Typography>
          <Box component="pre" sx={{ whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto', backgroundColor: '#f5f5f5', p: 2 }}>
            {JSON.stringify(stores, null, 2)}
          </Box>
        </Box>
      )}
      
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Store' : 'Add New Store'}</DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && (
            <Box mb={2}>
              {formErrors.map((e, i) => <Typography key={i} color="error">{e}</Typography>)}
            </Box>
          )}

          <TextField margin="dense" label="Name" fullWidth value={formData.name} onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))} />
          <TextField margin="dense" label="Email" fullWidth value={formData.email} onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))} />
          <TextField margin="dense" label="Phone" fullWidth value={formData.phone} onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))} />
          <TextField margin="dense" label="Location" fullWidth value={formData.location} onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))} />
          <TextField margin="dense" label="Province" fullWidth required value={formData.province} onChange={(e) => setFormData(prev => ({...prev, province: e.target.value}))} />
          <TextField margin="dense" label="Ward" fullWidth required value={formData.ward} onChange={(e) => setFormData(prev => ({...prev, ward: e.target.value}))} />
          <TextField margin="dense" label="Hamlet" fullWidth value={formData.hamlet} onChange={(e) => setFormData(prev => ({...prev, hamlet: e.target.value}))} />
          <TextField margin="dense" label="Detail" fullWidth required value={formData.detail} onChange={(e) => setFormData(prev => ({...prev, detail: e.target.value}))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} disabled={submitLoading}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitLoading}>{submitLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update' : 'Create')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Stores
