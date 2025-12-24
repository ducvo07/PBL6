"""
Discount GraphQL API
"""

from .schema import DiscountQuery, DiscountMutation, discount_schema

__all__ = [
    'DiscountQuery',
    'DiscountMutation',
    'discount_schema'
]