from django.db import models
from django.contrib.auth.models import User
from products.models import Product


class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.username} - {self.product.name} (x{self.quantity})"

    @property
    def original_subtotal(self):
        return self.product.price * self.quantity

    @property
    def discounted_subtotal(self):
        return self.product.discounted_price * self.quantity

    @property
    def item_discount(self):
        return self.original_subtotal - self.discounted_subtotal
