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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'
import { useLazyQuery, useMutation, gql } from '@apollo/client'
import { VOUCHER_CREATE, VOUCHER_UPDATE } from '../graphql/mutations'

interface Voucher {
  voucherId: number
  code: string
  type: string
  discountType: string
  discountValue: number
  minOrderAmount?: number
  maxDiscount?: number
  usageLimit?: number
  perUserLimit?: number
  isActive: boolean
  startDate: string
  endDate: string
  createdAt: string
}

const GET_VOUCHERS = gql`
  query GetVouchers($search: String) {
    vouchers(search: $search) {
      voucherId
      code
      type
      discountType
      discountValue
      minOrderAmount
      maxDiscount
      usageLimit
      perUserLimit
      isActive
      startDate
      endDate
      createdAt
    }
  }
`

const Vouchers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const queryVariables = useMemo(() => ({ search: debouncedSearchTerm.trim() ? debouncedSearchTerm.trim() : null }), [debouncedSearchTerm])

  const [getVouchers, { loading: queryLoading, error, data }] = useLazyQuery(GET_VOUCHERS)
  const [createVoucher] = useMutation(VOUCHER_CREATE)
  const [updateVoucher] = useMutation(VOUCHER_UPDATE)

  // Modal / form state
  const [openModal, setOpenModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    type: 'platform',
    discountType: 'percent',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    perUserLimit: '1',
    isActive: true,
    sellerId: ''
  })
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => { getVouchers({ variables: { search: null } }) }, [getVouchers])
  useEffect(() => {
    const t = setTimeout(() => {
      const s = searchTerm.trim() ? searchTerm.trim() : null
      setDebouncedSearchTerm(searchTerm)
      getVouchers({ variables: { search: s } })
    }, 300)
    return () => clearTimeout(t)
  }, [searchTerm, getVouchers])

  const handleSubmit = async () => {
    setSubmitLoading(true)
    setFormErrors([])
    try {
      const input = {
        code: formData.code,
        type: formData.type,
        discount_type: formData.discountType,
        discount_value: parseFloat(formData.discountValue),
        min_order_amount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
        max_discount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        start_date: formData.startDate,
        end_date: formData.endDate,
        usage_limit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        per_user_limit: parseInt(formData.perUserLimit),
        is_active: formData.isActive,
        seller_id: formData.sellerId || null
      }

      let res;
      if (isEditMode && editingVoucherId) {
        res = await updateVoucher({ variables: { voucher_id: editingVoucherId, input } })
      } else {
        res = await createVoucher({ variables: { input } })
      }

      const mutationData = isEditMode ? res.data?.update_voucher : res.data?.create_voucher
      if (mutationData?.success) {
        setOpenModal(false)
        getVouchers({ variables: queryVariables })
        resetForm()
      } else {
        setFormErrors([mutationData?.message || `${isEditMode ? 'Cập nhật' : 'Tạo'} voucher thất bại`])
      }
    } catch (err: any) {
      setFormErrors([err.message || 'Lỗi không xác định'])
    } finally {
      setSubmitLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'platform',
      discountType: 'percent',
      discountValue: '',
      minOrderAmount: '',
      maxDiscount: '',
      startDate: '',
      endDate: '',
      usageLimit: '',
      perUserLimit: '1',
      isActive: true,
      sellerId: ''
    })
    setIsEditMode(false)
    setEditingVoucherId(null)
  }

  const handleAddClick = () => {
    resetForm()
    setOpenModal(true)
  }

  const handleEditClick = (voucher: Voucher) => {
    setFormData({
      code: voucher.code,
      type: voucher.type,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue.toString(),
      minOrderAmount: voucher.minOrderAmount ? voucher.minOrderAmount.toString() : '',
      maxDiscount: voucher.maxDiscount ? voucher.maxDiscount.toString() : '',
      startDate: voucher.startDate.split('T')[0], // Format date
      endDate: voucher.endDate.split('T')[0],
      usageLimit: voucher.usageLimit ? voucher.usageLimit.toString() : '',
      perUserLimit: voucher.perUserLimit ? voucher.perUserLimit.toString() : '1',
      isActive: voucher.isActive,
      sellerId: ''
    })
    setIsEditMode(true)
    setEditingVoucherId(voucher.voucherId.toString())
    setOpenModal(true)
  }

  if (queryLoading) return <Typography>Loading...</Typography>
  if (error) return <Typography>Error: {error.message}</Typography>

  const vouchers = data?.vouchers || []

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'platform':
        return 'primary'
      case 'seller':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getDiscountTypeColor = (discountType: string) => {
    switch (discountType.toLowerCase()) {
      case 'percent':
        return 'success'
      case 'fixed':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Vouchers Management</Typography>
        <Button variant="contained" color="primary" onClick={handleAddClick}>
          Add Voucher
        </Button>
      </Box>

      <Box mb={3}>
        <TextField
          placeholder="Search vouchers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          variant="outlined"
          size="small"
          className="custom-input"
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Valid Period</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vouchers.map((voucher: Voucher) => (
              <TableRow key={voucher.voucherId}>
                <TableCell>{voucher.voucherId}</TableCell>
                <TableCell>{voucher.code}</TableCell>
                <TableCell>
                  <Chip
                    label={voucher.type}
                    color={getTypeColor(voucher.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${voucher.discountValue}${voucher.discountType === 'percent' ? '%' : ' VND'}`}
                    color={getDiscountTypeColor(voucher.discountType)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={voucher.isActive ? 'Active' : 'Inactive'}
                    color={voucher.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(voucher.startDate).toLocaleDateString()} - {new Date(voucher.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{new Date(voucher.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => handleEditClick(voucher)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Voucher Dialog */}
      <Dialog open={openModal} onClose={() => { setOpenModal(false); resetForm(); }} maxWidth="md" fullWidth>
        <DialogTitle>{isEditMode ? 'Chỉnh Sửa Voucher' : 'Thêm Voucher Mới'}</DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && (
            <Box mb={2}>
              {formErrors.map((error, idx) => (
                <Typography key={idx} color="error">{error}</Typography>
              ))}
            </Box>
          )}
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Mã Voucher"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              className="custom-mui"
            />
            <FormControl className="custom-mui">
              <InputLabel>Loại Voucher</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="platform">Platform</MenuItem>
                <MenuItem value="seller">Seller</MenuItem>
              </Select>
            </FormControl>
            <FormControl className="custom-mui">
              <InputLabel>Loại Giảm Giá</InputLabel>
              <Select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              >
                <MenuItem value="percent">Phần Trăm (%)</MenuItem>
                <MenuItem value="fixed">Cố Định (VND)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Giá Trị Giảm"
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              required
              className="custom-mui"
            />
            <TextField
              label="Đơn Tối Thiểu (VND)"
              type="number"
              value={formData.minOrderAmount}
              onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
              className="custom-mui"
            />
            <TextField
              label="Giảm Tối Đa (VND)"
              type="number"
              value={formData.maxDiscount}
              onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
              className="custom-mui"
            />
            <TextField
              label="Ngày Bắt Đầu"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
              InputLabelProps={{ shrink: true }}
              className="custom-mui"
            />
            <TextField
              label="Ngày Kết Thúc"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
              InputLabelProps={{ shrink: true }}
              className="custom-mui"
            />
            <TextField
              label="Giới Hạn Sử Dụng"
              type="number"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
              className="custom-mui"
            />
            <TextField
              label="Giới Hạn Mỗi User"
              type="number"
              value={formData.perUserLimit}
              onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
              required
              className="custom-mui"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenModal(false); resetForm(); }}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitLoading}>
            {submitLoading ? (isEditMode ? 'Đang Cập Nhật...' : 'Đang Tạo...') : (isEditMode ? 'Cập Nhật Voucher' : 'Tạo Voucher')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Vouchers
