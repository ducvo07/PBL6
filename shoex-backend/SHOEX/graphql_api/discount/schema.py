import graphene
from graphene import ObjectType, Field, List, String, Int, Boolean, ID, Date, Decimal
from graphene_django import DjangoObjectType
from django.db.models import Q
from decimal import Decimal as DecimalType

from SHOEX.discount.models import Voucher, VoucherProduct, VoucherCategory, VoucherStore, UserVoucher, OrderVoucher


class VoucherType(DjangoObjectType):
    class Meta:
        model = Voucher
        fields = '__all__'


class VoucherProductType(DjangoObjectType):
    class Meta:
        model = VoucherProduct
        fields = '__all__'


class VoucherCategoryType(DjangoObjectType):
    class Meta:
        model = VoucherCategory
        fields = '__all__'


class VoucherStoreType(DjangoObjectType):
    class Meta:
        model = VoucherStore
        fields = '__all__'


class UserVoucherType(DjangoObjectType):
    class Meta:
        model = UserVoucher
        fields = '__all__'


class OrderVoucherType(DjangoObjectType):
    class Meta:
        model = OrderVoucher
        fields = '__all__'


# ===================================================================
# ============================ INPUTS ================================
# ===================================================================

class VoucherCreateInput(graphene.InputObjectType):
    code = String(required=True)
    type = String(required=True)  # 'platform' or 'seller'
    discount_type = String(required=True)  # 'percent' or 'fixed'
    discount_value = Decimal(required=True)
    min_order_amount = Decimal(required=False)
    max_discount = Decimal(required=False)
    start_date = Date(required=True)
    end_date = Date(required=True)
    usage_limit = Int(required=False)
    per_user_limit = Int(required=False)
    is_active = Boolean(required=False)
    seller_id = ID(required=False)  # For seller vouchers


class DiscountQuery(ObjectType):
    """GraphQL queries cho Discount module"""

    # Single object queries
    voucher = Field(VoucherType, id=ID(required=True))

    # List queries
    vouchers = List(VoucherType, search=String(required=False))

    def resolve_voucher(self, info, id):
        try:
            return Voucher.objects.get(pk=id)
        except Voucher.DoesNotExist:
            return None

    def resolve_vouchers(self, info, search=None):
        """Lấy danh sách vouchers"""
        qs = Voucher.objects.all()
        if search:
            q = Q(code__icontains=search) | Q(type__icontains=search) | Q(discount_type__icontains=search)
            qs = qs.filter(q)
        return qs.order_by('-created_at')


# ===================================================================
# ============================ MUTATIONS ============================
# ===================================================================

class CreateVoucher(graphene.Mutation):
    class Arguments:
        input = VoucherCreateInput(required=True)
    
    success = Boolean()
    message = String()
    voucher = Field(VoucherType)
    
    @staticmethod
    def mutate(root, info, input):
        try:
            voucher = Voucher.objects.create(
                code=input.code,
                type=input.type,
                discount_type=input.discount_type,
                discount_value=input.discount_value,
                min_order_amount=input.min_order_amount or 0,
                max_discount=input.max_discount,
                start_date=input.start_date,
                end_date=input.end_date,
                usage_limit=input.usage_limit,
                per_user_limit=input.per_user_limit or 1,
                is_active=input.is_active if input.is_active is not None else True,
                seller_id=input.seller_id if input.seller_id else None
            )
            return CreateVoucher(success=True, message="Tạo voucher thành công", voucher=voucher)
        except Exception as e:
            return CreateVoucher(success=False, message=f"Lỗi: {str(e)}", voucher=None)


class UpdateVoucher(graphene.Mutation):
    class Arguments:
        voucher_id = ID(required=True)
        input = VoucherCreateInput(required=True)
    
    success = Boolean()
    message = String()
    voucher = Field(VoucherType)
    
    @staticmethod
    def mutate(root, info, voucher_id, input):
        try:
            voucher = Voucher.objects.get(voucher_id=voucher_id)
            voucher.code = input.code
            voucher.type = input.type
            voucher.discount_type = input.discount_type
            voucher.discount_value = input.discount_value
            voucher.min_order_amount = input.min_order_amount or 0
            voucher.max_discount = input.max_discount
            voucher.start_date = input.start_date
            voucher.end_date = input.end_date
            voucher.usage_limit = input.usage_limit
            voucher.per_user_limit = input.per_user_limit or 1
            voucher.is_active = input.is_active if input.is_active is not None else True
            voucher.seller_id = input.seller_id
            voucher.save()
            return UpdateVoucher(success=True, message="Cập nhật voucher thành công", voucher=voucher)
        except Voucher.DoesNotExist:
            return UpdateVoucher(success=False, message="Voucher không tồn tại", voucher=None)
        except Exception as e:
            return UpdateVoucher(success=False, message=f"Lỗi: {str(e)}", voucher=None)


class DiscountMutation(ObjectType):
    """GraphQL mutations cho Discount module"""
    create_voucher = CreateVoucher.Field()
    update_voucher = UpdateVoucher.Field()


# Main schema for discount module
discount_schema = graphene.Schema(
    query=DiscountQuery,
    mutation=DiscountMutation
)


# Export all
__all__ = [
    'DiscountQuery',
    'DiscountMutation',
    'discount_schema'
]