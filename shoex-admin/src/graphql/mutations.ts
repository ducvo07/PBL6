import { gql } from '@apollo/client'

// Authentication Mutations
export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      message
      user {
        id
        username
        email
        fullName
        role
        isActive
      }
      tokens {
        accessToken
        refreshToken
        expiresIn
      }
    }
  }
`

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`

// User Mutations
export const USER_CREATE = gql`
  mutation UserCreate($input: UserCreateInput!) {
    user_create(input: $input) {
      success
      user {
        id
        username
        email
        fullName
        role
        isActive
      }
      errors
    }
  }
`

export const USER_UPDATE = gql`
  mutation UserUpdate($id: ID!, $input: UserUpdateInput!) {
    user_update(id: $id, input: $input) {
      success
      user {
        id
        username
        email
        fullName
        role
        isActive
      }
      errors
    }
  }
`

export const USER_DELETE = gql`
  mutation UserDelete($id: ID!) {
    user_delete(id: $id) {
      success
      errors
    }
  }
`

// Product Mutations
export const PRODUCT_CREATE = gql`
  mutation ProductCreate($input: ProductCreateInput!) {
    product_create(input: $input) {
      success
      product {
        product_id
        name
        base_price
        is_active
      }
      errors
    }
  }
`

export const PRODUCT_UPDATE = gql`
  mutation ProductUpdate($id: ID!, $input: ProductUpdateInput!) {
    product_update(id: $id, input: $input) {
      success
      product {
        product_id
        name
        base_price
        is_active
      }
      errors
    }
  }
`

export const PRODUCT_DELETE = gql`
  mutation ProductDelete($id: ID!) {
    product_delete(id: $id) {
      success
      errors
    }
  }
`

export const UPLOAD_PRODUCT_IMAGE = gql`
  mutation UploadProductImage($productId: ID!, $image: Upload!, $isThumbnail: Boolean, $altText: String, $displayOrder: Int) {
    uploadProductImage(productId: $productId, image: $image, isThumbnail: $isThumbnail, altText: $altText, displayOrder: $displayOrder) {
      productImage {
        id
        image
        isThumbnail
        altText
        displayOrder
      }
      errors {
        message
      }
    }
  }
`

// Store Mutations
export const STORE_CREATE = gql`
  mutation StoreCreate($input: StoreCreateInput!) {
    create_store(input: $input) {
      success
      store {
        store_id
        name
        email
      }
      message
    }
  }
`

export const STORE_UPDATE = gql`
  mutation StoreUpdate($store_id: ID!, $input: StoreUpdateInput!) {
    update_store(store_id: $store_id, input: $input) {
      success
      store {
        store_id
        name
        email
      }
      message
    }
  }
`

export const STORE_DELETE = gql`
  mutation StoreDelete($storeId: ID!) {
    deleteStore(storeId: $storeId) {
      success
      message
    }
  }
`

// Voucher Mutations
export const VOUCHER_CREATE = gql`
  mutation VoucherCreate($input: VoucherCreateInput!) {
    create_voucher(input: $input) {
      success
      voucher {
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
      message
    }
  }
`

export const VOUCHER_UPDATE = gql`
  mutation VoucherUpdate($voucher_id: ID!, $input: VoucherCreateInput!) {
    update_voucher(voucher_id: $voucher_id, input: $input) {
      success
      voucher {
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
      message
    }
  }
`

// Order Mutations
export const ORDER_CREATE = gql`
  mutation OrderCreate($input: OrderCreateInput!) {
    create_order(input: $input) {
      success
      order {
        orderId
        buyer {
          username
          fullName
        }
        totalAmount
        status
        paymentStatus
        createdAt
      }
      message
    }
  }
`

export const ORDER_UPDATE = gql`
  mutation OrderUpdate($order_id: ID!, $input: OrderUpdateInput!) {
    order_update(order_id: $order_id, input: $input) {
      success
      order {
        order_id
        status
      }
      errors
    }
  }
`