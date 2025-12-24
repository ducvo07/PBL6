import React, { useState, useEffect, useMemo } from 'react'
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
} from '@mui/material'
import { Search as SearchIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material'
import { useQuery, useMutation, useLazyQuery, gql } from '@apollo/client'
import { PRODUCT_CREATE, PRODUCT_UPDATE } from '../graphql/mutations'

interface Product {
  productId: string
  name: string
  basePrice: number
  store?: { name: string }
  category?: { name: string }
  isActive: boolean
  createdAt: string
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const GET_PRODUCTS = gql`
  query GetProducts($search: String) {
    products(search: $search) {
      productId
      name
      basePrice
      isActive
      store {
        name
      }
      category {
        name
      }
      createdAt
    }
  }
`

const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const queryVariables = useMemo(() => ({
    search: debouncedSearchTerm.trim() ? debouncedSearchTerm.trim() : null
  }), [debouncedSearchTerm])
  const [getProducts, { loading: queryLoading, error, data }] = useLazyQuery(GET_PRODUCTS)

  // Initial load and debounced search
  useEffect(() => {
    getProducts({ variables: { search: null } })
  }, [getProducts])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      getProducts({ variables: { search: searchTerm.trim() ? searchTerm.trim() : null } })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, getProducts])

  const handleOpenModal = () => {
    setOpenModal(true)
    setFormErrors([])
    setIsEditMode(false)
    setEditingProductId(null)
    setFormData({
      name: '',
      basePrice: '',
      storeId: '',
      categoryId: '',
      isActive: true,
    })
  }

  const handleEditProduct = (product: Product) => {
    setIsEditMode(true)
    setEditingProductId(product.productId)
    setFormData({
      name: product.name,
      basePrice: product.basePrice.toString(),
      storeId: '', // Assuming we don't have store/category IDs in the product data
      categoryId: '',
      isActive: product.isActive,
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
      if (isEditMode && editingProductId) {
        result = await updateProduct({
          variables: {
            id: editingProductId,
            input: {
              name: formData.name,
              basePrice: parseFloat(formData.basePrice),
              isActive: formData.isActive,
            }
          }
        })
        if (result.data?.productUpdate?.success) {
          setOpenModal(false)
          getProducts({ variables: queryVariables })
        } else {
          setFormErrors(result.data?.productUpdate?.errors || ['Unknown error occurred'])
        }
      } else {
        result = await createProduct({
          variables: {
            input: {
              name: formData.name,
              basePrice: parseFloat(formData.basePrice),
              storeId: formData.storeId,
              categoryId: formData.categoryId,
              isActive: formData.isActive,
            }
          }
        })
        if (result.data?.productCreate?.success) {
          setOpenModal(false)
          getProducts({ variables: queryVariables })
        } else {
          setFormErrors(result.data?.productCreate?.errors || ['Unknown error occurred'])
        }
      }
    } catch (err: any) {
      setFormErrors([err.message || 'Failed to save product'])
    } finally {
      setSubmitLoading(false)
    }
  }

  // Modal state
  const [openModal, setOpenModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    basePrice: '',
    storeId: '',
    categoryId: '',
    isActive: true,
  })
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [submitLoading, setSubmitLoading] = useState(false)

  if (queryLoading) return <Typography>Loading...</Typography>
  if (error) return <Typography>Error: {error.message}</Typography>

  const products = data?.products || []

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Products Management</Typography>
        <Button variant="contained" color="primary" startIcon={<PersonAddIcon />} onClick={handleOpenModal}>
          Add Product
        </Button>
      </Box>

      <Box mb={3}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => {
            console.log('onChange fired:', e.target.value)
            setSearchTerm(e.target.value)
          }}
          style={{
            padding: '10px 14px',
            border: '1px solid #1976d2',
            borderRadius: '6px',
            fontSize: '14px',
            width: '300px',
            backgroundColor: '#f5f5f5',
            color: '#333',
            outline: 'none',
            transition: 'border-color 0.3s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#1565c0'}
          onBlur={(e) => e.target.style.borderColor = '#1976d2'}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Store</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product: Product) => (
              <TableRow key={product.productId}>
                <TableCell>{product.productId}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{formatCurrency(product.basePrice)}</TableCell>
                <TableCell>{product.store?.name || 'N/A'}</TableCell>
                <TableCell>{product.category?.name || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={product.isActive ? 'Active' : 'Inactive'}
                    color={product.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => handleEditProduct(product)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && (
            <Box mb={2}>
              {formErrors.map((error, index) => (
                <Typography key={index} color="error" variant="body2">
                  {error}
                </Typography>
              ))}
            </Box>
          )}

          <TextField
            margin="dense"
            label="Product Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />

          <TextField
            margin="dense"
            label="Base Price"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.basePrice}
            onChange={(e) => handleInputChange('basePrice', e.target.value)}
            required
          />

          {!isEditMode && (
            <>
              <TextField
                margin="dense"
                label="Store ID"
                fullWidth
                variant="outlined"
                value={formData.storeId}
                onChange={(e) => handleInputChange('storeId', e.target.value)}
              />

              <TextField
                margin="dense"
                label="Category ID"
                fullWidth
                variant="outlined"
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
              />
            </>
          )}

          <TextField
            margin="dense"
            label="Status"
            select
            fullWidth
            variant="outlined"
            value={formData.isActive}
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
            {submitLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Product' : 'Create Product')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Products
