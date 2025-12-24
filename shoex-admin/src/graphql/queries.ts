// GraphQL Queries for SHOEX Admin Dashboard

import { gql } from '@apollo/client'

// User Queries
export const GET_USERS = gql`
  query GetUsers($filter: UserFilterInput, $search: String) {
    users(filter: $filter, search: $search) {
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

export const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    user(id: $id) {
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

// Product Queries
export const GET_PRODUCTS = gql`
  query GetProducts($filter: ProductFilterInput, $sort_by: ProductSortInput) {
    products(filter: $filter, sort_by: $sort_by, first: 50) {
      edges {
        node {
          product_id
          name
          base_price
          is_active
          store {
            name
          }
          category {
            name
          }
          created_at
        }
      }
    }
  }
`

// Store Queries
export const GET_STORES = gql`
  query GetStores {
    stores {
      store_id
      name
      email
      phone
      currency
      created_at
      join_date
    }
  }
`

// Voucher Queries
export const GET_VOUCHERS = gql`
  query GetVouchers {
    vouchers {
      voucherId
      code
      type
      discountType
      discountValue
      isActive
      startDate
      endDate
      createdAt
    }
  }
`

// Order Queries
export const GET_ORDERS = gql`
  query GetOrders {
    orders {
      orderId
      buyer {
        username
        fullName
        email
      }
      totalAmount
      status
      paymentStatus
      createdAt
    }
  }
`
