import graphene
from graphene import ObjectType, Field, List, String, Int, Boolean, ID, Date, DateTime, Decimal
from graphene_django import DjangoObjectType
from django.db.models import Q

from SHOEX.orders.models import Order, OrderItem
from SHOEX.address.models import Address


class AddressType(DjangoObjectType):
    class Meta:
        model = Address
        fields = '__all__'


class OrderType(DjangoObjectType):
    class Meta:
        model = Order
        fields = '__all__'
    
    # Explicitly resolve buyer field to ensure proper serialization
    def resolve_buyer(self, info):
        return self.buyer


class OrderItemType(DjangoObjectType):
    class Meta:
        model = OrderItem
        fields = '__all__'


# ===================================================================
# ============================ INPUTS ================================
# ===================================================================

class OrderCreateInput(graphene.InputObjectType):
    buyer_id = ID(required=True)
    address_id = ID(required=True)
    total_amount = Decimal(required=True)
    status = String(required=False)
    payment_status = String(required=False)
    payment_method = String(required=False)
    shipping_fee = Decimal(required=False)
    notes = String(required=False)


class OrderQuery(ObjectType):
    """GraphQL queries cho Order module"""

    # Single object queries
    order = Field(OrderType, id=ID(required=True))

    # List queries
    orders = List(OrderType, search=String(required=False))

    def resolve_order(self, info, id):
        try:
            return Order.objects.get(pk=id)
        except Order.DoesNotExist:
            return None

    def resolve_orders(self, info, search=None):
        """Lấy danh sách orders"""
        qs = Order.objects.all()
        if search:
            q = Q(buyer__username__icontains=search) | Q(buyer__full_name__icontains=search) | Q(buyer__email__icontains=search)
            qs = qs.filter(q)
        return qs.order_by('-created_at')


# ===================================================================
# ============================ MUTATIONS ============================
# ===================================================================

class CreateOrder(graphene.Mutation):
    class Arguments:
        input = OrderCreateInput(required=True)
    
    success = Boolean()
    message = String()
    order = Field(OrderType)
    
    @staticmethod
    def mutate(root, info, input):
        try:
            order = Order.objects.create(
                buyer_id=input.buyer_id,
                address_id=input.address_id,
                total_amount=input.total_amount,
                status=input.status or 'pending',
                payment_status=input.payment_status or 'pending',
                payment_method=input.payment_method,
                shipping_fee=input.shipping_fee or 0,
                notes=input.notes
            )
            return CreateOrder(success=True, message="Tạo đơn hàng thành công", order=order)
        except Exception as e:
            return CreateOrder(success=False, message=f"Lỗi: {str(e)}", order=None)


class OrderMutation(ObjectType):
    """GraphQL mutations cho Order module"""
    create_order = CreateOrder.Field()


# Main schema for order module
order_schema = graphene.Schema(
    query=OrderQuery,
    mutation=OrderMutation
)


# Export all
__all__ = [
    'OrderQuery',
    'OrderMutation',
    'order_schema'
]