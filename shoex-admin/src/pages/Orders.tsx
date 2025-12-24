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
import { ORDER_CREATE } from '../graphql/mutations'

interface Order {
  orderId: number
  buyer: {
    username: string
    fullName: string
    email: string
  }
  totalAmount: number
  status: string
  paymentStatus: string
  paymentMethod?: string
  shippingFee?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

const GET_ORDERS = gql`
  query GetOrders($search: String) {
    orders(search: $search) {
      orderId
      buyer {
        username
        fullName
        email
      }
      totalAmount
      status
      paymentStatus
      paymentMethod
      shippingFee
      notes
      createdAt
      updatedAt
    }
  }
`

const Orders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const formatVND = (v: any) => {
    const n = Number(v ?? 0)
    if (Number.isNaN(n)) return '₫0'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
  }
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const queryVariables = useMemo(() => ({ search: debouncedSearchTerm.trim() ? debouncedSearchTerm.trim() : null }), [debouncedSearchTerm])

  const [getOrders, { loading: queryLoading, error, data }] = useLazyQuery(GET_ORDERS)
  const [createOrder] = useMutation(ORDER_CREATE)

  // Modal state
  const [openModal, setOpenModal] = useState(false)
  const [formData, setFormData] = useState({
    buyerId: '',
    addressId: '',
    totalAmount: '',
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: '',
    shippingFee: '',
    notes: ''
  })
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [submitLoading, setSubmitLoading] = useState(false)

  // View dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => { getOrders({ variables: { search: null } }) }, [getOrders])
  useEffect(() => {
    const t = setTimeout(() => {
      const s = searchTerm.trim() ? searchTerm.trim() : null
      setDebouncedSearchTerm(searchTerm)
      getOrders({ variables: { search: s } })
    }, 300)
    return () => clearTimeout(t)
  }, [searchTerm, getOrders])

  const handleSubmit = async () => {
    setSubmitLoading(true)
    setFormErrors([])
    try {
      const input = {
        buyer_id: formData.buyerId,
        address_id: formData.addressId,
        total_amount: parseFloat(formData.totalAmount),
        status: formData.status,
        payment_status: formData.paymentStatus,
        payment_method: formData.paymentMethod,
        shipping_fee: formData.shippingFee ? parseFloat(formData.shippingFee) : 0,
        notes: formData.notes
      }

      const res = await createOrder({ variables: { input } })
      if (res.data?.create_order?.success) {
        setOpenModal(false)
        getOrders({ variables: queryVariables })
        setFormData({
          buyerId: '',
          addressId: '',
          totalAmount: '',
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: '',
          shippingFee: '',
          notes: ''
        })
      } else {
        setFormErrors([res.data?.create_order?.message || 'Tạo đơn hàng thất bại'])
      }
    } catch (err: any) {
      setFormErrors([err.message || 'Lỗi không xác định'])
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleAddClick = () => {
    setOpenModal(true)
  }

  const handleViewClick = (order: Order) => {
    setSelectedOrder(order)
    setViewDialogOpen(true)
  }

  if (queryLoading) return <Typography>Loading...</Typography>
  if (error) return <Typography>Error: {error.message}</Typography>

  const orders = data?.orders || []

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning'
      case 'confirmed':
        return 'info'
      case 'processing':
        return 'primary'
      case 'shipped':
        return 'secondary'
      case 'delivered':
        return 'success'
      case 'cancelled':
        return 'error'
      case 'returned':
        return 'default'
      default:
        return 'default'
    }
  }

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus.toLowerCase()) {
      case 'pending':
        return 'warning'
      case 'paid':
        return 'success'
      case 'failed':
        return 'error'
      case 'refunded':
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Orders Management</Typography>
        <Button variant="contained" color="primary" onClick={handleAddClick}>
          Add Order
        </Button>
      </Box>

      <Box mb={3}>
        <TextField
          placeholder="Search orders..."
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
              <TableCell>Customer</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Order Status</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order: Order) => (
              <TableRow key={order.orderId}>
                <TableCell>{order.orderId}</TableCell>
                <TableCell>
                  <div>
                    <div>{order.buyer.fullName}</div>
                    <div style={{ fontSize: '0.8em', color: 'gray' }}>{order.buyer.username}</div>
                  </div>
                </TableCell>
                <TableCell>{formatVND(order.totalAmount)}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={order.paymentStatus}
                    color={getPaymentStatusColor(order.paymentStatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => handleViewClick(order)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Order Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Thêm Đơn Hàng Mới</DialogTitle>
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
              label="ID Người Mua"
              value={formData.buyerId}
              onChange={(e) => setFormData({ ...formData, buyerId: e.target.value })}
              required
              className="custom-mui"
            />
            <TextField
              label="ID Địa Chỉ"
              value={formData.addressId}
              onChange={(e) => setFormData({ ...formData, addressId: e.target.value })}
              required
              className="custom-mui"
            />
            <TextField
              label="Tổng Tiền"
              type="number"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              required
              className="custom-mui"
            />
            <FormControl className="custom-mui">
              <InputLabel>Trạng Thái Đơn Hàng</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="pending">Đang Chờ</MenuItem>
                <MenuItem value="confirmed">Đã Xác Nhận</MenuItem>
                <MenuItem value="processing">Đang Xử Lý</MenuItem>
                <MenuItem value="shipped">Đã Gửi Hàng</MenuItem>
                <MenuItem value="delivered">Đã Giao Hàng</MenuItem>
                <MenuItem value="cancelled">Đã Hủy</MenuItem>
                <MenuItem value="returned">Đã Trả Hàng</MenuItem>
              </Select>
            </FormControl>
            <FormControl className="custom-mui">
              <InputLabel>Trạng Thái Thanh Toán</InputLabel>
              <Select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
              >
                <MenuItem value="pending">Chờ Thanh Toán</MenuItem>
                <MenuItem value="paid">Đã Thanh Toán</MenuItem>
                <MenuItem value="failed">Thanh Toán Thất Bại</MenuItem>
                <MenuItem value="refunded">Đã Hoàn Tiền</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Phương Thức Thanh Toán"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="custom-mui"
            />
            <TextField
              label="Phí Vận Chuyển"
              type="number"
              value={formData.shippingFee}
              onChange={(e) => setFormData({ ...formData, shippingFee: e.target.value })}
              className="custom-mui"
            />
            <TextField
              label="Ghi Chú"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="custom-mui"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitLoading}>
            {submitLoading ? 'Đang Tạo...' : 'Tạo Đơn Hàng'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chi Tiết Đơn Hàng #{selectedOrder?.orderId}</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <Typography variant="h6">Thông Tin Người Mua</Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <TextField
                  label="Tên Đầy Đủ"
                  value={selectedOrder.buyer.fullName}
                  InputProps={{ readOnly: true }}
                  className="custom-mui"
                />
                <TextField
                  label="Tên Đăng Nhập"
                  value={selectedOrder.buyer.username}
                  InputProps={{ readOnly: true }}
                  className="custom-mui"
                />
                <TextField
                  label="Email"
                  value={selectedOrder.buyer.email}
                  InputProps={{ readOnly: true }}
                  className="custom-mui"
                />
              </Box>

              <Typography variant="h6" sx={{ mt: 2 }}>Thông Tin Đơn Hàng</Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <TextField
                  label="Tổng Tiền"
                  value={formatVND(selectedOrder.totalAmount)}
                  InputProps={{ readOnly: true }}
                  className="custom-mui"
                />
                <TextField
                  label="Phí Vận Chuyển"
                  value={selectedOrder.shippingFee ? formatVND(selectedOrder.shippingFee) : 'N/A'}
                  InputProps={{ readOnly: true }}
                  className="custom-mui"
                />
                <FormControl className="custom-mui">
                  <InputLabel>Trạng Thái Đơn Hàng</InputLabel>
                  <Select value={selectedOrder.status} disabled>
                    <MenuItem value="pending">Đang Chờ</MenuItem>
                    <MenuItem value="confirmed">Đã Xác Nhận</MenuItem>
                    <MenuItem value="processing">Đang Xử Lý</MenuItem>
                    <MenuItem value="shipped">Đã Gửi Hàng</MenuItem>
                    <MenuItem value="delivered">Đã Giao Hàng</MenuItem>
                    <MenuItem value="cancelled">Đã Hủy</MenuItem>
                    <MenuItem value="returned">Đã Trả Hàng</MenuItem>
                  </Select>
                </FormControl>
                <FormControl className="custom-mui">
                  <InputLabel>Trạng Thái Thanh Toán</InputLabel>
                  <Select value={selectedOrder.paymentStatus} disabled>
                    <MenuItem value="pending">Chờ Thanh Toán</MenuItem>
                    <MenuItem value="paid">Đã Thanh Toán</MenuItem>
                    <MenuItem value="failed">Thanh Toán Thất Bại</MenuItem>
                    <MenuItem value="refunded">Đã Hoàn Tiền</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Phương Thức Thanh Toán"
                  value={selectedOrder.paymentMethod || 'N/A'}
                  InputProps={{ readOnly: true }}
                  className="custom-mui"
                />
              </Box>

              {selectedOrder.notes && (
                <>
                  <Typography variant="h6" sx={{ mt: 2 }}>Ghi Chú</Typography>
                  <TextField
                    value={selectedOrder.notes}
                    InputProps={{ readOnly: true }}
                    multiline
                    rows={3}
                    className="custom-mui"
                  />
                </>
              )}

              <Typography variant="h6" sx={{ mt: 2 }}>Thời Gian</Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <TextField
                  label="Ngày Tạo"
                  value={new Date(selectedOrder.createdAt).toLocaleString()}
                  InputProps={{ readOnly: true }}
                  className="custom-mui"
                />
                <TextField
                  label="Ngày Cập Nhật"
                  value={new Date(selectedOrder.updatedAt).toLocaleString()}
                  InputProps={{ readOnly: true }}
                  className="custom-mui"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Orders
